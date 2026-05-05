import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { AuthModal } from './components/AuthModal';
import { Feed } from './components/Feed';
import { SchoolDirectory } from './components/SchoolDirectory';
import { Profile } from './components/Profile';
import { Messaging } from './components/Messaging';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LayoutGrid, GraduationCap, User, LogOut, MessageSquare, Bot, WifiOff, Loader2, Menu, X } from 'lucide-react';
import { AIAssistant } from './components/AIAssistant';
import { auth } from './firebase';
import { motion, AnimatePresence } from 'motion/react';
import { EmailVerification } from './components/EmailVerification';
import { CompleteProfile } from './components/CompleteProfile';

const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white py-2 px-4 flex items-center justify-center gap-3 font-bold text-sm shadow-xl"
        >
          <WifiOff size={16} />
          Vous êtes hors ligne. Certaines fonctionnalités peuvent être limitées.
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'schools' | 'profile' | 'messaging' | 'ai'>('feed');
  const [chatTargetEmail, setChatTargetEmail] = useState<string | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            <Loader2 className="text-moroccan-green" size={48} />
          </motion.div>
          <p className="font-serif italic text-moroccan-green font-bold animate-pulse">Chargement de votre univers...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  // Mandatory Email Verification
  if (!user.emailVerified) {
    return (
      <ErrorBoundary>
        <EmailVerification />
      </ErrorBoundary>
    );
  }

  // Mandatory Profile Completion
  if (!profile && !loading) {
    return (
      <ErrorBoundary>
        <CompleteProfile />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-ivory pb-6 pt-20 md:pb-0 md:pt-28 selection:bg-majorelle selection:text-white transition-all duration-300">
        <OfflineIndicator />
        <div className="fixed inset-0 zellij-pattern opacity-[0.03] pointer-events-none"></div>
        
        {/* Mobile Top Header */}
        <header className="md:hidden fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-b border-moroccan-green/5 px-4 flex items-center justify-between z-50 h-16 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="w-8 h-8 bg-moroccan-red rounded-lg flex items-center justify-center text-white font-serif italic font-bold text-lg shadow-lg">3</div>
            <h1 className="text-base font-serif italic font-bold text-slate-900 tracking-tight">3ALEM O T3ALEM</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsAIOpen(true)}
              className="text-orange-500 p-2 rounded-xl hover:bg-orange-50 transition-all"
            >
              <Bot size={20} />
            </button>
            <button 
              onClick={() => auth.signOut()}
              className="text-moroccan-red p-2 rounded-xl hover:bg-moroccan-red/5 transition-all"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[55] md:hidden"
              />
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 bottom-0 w-[80%] max-w-[300px] bg-white z-[60] md:hidden shadow-2xl flex flex-col p-6"
              >
                <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-100">
                  <div className="w-10 h-10 bg-moroccan-red rounded-xl flex items-center justify-center text-white font-serif italic font-bold text-xl">3</div>
                  <h1 className="font-serif italic font-bold text-slate-900">3ALEM O T3ALEM</h1>
                </div>

                <nav className="flex flex-col gap-2 flex-grow">
                  {[
                    { id: 'feed', icon: LayoutGrid, label: 'Fil d\'actualité' },
                    { id: 'schools', icon: GraduationCap, label: 'Annuaire des Écoles' },
                    { id: 'ai', icon: Bot, label: 'Assistant IA' },
                    { id: 'profile', icon: User, label: 'Mon Profil' },
                    { id: 'messaging', icon: MessageSquare, label: 'Messages' }
                  ].map((tab) => (
                    <button 
                      key={tab.id}
                      onClick={() => {
                        if (tab.id === 'profile') setViewingUserId(null);
                        setActiveTab(tab.id as any);
                        setIsMenuOpen(false);
                      }}
                      className={`px-4 py-4 rounded-2xl text-sm font-bold transition-all flex items-center gap-4 ${activeTab === tab.id ? 'bg-moroccan-green text-white shadow-lg shadow-moroccan-green/20' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      <tab.icon size={20} />
                      {tab.label}
                    </button>
                  ))}
                </nav>

                <div className="pt-6 border-t border-slate-100">
                  <button 
                    onClick={() => auth.signOut()}
                    className="w-full bg-moroccan-red/5 text-moroccan-red p-4 rounded-2xl font-bold flex items-center gap-3 transition-all hover:bg-moroccan-red/10 border border-moroccan-red/10"
                  >
                    <LogOut size={20} />
                    Déconnexion
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Header */}
        <header className="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl bg-white/80 backdrop-blur-xl border border-white/50 z-40 px-8 py-4 rounded-[32px] items-center justify-between shadow-2xl shadow-moroccan-green/5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-moroccan-red rounded-2xl flex items-center justify-center text-white font-serif italic font-bold text-2xl shadow-xl shadow-moroccan-red/20">3</div>
            <div className="flex flex-col">
              <h1 className="text-xl font-serif italic font-bold text-slate-900 tracking-tight leading-none">3ALEM O T3ALEM</h1>
              <span className="text-[10px] uppercase font-black tracking-[0.3em] text-moroccan-green/60">Knowledge Community</span>
            </div>
          </div>
          
          <nav className="flex items-center gap-2 bg-slate-50/50 p-1.5 rounded-[24px] border border-slate-100">
            {[
              { id: 'feed', icon: LayoutGrid, label: 'Communauté' },
              { id: 'schools', icon: GraduationCap, label: 'Écoles' },
              { id: 'ai', icon: Bot, label: 'Assistant IA' },
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
        <main className="container mx-auto px-4 relative z-10 transition-all duration-500 max-w-7xl">
          {activeTab === 'feed' && <Feed onStartChat={(email) => activateChat(email)} onViewProfile={viewUserProfile} />}
          {activeTab === 'schools' && <SchoolDirectory />}
          {activeTab === 'ai' && <AIAssistant mode="academic" isFullPage={true} isOpen={true} onClose={() => setActiveTab('feed')} />}
          {activeTab === 'profile' && <Profile targetUserId={viewingUserId} onMessage={(uid) => {
            setActiveTab('messaging');
          }} />}
          {activeTab === 'messaging' && <Messaging targetEmail={chatTargetEmail} onClearTarget={() => setChatTargetEmail(null)} onViewProfile={viewUserProfile} />}
        </main>

        {/* Floating Support AI Button */}
        <button 
          onClick={() => setIsAIOpen(true)}
          className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-16 h-16 bg-orange-500 text-white rounded-full shadow-2xl shadow-orange-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group border-4 border-white"
        >
          <Bot size={32} className="group-hover:animate-bounce" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
        </button>

        <AIAssistant mode="service" isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />

        {/* Removed Mobile bottom nav to use burger menu instead as requested */}
      </div>
    </ErrorBoundary>
  );
}
