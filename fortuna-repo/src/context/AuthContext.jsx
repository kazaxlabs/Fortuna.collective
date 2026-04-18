import React, { createContext, useState } from 'react';
import { demoLogin, demoLogout, getDemoSession } from '../services/demoAuth';

export const AuthContext = createContext(null);

const getInitialState = () => {
  const session = getDemoSession();
  if (!session) return { user: null, profile: null };
  return {
    user: { uid: session.uid, email: session.email, displayName: session.displayName },
    profile: session,
  };
};

export const AuthProvider = ({ children }) => {
  const initial = getInitialState();
  const [user, setUser] = useState(initial.user);
  const [profile, setProfile] = useState(initial.profile);
  const [loading] = useState(false);

  const login = (username, password) => {
    const session = demoLogin(username, password); // throws on bad creds
    setUser({ uid: session.uid, email: session.email, displayName: session.displayName });
    setProfile(session);
    return session;
  };

  const logout = () => {
    demoLogout();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, setProfile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
