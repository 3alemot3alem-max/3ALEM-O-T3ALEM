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
      <div className="min-h-screen bg-ivory pb-24 pt-20 md:pb-0 md:pt-28 selection:bg-majorelle selection:text-white">
        <div className="fixed inset-0 zellij-pattern opacity-[0.03] pointer-events-none"></div>
        
        {/* Mobile Top Header */}
        <header className="md:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-moroccan-green/5 px-6 py-4 flex items-center justify-between z-40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-moroccan-red rounded-xl flex items-center justify-center text-white font-serif italic font-bold text-xl shadow-lg shadow-moroccan-red/20">3</div>
            <h1 className="text-lg font-serif italic font-bold text-slate-900 tracking-tight">3ALEM O T3ALEM</h1>
          </div>
          <button 
            onClick={() => auth.signOut()}
            className="text-moroccan-red p-2 rounded-2xl hover:bg-moroccan-red/5 transition-all"
            title="D&eacute;connexion"
          >
            <LogOut size={20} />
          </button>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl bg-white/70 backdrop-blur-xl border border-white/50 z-40 px-8 py-4 rounded-[32px] items-center justify-between shadow-2xl shadow-moroccan-green/5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-moroccan-red rounded-2xl flex items-center justify-center text-white font-serif italic font-bold text-2xl shadow-xl shadow-moroccan-red/20">3</div>
            <div className="flex flex-col">
              <h1 className="text-xl font-serif italic font-bold text-slate-900 tracking-tight leading-none">3ALEM O T3ALEM</h1>
              <span className="text-[10px] uppercase font-black tracking-[0.3em] text-moroccan-green/60">Knowledge Community</span>
            </div>
          </div>
          
          <nav className="flex items-center gap-2 bg-slate-50/50 p-1.5 rounded-[24px] border border-slate-100">
            {[
              { id: 'feed', icon: LayoutGrid, label: 'Communaut&eacute;' },
              { id: 'schools', icon: GraduationCap, label: '&Eacute;coles' },
              { id: 'profile', icon: User, label: 'Profil' },
              { id: 'messaging', icon: MessageSquare, label: 'Messages' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'profile') setViewingUserId(null);
                  setActiveTab(tab.id as any);
                }}
                className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-2.5 ${activeTab === tab.id ? 'bg-moroccan-green text-white shadow-xl shadow-moroccan-green/20 scale-105' : 'text-slate-400 hover:text-moroccan-green hover:bg-moroccan-green/5'}`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? 'animate-pulse' : ''} />
                <span dangerouslySetInnerHTML={{ __html: tab.label }} />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <div className="text-right hidden lg:block">
              <p className="text-sm font-serif italic font-bold text-slate-900 leading-none">{user.displayName || 'Utilisateur'}</p>
              <div className="flex items-center justify-end gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 bg-moroccan-green rounded-full"></div>
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.1em]">En ligne</span>
              </div>
            </div>
            <button 
              onClick={() => auth.signOut()}
              className="bg-moroccan-red/5 text-moroccan-red p-3 rounded-2xl hover:bg-moroccan-red/10 transition-all flex items-center gap-2 group"
              title="D&eacute;connexion"
            >
              <LogOut size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
              <span className="hidden lg:block text-xs font-black uppercase tracking-widest">Quitter</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto relative z-10 transition-all duration-500">
          {activeTab === 'feed' && <Feed onStartChat={(email) => activateChat(email)} onViewProfile={viewUserProfile} />}
          {activeTab === 'schools' && <SchoolDirectory />}
          {activeTab === 'profile' && <Profile targetUserId={viewingUserId} onMessage={(uid) => {
            setActiveTab('messaging');
          }} />}
          {activeTab === 'messaging' && <Messaging targetEmail={chatTargetEmail} onClearTarget={() => setChatTargetEmail(null)} onViewProfile={viewUserProfile} />}
        </main>

        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-moroccan-green/5 px-6 py-4 flex justify-between items-center z-40 shadow-[0_-10px_40px_rgba(193,39,45,0.1)] rounded-t-[32px]">
          {[
            { id: 'feed', icon: LayoutGrid, label: 'Feed' },
            { id: 'schools', icon: GraduationCap, label: '&Eacute;coles' },
            { id: 'profile', icon: User, label: 'Profil' },
            { id: 'messaging', icon: MessageSquare, label: 'Chat' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => {
                if (tab.id === 'profile') setViewingUserId(null);
                setActiveTab(tab.id as any);
              }}
              className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab === tab.id ? 'text-moroccan-green scale-110' : 'text-slate-300'}`}
            >
              <div className={`p-2 rounded-xl transition-all ${activeTab === tab.id ? 'bg-moroccan-green/10' : ''}`}>
                <tab.icon size={22} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em]" dangerouslySetInnerHTML={{ __html: tab.label }}></span>
            </button>
          ))}
        </nav>
      </div>
    </ErrorBoundary>
  );
}
