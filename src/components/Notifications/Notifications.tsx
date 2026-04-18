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
      <div className="p-8 border-b border-[var(--color-shadow-dark)]/10 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 neu-convex rounded-2xl text-[var(--color-accent)]">
            <Bell size={24} />
          </div>
          <h1 className="text-2xl font-black tracking-tight uppercase">Signals</h1>
        </div>
        <button className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text)] opacity-40 hover:opacity-100 hover:neu-button px-4 py-2 rounded-xl transition-all">
          Clear Buffer
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
        <div className="max-w-2xl mx-auto space-y-8">
          <AgentActionPrompts />
          {NOTIFICATIONS.map((notif) => (
            <div
              key={notif.id}
              className="flex items-start gap-6 p-6 neu-convex rounded-[2.5rem] hover:scale-[1.02] transition-all group cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-2xl neu-concave flex items-center justify-center shrink-0`}>
                <notif.icon size={22} className="text-[var(--color-accent)]" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-base leading-relaxed">
                  <span className="font-extrabold text-[var(--color-text)]">{notif.user}</span>{' '}
                  <span className="text-[var(--color-text)] opacity-60 font-medium">{notif.content}</span>
                </p>
                <span className="text-[10px] text-[var(--color-text)] opacity-40 font-black uppercase tracking-widest">{notif.time}</span>
              </div>
              <div className="w-3 h-3 rounded-full bg-[var(--color-accent)] mt-3 opacity-0 group-hover:opacity-100 transition-all shadow-[0_0_10px_var(--color-accent)]" />
            </div>
          ))}

          {/* Empty State / End of list */}
          <div className="py-24 text-center space-y-6 border-t border-[var(--color-shadow-dark)]/10 mt-12 bg-transparent">
            <div className="w-16 h-16 neu-concave rounded-full flex items-center justify-center mx-auto text-[var(--color-text)] opacity-10">
              <Check size={32} />
            </div>
            <p className="text-sm text-[var(--color-text)] opacity-20 italic font-medium">Equilibrium restored. Collective sync complete.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
