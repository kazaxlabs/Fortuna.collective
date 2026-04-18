import React, { useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { completeOnboarding } from '../../services/authService';
import { useAuth } from '../../context/useAuth';
import './Onboarding.css';

const STEPS = [
  {
    id: 1, title: 'Welcome to the Inner Circle',
    subtitle: 'Before you enter, introduce yourself to the network.',
  },
  {
    id: 2, title: 'Your Professional Identity',
    subtitle: 'Tell us about your field and current work.',
  },
  {
    id: 3, title: 'Network Intelligence',
    subtitle: 'What you can offer — and what you are seeking.',
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

export default function Onboarding() {
  const { user, setProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    primaryField: '',
    company: '',
    assetIBring: '',
    connectionISeeking: '',
    social: '',
  });
  const [loading, setLoading] = useState(false);

  const update = (key, val) => setData((d) => ({ ...d, [key]: val }));

  const handleFinish = async () => {
    setLoading(true);
    await completeOnboarding(user.uid, {
      ...data,
      displayName: user.displayName,
      email: user.email,
    });
    setProfile((p) => ({ ...p, ...data, onboardingComplete: true }));
    setLoading(false);
  };

  const slideVariants = {
    enter: { x: 40, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
  };

  return (
    <div className="ob-bg">
      <div className="ob-glow" />
      <div className="ob-container glass">
        {/* Progress */}
        <div className="ob-progress">
          {STEPS.map((s, i) => (
            <div key={s.id} className={`ob-dot ${i <= step ? 'ob-dot-active' : ''}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <Motion.div
            key={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="ob-step"
          >
            <div className="ob-step-header">
              <span className="label-gold">Step {step + 1} of {STEPS.length}</span>
              <h2>{STEPS[step].title}</h2>
              <p>{STEPS[step].subtitle}</p>
            </div>

            {step === 0 && (
              <div className="ob-fields">
                <div className="ob-code-block">
                  <p className="label-gold" style={{ marginBottom: '12px' }}>FORTUNA CODE OF CONDUCT</p>
                  <ul className="ob-rules">
                    <li><strong>Zero Spam.</strong> Provide value before you seek it.</li>
                    <li><strong>Radical Discretion.</strong> What's shared in FORTUNA stays here.</li>
                    <li><strong>Topic Integrity.</strong> Keep conversations in their designated rooms.</li>
                    <li><strong>Real Identity.</strong> Use your real name and a professional photo.</li>
                    <li><strong>Give-to-Get.</strong> Prioritize contribution over observation.</li>
                  </ul>
                </div>
                <p className="ob-agree">By continuing, you agree to uphold these standards.</p>
              </div>
            )}

            {step === 1 && (
              <div className="ob-fields">
                <div className="ob-field-group">
                  <label className="label-gold">Primary Field</label>
                  <div className="ob-field-grid">
                    {FIELDS.map((f) => (
                      <button
                        key={f}
                        className={`ob-field-chip ${data.primaryField === f ? 'ob-field-chip-active' : ''}`}
                        onClick={() => update('primaryField', f)}
                        type="button"
                      >{f}</button>
                    ))}
                  </div>
                </div>
                <div className="ob-field-group">
                  <label className="label-gold">Current Company / Project</label>
                  <input className="input-field" placeholder="What are you building right now?" value={data.company} onChange={(e) => update('company', e.target.value)} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="ob-fields">
                <div className="ob-field-group">
                  <label className="label-gold">One High-Value Asset I Bring</label>
                  <input className="input-field" placeholder="e.g., Venture capital access, 500k+ reach on IG" value={data.assetIBring} onChange={(e) => update('assetIBring', e.target.value)} />
                </div>
                <div className="ob-field-group">
                  <label className="label-gold">One Connection I Am Seeking</label>
                  <input className="input-field" placeholder="e.g., A reliable nightlife host, a commercial RE agent" value={data.connectionISeeking} onChange={(e) => update('connectionISeeking', e.target.value)} />
                </div>
                <div className="ob-field-group">
                  <label className="label-gold">LinkedIn / Instagram Handle</label>
                  <input className="input-field" placeholder="URL or @handle" value={data.social} onChange={(e) => update('social', e.target.value)} />
                </div>
              </div>
            )}
          </Motion.div>
        </AnimatePresence>

        <div className="ob-actions">
          {step > 0 && (
            <button className="btn-ghost" onClick={() => setStep((s) => s - 1)}>Back</button>
          )}
          {step < STEPS.length - 1 ? (
            <button className="btn-primary" onClick={() => setStep((s) => s + 1)}>
              Continue
            </button>
          ) : (
            <button className="btn-primary" onClick={handleFinish} disabled={loading}>
              {loading ? 'Entering…' : 'Enter FORTUNA →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
