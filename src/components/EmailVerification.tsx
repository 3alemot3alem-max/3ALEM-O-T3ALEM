import React, { useState, useEffect } from 'react';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../AuthContext';
import { motion } from 'motion/react';
import { Mail, RefreshCw, LogOut, CheckCircle, Loader2 } from 'lucide-react';

export const EmailVerification: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  const handleRefresh = async () => {
    setLoading(true);
    setError('');
    try {
      await refreshUser();
    } catch (err: any) {
      setError("Erreur lors de la mise à jour du statut. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      await sendEmailVerification(user);
      setResent(true);
      setTimeout(() => setResent(false), 6000);
    } catch (err: any) {
      if (err.code === 'auth/too-many-requests') {
        setError("Trop de tentatives. Veuillez attendre quelques minutes before de réessayer.");
      } else {
        setError("Impossible d'envoyer l'email de vérification. Vérifiez votre connexion.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Check verification status every 4 seconds automatically
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      await refreshUser();
    }, 4000);
    return () => clearInterval(interval);
  }, [user, refreshUser]);

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-6 relative overflow-hidden">
      <div className="fixed inset-0 zellij-pattern opacity-[0.03] pointer-events-none"></div>
      
      {/* Background accents */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-moroccan-green/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-moroccan-red/10 rounded-full blur-[120px]"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[48px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] w-full max-w-lg overflow-hidden relative z-10 border border-white/50"
      >
        <div className="p-10 md:p-14 text-center">
          <div className="w-28 h-28 bg-gradient-to-br from-moroccan-green/20 to-moroccan-green/5 rounded-[40px] flex items-center justify-center text-moroccan-green mx-auto mb-10 shadow-inner relative group">
            <div className="absolute inset-0 bg-moroccan-green/10 rounded-[40px] animate-ping opacity-20 group-hover:animate-none"></div>
            <Mail size={48} className="relative z-10" />
          </div>

          <h2 className="text-4xl font-serif italic font-bold text-slate-900 mb-6 leading-tight">Vérifiez votre <br/>identité académique</h2>
          
          <div className="bg-slate-50/80 backdrop-blur-sm rounded-3xl p-6 mb-10 border border-slate-100 flex flex-col items-center gap-2">
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-1">Email de destination</p>
            <p className="text-lg font-serif italic font-bold text-moroccan-green truncate w-full">
              {user?.email}
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-moroccan-red/5 text-moroccan-red p-5 rounded-3xl text-xs font-bold leading-relaxed mb-8 border border-moroccan-red/10"
            >
              {error}
            </motion.div>
          )}

          {resent && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-moroccan-green text-white p-5 rounded-3xl text-xs font-black uppercase tracking-widest mb-8 flex items-center justify-center gap-3 shadow-xl shadow-moroccan-green/20"
            >
              <CheckCircle size={16} /> Corresponance envoyée !
            </motion.div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="w-full bg-moroccan-green text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] hover:bg-moroccan-green/90 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-moroccan-green/20 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              {loading ? <Loader2 className="animate-spin" size={24} /> : <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-500" />}
              <span className="relative z-10">J&apos;ai cliqué sur le lien</span>
            </button>

            <button 
              onClick={handleResend}
              disabled={loading}
              className="w-full bg-slate-50 text-slate-500 py-5 rounded-3xl font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition-all border border-slate-100 text-xs"
            >
              Renvoyer le lien de vérification
            </button>

            <div className="pt-8 flex flex-col items-center gap-6">
              <button 
                onClick={() => signOut(auth)}
                className="group flex items-center gap-3 text-slate-400 hover:text-moroccan-red transition-colors duration-300"
              >
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-moroccan-red/10 group-hover:text-moroccan-red transition-all">
                  <LogOut size={18} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em]">Changer de compte</span>
              </button>
              
              <p className="text-[10px] text-slate-300 font-serif italic max-w-[280px] leading-loose">
                * N&apos;oubliez pas d&apos;inspecter votre dossier "Indésirables" ou "Spams" si vous ne trouvez pas notre pli.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
