import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Hash, Megaphone, ShieldAlert, Handshake, Heart, Plus, X, Coffee, MoreVertical, Trash2, Archive, Tag, TrendingUp, Globe, Landmark, Scale, Building, Hammer, Utensils } from 'lucide-react';
import { subscribeToPosts, createPost, toggleLike, subscribeToUserLikes, deletePost, archivePost, getPostsPaginated } from '../../services/postService';
import { useAuth } from '../../context/useAuth';
import { NicheGroup } from '../../services/agentService';

interface FeedProps {
  roomId?: string;
  onNavigateToProfile?: (userId: string) => void;
}

const ROOM_META: Record<string, { label: string; icon: any }> = {
  announcements: { label: 'Announcements', icon: Megaphone },
  rules: { label: 'Rules', icon: ShieldAlert },
  introductions: { label: 'Introductions', icon: Handshake },
  lounge: { label: 'Lounge', icon: Coffee },
  [NicheGroup.SALES]: { label: NicheGroup.SALES, icon: TrendingUp },
  [NicheGroup.MEDIA]: { label: NicheGroup.MEDIA, icon: Globe },
  [NicheGroup.FINANCE]: { label: NicheGroup.FINANCE, icon: Landmark },
  [NicheGroup.LAW]: { label: NicheGroup.LAW, icon: Scale },
  [NicheGroup.REAL_ESTATE]: { label: NicheGroup.REAL_ESTATE, icon: Building },
  [NicheGroup.TRADES]: { label: NicheGroup.TRADES, icon: Hammer },
  [NicheGroup.HOSPITALITY]: { label: NicheGroup.HOSPITALITY, icon: Utensils },
};

const HOME_TABS = [
  { id: 'lounge', label: 'Lounge' },
  { id: 'announcements', label: 'Announcements' },
  { id: 'introductions', label: 'Introductions' },
];

export default function Feed({ roomId, onNavigateToProfile }: FeedProps) {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [selectedNiche, setSelectedNiche] = useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const loadMoreRef = React.useRef<HTMLDivElement>(null);
  
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Set default niche from profile when available
  useEffect(() => {
    if (profile?.nicheGroup) {
      setSelectedNiche(profile.nicheGroup);
    } else {
      setSelectedNiche(NicheGroup.SALES);
    }
  }, [profile]);

  // Initialize currentTab from roomId if it's a home tab, otherwise default to lounge
  const [currentTab, setCurrentTab] = useState(() => {
    if (roomId && HOME_TABS.some(t => t.id === roomId)) return roomId;
    return 'lounge';
  });

  // If roomId changes and it's a home tab, update currentTab
  useEffect(() => {
    if (roomId && HOME_TABS.some(t => t.id === roomId)) {
      setCurrentTab(roomId);
    }
  }, [roomId]);

  const isHomeCategory = !roomId || HOME_TABS.some(t => t.id === roomId);
  const effectiveRoomId = isHomeCategory ? (currentTab === 'lounge' ? 'general' : currentTab) : roomId;
  
  const isPillarChannel = Object.values(NicheGroup).includes(effectiveRoomId as NicheGroup);
  const meta = ROOM_META[isHomeCategory ? currentTab : (roomId || '')];
  const isAdmin = profile?.role === 'admin';
  const adminOnlyRooms = ['announcements', 'rules'];
  const canPost = !adminOnlyRooms.includes(effectiveRoomId || '') || isAdmin;

  // Sync selectedNiche with Pillar Channel
  useEffect(() => {
    if (isPillarChannel) {
      setSelectedNiche(effectiveRoomId);
    }
  }, [isPillarChannel, effectiveRoomId]);

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      setPosts([]);
      setLastVisible(null);
      setHasMore(true);
      
      const { posts: initialPosts, lastVisible: lastDoc } = await getPostsPaginated(10, null, effectiveRoomId);
      setPosts(initialPosts);
      setLastVisible(lastDoc);
      if (initialPosts.length < 10) setHasMore(false);
      setLoading(false);
    };

    fetchInitial();
  }, [effectiveRoomId]);

  // Infinite scroll trigger
  useEffect(() => {
    if (!hasMore || loadingMore || loading) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        handleLoadMore();
      }
    }, { threshold: 0.1 });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, lastVisible]);

  const handleLoadMore = async () => {
    if (!hasMore || loadingMore || !lastVisible) return;
    setLoadingMore(true);
    
    // Simulate slight delay for tactile feel
    await new Promise(r => setTimeout(r, 400));
    
    const { posts: nextPosts, lastVisible: nextDoc } = await getPostsPaginated(10, lastVisible, effectiveRoomId);
    
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

  const handlePost = async () => {
    if (!newPost.trim() || !user || !canPost) return;
    setLoading(true);
    try {
      await createPost(user, newPost, effectiveRoomId || 'general', attachments, selectedNiche);
      setNewPost('');
      setAttachments([]);
    } catch (error) {
      console.error('Failed to post:', error);
    } finally {
      setLoading(false);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('File size too large. Please upload an image smaller than 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAttachments([...attachments, base64String]);
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
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
    if (!confirm('Are you sure you want to archive this post? It will be hidden from the feed.')) return;
    try {
      await archivePost(postId);
      setActiveMenuId(null);
    } catch (error) {
      console.error('Failed to archive post:', error);
    }
  };

  const getInitial = (name: string) => (name || '?')[0].toUpperCase();

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)] text-[var(--color-text)] overflow-y-auto no-scrollbar">
      {/* Tab Navigation */}
      {isHomeCategory && (
        <div className="sticky top-0 z-10 bg-[var(--color-bg)]/90 backdrop-blur-xl border-b border-[var(--color-shadow-dark)]/10 flex w-full p-4 gap-4">
          <div className="flex w-full neu-concave rounded-3xl p-1.5 overflow-hidden">
            {HOME_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex-1 py-3 text-label font-black uppercase tracking-widest transition-all relative rounded-2xl ${
                  currentTab === tab.id 
                    ? 'neu-convex text-[var(--color-accent)]' 
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto w-full space-y-8 sm:space-y-16 p-4 sm:p-8 pb-32">
        {/* Header if filtered (not home category) */}
        {!isHomeCategory && meta && (
          <div className="flex items-center gap-4 sm:gap-8 pb-6 sm:pb-10 border-b border-[var(--color-shadow-dark)]/10">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl neu-convex flex items-center justify-center text-[var(--color-accent)]`}>
              <meta.icon size={24} className="sm:hidden" />
              <meta.icon size={32} className="hidden sm:block" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-h2 tracking-tight text-[var(--color-text)] uppercase">{meta.label}</h1>
              <p className="text-[9px] sm:text-label font-black uppercase tracking-[0.2em] mt-1 text-[var(--color-text-muted)]">
                {effectiveRoomId === 'rules' ? 'Official' : 
                 ['announcements', 'introductions'].includes(effectiveRoomId) ? 'System' : 
                 'Channel'}
              </p>
            </div>
          </div>
        )}

        {/* Create Post */}
        {canPost && (
          <div className="p-6 sm:p-10 neu-convex rounded-[2.5rem] sm:rounded-[3rem] space-y-6 sm:space-y-8">
            <div className="flex gap-4 sm:gap-6">
              <div className="flex flex-col items-center gap-4 sm:gap-6 shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-[1.5rem] neu-concave flex items-center justify-center overflow-hidden">
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User size={24} className="text-[var(--color-text)] opacity-20" />
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 sm:p-4 text-[var(--color-text)] opacity-40 hover:opacity-100 transition-all neu-button rounded-xl sm:rounded-2xl"
                  title="Attach Photo"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex-1 space-y-6 sm:space-y-8">
                <textarea
                  placeholder={effectiveRoomId === 'announcements' ? "Compose announcement..." : "What's on your mind?"}
                  className="w-full bg-transparent border-none outline-none text-base sm:text-body-lg text-[var(--color-text)] placeholder-[var(--color-text-muted)] placeholder:opacity-40 resize-none py-1 sm:py-2 tracking-tight leading-relaxed font-medium"
                  rows={2}
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                />
                
                {/* Attachments Preview */}
                <AnimatePresence>
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-[var(--color-shadow-dark)]/10">
                      {attachments.map((url, index) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          key={index} 
                          className="relative group rounded-2xl sm:rounded-[2rem] overflow-hidden neu-convex p-0.5 sm:p-1"
                        >
                          <img src={url} alt="Draft" className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-xl sm:rounded-[1.5rem]" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="absolute top-1 right-1 p-1 bg-black/50 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-0 pt-6 sm:pt-8 border-t border-[var(--color-shadow-dark)]/10">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <label className="text-[9px] sm:text-label font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                      Channels:
                    </label>
                    {isPillarChannel ? (
                      <div className="px-3 py-1.5 text-[9px] sm:text-label text-[var(--color-accent)] font-black uppercase tracking-widest italic flex items-center gap-2">
                        <Tag size={10} strokeWidth={3} />
                        {effectiveRoomId}
                      </div>
                    ) : (
                      <select 
                        value={selectedNiche}
                        onChange={(e) => setSelectedNiche(e.target.value)}
                        className="neu-concave border-none rounded-xl px-3 py-1.5 text-[9px] sm:text-label text-[var(--color-text)] font-bold outline-none cursor-pointer"
                      >
                        {Object.values(NicheGroup).map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <button 
                    onClick={handlePost}
                    disabled={loading || !newPost.trim()}
                    className="w-full sm:w-auto neu-button-accent text-white px-10 py-4 rounded-2xl sm:rounded-3xl text-label font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 active:scale-95 shadow-lg"
                  >
                    {loading ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!canPost && adminOnlyRooms.includes(effectiveRoomId || '') && (
          <div className="p-6 bg-[#111] border border-white/20 rounded-xl text-center">
            <p className="text-xs text-white/60 uppercase tracking-widest">
              Only administrators can post in {meta?.label}
            </p>
          </div>
        )}

        {/* Feed */}
        <div className="space-y-12">
          <div className="flex items-center justify-between">
            <h2 className="text-label font-black text-[var(--color-text-muted)] uppercase tracking-[0.4em] ml-2">
              {roomId ? `${meta?.label} Feed` : 'Updates'}
            </h2>
          </div>

          {posts.length === 0 && !loading ? (
            <div className="py-40 text-center neu-concave rounded-[4rem] space-y-8">
              <div className="w-24 h-24 neu-convex rounded-full flex items-center justify-center mx-auto text-[var(--color-text-muted)] opacity-20">
                <Coffee size={40} />
              </div>
              <div className="space-y-2">
                <h4 className="text-h3 text-[var(--color-text)] opacity-60">No Posts Yet</h4>
                <p className="text-body-sm text-[var(--color-text-muted)] italic font-medium">Share an update with your network.</p>
              </div>
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={post.id} 
                  className="neu-convex rounded-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-10 hover:translate-y-[-2px] transition-transform duration-500 relative group"
                >
                  <div className="flex items-center justify-between mb-6 sm:mb-10">
                    <button 
                      onClick={() => onNavigateToProfile?.(post.authorUid)}
                      className="flex items-center gap-4 sm:gap-6 hover:opacity-80 transition-opacity text-left"
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl neu-concave flex items-center justify-center overflow-hidden shrink-0">
                        {post.avatar ? (
                          <img src={post.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-xl sm:text-h3 text-[var(--color-text-muted)] opacity-20">{getInitial(post.authorName)}</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-base sm:text-h3 text-[var(--color-text)] tracking-tight leading-none uppercase">{post.authorName}</span>
                          {post.nicheGroup && (
                            <div className="flex items-center gap-2 px-2 sm:px-3 py-1 neu-concave text-[var(--color-accent)] rounded-full text-[8px] sm:text-label font-black uppercase tracking-widest scale-90 sm:scale-100">
                              <Tag size={8} className="sm:w-[10px] sm:h-[10px]" strokeWidth={3} />
                              {post.nicheGroup}
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] sm:text-label text-[var(--color-text-muted)] font-black uppercase tracking-widest mt-1 sm:mt-1.5 opacity-60">
                          {post.authorUid === 'admin' ? 'Admin' : 'Member'}
                        </span>
                      </div>
                    </button>

                    {(post.authorUid === user?.uid || isAdmin) && (
                      <div className="relative">
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === post.id ? null : post.id)}
                          className="p-3 sm:p-4 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all neu-button rounded-xl sm:rounded-2xl"
                        >
                          <MoreVertical size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                        </button>
                        
                        <AnimatePresence>
                          {activeMenuId === post.id && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 10 }}
                              className="absolute right-0 mt-3 sm:mt-5 w-48 sm:w-60 neu-convex rounded-2xl sm:rounded-3xl z-20 overflow-hidden shadow-2xl"
                            >
                              <button 
                                onClick={() => handleArchivePost(post.id)}
                                className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 text-[9px] sm:text-label font-black uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[#FF9500] hover:neu-concave transition-all"
                              >
                                <Archive size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
                                Archive
                              </button>
                              <button 
                                onClick={() => handleDeletePost(post.id)}
                                className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 text-[9px] sm:text-label font-black uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[#FF3B30] hover:neu-concave transition-all border-t border-[var(--color-shadow-dark)]/5"
                              >
                                <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
                                Delete
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-6 sm:space-y-10 mb-8 sm:mb-12">
                    <p className="text-sm sm:text-body-lg text-[var(--color-text)] leading-[1.6] whitespace-pre-wrap tracking-normal font-medium opacity-90">
                      {post.content}
                    </p>
                    
                    {post.attachments && post.attachments.length > 0 && (
                      <div className={`grid gap-4 sm:gap-6 ${post.attachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {post.attachments.map((url: string, idx: number) => (
                          <div key={idx} className="rounded-2xl sm:rounded-[2.5rem] overflow-hidden neu-concave p-1 sm:p-2">
                            <img 
                              src={url} 
                              alt="" 
                              className="w-full h-auto max-h-[400px] sm:max-h-[600px] object-cover rounded-xl sm:rounded-[2rem]" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-6 sm:pt-10 border-t border-[var(--color-shadow-dark)]/10">
                    <div className="flex items-center gap-6 sm:gap-10">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 sm:gap-3 transition-all ${likedPosts.has(post.id) ? 'text-[#FF2D55]' : 'text-[var(--color-text-muted)] hover:text-[#FF2D55]'}`}
                      >
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center transition-all ${likedPosts.has(post.id) ? 'neu-concave' : 'neu-button'}`}>
                          <Heart size={18} strokeWidth={2.5} fill={likedPosts.has(post.id) ? 'currentColor' : 'none'} className={`sm:w-5 sm:h-5 ${likedPosts.has(post.id) ? 'scale-110' : ''}`} />
                        </div>
                        <span className="text-sm sm:text-body font-black italic">{post.likesCount || 0}</span>
                      </button>
                      
                      <div className="flex items-center gap-2 sm:gap-3 text-[var(--color-text-muted)]">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl neu-convex flex items-center justify-center">
                          <Handshake size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                        </div>
                        <span className="text-sm sm:text-body font-black italic">{post.followersCount || 0}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1.5 text-[var(--color-text-muted)] text-[8px] sm:text-label font-black uppercase tracking-[0.2em] opacity-40">
                      <span>{new Date(post.createdAt?.seconds * 1000 || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>Posted</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Load More Trigger */}
              <div ref={loadMoreRef} className="py-20 flex justify-center">
                {(loadingMore || loading) ? (
                  <div className="flex items-center gap-4 text-label font-black uppercase tracking-[0.3em] text-[var(--color-accent)] animate-pulse">
                    <div className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    Updating...
                  </div>
                ) : hasMore ? (
                  <div className="h-2 w-full" />
                ) : posts.length > 0 && (
                  <div className="text-label font-black uppercase tracking-[0.4em] text-[var(--color-text-muted)] opacity-20">
                    No More Updates
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
