import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type RoomPref = 'all' | 'mentions' | 'muted';

interface NotificationPrefs {
  soundEnabled: boolean;
  roomPrefs: Record<string, RoomPref>;
}

interface NotificationContextType {
  prefs: NotificationPrefs;
  toggleSound: () => void;
  setRoomPref: (roomId: string, pref: RoomPref) => void;
  playNotification: (roomId: string, isMention?: boolean) => void;
}

const defaultPrefs: NotificationPrefs = {
  soundEnabled: true,
  roomPrefs: {}
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<NotificationPrefs>(() => {
    try {
      const saved = localStorage.getItem('fortuna_notif_prefs');
      return saved ? JSON.parse(saved) : defaultPrefs;
    } catch (e) {
      return defaultPrefs;
    }
  });

  useEffect(() => {
    localStorage.setItem('fortuna_notif_prefs', JSON.stringify(prefs));
  }, [prefs]);

  const toggleSound = () => setPrefs(p => ({ ...p, soundEnabled: !p.soundEnabled }));

  const setRoomPref = (roomId: string, pref: RoomPref) => {
    setPrefs(p => ({ ...p, roomPrefs: { ...p.roomPrefs, [roomId]: pref } }));
  };

  const playNotification = (roomId: string, isMention = false) => {
    if (!prefs.soundEnabled) return;
    const roomPref = prefs.roomPrefs[roomId] || 'all';
    if (roomPref === 'muted') return;
    if (roomPref === 'mentions' && !isMention) return;

    // Play a subtle pop sound
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.volume = 0.4;
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  return (
    <NotificationContext.Provider value={{ prefs, toggleSound, setRoomPref, playNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
