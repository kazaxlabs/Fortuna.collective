import React from 'react';
import { Home, Search, Network, Bell, User, Plus } from 'lucide-react';

interface BottomNavProps {
  activeRoute: string;
  onRouteChange: (route: string) => void;
}

const NAV_ITEMS = [
  { id: 'feed', icon: Home, label: 'Newsstand' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'create', icon: Plus, label: 'Brief' },
  { id: 'network', icon: Network, label: 'Circle' },
  { id: 'notifications', icon: Bell, label: 'Intelligence' },
];

export default function BottomNav({ activeRoute, onRouteChange }: BottomNavProps) {
  return (
    <div className="md:hidden fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50">
      <div className="bg-[var(--color-bg)] neu-convex rounded-full p-2 flex items-center justify-around gap-2 shadow-2xl border border-[var(--color-shadow-dark)]/5">
        {NAV_ITEMS.map((item) => {
          const isActive = activeRoute === item.id || (item.id === 'feed' && activeRoute.startsWith('feed'));
          return (
            <button
              key={item.id}
              onClick={() => onRouteChange(item.id)}
              className={`flex-1 flex items-center justify-center py-4 rounded-full transition-all duration-300 active:scale-90 ${
                isActive 
                  ? 'neu-concave text-[var(--color-accent)]' 
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <item.icon size={22} strokeWidth={2.5} />
            </button>
          );
        })}
        <button
          onClick={() => onRouteChange('profile')}
          className="p-1 rounded-full transition-all active:scale-90"
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden transition-all ${activeRoute === 'profile' ? 'neu-concave scale-90' : 'neu-convex'}`}>
            <User size={20} strokeWidth={2.5} className={activeRoute === 'profile' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'} />
          </div>
        </button>
      </div>
    </div>
  );
}
