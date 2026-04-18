import React, { useState, useEffect, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { sendMessage, subscribeToMessages } from '../../services/chatService';
import { useAuth } from '../../context/useAuth';
import './ChatRoom.css';

const ROOM_META = {
  announcements: { label: 'Announcements', icon: '📢', description: 'Official FORTUNA updates. Admin-posted only.', adminOnly: true },
  introductions: { label: 'Introductions', icon: '🤝', description: 'Introduce yourself to the network using the member template.' },
  lounge: { label: 'General Lounge', icon: '💎', description: 'The main water cooler. Open conversation.' },
  sales: { label: 'Sales & Marketing', icon: '📈', description: 'Revenue Architecture, Growth Systems, Brand Scaling, Strategic Partnerships.' },
  media: { label: 'Media & Advertising', icon: '🎬', description: 'Creative Production, Market Reach, Digital Presence, Brand Narrative.' },
  finance: { label: 'Finance & Trading', icon: '💰', description: 'Capital Management, Financial Operations, Market Participation, Transaction Advisory.' },
  law: { label: 'Law', icon: '⚖️', description: 'Corporate Governance, Litigation & Counsel, Real Estate Law, Asset Protection.' },
  realestate: { label: 'Real Estate', icon: '🏠', description: 'Acquisition & Yield, Property Management, Development & Planning, Asset Presentation.' },
  trades: { label: 'Trades & Construction', icon: '🛠️', description: 'Project Execution, Build Logistics, Technical Infrastructure, Smart Systems.' },
  hospitality: { label: 'Hospitality', icon: '🥂', description: 'Venue Performance, Experience Design, Event Curation, Site Maintenance.' },
  'event-access': { label: 'Event Access', icon: '🎟️', description: 'Ticket tiers, QR codes, and guest list management.' },
  opportunities: { label: 'Opportunities / Hires', icon: '🤝', description: 'Job postings and partnership requests.' },
  rules: { label: 'Support & Rules', icon: '🛠️', description: 'Group guidelines and admin support.' },
};

function formatTime(ts) {
  if (!ts?.toDate) return '';
  return ts.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatRoom({ roomId }) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const meta = ROOM_META[roomId] || { label: roomId, icon: '💬', description: '' };
  const isAdmin = profile?.role === 'admin';
  const isAdminOnly = meta.adminOnly && !isAdmin;

  useEffect(() => {
    const unsub = subscribeToMessages(roomId, setMessages);
    return unsub;
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || isAdminOnly) return;
    setSending(true);
    await sendMessage(roomId, { uid: user.uid, displayName: profile?.displayName, primaryField: profile?.primaryField }, text);
    setText('');
    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
  };

  const getInitial = (name) => (name || '?')[0].toUpperCase();

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header glass">
        <div className="chat-header-icon">{meta.icon}</div>
        <div>
          <h3 className="chat-header-title">{meta.label}</h3>
          <p className="chat-header-desc">{meta.description}</p>
        </div>
        <div className="chat-discretion">
          <span className="chat-discretion-badge">🔒 Radical Discretion</span>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <span className="chat-empty-icon">{meta.icon}</span>
            <p>No messages yet. Be the first to speak.</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isOwn = msg.uid === user.uid;
            return (
              <Motion.div
                key={msg.id}
                className={`chat-msg-row ${isOwn ? 'chat-msg-own' : ''}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                {!isOwn && (
                  <div className="chat-avatar">{getInitial(msg.displayName)}</div>
                )}
                <div className="chat-bubble-group">
                  {!isOwn && (
                    <div className="chat-meta">
                      <span className="chat-name">{msg.displayName}</span>
                      {msg.primaryField && <span className="chat-field label-gold">{msg.primaryField}</span>}
                    </div>
                  )}
                  <div className={`chat-bubble ${isOwn ? 'chat-bubble-own' : 'chat-bubble-other'}`}>
                    <p className="chat-text">{msg.text}</p>
                    <span className="chat-time">{formatTime(msg.createdAt)}</span>
                  </div>
                </div>
                {isOwn && (
                  <div className="chat-avatar chat-avatar-own">{getInitial(profile?.displayName)}</div>
                )}
              </Motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form className="chat-input-area" onSubmit={handleSend}>
        {isAdminOnly ? (
          <div className="chat-locked">
            <span>🔒</span>
            <span>This channel is admin-only. Only administrators can post here.</span>
          </div>
        ) : (
          <>
            <textarea
              className="chat-input input-field"
              placeholder={`Message #${meta.label}…`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              disabled={sending}
            />
            <button type="submit" className="btn-primary chat-send" disabled={sending || !text.trim()}>
              →
            </button>
          </>
        )}
      </form>
    </div>
  );
}
