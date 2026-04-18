import React from 'react';
import { motion as Motion } from 'framer-motion';
import { useAuth } from '../../context/useAuth';
import './Sidebar.css';

const ROOMS = [
  {
    section: 'Main Stage',
    items: [
      { id: 'announcements', label: 'Announcements', icon: '📢', adminOnly: true },
      { id: 'introductions', label: 'Introductions', icon: '🤝' },
      { id: 'lounge', label: 'General Lounge', icon: '💎' },
    ],
  },
  {
    section: 'Breakout Rooms',
    items: [
      { id: 'sales', label: 'Sales & Marketing', icon: '📈' },
      { id: 'media', label: 'Media & Advertising', icon: '🎬' },
      { id: 'finance', label: 'Finance & Trading', icon: '💰' },
      { id: 'law', label: 'Law', icon: '⚖️' },
      { id: 'realestate', label: 'Real Estate', icon: '🏠' },
      { id: 'trades', label: 'Trades & Construction', icon: '🛠️' },
      { id: 'hospitality', label: 'Hospitality', icon: '🥂' },
    ],
  },
  {
    section: 'The Vault',
    items: [
      { id: 'event-access', label: 'Event Access', icon: '🎟️' },
      { id: 'opportunities', label: 'Opportunities / Hires', icon: '🤝' },
      { id: 'rules', label: 'Support & Rules', icon: '🛠️' },
    ],
  },
];

export default function Sidebar({ activeRoom, onRoomChange }) {
  const { profile, logout } = useAuth();
  const isAdmin = profile?.role === 'admin';

  return (
    <aside className="sidebar glass">
      {/* Logo */}
      <div className="sidebar-logo">
        <span className="sidebar-logo-f">𝔽</span>
        <div>
          <div className="sidebar-brand">FORTUNA</div>
          <div className="sidebar-tagline label-gold">Inner Circle</div>
        </div>
      </div>

      <div className="divider" />

      {/* User Chip */}
      {profile && (
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {(profile.displayName || 'F')[0].toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{profile.displayName || 'Member'}</div>
            <div className="sidebar-user-field label-gold">{profile.primaryField || 'Member'}</div>
          </div>
        </div>
      )}

      <div className="divider" />

      {/* Navigation */}
      <nav className="sidebar-nav">
        {ROOMS.map(({ section, items }) => (
          <div key={section} className="sidebar-section">
            <div className="sidebar-section-label label-gold">{section}</div>
            {items.map((room) => {
              if (room.adminOnly && !isAdmin) return null;
              const isActive = activeRoom === room.id;
              return (
                <Motion.button
                  key={room.id}
                  className={`sidebar-room ${isActive ? 'sidebar-room-active' : ''}`}
                  onClick={() => onRoomChange(room.id)}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.15 }}
                >
                  <span className="sidebar-room-icon">{room.icon}</span>
                  <span className="sidebar-room-label">{room.label}</span>
                  {room.adminOnly && (
                    <span className="sidebar-admin-badge">ADMIN</span>
                  )}
                </Motion.button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn-ghost sidebar-logout" onClick={logout}>
          ← Exit
        </button>
      </div>
    </aside>
  );
}

export { ROOMS };
