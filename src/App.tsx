import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { AuthModal } from './components/AuthModal';
import { Feed } from './components/Feed';
import { SchoolDirectory } from './components/SchoolDirectory';
import { Profile } from './components/Profile';
import { Messaging } from './components/Messaging';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LayoutGrid, GraduationCap, User, LogOut, MessageSquare } from 'lucide-react';
import { auth } from './firebase';

export default function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'schools' | 'profile' | 'messaging'>('feed');
  const [chatTargetEmail, setChatTargetEmail] = useState<string | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);

  const activateChat = (email: string) => {
    setChatTargetEmail(email);
    setActiveTab('messaging');
  };

  const viewUserProfile = (userId: string) => {
    setViewingUserId(userId);
    setActiveTab('profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 pb-24 pt-20 md:pb-0 md:pt-24">
        {/* Mobile Top Header */}
        <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-200">3</div>
            <h1 className="text-lg font-black text-gray-900 tracking-tight">3ALEM O T3ALEM</h1>
          </div>
          <button 
            onClick={() => auth.signOut()}
            className="text-red-600 p-2 rounded-xl hover:bg-red-50 transition-all"
            title="Déconnexion"
          >
            <LogOut size={20} />
          </button>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40 px-8 py-4 items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">3</div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">3ALEM O T3ALEM</h1>
          </div>
          
          <nav className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl">
            <button 
              onClick={() => setActiveTab('feed')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'feed' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LayoutGrid size={18} />
              Communauté
            </button>
            <button 
              onClick={() => setActiveTab('schools')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'schools' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <GraduationCap size={18} />
              Écoles
            </button>
            <button 
              onClick={() => {
                setViewingUserId(null);
                setActiveTab('profile');
              }}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'profile' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <User size={18} />
              Profil
            </button>
            <button 
              onClick={() => setActiveTab('messaging')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'messaging' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <MessageSquare size={18} />
              Messages
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-right hidden lg:block">
              <p className="text-sm font-bold text-gray-900">{user.displayName || 'Utilisateur'}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Connecté</p>
            </div>
            <button 
              onClick={() => auth.signOut()}
              className="bg-red-50 text-red-600 p-2.5 rounded-xl hover:bg-red-100 transition-all flex items-center gap-2 group"
              title="Déconnexion"
            >
              <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
              <span className="hidden sm:block text-xs font-bold">Déconnexion</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto">
          {activeTab === 'feed' && <Feed onStartChat={(email) => activateChat(email)} onViewProfile={viewUserProfile} />}
          {activeTab === 'schools' && <SchoolDirectory />}
          {activeTab === 'profile' && <Profile targetUserId={viewingUserId} onMessage={(uid) => {
            setActiveTab('messaging');
          }} />}
          {activeTab === 'messaging' && <Messaging targetEmail={chatTargetEmail} onClearTarget={() => setChatTargetEmail(null)} onViewProfile={viewUserProfile} />}
        </main>

        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => setActiveTab('feed')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'feed' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <LayoutGrid size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Feed</span>
          </button>
          <button 
            onClick={() => setActiveTab('schools')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'schools' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <GraduationCap size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Écoles</span>
          </button>
          <button 
            onClick={() => {
              setViewingUserId(null);
              setActiveTab('profile');
            }}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <User size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Profil</span>
          </button>
          <button 
            onClick={() => setActiveTab('messaging')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'messaging' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <MessageSquare size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Chat</span>
          </button>
        </nav>
      </div>
    </ErrorBoundary>
  );
}
