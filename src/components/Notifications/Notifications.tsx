import React from 'react';
import { Bell, UserPlus, Heart, MessageSquare, Briefcase, TrendingUp, Check } from 'lucide-react';
import AgentActionPrompts from './AgentActionPrompts';

export default function Notifications() {
  const NOTIFICATIONS = [
    { id: '1', type: 'like', user: 'Sarah Jenkins', content: 'liked your post in #realestate', time: '2m ago', icon: Heart, color: 'text-white' },
    { id: '2', type: 'follow', user: 'Marcus Thorne', content: 'started following you', time: '15m ago', icon: UserPlus, color: 'text-white' },
    { id: '3', type: 'comment', user: 'Elena Vance', content: 'commented on your update', time: '1h ago', icon: MessageSquare, color: 'text-white' },
    { id: '4', type: 'opportunity', user: 'Global Capital', content: 'posted a new opportunity in #finance', time: '3h ago', icon: Briefcase, color: 'text-white' },
    { id: '5', type: 'trending', user: 'Network', content: '#tech is trending in your area', time: '5h ago', icon: TrendingUp, color: 'text-white' },
  ];

  return (
    <div className="h-full bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col">
      <div className="p-6 sm:p-8 border-b border-[var(--color-shadow-dark)]/10 sticky top-0 z-10 flex items-center justify-between bg-[var(--color-bg)]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 neu-convex rounded-xl sm:rounded-2xl text-[var(--color-accent)]">
            <Bell size={20} className="sm:w-6 sm:h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase">Notifications</h1>
        </div>
        <button className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text)] opacity-40 hover:opacity-100 hover:neu-button px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all">
          Clear All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 sm:space-y-10 no-scrollbar">
        <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 pb-20">
          <AgentActionPrompts />
          {NOTIFICATIONS.map((notif) => (
            <div
              key={notif.id}
              className="flex items-start gap-4 sm:gap-6 p-5 sm:p-6 neu-convex rounded-[2rem] sm:rounded-[2.5rem] hover:scale-[1.02] transition-all group cursor-pointer"
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl neu-concave flex items-center justify-center shrink-0`}>
                <notif.icon size={20} className="sm:w-[22px] sm:h-[22px] text-[var(--color-accent)]" />
              </div>
              <div className="flex-1 space-y-1 sm:space-y-2 min-w-0">
                <p className="text-sm sm:text-base leading-relaxed">
                  <span className="font-extrabold text-[var(--color-text)]">{notif.user}</span>{' '}
                  <span className="text-[var(--color-text)] opacity-60 font-medium">{notif.content}</span>
                </p>
                <span className="text-[9px] sm:text-[10px] text-[var(--color-text)] opacity-40 font-black uppercase tracking-widest">{notif.time}</span>
              </div>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[var(--color-accent)] mt-3 opacity-0 group-hover:opacity-100 transition-all shadow-[0_0_10px_var(--color-accent)] shrink-0" />
            </div>
          ))}

          {/* Empty State / End of list */}
          <div className="py-16 sm:py-24 text-center space-y-4 sm:space-y-6 border-t border-[var(--color-shadow-dark)]/10 mt-8 sm:mt-12 bg-transparent">
            <div className="w-12 h-12 sm:w-16 sm:h-16 neu-concave rounded-full flex items-center justify-center mx-auto text-[var(--color-text)] opacity-10">
              <Check size={24} className="sm:w-8 sm:h-8" />
            </div>
            <p className="text-xs sm:text-sm text-[var(--color-text)] opacity-20 italic font-medium">All caught up.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
