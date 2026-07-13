import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { AuthModal } from './components/AuthModal';
import { Feed } from './components/Feed';
import { SchoolDirectory } from './components/SchoolDirectory';
import { Profile } from './components/Profile';
import { EducationalAI } from './components/EducationalAI';
import { Notifications } from './components/Notifications';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LayoutGrid, GraduationCap, User, LogOut, Bot, WifiOff, Loader2, Menu, X, Bell } from 'lucide-react';
import { auth } from './firebase';
import { motion, AnimatePresence } from 'motion/react';
import { EmailVerification } from './components/EmailVerification';
import { CompleteProfile } from './components/CompleteProfile';

import authImage from './assets/images/logo.png';

const AppLogo = ({ className = "h-8 w-8" }: { className?: string }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <img src={authImage} alt="3alem o t3alem Logo" className="object-contain w-full h-full" />
  </div>
);

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
  const [activeTab, setActiveTab] = useState<'feed' | 'schools' | 'profile' | 'ai'>('feed');
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const viewUserProfile = (userId: string) => {
    setViewingUserId(userId);
    setActiveTab('profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="text-moroccan-green animate-spin mx-auto" size={48} />
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
            <span className="font-serif italic font-bold ml-2 text-moroccan-red flex items-center gap-1">3alem <AppLogo className="w-10 h-10 text-moroccan-red object-contain" /> t3alem</span>
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
                  <span className="font-serif italic font-bold text-xl text-moroccan-red flex items-center gap-2">3alem <AppLogo className="w-12 h-12 text-moroccan-red object-contain" /> t3alem</span>
                </div>

                <nav className="flex flex-col gap-2 flex-grow">
                  {[
                    { id: 'feed', icon: LayoutGrid, label: 'Fil d\'actualité' },
                    { id: 'schools', icon: GraduationCap, label: 'Annuaire des Écoles' },
                    { id: 'ai', icon: Bot, label: 'Assistant IA' },
                    { id: 'notifications', icon: Bell, label: 'Notifications' },
                    { id: 'profile', icon: User, label: 'Mon Profil' }
                  ].map((tab) => (
                    <button 
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 p-4 rounded-xl transition-all font-semibold ${
                        activeTab === tab.id 
                          ? 'bg-moroccan-green text-white shadow-lg shadow-emerald-900/20' 
                          : 'hover:bg-black/5'
                      }`}
                    >
                      <tab.icon size={20} />
                      {tab.label}
                    </button>
                  ))}
                </nav>

                <div className="pt-6 border-t border-black/10 mt-auto">
                  <button 
                    onClick={() => auth.signOut()}
                    className="flex items-center gap-3 p-4 rounded-xl transition-all font-semibold text-red-600 hover:bg-red-50 w-full"
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
        <header className="hidden md:flex fixed top-0 left-0 right-0 backdrop-blur-xl border-b border-black/5 px-6 items-center justify-between z-50 h-20 shadow-sm transition-colors duration-500 bg-[#e1d4d4]/90 text-slate-900">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab('feed')}>
            <AppLogo className="w-12 h-12 text-moroccan-red object-contain" />
            <span className="font-serif italic font-bold text-2xl text-moroccan-red ml-1">3alem o t3alem</span>
          </div>
          
          <nav className="flex items-center gap-2">
            {[
              { id: 'feed', icon: LayoutGrid, label: 'Fil d\'actualité' },
              { id: 'schools', icon: GraduationCap, label: 'Annuaire' },
              { id: 'ai', icon: Bot, label: 'Assistant IA' },
              { id: 'notifications', icon: Bell, label: 'Notifications' },
              { id: 'profile', icon: User, label: 'Profil' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all font-semibold ${
                  activeTab === tab.id 
                    ? 'bg-moroccan-green text-white shadow-lg shadow-emerald-900/20' 
                    : 'hover:bg-black/5'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
            
            <div className="w-px h-8 bg-black/10 mx-2"></div>
            
            <button 
              onClick={() => auth.signOut()}
              className="text-slate-600 hover:text-red-600 hover:bg-red-50 p-2.5 rounded-full transition-all"
              title="Se déconnecter"
            >
              <LogOut size={20} />
            </button>
          </nav>
        </header>

        {/* Main Content */}
        <main className="w-full relative z-10 px-4 md:px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto"
            >
              {activeTab === 'feed' && <Feed onViewProfile={viewUserProfile} />}
              {activeTab === 'schools' && <SchoolDirectory />}
              {activeTab === 'profile' && <Profile targetUserId={viewingUserId || undefined} />}
              {activeTab === 'ai' && <EducationalAI />}
              {activeTab === 'notifications' && <Notifications />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t border-black/5 z-50 pb-safe transition-colors duration-500 bg-[#e1d4d4]/90 text-slate-900 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="flex justify-around items-center h-16 px-2">
            {[
              { id: 'feed', icon: LayoutGrid, label: 'Accueil' },
              { id: 'schools', icon: GraduationCap, label: 'Écoles' },
              { id: 'ai', icon: Bot, label: 'IA' },
              { id: 'notifications', icon: Bell, label: 'Notifs' },
              { id: 'profile', icon: User, label: 'Profil' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative ${
                  activeTab === tab.id ? 'text-moroccan-green' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {activeTab === 'ai' && tab.id === 'ai' && (
                  <div className="absolute top-1 right-3 w-2 h-2 bg-moroccan-green rounded-full animate-ping"></div>
                )}
                <tab.icon size={22} className={activeTab === tab.id ? 'fill-current' : ''} />
                <span className="text-[10px] font-semibold">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-1 bg-moroccan-green rounded-b-full"
                  />
                )}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </ErrorBoundary>
  );
}
