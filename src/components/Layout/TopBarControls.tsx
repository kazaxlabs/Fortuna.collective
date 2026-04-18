import React, { useState } from 'react';
import { Bell, Moon, Sun, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import ProfileModal from '../Profile/ProfileModal';

export default function TopBarControls() {
  const { profile } = useAuth();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-40 md:absolute md:top-8 md:right-12 md:left-auto">
        <div className="flex items-center justify-between md:justify-end gap-3 p-2 bg-[var(--color-bg)] border-b md:border border-[var(--color-shadow-dark)]/10 md:rounded-full shadow-2xl">
          {/* Logo/Brand for mobile */}
          <div className="md:hidden flex items-center gap-3 px-6">
            <ShieldCheck size={20} className="text-[var(--color-accent)]" />
            <span className="text-label font-black tracking-[0.4em] uppercase text-[var(--color-text-muted)]">Neural Network</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button 
                className="p-4 neu-button rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all flex items-center justify-center relative active:scale-95"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} strokeWidth={2.5} />
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-[var(--color-accent)] rounded-full animate-pulse shadow-[0_0_8px_var(--color-accent)]" />
              </button>
              
              {showNotifications && (
                <div className="absolute top-full right-0 mt-8 w-72 bg-[var(--color-bg)] neu-convex p-8 rounded-[2.5rem] shadow-2xl z-[60] border border-[var(--color-shadow-dark)]/5">
                  <h4 className="text-label font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-6 ml-2">Intelligence Stream</h4>
                  <div className="neu-concave p-8 rounded-2xl text-[var(--color-text-muted)] text-sm text-center font-bold italic tracking-tight opacity-40">
                    No active directives identified.
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button 
              className="p-4 neu-button rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all active:scale-95"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
            </button>

            {/* Profile */}
            <button 
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-4 pl-3 pr-8 py-2 ml-2 neu-button rounded-full transition-all group active:scale-95"
            >
              <div className="w-10 h-10 rounded-full neu-concave flex items-center justify-center text-label font-black text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-all">
                {profile?.displayName?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:block text-label font-black text-[var(--color-text-muted)] uppercase tracking-widest group-hover:text-[var(--color-text)] transition-all">{profile?.displayName || 'Identity'}</span>
            </button>
          </div>
        </div>
      </div>

      {showProfileModal && (
        <ProfileModal 
          isOpen={showProfileModal} 
          onClose={() => setShowProfileModal(false)} 
        />
      )}
    </>
  );
}
