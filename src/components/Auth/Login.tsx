import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'motion/react';
import { ShieldCheck, Key, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../../context/useAuth';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

export default function Login() {
  const { login, loginWithEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    setIsMobileDevice(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await login();
    } catch (err) {
      console.error(err);
      setError('Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

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

        <div className="w-full flex items-center gap-6 mb-10">
          <div className="flex-1 h-[2px] neu-concave rounded-full opacity-30"></div>
          <span className="text-[10px] font-bold text-[var(--color-text)] opacity-40 uppercase tracking-[0.3em]">Alternative Sign In</span>
          <div className="flex-1 h-[2px] neu-concave rounded-full opacity-30"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-4 neu-button text-[var(--color-text)] font-bold py-4 px-8 rounded-2xl disabled:opacity-50"
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="" 
            className="w-5 h-5"
            referrerPolicy="no-referrer"
          />
          <span className="text-sm uppercase tracking-widest">Continue with Google</span>
        </button>

        <footer className="mt-24 text-center">
          <p className="text-[10px] text-[var(--color-text)] opacity-40 font-bold uppercase tracking-widest leading-relaxed max-w-xs">
            Authorized users only. Account activity is recorded for security purposes.
          </p>
        </footer>
      </Motion.div>
    </div>
  );
}
