import React from 'react';
import { Home, Search, Network, Bell, User, Plus } from 'lucide-react';

interface BottomNavProps {
  activeRoute: string;
  onRouteChange: (route: string) => void;
}

const NAV_ITEMS = [
  { id: 'feed', icon: Home, label: 'Home' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'create', icon: Plus, label: 'Post' },
  { id: 'network', icon: Network, label: 'Network' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
];

export default function BottomNav({ activeRoute, onRouteChange }: BottomNavProps) {
  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 w-full z-50 px-4 pt-4 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/80 to-transparent"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
    >
      <div className="mx-auto max-w-sm bg-[var(--color-bg)]/90 backdrop-blur-2xl neu-convex rounded-[2.5rem] p-3 flex items-center justify-around gap-2 shadow-2xl border border-[var(--color-shadow-dark)]/10">
        {NAV_ITEMS.map((item) => {
          const isActive = activeRoute === item.id || (item.id === 'feed' && activeRoute.startsWith('feed'));
          return (
            <button
              key={item.id}
              onClick={() => onRouteChange(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-3 rounded-2xl transition-all duration-300 active:scale-90 ${
                isActive 
                  ? 'neu-concave text-[var(--color-accent)]' 
                  : 'text-[var(--color-text-muted)] opacity-60'
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 3 : 2} />
              <span className={`text-[8px] font-black uppercase tracking-widest mt-1 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
        <button
          onClick={() => onRouteChange('profile')}
          className="p-1 rounded-full transition-all active:scale-90"
        >
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center overflow-hidden transition-all ${activeRoute === 'profile' ? 'neu-concave scale-90' : 'neu-convex'}`}>
            <User size={20} strokeWidth={activeRoute === 'profile' ? 3 : 2} className={activeRoute === 'profile' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)] opacity-60'} />
          </div>
        </button>
      </div>
    </div>
  );
}
