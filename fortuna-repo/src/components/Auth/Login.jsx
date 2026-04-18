import React, { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { useAuth } from '../../context/useAuth';
import './Auth.css';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      login(username.trim(), password);
    } catch {
      setError('Invalid credentials. Access denied.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-bg">
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />

      <Motion.div
        className="auth-panel glass"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        <Motion.div className="auth-logo" variants={fadeUp}>
          <span className="auth-logo-icon">𝔽</span>
          <span className="label-gold">FORTUNA</span>
        </Motion.div>

        <Motion.div className="auth-heading" variants={fadeUp}>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Enter your credentials to access the inner circle.</p>
        </Motion.div>

        <Motion.form className="auth-form" onSubmit={handleSubmit} variants={fadeUp}>
          <div className="auth-field">
            <label className="label-gold">Username</label>
            <input
              id="username"
              className="input-field"
              type="text"
              placeholder="your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="auth-field">
            <label className="label-gold">Passphrase</label>
            <input
              id="password"
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Verifying…' : 'Enter the Circle'}
          </button>
        </Motion.form>

        <Motion.p className="auth-prototype-note" variants={fadeUp}>
          🔒 Prototype access — invite only
        </Motion.p>
      </Motion.div>
    </div>
  );
}
