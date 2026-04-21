import React, { useState, useRef } from 'react';
import { Plus, Video, MapPin, Calendar, Send, X } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { createPost } from '../../services/postService';

export default function CreatePost() {
  const { profile, user } = useAuth();
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('File size too large. Please upload an image smaller than 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAttachments([...attachments, base64String]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isPosting || !user) return;
    
    setIsPosting(true);
    try {
      await createPost(user, content, 'general', attachments);
      setContent('');
      setAttachments([]);
      alert('Posted successfully.');
    } catch (error) {
      console.error('Post creation error:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="h-full bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col p-6 sm:p-14 overflow-y-auto no-scrollbar">
      <div className="max-w-2xl mx-auto w-full space-y-12">
        <div className="flex items-center justify-between pb-8 border-b border-[var(--color-shadow-dark)]/10">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight uppercase">Compose</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text)] opacity-40">Direct Collective Dispatch</p>
          </div>
          <button className="p-4 neu-button rounded-2xl text-[var(--color-text)] opacity-40 hover:opacity-100 transition-all">
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-10">
          <div className="flex flex-col items-center gap-6 shrink-0">
            <div className="w-20 h-20 rounded-[1.5rem] neu-convex p-1">
              <div className="w-full h-full rounded-[1.25rem] neu-concave flex items-center justify-center overflow-hidden">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt={profile.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-2xl font-black text-[var(--color-text)] opacity-20">{(profile?.displayName || '?')[0].toUpperCase()}</span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
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
                className="p-5 neu-button rounded-2xl text-[var(--color-accent)] hover:scale-105 transition-all shadow-md"
                title="Attach Intelligence"
              >
                <Plus size={24} strokeWidth={3} />
              </button>
              <button type="button" className="p-5 neu-button rounded-2xl text-[var(--color-text)] opacity-40 hover:opacity-100 transition-all">
                <Video size={24} strokeWidth={2} />
              </button>
            </div>
          </div>
          
          <form onSubmit={handlePost} className="flex-1 space-y-10">
            <div className="neu-concave rounded-[3rem] p-8 min-h-[300px]">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What intelligence do you wish to broadcast?"
                className="w-full bg-transparent border-none outline-none text-xl resize-none min-h-[200px] text-[var(--color-text)] placeholder-[var(--color-text)] placeholder:opacity-20 font-medium leading-relaxed"
                autoFocus
              />

              {/* Attachments Preview */}
              {attachments.length > 0 && (
                <div className="grid grid-cols-2 gap-6 pt-8 border-t border-[var(--color-shadow-dark)]/5">
                  {attachments.map((url, index) => (
                    <div key={index} className="relative group rounded-[2rem] overflow-hidden neu-convex p-1">
                      <img src={url} alt="Attachment" className="w-full h-40 object-cover rounded-[1.5rem]" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex gap-4">
                <button type="button" className="p-4 neu-button rounded-xl text-[var(--color-text)] opacity-20 hover:opacity-60 transition-all">
                  <MapPin size={20} strokeWidth={2.5} />
                </button>
                <button type="button" className="p-4 neu-button rounded-xl text-[var(--color-text)] opacity-20 hover:opacity-60 transition-all">
                  <Calendar size={20} strokeWidth={2.5} />
                </button>
              </div>

              <button
                type="submit"
                disabled={!content.trim() || isPosting}
                className="flex items-center gap-4 neu-button-accent text-white px-12 py-5 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-lg disabled:opacity-50 active:scale-95 transition-all"
              >
                {isPosting ? 'Posting...' : (
                  <>
                    <span>Dispatch</span>
                    <Send size={18} strokeWidth={3} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
