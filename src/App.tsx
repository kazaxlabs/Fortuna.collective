import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import Login from './components/Auth/Login';
import Onboarding from './components/Auth/Onboarding';
import Sidebar from './components/Layout/Sidebar';
import BottomNav from './components/Layout/BottomNav';
import ChatRoom from './components/Chat/ChatRoom';
import Feed from './components/Feed/Feed';
import Search from './components/Search/Search';
import CreatePost from './components/Post/CreatePost';
import Notifications from './components/Notifications/Notifications';
import Profile from './components/Profile/Profile';
import DirectChat from './components/Chat/DirectChat';
import ConversationsList from './components/Chat/ConversationsList';
import Network from './components/Network/Network';
import UserNetwork from './components/Network/UserNetwork';
import FounderControl from './components/Admin/FounderControl';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/UI/ErrorBoundary';
import { getOrCreateConversation } from './services/chatService';
import './index.css';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [activeRoute, setActiveRoute] = useState('feed');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavigateToProfile = (userId: string) => {
    setSelectedUserId(userId);
    setActiveRoute('profile');
  };

  const handleNavigateToChat = (convoId: string) => {
    setSelectedConvoId(convoId);
    setActiveRoute('direct-chat');
  };

  const handleMessageUser = async (userId: string) => {
    if (!user) return;
    const convoId = await getOrCreateConversation(user.uid, userId);
    if (convoId) {
      handleNavigateToChat(convoId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <div className="flex flex-col items-center gap-8">
          <div className="w-20 h-20 neu-convex rounded-full flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_var(--color-accent)]" />
          </div>
          <div className="space-y-2 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-text)] opacity-40 animate-pulse">Establishing Connection</p>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-accent)] opacity-20">Synchronizing Node v4.1</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <Login />;
  
  if (!profile?.onboardingComplete) return <Onboarding />;

  return (
    <div className="app-layout relative bg-[var(--color-bg)] flex flex-col md:flex-row h-screen overflow-hidden">
      {!isMobile && (
        <Sidebar 
          activeRoute={activeRoute} 
          onRouteChange={(route) => {
            setActiveRoute(route);
            if (route === 'profile') setSelectedUserId(null); // Reset to own profile
          }} 
        />
      )}

      <main className="flex-1 h-screen overflow-hidden relative flex flex-col">
        <div className="flex-1 overflow-y-auto w-full no-scrollbar pb-24 md:pb-0">
          {activeRoute.startsWith('feed') ? (
            <Feed 
              roomId={activeRoute.includes(':') ? activeRoute.split(':')[1] : undefined} 
              onNavigateToProfile={handleNavigateToProfile}
            />
          ) : activeRoute === 'search' ? (
            <Search onSelectUser={handleNavigateToProfile} onMessageUser={handleMessageUser} />
          ) : activeRoute === 'create' ? (
            <CreatePost />
          ) : activeRoute === 'notifications' ? (
            <Notifications />
          ) : activeRoute === 'network' ? (
            <UserNetwork onSelectUser={handleNavigateToProfile} onMessageUser={handleMessageUser} />
          ) : activeRoute === 'files' ? (
            <Network />
          ) : activeRoute === 'messages' ? (
            <ConversationsList onSelectConvo={handleNavigateToChat} />
          ) : activeRoute === 'profile' ? (
            <Profile userId={selectedUserId || undefined} onNavigateToChat={handleNavigateToChat} />
          ) : activeRoute === 'founder-control' ? (
            <FounderControl />
          ) : activeRoute.startsWith('direct-chat') ? (
            <DirectChat 
              convoId={activeRoute.includes(':') ? activeRoute.split(':')[1] : selectedConvoId!} 
              onBack={() => setActiveRoute('profile')} 
            />
          ) : (
            <ChatRoom roomId={activeRoute} />
          )}
        </div>
      </main>

      {isMobile && <BottomNav activeRoute={activeRoute} onRouteChange={setActiveRoute} />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
