import React, { useState } from 'react';
import { useAuth } from './context/useAuth';
import Login from './components/Auth/Login';
import Onboarding from './components/Auth/Onboarding';
import Sidebar from './components/Layout/Sidebar';
import ChatRoom from './components/Chat/ChatRoom';
import './index.css';

export default function App() {
  const { user, profile, loading } = useAuth();
  const [activeRoom, setActiveRoom] = useState('lounge');

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-logo">𝔽</div>
        <div className="app-loading-bar">
          <div className="app-loading-fill" />
        </div>
      </div>
    );
  }

  if (!user) return <Login />;
  if (!profile?.onboardingComplete) return <Onboarding />;

  return (
    <div className="app-layout">
      <Sidebar activeRoom={activeRoom} onRoomChange={setActiveRoom} />
      <main className="app-main">
        <ChatRoom roomId={activeRoom} />
      </main>
    </div>
  );
}
