import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { AuthModal } from './components/AuthModal';
import { Feed } from './components/Feed';
import { SchoolDirectory } from './components/SchoolDirectory';
import { Profile } from './components/Profile';
import { Messaging } from './components/Messaging';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LayoutGrid, GraduationCap, User, LogOut, MessageSquare, Bot, WifiOff, Loader2, Menu, X } from 'lucide-react';
import { auth } from './firebase';
import { motion, AnimatePresence } from 'motion/react';
import { EmailVerification } from './components/EmailVerification';
import { CompleteProfile } from './components/CompleteProfile';
import regeneratedLogo from './assets/images/regenerated_image_1779220280486.jpg';

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
  if (!user.emailVerified && localStorage.getItem('is_school_auth') !== 'true') {
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
      <div className="min-h-screen pb-6 pt-20 md:pb-0 md:pt-28 selection:bg-majorelle selection:text-white transition-colors duration-500 bg-[#e1d4d4] border-[#807e7e]">
        <OfflineIndicator />
        <div className="fixed inset-0 zellij-pattern opacity-[0.03] pointer-events-none"></div>
        
        {/* Mobile Top Header */}
        <header className="md:hidden fixed top-0 left-0 right-0 backdrop-blur-xl border-b border-black/5 px-4 flex items-center justify-between z-50 h-16 shadow-sm transition-colors duration-500 bg-[#e1d4d4]/90 text-slate-900">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl transition-all hover:bg-black/5"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <img src={regeneratedLogo} className="h-8 w-8 rounded-full border border-white/20 object-cover shadow-sm" alt="Logo" />
            <span className="font-serif italic font-bold">3alem o t3alem</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => auth.signOut()}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all"
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
                className="fixed top-0 left-0 bottom-0 w-[80%] max-w-[300px] bg-[#e1d4d4] z-[60] md:hidden shadow-2xl flex flex-col p-6 text-slate-900"
              >
                <div className="flex items-center justify-center mb-10 pb-6 border-b border-black/10">
                  <img src={regeneratedLogo} className="h-16 w-16 rounded-full border border-black/5 object-cover shadow-lg" alt="3alem o t3alem" />
                </div>

                <nav className="flex flex-col gap-2 flex-grow">
                  {[
                    { id: 'feed', icon: LayoutGrid, label: 'Fil d\'actualité' },
                    { id: 'schools', icon: GraduationCap, label: 'Annuaire des Écoles' },
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
                      className={`px-4 py-4 rounded-2xl text-sm font-bold transition-all flex items-center gap-4 ${activeTab === tab.id ? 'bg-[#1EBA64] text-white shadow-lg shadow-black/20' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                    >
                      <tab.icon size={20} />
                      {tab.label}
                    </button>
                  ))}
                </nav>

                <div className="pt-6 border-t border-white/10">
                  <button 
                    onClick={() => auth.signOut()}
                    className="w-full bg-white/10 text-white p-4 rounded-2xl font-bold flex items-center gap-3 transition-all hover:bg-white/20 border border-white/10"
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
        <header className="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl bg-[#310202]/95 backdrop-blur-xl border border-white/5 z-40 px-8 py-4 rounded-[32px] items-center justify-between shadow-2xl shadow-black/40">
          <div className="flex items-center gap-3 shrink-0">
            <img src={regeneratedLogo} className="h-10 w-10 rounded-full border border-white/20 object-cover shadow-lg shadow-[#1EBA64]/20" alt="3alem o t3alem" />
            <div className="flex flex-col">
              <span className="font-serif italic font-bold text-white tracking-wide text-lg whitespace-nowrap">3alem o t3alem</span>
            </div>
          </div>
          
          <nav className="flex items-center gap-2 bg-white/5 p-1.5 rounded-[24px] border border-white/10">
            {[
              { id: 'feed', icon: LayoutGrid, label: 'Communauté' },
              { id: 'schools', icon: GraduationCap, label: 'Écoles' },
              { id: 'profile', icon: User, label: 'Profil' },
              { id: 'messaging', icon: MessageSquare, label: 'Messages' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'profile') setViewingUserId(null);
                  setActiveTab(tab.id as any);
                }}
                className={`px-5 py-2.5 rounded-[20px] text-sm font-medium transition-all duration-300 flex items-center gap-2.5 ${activeTab === tab.id ? 'bg-[#1EBA64] text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                <tab.icon size={16} />
                <span dangerouslySetInnerHTML={{ __html: tab.label }} />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <div className="text-right hidden lg:block">
              <p className="text-sm font-serif italic font-bold text-white leading-none">{user.displayName || 'Utilisateur'}</p>
              <div className="flex items-center justify-end gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 bg-[#1EBA64] rounded-full"></div>
                <span className="text-[9px] text-white/50 font-black uppercase tracking-[0.1em]">En ligne</span>
              </div>
            </div>
            <button 
              onClick={() => auth.signOut()}
              className="bg-white/5 border border-white/20 text-white/90 px-4 py-2 md:py-2.5 rounded-[20px] hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 group"
              title="Quitter"
            >
              <LogOut size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
              <span className="hidden lg:block text-[11px] font-black uppercase tracking-widest mt-0.5">Quitter</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 relative z-10 transition-all duration-500 max-w-7xl">
          {activeTab === 'feed' && <Feed onStartChat={(email) => activateChat(email)} onViewProfile={viewUserProfile} />}
          {activeTab === 'schools' && <SchoolDirectory />}
          {activeTab === 'profile' && <Profile targetUserId={viewingUserId} onMessage={(uid) => {
            setActiveTab('messaging');
          }} />}
          {activeTab === 'messaging' && <Messaging targetEmail={chatTargetEmail} onClearTarget={() => setChatTargetEmail(null)} onViewProfile={viewUserProfile} />}
        </main>

        {/* Removed Mobile bottom nav to use burger menu instead as requested */}
      </div>
    </ErrorBoundary>
  );
}
