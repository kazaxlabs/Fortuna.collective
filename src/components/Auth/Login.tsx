import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'motion/react';
import { ShieldCheck, Key, UserPlus, LogIn, Crown } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { registerWithCredentials, loginWithCredentials } from '../../services/authService';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

export default function Login() {
  const { loginWithEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    setIsMobileDevice(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const finalEmail = email.includes('@') ? email : `${email.toLowerCase()}@fortuna.admin`;
      await loginWithEmail(finalEmail, password);
    } catch (err: any) {
      console.error(err);
      setError('Invalid credentials or access denied.');
    } finally {
      setLoading(false);
    }
  };

  const handleFounderAccess = async () => {
    setLoading(true);
    setError('');
    const founderEmail = 'founder@fortuna.admin';
    const founderPass = 'founder2026!'; // Temporary hardcoded password
    
    try {
      // Attempt login first
      const result = await loginWithEmail(founderEmail, founderPass);
      // Ensure the existing founder has onboardingComplete to bypass Onboarding screen
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          role: 'admin',
          onboardingComplete: true,
        }, { merge: true });
        // Force reload to completely reset auth state and routing tree directly into the dashboard
        window.location.reload();
      }
    } catch (loginErr: any) {
      // If user doesn't exist, create it and bless it with admin role
      try {
        const user = await registerWithCredentials(founderEmail, founderPass, 'Founder');
        // Force the admin role directly
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          displayName: 'Founder',
          email: founderEmail,
          role: 'admin',
          onboardingComplete: true,
          createdAt: serverTimestamp(),
        }, { merge: true });
        
        window.location.reload();
      } catch (regErr: any) {
        console.error(regErr);
        setError('Failed to establish founder credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-[var(--color-bg)] p-10 relative overflow-hidden">
      <Motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10 flex flex-col items-center"
      >
        <div className="w-full flex flex-col items-center mb-16">
          <div className="w-24 h-24 rounded-[2rem] neu-convex flex items-center justify-center mb-10 transition-transform hover:scale-105 duration-500">
            <ShieldCheck size={48} strokeWidth={1} className="text-[var(--color-accent)]" />
          </div>
          <h1 className="text-5xl font-extrabold text-[var(--color-text)] mb-4 tracking-tight">fortuna collective</h1>
          <p className="text-[var(--color-text)] opacity-60 text-lg font-medium tracking-tight">Sign in to the network.</p>
        </div>

        {error && (
          <Motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full mb-8 p-5 neu-concave rounded-2xl text-[#FF3B30] text-sm text-center font-bold uppercase tracking-widest"
          >
            {error}
            {isMobileDevice && error.includes('failed') && (
              <p className="mt-2 text-[10px] normal-case tracking-normal opacity-80">
                Try opening this app in a new tab if the window doesn't appear.
              </p>
            )}
          </Motion.div>
        )}

        <form onSubmit={handleCredentialLogin} className="w-full space-y-8 mb-10">
          <div className="space-y-4">
            <input 
              type="text"
              placeholder="Email or Alias"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field w-full text-center"
              required
            />
            <input 
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full text-center"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full neu-button py-5 rounded-[2rem] flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <span className="text-sm font-bold uppercase tracking-widest text-[var(--color-accent)]">
              {loading ? 'Signing in...' : 'Sign In'}
            </span>
          </button>
        </form>

        <div className="w-full flex items-center gap-6 mb-8 mt-2">
          <div className="flex-1 h-[2px] neu-concave rounded-full opacity-30"></div>
          <span className="text-[10px] font-bold text-[var(--color-text)] opacity-40 uppercase tracking-[0.3em]">Administrator Override</span>
          <div className="flex-1 h-[2px] neu-concave rounded-full opacity-30"></div>
        </div>

        <button
          onClick={handleFounderAccess}
          disabled={loading}
          type="button"
          className="w-full flex items-center justify-center gap-4 py-4 px-8 rounded-[1.5rem] border border-[var(--color-accent)]/30 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-all disabled:opacity-50"
        >
          <Crown size={16} strokeWidth={3} />
          <span className="text-xs font-black uppercase tracking-[0.2em]">Founder Access</span>
        </button>

        <footer className="mt-16 text-center">
          <p className="text-[10px] text-[var(--color-text)] opacity-40 font-bold uppercase tracking-widest leading-relaxed max-w-xs">
            Authorized users only. Account activity is recorded for security purposes.
          </p>
        </footer>
      </Motion.div>
    </div>
  );
}
