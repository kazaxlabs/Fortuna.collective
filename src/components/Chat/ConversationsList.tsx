import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/useAuth';
import { subscribeToConversations } from '../../services/chatService';
import { subscribeToUserProfile } from '../../services/userService';
import { User, MessageSquare, ChevronRight, Search } from 'lucide-react';

interface ConversationsListProps {
  onSelectConvo: (convoId: string) => void;
}

export default function ConversationsList({ onSelectConvo }: ConversationsListProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToConversations(user.uid, (convos) => {
      setConversations(convos);
      convos.forEach(convo => {
        const otherId = convo.participants.find((id: string) => id !== user.uid);
        if (otherId && !profiles[otherId]) {
          subscribeToUserProfile(otherId, (p) => {
            setProfiles(prev => ({ ...prev, [otherId]: p }));
          });
        }
      });
    });
    return () => unsub();
  }, [user]);

  const filteredConversations = conversations.filter(convo => {
    const otherId = convo.participants.find((id: string) => id !== user?.uid);
    const profile = profiles[otherId];
    if (!searchQuery.trim()) return true;
    return profile?.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-full bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col overflow-y-auto no-scrollbar">
      <div className="p-6 sm:p-14 space-y-8 sm:space-y-12">
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-text)] uppercase leading-none">Messages</h1>
          <p className="text-[var(--color-text)] opacity-40 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em]">Secure Direct Channels</p>
        </div>

        <div className="relative group neu-concave rounded-2xl sm:rounded-[2rem] p-1">
          <Search className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 text-[var(--color-text)] opacity-20 sm:w-5 sm:h-5" size={18} strokeWidth={2.5} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none py-3.5 sm:py-5 pl-12 sm:pl-16 pr-6 sm:pr-8 text-sm sm:text-lg text-[var(--color-text)] outline-none placeholder-[var(--color-text)] placeholder:opacity-20 font-medium"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:gap-10 pb-20">
          {conversations.length === 0 ? (
            <div className="py-20 sm:py-32 text-center neu-concave rounded-[3rem] sm:rounded-[4rem] space-y-8 sm:space-y-10">
              <div className="w-20 h-20 sm:w-24 sm:h-24 neu-convex rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mx-auto text-[var(--color-text)] opacity-10">
                <MessageSquare size={32} className="sm:w-10 sm:h-10" strokeWidth={1} />
              </div>
              <div className="space-y-3 px-6 sm:px-8">
                <h4 className="text-[var(--color-text)] opacity-40 text-xl sm:text-2xl font-black tracking-tight uppercase">Empty Archive</h4>
                <p className="text-[var(--color-text)] opacity-20 text-sm sm:text-base font-medium italic leading-relaxed max-w-sm mx-auto">
                  Initiate a dialogue from any profile to establish a connection.
                </p>
              </div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="py-20 sm:py-32 text-center neu-concave rounded-[3rem] sm:rounded-[4rem]">
              <p className="text-[var(--color-text)] opacity-40 text-sm sm:text-base font-medium italic px-6">No correspondences identified matching "{searchQuery}"</p>
            </div>
          ) : (
            filteredConversations.map((convo) => {
              const otherId = convo.participants.find((id: string) => id !== user?.uid);
              const profile = profiles[otherId];

              return (
                <motion.button
                  key={convo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => onSelectConvo(convo.id)}
                  className="w-full p-6 sm:p-10 neu-convex rounded-[2.5rem] sm:rounded-[3rem] flex items-center gap-6 sm:gap-10 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                >
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-[1.5rem] neu-concave p-0.5 sm:p-1 shrink-0">
                    <div className="w-full h-full rounded-[1.15rem] sm:rounded-[1.25rem] flex items-center justify-center overflow-hidden">
                      {profile?.avatar ? (
                        <img src={profile.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-3xl sm:text-4xl font-black text-[var(--color-text)] opacity-20">{(profile?.displayName || '?')[0].toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <h3 className="font-extrabold text-lg sm:text-2xl text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors tracking-tight truncate pr-2 sm:pr-4">
                        {profile?.displayName || 'Correspondent'}
                      </h3>
                      <span className="text-[8px] sm:text-[10px] font-black text-[var(--color-text)] opacity-20 uppercase tracking-widest whitespace-nowrap">
                        {convo.updatedAt?.seconds ? new Date(convo.updatedAt.seconds * 1000).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p className="text-sm sm:text-lg text-[var(--color-text)] opacity-40 truncate font-medium leading-relaxed">
                      {convo.lastMessage || 'Channel established'}
                    </p>
                  </div>
                  <ChevronRight size={20} className="sm:w-7 sm:h-7 text-[var(--color-text)] opacity-10 group-hover:text-[var(--color-accent)] group-hover:opacity-100 transition-all shrink-0" strokeWidth={3} />
                </motion.button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
