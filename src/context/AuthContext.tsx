import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { subscribeToAuth, loginWithGoogle, logoutUser, loginWithCredentials, registerWithCredentials } from '../services/authService';
import { subscribeToUserProfile } from '../services/userService';
import { AuthContextType, UserProfile } from '../types';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubAuth = subscribeToAuth(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Subscribe to profile for real-time updates (including status changes)
        if (unsubProfile) unsubProfile();
        unsubProfile = subscribeToUserProfile(firebaseUser.uid, (userProfile) => {
          if (userProfile) {
            setProfile(userProfile);
            
            // Session Kill-Switch Logic
            if (userProfile.status === 'banned' || userProfile.status === 'hold') {
              console.warn('Session terminated by administrative action.');
              logoutUser(); // This will trigger unsubAuth with null
            }
          }
          setLoading(false);
        });
      } else {
        setUser(null);
        setProfile(null);
        if (unsubProfile) {
          unsubProfile();
          unsubProfile = null;
        }
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const login = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await loginWithCredentials(email, pass);
    } catch (error) {
      console.error('Email login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      await registerWithCredentials(email, pass, name);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, setProfile, loading, login, loginWithEmail, registerWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
