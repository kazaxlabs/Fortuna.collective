// ============================================================
// DEMO MODE — Prototype Only
// Hardcoded credentials for prototype testing.
// Replace this with real Firebase auth before production.
// ============================================================

const DEMO_USERS = {
  kaza1: {
    uid: 'demo-user-001',
    email: 'kaza1@fortuna.demo',
    displayName: 'Kaza — Admin',
    primaryField: 'Sales & Marketing',
    company: 'FORTUNA Network',
    assetIBring: 'Revenue Architecture & Growth Systems',
    connectionISeeking: 'High-tier strategic partners',
    social: '@kaza',
    role: 'admin',
    onboardingComplete: true,
  },
};

const PASSWORDS = {
  kaza1: 'Kaza2',
};

const SESSION_KEY = 'fortuna_demo_session';

export const demoLogin = (username, password) => {
  const user = DEMO_USERS[username];
  if (!user || PASSWORDS[username] !== password) {
    throw new Error('INVALID_CREDENTIALS');
  }
  sessionStorage.setItem(SESSION_KEY, username);
  return user;
};

export const demoLogout = () => {
  sessionStorage.removeItem(SESSION_KEY);
};

export const getDemoSession = () => {
  const username = sessionStorage.getItem(SESSION_KEY);
  if (!username) return null;
  return DEMO_USERS[username] || null;
};
