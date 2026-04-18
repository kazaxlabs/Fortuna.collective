import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { 
  Settings, MapPin, Link as LinkIcon, Calendar, Briefcase, TrendingUp, Users, 
  Heart, MessageSquare, UserPlus, UserMinus, Edit3, MoreVertical, Trash2, Archive 
} from 'lucide-react';
import { followUser, unfollowUser, isFollowing, subscribeToUserProfile } from '../../services/userService';
import { getOrCreateConversation } from '../../services/chatService';
import { 
  subscribeToUserPosts, deletePost, archivePost, toggleLike, subscribeToUserLikes, getUserPostsPaginated
} from '../../services/postService';
import { UserProfile } from '../../types';
import EditProfileModal from './EditProfileModal';

interface ProfileProps {
  userId?: string;
  onNavigateToChat?: (convoId: string) => void;
}

export default function Profile({ userId, onNavigateToChat }: ProfileProps) {
  const { user, profile: myProfile } = useAuth();
  const [viewProfile, setViewProfile] = useState<UserProfile | null>(null);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [posts, setPosts] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  const isOwnAccount = !userId || userId === user?.uid;
  const targetId = userId || user?.uid;

  useEffect(() => {
    if (!targetId) return;
    const unsub = subscribeToUserProfile(targetId, setViewProfile);
    return () => unsub();
  }, [targetId]);

  useEffect(() => {
    if (user && targetId && !isOwnAccount) {
      isFollowing(user.uid, targetId).then(setFollowing);
    }
  }, [user, targetId, isOwnAccount]);

  useEffect(() => {
    if (!targetId) return;

    const fetchInitial = async () => {
      setPosts([]);
      setLastVisible(null);
      setHasMore(true);
      
      const { posts: initialPosts, lastVisible: lastDoc } = await getUserPostsPaginated(targetId, 10, null);
      setPosts(initialPosts);
      setLastVisible(lastDoc);
      if (initialPosts.length < 10) setHasMore(false);
    };

    fetchInitial();
  }, [targetId]);

  // Infinite scroll trigger
  useEffect(() => {
    if (!hasMore || loadingMore || !targetId) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        handleLoadMore();
      }
    }, { threshold: 0.1 });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, targetId, lastVisible]);

  const handleLoadMore = async () => {
    if (!hasMore || loadingMore || !lastVisible || !targetId) return;
    setLoadingMore(true);
    
    const { posts: nextPosts, lastVisible: nextDoc } = await getUserPostsPaginated(targetId, 10, lastVisible);
    
    if (nextPosts.length > 0) {
      setPosts(prev => [...prev, ...nextPosts]);
      setLastVisible(nextDoc);
      if (nextPosts.length < 10) setHasMore(false);
    } else {
      setHasMore(false);
    }
    
    setLoadingMore(false);
  };

  useEffect(() => {
    if (user) {
      const unsub = subscribeToUserLikes(user.uid, setLikedPosts);
      return () => unsub();
    }
  }, [user]);

  const handleFollowToggle = async () => {
    if (!user || !targetId || isOwnAccount) return;
    setLoading(true);
    try {
      if (following) {
        await unfollowUser(user.uid, targetId);
        setFollowing(false);
      } else {
        await followUser(user.uid, targetId);
        setFollowing(true);
      }
    } catch (error) {
      console.error('Follow error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!user || !targetId || isOwnAccount || !onNavigateToChat) return;
    const convoId = await getOrCreateConversation(user.uid, targetId);
    if (convoId) {
      onNavigateToChat(convoId);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    const isLiked = likedPosts.has(postId);
    try {
      await toggleLike(user, postId, isLiked);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to permanently delete this post?')) return;
    try {
      await deletePost(postId);
      setActiveMenuId(null);
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleArchivePost = async (postId: string) => {
    if (!confirm('Are you sure you want to archive this post?')) return;
    try {
      await archivePost(postId);
      setActiveMenuId(null);
    } catch (error) {
      console.error('Failed to archive post:', error);
    }
  };

  const getInitial = (name: string) => (name || '?')[0].toUpperCase();

  const currentProfile = isOwnAccount ? myProfile : viewProfile;

  const STATS = [
    { id: '1', label: 'Followers', value: currentProfile?.followersCount || 0, icon: Users },
    { id: '2', label: 'Following', value: currentProfile?.followingCount || 0, icon: Heart },
    { id: '3', label: 'Entries', value: posts.length, icon: TrendingUp },
  ];

  if (!currentProfile) {
    return (
      <div className="flex items-center justify-center h-full bg-[#F5F5F7] dark:bg-black text-[#1D1D1F] dark:text-white">
        <div className="w-8 h-8 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col overflow-y-auto no-scrollbar pb-32">
      {/* Banner Area */}
      <div className="h-72 bg-[var(--color-bg)] flex flex-col shrink-0 relative px-10 pt-10">
        <div className="w-full h-full neu-concave rounded-[3rem] overflow-hidden relative border border-[var(--color-shadow-dark)]/5">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent opacity-50" />
        </div>
        
        {/* Avatar and Main Actions */}
        <div className="absolute -bottom-20 left-20 flex items-end gap-10">
          <div className="w-44 h-44 rounded-[3rem] neu-convex p-3 bg-[var(--color-bg)] shadow-2xl">
            <div className="w-full h-full rounded-[2.2rem] neu-concave flex items-center justify-center overflow-hidden">
              {currentProfile?.avatar ? (
                <img src={currentProfile.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-display text-[var(--color-text-muted)] opacity-20">{(currentProfile?.displayName || '?')[0].toUpperCase()}</span>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 right-20 flex gap-6">
          {isOwnAccount ? (
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="px-12 py-5 neu-button-accent rounded-3xl text-white flex items-center gap-4 active:scale-95 transition-all shadow-xl text-label font-black uppercase tracking-widest"
            >
              <Edit3 size={20} strokeWidth={3} />
              Refine Identity
            </button>
          ) : (
            <div className="flex items-center gap-6">
              <button 
                onClick={handleMessage}
                className="p-6 neu-button rounded-full text-[var(--color-accent)] active:scale-90 transition-all shadow-lg"
              >
                <MessageSquare size={24} strokeWidth={3} />
              </button>
              <button 
                onClick={handleFollowToggle}
                disabled={loading}
                className={`px-12 py-5 rounded-3xl text-label font-black uppercase tracking-widest transition-all flex items-center gap-4 active:scale-95 ${
                  following 
                    ? 'neu-concave text-[var(--color-text-muted)]' 
                    : 'neu-button-accent text-white shadow-xl'
                }`}
              >
                {following ? <UserMinus size={18} strokeWidth={3} /> : <UserPlus size={18} strokeWidth={3} />}
                {following ? 'Drop Sync' : 'Initiate Sync'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-10 pt-28 space-y-20">
        <div className="max-w-4xl mx-auto space-y-20">
          {/* Identity Section */}
          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <h1 className="text-display text-[var(--color-text)] uppercase tracking-tight">{currentProfile?.displayName}</h1>
              <div className="neu-concave px-5 py-2 rounded-full border border-[var(--color-shadow-dark)]/5">
                <span className="text-label font-black uppercase tracking-[0.3em] text-[var(--color-accent)]">
                  {currentProfile?.role === 'admin' ? 'Strategic Architect' : 'Core Node'}
                </span>
              </div>
            </div>
            <div className="neu-convex p-10 rounded-[3rem] inline-block max-w-2xl border border-[var(--color-shadow-dark)]/5">
              <p className="text-body-lg text-[var(--color-text)] opacity-90 leading-[1.6] font-medium italic">
                "{currentProfile?.bio || 'Professional identity details under encryption.'}"
              </p>
            </div>
            <div className="flex flex-wrap gap-12 text-label text-[var(--color-text-muted)] font-black uppercase tracking-[0.2em]">
              <div className="flex items-center gap-3">
                <Briefcase size={18} strokeWidth={3} className="text-[var(--color-accent)] opacity-60" /> {currentProfile?.primaryField || 'Professional Domain'}
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={18} strokeWidth={3} className="text-[var(--color-accent)] opacity-60" /> {currentProfile?.location || 'Global Node'}
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={18} strokeWidth={3} className="text-[var(--color-accent)] opacity-60" /> Initialized 2026
              </div>
            </div>
          </div>

          {/* Aggregate Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {STATS.map((stat) => (
              <div key={stat.id} className="p-10 neu-convex rounded-[3rem] flex items-center gap-8 group hover:translate-y-[-4px] transition-all border border-[var(--color-shadow-dark)]/5">
                <div className="w-16 h-16 rounded-2xl neu-concave flex items-center justify-center text-[var(--color-text-muted)] opacity-30 group-hover:opacity-100 group-hover:text-[var(--color-accent)] transition-all">
                  <stat.icon size={28} strokeWidth={3} />
                </div>
                <div className="flex flex-col">
                  <span className="text-h1 text-[var(--color-text)] tracking-tight">{stat.value}</span>
                  <span className="text-label font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)] mt-1">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Sub-Feeds */}
          <div className="space-y-16">
            <div className="neu-concave p-2 rounded-[2.5rem] flex items-center gap-4 inline-flex border border-[var(--color-shadow-dark)]/5">
              <button className="px-10 py-4 rounded-2xl neu-convex text-label font-black uppercase tracking-widest text-[var(--color-accent)]">Transmission Log</button>
              <button className="px-10 py-4 rounded-2xl text-label font-black uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all">Shared Assets</button>
              <button className="px-10 py-4 rounded-2xl text-label font-black uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all">Resonated</button>
            </div>
            
            <div className="space-y-12">
              {posts.length === 0 ? (
                <div className="py-40 text-center space-y-8 neu-concave rounded-[4rem] border border-[var(--color-shadow-dark)]/5">
                  <div className="w-24 h-24 neu-convex rounded-full flex items-center justify-center mx-auto text-[var(--color-text-muted)] opacity-10">
                    <TrendingUp size={48} strokeWidth={2.5} />
                  </div>
                  <div className="space-y-3">
                    <p className="text-h3 text-[var(--color-text)] uppercase opacity-60">Null Buffer</p>
                    <p className="text-body text-[var(--color-text-muted)] italic font-medium">No activity streams detected from this professional node.</p>
                  </div>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="neu-convex rounded-[3.5rem] p-10 hover:translate-y-[-2px] transition-all duration-500 border border-[var(--color-shadow-dark)]/5 relative group">
                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl neu-concave flex items-center justify-center overflow-hidden shadow-sm">
                          {post.avatar ? (
                            <img src={post.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-h3 text-[var(--color-text-muted)] opacity-20">{getInitial(post.authorName)}</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-h3 text-[var(--color-text)] tracking-tight uppercase leading-none">{post.authorName}</span>
                          <span className="text-label font-black text-[var(--color-accent)] uppercase tracking-widest mt-2">{post.authorHandle || 'NODE_MEMBER'}</span>
                        </div>
                      </div>

                      {(isOwnAccount || myProfile?.role === 'admin') && (
                        <div className="relative">
                          <button 
                            onClick={() => setActiveMenuId(activeMenuId === post.id ? null : post.id)}
                            className="p-4 rounded-2xl neu-button text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all"
                          >
                            <MoreVertical size={20} strokeWidth={2.5} />
                          </button>
                          
                          {activeMenuId === post.id && (
                            <div className="absolute right-0 mt-5 w-60 neu-convex rounded-3xl z-40 overflow-hidden p-2 shadow-2xl border border-[var(--color-shadow-dark)]/5">
                              <button 
                                onClick={() => handleArchivePost(post.id)}
                                className="w-full flex items-center gap-4 px-6 py-5 text-label font-black uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[#FF9500] hover:neu-concave rounded-2xl transition-all"
                              >
                                <Archive size={18} strokeWidth={2.5} />
                                Retire Entry
                              </button>
                              <button 
                                onClick={() => handleDeletePost(post.id)}
                                className="w-full flex items-center gap-4 px-6 py-5 text-label font-black uppercase tracking-widest text-[#FF3B30] hover:bg-[#FF3B3010] rounded-2xl transition-all"
                              >
                                <Trash2 size={18} strokeWidth={2.5} />
                                Eliminate
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-10 mb-12">
                      <p className="text-body-lg text-[var(--color-text)] opacity-90 leading-[1.6] tracking-normal font-medium">
                        {post.content}
                      </p>
                      
                      {post.attachments && post.attachments.length > 0 && (
                        <div className={`grid gap-8 ${post.attachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          {post.attachments.map((url: string, idx: number) => (
                            <div key={idx} className="neu-concave p-2 rounded-[3.5rem] overflow-hidden">
                              <img 
                                src={url} 
                                alt="" 
                                className="rounded-[3rem] w-full h-auto max-h-[40rem] object-cover" 
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-10 border-t border-[var(--color-shadow-dark)]/10 text-[var(--color-text)]">
                      <div className="flex items-center gap-10">
                        <button 
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-4 transition-all ${likedPosts.has(post.id) ? 'text-[#FF2D55]' : 'text-[var(--color-text-muted)] hover:text-[#FF2D55]'}`}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${likedPosts.has(post.id) ? 'neu-concave bg-[#FF2D55]/5' : 'neu-button'}`}>
                            <Heart size={20} strokeWidth={3} fill={likedPosts.has(post.id) ? 'currentColor' : 'none'} />
                          </div>
                          <span className="text-body font-black italic">{post.likesCount || 0}</span>
                        </button>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-label font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)] opacity-40">
                        <span>{new Date(post.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span>Transmitted</span>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Load More Trigger */}
              <div ref={loadMoreRef} className="py-20 flex justify-center">
                {loadingMore ? (
                  <div className="flex items-center gap-4 text-label font-black uppercase tracking-[0.3em] text-[var(--color-accent)] animate-pulse">
                    <div className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    Retrieving...
                  </div>
                ) : hasMore ? (
                  <div className="h-2 w-full" />
                ) : posts.length > 0 && (
                  <div className="text-label font-black uppercase tracking-[0.4em] text-[var(--color-text-muted)] opacity-20">
                    End of Transmissions
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
