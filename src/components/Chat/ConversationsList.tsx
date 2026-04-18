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
      <div className="p-10 sm:p-14 space-y-12">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-[var(--color-text)] uppercase leading-none">Correspondence</h1>
          <p className="text-[var(--color-text)] opacity-40 text-[10px] font-black uppercase tracking-[0.3em]">Secure direct channels.</p>
        </div>

        <div className="relative group neu-concave rounded-[2rem] p-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--color-text)] opacity-20" size={20} strokeWidth={2.5} />
          <input
            type="text"
            placeholder="Search correspondents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none py-5 pl-16 pr-8 text-lg text-[var(--color-text)] outline-none placeholder-[var(--color-text)] placeholder:opacity-20 font-medium"
          />
        </div>

        <div className="grid grid-cols-1 gap-10 pb-20">
          {conversations.length === 0 ? (
            <div className="py-32 text-center neu-concave rounded-[4rem] space-y-10">
              <div className="w-24 h-24 neu-convex rounded-[2rem] flex items-center justify-center mx-auto text-[var(--color-text)] opacity-10">
                <MessageSquare size={40} strokeWidth={1} />
              </div>
              <div className="space-y-3 px-8">
                <h4 className="text-[var(--color-text)] opacity-40 text-2xl font-black tracking-tight uppercase">The Archives are Empty</h4>
                <p className="text-[var(--color-text)] opacity-20 text-base font-medium italic leading-relaxed max-w-sm mx-auto">
                  Initiate a dialogue from any colleague's profile to establish a connection.
                </p>
              </div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="py-32 text-center neu-concave rounded-[4rem]">
              <p className="text-[var(--color-text)] opacity-40 text-base font-medium italic">No correspondences identified matching "{searchQuery}"</p>
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
                  className="w-full p-10 neu-convex rounded-[3rem] flex items-center gap-10 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                >
                  <div className="w-24 h-24 rounded-[1.5rem] neu-concave p-1 shrink-0">
                    <div className="w-full h-full rounded-[1.25rem] flex items-center justify-center overflow-hidden">
                      {profile?.avatar ? (
                        <img src={profile.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-4xl font-black text-[var(--color-text)] opacity-20">{(profile?.displayName || '?')[0].toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-extrabold text-2xl text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors tracking-tight truncate pr-4">
                        {profile?.displayName || 'Counterparty'}
                      </h3>
                      <span className="text-[10px] font-black text-[var(--color-text)] opacity-20 uppercase tracking-widest whitespace-nowrap">
                        {convo.updatedAt?.seconds ? new Date(convo.updatedAt.seconds * 1000).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p className="text-lg text-[var(--color-text)] opacity-40 truncate font-medium leading-relaxed">
                      {convo.lastMessage || 'Channel established'}
                    </p>
                  </div>
                  <ChevronRight size={28} className="text-[var(--color-text)] opacity-10 group-hover:text-[var(--color-accent)] group-hover:opacity-100 transition-all shrink-0" strokeWidth={3} />
                </motion.button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
