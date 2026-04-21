import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { completeOnboarding } from '../../services/authService';
import GlassCard from '../UI/GlassCard';

const FIELDS = [
  'Sales & Marketing',
  'Media & Advertising',
  'Finance & Trading',
  'Law',
  'Real Estate',
  'Trades & Construction',
  'Hospitality',
  'Other',
];

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { profile, setProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    primaryField: profile?.primaryField || '',
    company: profile?.company || '',
    assetIBring: profile?.assetIBring || '',
    connectionISeeking: profile?.connectionISeeking || '',
    social: profile?.social || '',
  });

  const [saving, setSaving] = useState(false);

  if (!isOpen || !profile) return null;

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;
    setSaving(true);
    
    try {
      await completeOnboarding(profile.uid, formData);
      setProfile({ ...profile, ...formData });
      onClose();
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
          <div className="relative w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] glass border border-[#222] rounded-[32px] shadow-premium bg-black">
            {/* Header */}
            <div className="flex items-center justify-between p-10 pb-6 border-b border-[#222]">
              <div>
                <h2 className="text-2xl font-brand font-light text-white tracking-tight">Edit Profile</h2>
                <p className="text-[10px] font-brand font-medium text-gray-500 tracking-[0.2em] uppercase mt-2">Professional Identity</p>
              </div>
              <button 
                onClick={onClose}
                className="p-3 rounded-full hover:bg-[#111] text-gray-500 hover:text-white transition-all duration-500"
              >
                <X size={20} strokeWidth={1.2} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-brand font-medium tracking-[0.3em] text-white uppercase opacity-80">Display Name</label>
                  <input 
                    type="text" 
                    value={formData.displayName}
                    onChange={(e) => handleChange('displayName', e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-brand font-medium tracking-[0.3em] text-white uppercase opacity-80">Primary Field</label>
                  <div className="grid grid-cols-2 gap-3">
                    {FIELDS.map(field => (
                      <button
                        key={field}
                        type="button"
                        onClick={() => handleChange('primaryField', field)}
                        className={`text-left px-5 py-3 rounded-xl text-[11px] font-brand font-medium tracking-wider border transition-all duration-500 ${
                          formData.primaryField === field 
                            ? 'bg-white border-white text-black shadow-md' 
                            : 'bg-[#111] border-[#222] text-gray-400 hover:border-white hover:text-white'
                        }`}
                      >
                        {field}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-brand font-medium tracking-[0.3em] text-white uppercase opacity-80">Current Company / Project</label>
                  <input 
                    type="text" 
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-brand font-medium tracking-[0.3em] text-white uppercase opacity-80">One High-Value Asset I Bring</label>
                  <input 
                    type="text" 
                    value={formData.assetIBring}
                    onChange={(e) => handleChange('assetIBring', e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-brand font-medium tracking-[0.3em] text-white uppercase opacity-80">One Connection I Am Seeking</label>
                  <input 
                    type="text" 
                    value={formData.connectionISeeking}
                    onChange={(e) => handleChange('connectionISeeking', e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-brand font-medium tracking-[0.3em] text-white uppercase opacity-80">LinkedIn / Instagram Handle</label>
                  <input 
                    type="text" 
                    value={formData.social}
                    onChange={(e) => handleChange('social', e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="p-10 pt-6 border-t border-[#222] flex justify-end gap-4">
              <button 
                type="button"
                onClick={onClose}
                className="px-8 py-3 rounded-full text-[10px] font-brand font-medium tracking-[0.2em] uppercase text-gray-500 hover:text-white transition-all duration-500"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="btn-primary !px-8 !py-3 !text-[10px] !tracking-[0.2em] disabled:opacity-30"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
      </div>
    </AnimatePresence>
  );
}
