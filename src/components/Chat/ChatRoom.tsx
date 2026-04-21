import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendMessage, subscribeToMessages, markMessageAsRead } from '../../services/chatService';
import { useAuth } from '../../context/useAuth';
import { Send, Hash, Plus, X, ShieldAlert, CheckCheck, Loader2 } from 'lucide-react';

const ROOM_META: Record<string, { label: string; icon: string; description: string; adminOnly?: boolean }> = {
  announcements: { label: 'Announcements', icon: '📢', description: 'Official Directives. Administrator broadcast only.', adminOnly: true },
  introductions: { label: 'Introductions', icon: '🤝', description: 'Introduce yourself to the network.' },
  lounge: { label: 'Common Room', icon: '💬', description: 'Open discourse and unstructured communication.' },
  sales: { label: 'Sales & Marketing', icon: '📈', description: 'Revenue Architecture, Growth Systems, Brand Scaling.' },
  media: { label: 'Media & Advertising', icon: '🎬', description: 'Creative Production, Market Reach, Digital Presence.' },
  finance: { label: 'Finance & Trading', icon: '💰', description: 'Capital Management, Financial Operations.' },
  law: { label: 'Law', icon: '⚖️', description: 'Corporate Governance, Litigation & Counsel.' },
  realestate: { label: 'Real Estate', icon: '🏠', description: 'Acquisition & Yield, Property Management.' },
  trades: { label: 'Trades & Construction', icon: '🛠️', description: 'Project Execution, Build Logistics.' },
  hospitality: { label: 'Hospitality', icon: '🥂', description: 'Venue Performance, Experience Design.' },
  'event-access': { label: 'Event Access', icon: '🎟️', description: 'Ticket tiers, QR codes, and guest list management.' },
  opportunities: { label: 'Opportunities / Hires', icon: '🤝', description: 'Professional mandates and partnership requests.' },
  rules: { label: 'Regulations', icon: '🛠️', description: 'Governance guidelines and administrative support.', adminOnly: true },
};

function formatTime(ts: any) {
  if (!ts) return '';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

interface ChatRoomProps {
  roomId: string;
}

export default function ChatRoom({ roomId }: ChatRoomProps) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const meta = ROOM_META[roomId] || { label: roomId, icon: '💬', description: '' };
  const isAdmin = profile?.role === 'admin';
  const isAdminOnly = meta.adminOnly && !isAdmin;

  useEffect(() => {
    const unsub = subscribeToMessages(roomId, (msgs) => {
      setMessages(msgs);
      // Mark new messages as read
      if (user) {
        msgs.forEach(msg => {
          if (!msg.readBy?.includes(user.uid)) {
            markMessageAsRead(roomId, msg.id, user.uid);
          }
        });
      }
    });
    return unsub;
  }, [roomId, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!text.trim() && !attachment) || isAdminOnly || !user) return;
    
    setSending(true);
    const messageText = attachment ? `${text}\n\n[Asset Linked]` : text;
    await sendMessage(roomId, { uid: user.uid, displayName: profile?.displayName, primaryField: profile?.primaryField }, messageText);
    setText('');
    setAttachment(null);
    setSending(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('File size too large. Please upload an image smaller than 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment(reader.result as string);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const getInitial = (name: string) => (name || '?')[0].toUpperCase();

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)] text-[var(--color-text)] overflow-hidden">
      {/* Header */}
      <div className="px-12 py-8 bg-[var(--color-bg)] border-b border-[var(--color-shadow-dark)]/10 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="p-4 rounded-[1.5rem] neu-convex text-[var(--color-accent)]">
            <Hash size={32} strokeWidth={3} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-black tracking-tighter uppercase">{meta.label}</h2>
              {meta.adminOnly && (
                <div className="flex items-center gap-2 px-3 py-1 bg-[#FFCC00] text-black rounded-full shadow-[0_0_10px_#FFCC00]">
                  <ShieldAlert size={12} strokeWidth={4} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Master Lockdown</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-[var(--color-text)] opacity-40 font-black uppercase tracking-[0.3em] max-w-[500px] truncate leading-relaxed">
              {meta.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-6 py-2 neu-concave rounded-full border border-[#34C75940]">
            <span className="text-[9px] text-[#34C759] font-black uppercase tracking-[0.3em]">Secure Chat Connected</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-12 space-y-12 no-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
            <div className="w-32 h-32 rounded-[3.5rem] neu-concave flex items-center justify-center">
              <Hash size={56} strokeWidth={3} className="text-[var(--color-text)] opacity-10" />
            </div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black uppercase tracking-tighter opacity-60">The Discourse Begins</h4>
              <p className="text-[var(--color-text)] text-sm italic opacity-20 font-medium">Initiate a tactile thread to document protocol history.</p>
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => {
              const isMe = msg.uid === user?.uid;
              const prevMsg = messages[idx - 1];
              const isSameUser = prevMsg?.uid === msg.uid;
              
              return (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={msg.id} 
                  className={`flex gap-6 ${isMe ? 'flex-row-reverse' : ''} ${isSameUser ? 'mt-3' : 'mt-12'}`}
                >
                  {!isSameUser ? (
                    <div className="w-16 h-16 rounded-[1.5rem] neu-concave flex items-center justify-center shrink-0 overflow-hidden border border-[var(--color-shadow-dark)]/5">
                      {msg.avatar ? (
                        <img src={msg.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-2xl font-black text-[var(--color-text)] opacity-10">{getInitial(msg.displayName)}</span>
                      )}
                    </div>
                  ) : (
                    <div className="w-16 shrink-0" />
                  )}
                  <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : ''}`}>
                    {!isSameUser && (
                      <div className="flex items-center gap-4 mb-3 px-2">
                        <span className="text-sm font-black text-[var(--color-text)] uppercase tracking-tight">{msg.displayName}</span>
                        <div className="neu-concave px-2 py-0.5 rounded-lg opacity-40">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className={`px-8 py-6 rounded-[2.5rem] text-lg leading-relaxed relative group/msg transition-all ${
                      isMe 
                        ? 'neu-convex text-[var(--color-text)] rounded-tr-none' 
                        : 'neu-concave text-[var(--color-text)] rounded-tl-none'
                    }`}>
                      <p className="tracking-tight font-medium whitespace-pre-wrap leading-relaxed opacity-90">{msg.text}</p>
                      
                      {isMe && msg.readBy && msg.readBy.length > 1 && (
                        <div className="absolute -bottom-10 right-0 flex items-center gap-3 opacity-0 group-hover/msg:opacity-100 transition-all whitespace-nowrap">
                          <CheckCheck size={14} strokeWidth={3} className="text-[#34C759]" />
                          <span className="text-[9px] text-[var(--color-text)] opacity-20 font-black uppercase tracking-[0.2em] text-right">
                            Acknowledged by {msg.readBy.length - 1} network nodes
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={bottomRef} className="h-20" />
      </div>

      {/* Input */}
      <div className="p-12 bg-[var(--color-bg)] border-t border-[var(--color-shadow-dark)]/10">
        <AnimatePresence>
          {attachment && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-8 relative inline-block p-2 neu-convex rounded-[2.5rem] border border-[var(--color-shadow-dark)]/5"
            >
              <img src={attachment} alt="Attachment" className="h-32 w-32 object-cover rounded-[2rem]" referrerPolicy="no-referrer" />
              <button 
                onClick={() => setAttachment(null)}
                className="absolute -top-4 -right-4 p-3 bg-[#FF3B30] rounded-full text-white shadow-xl hover:scale-110 active:scale-90 transition-all z-20"
              >
                <X size={16} strokeWidth={4} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form 
          onSubmit={handleSend}
          className="flex items-center gap-8"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-6 neu-button rounded-3xl text-[var(--color-text)] opacity-30 hover:opacity-100 transition-all active:scale-95 disabled:opacity-50"
            disabled={sending || isAdminOnly}
          >
            <Plus size={32} strokeWidth={3} />
          </button>
          
          <div className="relative flex-1 neu-concave rounded-[3rem] p-3 flex items-center">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              placeholder={isAdminOnly ? "READ-ONLY PROTOCOL ACTIVE" : `DRAFT COMMUNIQUE FOR #${roomId}...`}
              className="w-full bg-transparent border-none py-4 px-6 text-xl text-[var(--color-text)] outline-none placeholder-[var(--color-text)] placeholder:opacity-20 font-medium resize-none disabled:opacity-50"
              disabled={sending || isAdminOnly}
            />
            <button
              type="submit"
              disabled={sending || (!text.trim() && !attachment) || isAdminOnly}
              className="ml-4 p-5 neu-button-accent rounded-[2rem] text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:grayscale active:scale-95"
            >
              {sending ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} strokeWidth={3} />}
            </button>
          </div>
        </form>
        {isAdminOnly && (
          <p className="text-[10px] text-[#FF9500] font-black uppercase tracking-[0.4em] mt-8 text-center opacity-80 animate-pulse">
            RESTRICTED: MASTER PERMISSIONS REQUIRED FOR TRANSMISSION
          </p>
        )}
      </div>
    </div>
  );
}
