import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/useAuth';
import { 
  Home, Search, Plus, User, Bell, LogOut, Megaphone, Coffee, Handshake, 
  Building, ShieldAlert, Network, MessageSquare, ShieldCheck,
  TrendingUp, Monitor, Landmark, Scale, Hammer, Utensils, Globe
} from 'lucide-react';
import { subscribeToConversations } from '../../services/chatService';
import { subscribeToUserProfile } from '../../services/userService';
import { NicheGroup } from '../../services/agentService';

interface SidebarProps {
  activeRoute: string;
  onRouteChange: (route: string) => void;
}

const NAV_ITEMS = [
  { id: 'feed', icon: Home, label: 'Home' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'network', icon: Network, label: 'Network' },
  { id: 'files', icon: Building, label: 'Library' },
  { id: 'messages', icon: MessageSquare, label: 'Messages' },
  { id: 'create', icon: Plus, label: 'Create Post' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'profile', icon: User, label: 'Profile' },
];

const OFFICIAL_ROOMS = [
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'rules', label: 'Rules', icon: ShieldAlert },
  { id: 'introductions', label: 'Introductions', icon: Handshake },
  { id: 'lounge', label: 'Lounge', icon: Coffee },
];

const PILLAR_CHANNELS = [
  { id: NicheGroup.SALES, label: NicheGroup.SALES, icon: TrendingUp },
  { id: NicheGroup.MEDIA, label: NicheGroup.MEDIA, icon: Globe },
  { id: NicheGroup.FINANCE, label: NicheGroup.FINANCE, icon: Landmark },
  { id: NicheGroup.LAW, label: NicheGroup.LAW, icon: Scale },
  { id: NicheGroup.REAL_ESTATE, label: NicheGroup.REAL_ESTATE, icon: Building },
  { id: NicheGroup.TRADES, label: NicheGroup.TRADES, icon: Hammer },
  { id: NicheGroup.HOSPITALITY, label: NicheGroup.HOSPITALITY, icon: Utensils },
];

export default function Sidebar({ activeRoute, onRouteChange }: SidebarProps) {
  const { user, profile, logout } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [convoProfiles, setConvoProfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToConversations(user.uid, (convos) => {
      setConversations(convos);
      convos.forEach(convo => {
        const otherId = convo.participants.find((id: string) => id !== user.uid);
        if (otherId && !convoProfiles[otherId]) {
          subscribeToUserProfile(otherId, (p) => {
            setConvoProfiles(prev => ({ ...prev, [otherId]: p }));
          });
        }
      });
    });
    return () => unsub();
  }, [user]);

  const getInitial = (name?: string) => (name || '?')[0].toUpperCase();

  return (
    <motion.div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{ width: isHovered ? 280 : 88 }}
      transition={{ type: 'spring', damping: 20, stiffness: 120 }}
      className="h-screen bg-[var(--color-bg)] neu-convex flex flex-col z-50 overflow-hidden"
    >
      {/* Account Section */}
      <div className="p-6">
        <div className="flex items-center gap-4 overflow-hidden">
          <div 
            className="w-12 h-12 rounded-2xl neu-concave flex items-center justify-center shrink-0 overflow-hidden transition-transform active:scale-95 cursor-pointer"
            onClick={() => onRouteChange('profile')}
          >
            {profile?.avatar ? (
              <img src={profile.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-xl font-bold text-[var(--color-text)] opacity-40">{getInitial(profile?.displayName)}</span>
            )}
          </div>
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col min-w-0"
              >
                <span className="text-sm font-bold truncate text-[var(--color-text)] tracking-tight">{profile?.displayName || 'Account'}</span>
                <span className="text-[10px] text-[var(--color-accent)] font-bold truncate uppercase tracking-widest">{profile?.role === 'admin' ? 'Admin' : 'Member'}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col px-4 space-y-4 shadow-inner pt-4">
        <div className="flex flex-col gap-3 mb-8">
          {NAV_ITEMS.map((item) => {
            const isActive = activeRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onRouteChange(item.id)}
                className={`flex items-center h-12 px-3 rounded-2xl transition-all duration-300 group relative ${
                  isActive 
                    ? 'neu-concave text-[var(--color-accent)] scale-[0.98]' 
                    : 'text-[var(--color-text)] neu-button'
                }`}
              >
                <div className="w-10 flex items-center justify-center shrink-0">
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <AnimatePresence>
                  {isHovered && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="ml-3 text-sm font-bold tracking-tight"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}

          {profile?.role === 'admin' && (
            <button
              onClick={() => onRouteChange('founder-control')}
              className={`flex items-center h-12 px-3 rounded-2xl transition-all duration-300 group relative ${
                activeRoute === 'founder-control' 
                  ? 'neu-concave text-[#FF9500] scale-[0.98]' 
                  : 'text-[var(--color-text)] neu-button'
              }`}
            >
              <div className="w-10 flex items-center justify-center shrink-0">
                <ShieldCheck size={22} strokeWidth={activeRoute === 'founder-control' ? 2.5 : 2} />
              </div>
              <AnimatePresence>
                {isHovered && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="ml-3 text-sm font-bold tracking-tight"
                  >
                    Governance
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {isHovered && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-4 mb-2 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest"
              >
                Information
              </motion.span>
            )}
          </AnimatePresence>
          {OFFICIAL_ROOMS.map((room) => {
            const isActive = activeRoute === room.id || activeRoute === `feed:${room.id}`;
            return (
              <button
                key={room.id}
                onClick={() => onRouteChange(`feed:${room.id}`)}
                className={`flex items-center h-12 px-3 rounded-2xl transition-all duration-300 group relative ${
                  isActive 
                    ? 'neu-concave text-[var(--color-accent)] scale-[0.98]' 
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] neu-button'
                }`}
              >
                <div className="w-10 flex items-center justify-center shrink-0">
                  <room.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <AnimatePresence>
                  {isHovered && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="ml-3 text-sm font-bold tracking-tight"
                    >
                      {room.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 pt-6">
          <AnimatePresence>
            {isHovered && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-4 mb-2 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest"
              >
                Channels
              </motion.span>
            )}
          </AnimatePresence>
          {PILLAR_CHANNELS.map((channel) => {
            const isActive = activeRoute === `feed:${channel.id}`;
            return (
              <button
                key={channel.id}
                onClick={() => onRouteChange(`feed:${channel.id}`)}
                className={`flex items-center h-12 px-3 rounded-2xl transition-all duration-300 group relative ${
                  isActive 
                    ? 'neu-concave text-[var(--color-accent)] scale-[0.98]' 
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] neu-button'
                }`}
              >
                <div className="w-10 flex items-center justify-center shrink-0">
                  <channel.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <AnimatePresence>
                  {isHovered && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="ml-3 text-sm font-bold tracking-tight"
                    >
                      {channel.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>

        {/* Messaging */}
        <div className="mt-8 flex flex-col gap-3">
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-4 mb-2"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text)] opacity-30">Recents</span>
              </motion.div>
            )}
          </AnimatePresence>
          {conversations.map((convo) => {
            const otherId = convo.participants.find((id: string) => id !== user?.uid);
            const otherProfile = convoProfiles[otherId];
            const isActive = activeRoute === `direct-chat:${convo.id}`;

            return (
              <button
                key={convo.id}
                onClick={() => onRouteChange(`direct-chat:${convo.id}`)}
                className={`flex items-center h-16 px-3 rounded-2xl transition-all duration-300 group relative ${
                  isActive 
                    ? 'neu-concave scale-[0.98]' 
                    : 'neu-button'
                }`}
              >
                <div className="w-10 flex items-center justify-center shrink-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-500 neu-concave`}>
                    {otherProfile?.avatar ? (
                      <img src={otherProfile.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-[var(--color-text)] opacity-40">{getInitial(otherProfile?.displayName)}</span>
                    )}
                  </div>
                </div>
                <AnimatePresence>
                  {isHovered && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex flex-col items-start min-w-0 ml-4 pr-2"
                    >
                      <span className={`text-sm font-bold truncate w-full tracking-tight text-[var(--color-text)]`}>{otherProfile?.displayName || 'Identity'}</span>
                      <span className="text-[10px] text-[var(--color-text)] opacity-40 font-bold uppercase tracking-widest truncate w-full text-left">{convo.lastMessage || 'No messages'}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-[var(--color-shadow-dark)]/10 flex flex-col gap-2">
        <button onClick={logout} className="flex items-center h-12 px-3 rounded-2xl text-[#FF3B30] neu-button overflow-hidden group active:scale-95">
          <div className="w-10 flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
            <LogOut size={22} strokeWidth={2.5} />
          </div>
          <AnimatePresence>
            {isHovered && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-3 text-sm font-bold tracking-tight"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
}
