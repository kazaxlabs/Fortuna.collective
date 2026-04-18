import React, { useState } from 'react';
import { AnimatePresence, motion as Motion } from 'motion/react';
import { 
  ShieldCheck, UserCircle, Zap, ArrowRight, ArrowLeft, 
  Briefcase, Target, Globe, Terminal, Plus 
} from 'lucide-react';
import { completeOnboarding } from '../../services/authService';
import { useAuth } from '../../context/useAuth';

const STEPS = [
  {
    id: 1, 
    title: 'Welcome',
    subtitle: 'Let’s set up your profile to get started.',
    icon: ShieldCheck
  },
  {
    id: 2, 
    title: 'Profile',
    subtitle: 'Share a few details about your work.',
    icon: UserCircle
  },
  {
    id: 3, 
    title: 'Goals',
    subtitle: 'What are you looking for in the network?',
    icon: Zap
  },
];

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

interface OnboardingProps {}

export default function Onboarding({}: OnboardingProps) {
  const { user, setProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    primaryField: '',
    company: '',
    assetIBring: '',
    connectionISeeking: '',
    social: '',
    bio: '',
    location: '',
    avatar: '',
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const update = (key: string, val: string) => setData((d) => ({ ...d, [key]: val }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('File size must be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        update('avatar', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await completeOnboarding(user.uid, {
        ...data,
        displayName: user.displayName || 'Anonymous Member',
        email: user.email || '',
      });
      setProfile({ 
        uid: user.uid,
        displayName: user.displayName || 'Anonymous Member',
        email: user.email || '',
        ...data, 
        onboardingComplete: true,
        role: 'user' 
      } as any);
    } catch (error) {
      console.error('Onboarding failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const StepIcon = STEPS[step].icon;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex items-center justify-center p-6 sm:p-10 relative overflow-y-auto no-scrollbar">
      <div className="max-w-2xl w-full space-y-12 relative z-10 py-12">
        {/* Progress Tracker */}
        <div className="flex justify-center items-center gap-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex flex-col items-center gap-3 group cursor-default">
              <div className={`h-2 w-16 rounded-full transition-all duration-700 ${i <= step ? 'bg-[var(--color-accent)] shadow-[0_0_15px_var(--color-accent)]' : 'neu-concave'}`} />
              <span className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors duration-300 ${i === step ? 'text-[var(--color-accent)]' : 'text-[var(--color-text)] opacity-20'}`}>
                {s.id === 1 ? 'Start' : s.id === 2 ? 'Profile' : 'Goals'}
              </span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <Motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="space-y-12"
          >
            <div className="space-y-4 text-center">
              <Motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-20 h-20 neu-convex rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 text-[var(--color-accent)]"
              >
                <StepIcon size={40} strokeWidth={1.5} />
              </Motion.div>
              <h2 className="text-5xl font-black tracking-tight uppercase leading-none text-[var(--color-text)]">
                {STEPS[step].title}
              </h2>
              <p className="text-[var(--color-text)] opacity-40 text-base max-w-sm mx-auto leading-relaxed font-medium italic">
                "{STEPS[step].subtitle}"
              </p>
            </div>

            <div className="neu-convex rounded-[4rem] p-10 sm:p-16 shadow-2xl relative overflow-hidden">
              {step === 0 && (
                <div className="space-y-12">
                  <div className="flex items-center justify-center gap-4 text-[var(--color-text)] opacity-20">
                    <ShieldCheck size={20} strokeWidth={3} />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Guidelines</span>
                  </div>
                  <div className="space-y-10">
                    {[
                      { title: 'INTEGRITY', desc: 'Maintain absolute professional standard in collective discourse.' },
                      { title: 'RELEVANCE', desc: 'Direct communications to room-specific intelligence nodes.' },
                      { title: 'AUTHENTICITY', desc: 'Secure identity strictly enforced to foster absolute trust.' }
                    ].map((item, i) => (
                      <Motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + (i * 0.1) }}
                        key={item.title} 
                        className="flex gap-8 group"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] mt-2 group-hover:scale-150 transition-transform shadow-[0_0_10px_var(--color-accent)]" />
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text)] opacity-40">{item.title}</h4>
                          <p className="text-base text-[var(--color-text)] font-medium leading-relaxed">{item.desc}</p>
                        </div>
                      </Motion.div>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-12">
                  <div className="flex flex-col items-center gap-6">
                    <div 
                      className="relative w-32 h-32 rounded-[2.5rem] neu-convex p-1 group cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="w-full h-full rounded-[2.25rem] neu-concave flex items-center justify-center overflow-hidden">
                        {data.avatar ? (
                          <img src={data.avatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="text-[var(--color-text)] opacity-10 group-hover:opacity-40 flex flex-col items-center gap-3 transition-all">
                            <Plus size={32} strokeWidth={3} />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Add Photo</span>
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-[var(--color-accent)]/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-500 rounded-[2.5rem]">
                        <ArrowRight size={24} className="-rotate-90 text-[var(--color-accent)]" strokeWidth={3} />
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                    />
                  </div>

                  <div className="space-y-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-[var(--color-text)] opacity-20 uppercase tracking-[0.3em] ml-2">Field</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {FIELDS.map((f) => (
                          <button
                            key={f}
                            className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all duration-500 ${
                              data.primaryField === f 
                                ? 'neu-button-accent text-white shadow-lg' 
                                : 'neu-button text-[var(--color-text)] opacity-40 hover:opacity-100'
                            }`}
                            onClick={() => update('primaryField', f)}
                          >{f}</button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-[var(--color-text)] opacity-20 uppercase tracking-[0.3em] ml-2">Company</label>
                      <div className="neu-concave rounded-3xl p-1">
                        <input 
                          className="w-full bg-transparent border-none py-5 px-8 text-base text-[var(--color-text)] outline-none placeholder-[var(--color-text)] placeholder:opacity-20 font-bold" 
                          placeholder="Your company or venture" 
                          value={data.company} 
                          onChange={(e) => update('company', e.target.value)} 
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-[var(--color-text)] opacity-20 uppercase tracking-[0.3em] ml-2">Bio</label>
                      <div className="neu-concave rounded-[2rem] p-1">
                        <textarea 
                          className="w-full bg-transparent border-none py-6 px-8 text-base text-[var(--color-text)] outline-none placeholder-[var(--color-text)] placeholder:opacity-20 font-medium leading-relaxed resize-none h-40" 
                          placeholder="Tell us about yourself..." 
                          value={data.bio} 
                          onChange={(e) => update('bio', e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-12">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-[var(--color-text)] opacity-20 uppercase tracking-[0.3em] ml-2">I Offer</label>
                      <div className="neu-concave rounded-3xl p-1">
                        <input 
                          className="w-full bg-transparent border-none py-5 px-8 text-base text-[var(--color-text)] outline-none placeholder-[var(--color-text)] placeholder:opacity-20 font-bold" 
                          placeholder="What can you contribute?" 
                          value={data.assetIBring} 
                          onChange={(e) => update('assetIBring', e.target.value)} 
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-[var(--color-text)] opacity-20 uppercase tracking-[0.3em] ml-2">I Seek</label>
                      <div className="neu-concave rounded-3xl p-1">
                        <input 
                          className="w-full bg-transparent border-none py-5 px-8 text-base text-[var(--color-text)] outline-none placeholder-[var(--color-text)] placeholder:opacity-20 font-bold" 
                          placeholder="What are your goals?" 
                          value={data.connectionISeeking} 
                          onChange={(e) => update('connectionISeeking', e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-10 neu-concave rounded-[2.5rem] border border-[var(--color-shadow-dark)]/5">
                    <p className="text-xs text-[var(--color-text)] opacity-40 leading-relaxed text-center font-medium italic">
                      "The quality of your network determines the quality of your opportunities. Welcome to the collective intelligence."
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between pt-12">
          {step > 0 ? (
            <button 
              className="px-8 py-5 neu-button rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text)] opacity-40 hover:opacity-100 transition-all flex items-center gap-3 group" 
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" /> Back
            </button>
          ) : <div />}

          {step < STEPS.length - 1 ? (
            <button 
              className="px-12 py-6 neu-button-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-4" 
              onClick={() => setStep((s) => s + 1)}
            >
              Continue <ArrowRight size={18} strokeWidth={3} />
            </button>
          ) : (
            <button 
              className="px-12 py-6 neu-button-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_0_30px_var(--color-accent)] hover:scale-105 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50" 
              onClick={handleFinish} 
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Done'} <Zap size={18} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
