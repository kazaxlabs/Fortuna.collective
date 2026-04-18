import React, { useState } from 'react';
import { X, Plus, Save, Loader2 } from 'lucide-react';
import { UserProfile } from '../../types';
import { updateUserProfile } from '../../services/userService';

interface EditProfileModalProps {
  profile: UserProfile;
  onClose: () => void;
}

export default function EditProfileModal({ profile, onClose }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    displayName: profile.displayName || '',
    bio: profile.bio || '',
    avatar: profile.avatar || '',
    company: profile.company || '',
    primaryField: profile.primaryField || '',
    location: profile.location || '',
    social: profile.social || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert('Asset too substantial. Please select an image under 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, avatar: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    try {
      await updateUserProfile(profile.uid, formData);
      onClose();
    } catch (error) {
      console.error('Update profile error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-xl bg-white/90 dark:bg-black/90 border border-[#D2D2D7] dark:border-[#1C1C1E] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-10 py-8 border-b border-[#D2D2D7] dark:border-[#1C1C1E] flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-white">Profile Configuration</h2>
            <p className="text-[10px] text-[#86868B] font-bold uppercase tracking-widest mt-1">Identity Management Protocol</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all text-[#86868B] hover:text-[#007AFF]">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-10 overflow-y-auto no-scrollbar flex-1">
          {/* Avatar Input */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative group cursor-pointer">
              <div className="w-32 h-32 rounded-[2.5rem] bg-[#F5F5F7] dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center overflow-hidden shadow-inner transition-transform active:scale-95">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-5xl font-bold text-[#D2D2D7]">{(formData.displayName || '?')[0].toUpperCase()}</span>
                )}
              </div>
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[2.5rem] cursor-pointer">
                <Plus size={32} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            <div className="text-center space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#86868B]">Modify Visual Identity</p>
              {formData.avatar && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, avatar: '' })}
                  className="text-[10px] text-[#FF3B30] font-bold uppercase tracking-widest hover:underline"
                >
                  Clear Asset
                </button>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#86868B] ml-1">Alias Identification</label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Enter display identity..."
                className="w-full bg-[#F5F5F7] dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-4 px-6 text-base text-[#1D1D1F] dark:text-white focus:border-[#007AFF] outline-none transition-all shadow-inner font-medium placeholder-[#C7C7CC]"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#86868B] ml-1">Professional Manifest</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Declare your professional objectives..."
                className="w-full bg-[#F5F5F7] dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-4 px-6 text-base text-[#1D1D1F] dark:text-white focus:border-[#007AFF] outline-none transition-all shadow-inner font-medium placeholder-[#C7C7CC] resize-none h-32"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#86868B] ml-1">Organization</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full bg-[#F5F5F7] dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-4 px-6 text-base text-[#1D1D1F] dark:text-white focus:border-[#007AFF] outline-none transition-all shadow-inner font-medium"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#86868B] ml-1">Specialization</label>
                <input
                  type="text"
                  value={formData.primaryField}
                  onChange={(e) => setFormData({ ...formData, primaryField: e.target.value })}
                  className="w-full bg-[#F5F5F7] dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-4 px-6 text-base text-[#1D1D1F] dark:text-white focus:border-[#007AFF] outline-none transition-all shadow-inner font-medium"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#86868B] ml-1">Affiliated Channel</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-[#F5F5F7] dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-4 px-6 text-base text-[#1D1D1F] dark:text-white focus:border-[#007AFF] outline-none transition-all shadow-inner font-medium"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-[#D2D2D7] dark:border-[#1C1C1E]">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#007AFF] text-white py-5 rounded-[2rem] font-bold uppercase tracking-[0.2em] text-xs hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#007AFF30] disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <Save size={20} />
                  Authorize Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
