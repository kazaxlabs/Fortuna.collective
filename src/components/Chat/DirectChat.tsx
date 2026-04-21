import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, ChevronLeft, Plus, X, Check, CheckCheck } from 'lucide-react';
import { subscribeToDirectMessages, sendDirectMessage, markDirectMessageAsRead } from '../../services/chatService';
import { subscribeToUserProfile } from '../../services/userService';
import { useAuth } from '../../context/useAuth';

interface DirectChatProps {
  convoId: string;
  onBack: () => void;
}

export default function DirectChat({ convoId, onBack }: DirectChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);
  const [receiverProfile, setReceiverProfile] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('File too large. Please upload a file smaller than 1MB.');
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

  // Extract receiverId from convoId (convoId is sorted_uid1_uid2)
  const participants = convoId.split('_');
  const receiverId = participants.find(id => id !== user?.uid) || '';

  useEffect(() => {
    const unsub = subscribeToDirectMessages(convoId, (msgs) => {
      setMessages(msgs);
      // Mark new messages as read
      if (user) {
        msgs.forEach(msg => {
          if (msg.senderId !== user.uid && !msg.readBy?.includes(user.uid)) {
            markDirectMessageAsRead(convoId, msg.id, user.uid);
          }
        });
      }
    });
    return () => unsub();
  }, [convoId, user]);

  useEffect(() => {
    if (receiverId) {
      const unsub = subscribeToUserProfile(receiverId, setReceiverProfile);
      return () => unsub();
    }
  }, [receiverId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if ((!newMessage.trim() && !attachment) || !user) return;
    const messageText = attachment ? `${newMessage}\n\n[File Sent]` : newMessage;
    await sendDirectMessage(convoId, user.uid, receiverId, messageText);
    setNewMessage('');
    setAttachment(null);
  };

  return (
    <div className="h-full bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-10 py-6 bg-[var(--color-bg)] border-b border-[var(--color-shadow-dark)]/10 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-8">
          <button 
            onClick={onBack} 
            className="p-4 neu-button rounded-2xl text-[var(--color-text)] opacity-40 hover:opacity-100"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[2rem] neu-concave flex items-center justify-center overflow-hidden">
              {receiverProfile?.avatar ? (
                <img src={receiverProfile.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-2xl font-black text-[var(--color-text)] opacity-20">{(receiverProfile?.displayName || '?')[0].toUpperCase()}</span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-[var(--color-text)]">{receiverProfile?.displayName || 'Terminal Contact'}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-[#34C759] rounded-full shadow-[0_0_10px_#34C759]" />
                <p className="text-[10px] text-[var(--color-text)] opacity-40 font-black uppercase tracking-[0.2em]">Private Chat Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-12 no-scrollbar">
        <AnimatePresence>
          {messages.map((msg) => {
            const isMe = msg.senderId === user?.uid;
            return (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={msg.id} 
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] p-8 rounded-[2.5rem] transition-all relative ${
                  isMe 
                    ? 'neu-convex text-[var(--color-text)] rounded-tr-none' 
                    : 'neu-concave text-[var(--color-text)] rounded-tl-none'
                }`}>
                  <p className="text-lg leading-relaxed whitespace-pre-wrap tracking-normal font-medium opacity-90">{msg.text}</p>
                  
                  <div className={`text-[9px] mt-6 font-black uppercase tracking-[0.2em] flex items-center justify-between gap-10 opacity-30`}>
                    <span>{new Date(msg.createdAt?.seconds * 1000 || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && (
                      <div className="flex items-center gap-1.5 text-[var(--color-accent)]">
                        {msg.readBy && msg.readBy.length > 1 ? (
                          <>
                            <span>Acknowledged</span>
                            <CheckCheck size={12} strokeWidth={3} />
                          </>
                        ) : (
                          <>
                            <span>Sent</span>
                            <Check size={12} strokeWidth={3} />
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-10 bg-[var(--color-bg)] border-t border-[var(--color-shadow-dark)]/10">
        <AnimatePresence>
          {attachment && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-8 relative inline-block p-2 neu-convex rounded-[2.5rem]"
            >
              <img src={attachment} alt="Attachment" className="h-24 w-24 object-cover rounded-[2rem]" referrerPolicy="no-referrer" />
              <button 
                onClick={() => setAttachment(null)}
                className="absolute -top-3 -right-3 p-2 bg-[#FF3B30] rounded-full text-white shadow-xl hover:scale-110 transition-transform z-20"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-6 neu-button rounded-[1.5rem] text-[var(--color-text)] opacity-40 hover:opacity-100 transition-all"
          >
            <Plus size={24} />
          </button>
          
          <div className="relative flex-1 neu-concave rounded-[2.5rem] p-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Draft communique..."
              className="w-full bg-transparent border-none py-4 px-6 text-lg text-[var(--color-text)] outline-none placeholder-[var(--color-text)] placeholder:opacity-20 font-medium"
            />
            <button 
              onClick={handleSend}
              disabled={!newMessage.trim() && !attachment}
              className="absolute right-2 top-2 bottom-2 px-6 neu-button-accent rounded-[2rem] text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:grayscale"
            >
              <Send size={20} className="mr-2" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
