import React, { useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  OAuthProvider,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../firebase';
import { motion } from 'motion/react';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';
import regeneratedLogo from '../assets/images/regenerated_image_1779220280486.jpg';

export const AuthModal: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleTabSwitch = (login: boolean) => {
    setIsLogin(login);
    setError('');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      if (!auth) throw new Error("Auth non initialisée");
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Auth Error:", err.code, err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      if (!auth) throw new Error("Auth non initialisée");
      const provider = new OAuthProvider('apple.com');
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Apple Auth Error:", err.code);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs obligatoires.');
      setLoading(false);
      return;
    }

    try {
      const isSchoolPassword = password.trim() === '123456789!@#$';

      if (isSchoolPassword) {
        localStorage.setItem('is_school_auth', 'true');
        try {
          await signInWithEmailAndPassword(auth, email.trim(), password.trim());
        } catch (err: any) {
          if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
            try {
              await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
            } catch (createErr: any) {
              if (createErr.code === 'auth/email-already-in-use') {
                throw err; // throw the original invalid-credential if email exists but wrong password (which is unlikely if magic password, but better safe)
              }
              throw createErr;
            }
          } else {
            throw err;
          }
        }
      } else {
        localStorage.removeItem('is_school_auth');
        if (isLogin) {
          const result = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
          if (!result.user.emailVerified) {
            await sendEmailVerification(result.user);
          }
        } else {
          try {
            const result = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
            await sendEmailVerification(result.user);
          } catch (err: any) {
            throw err;
          }
        }
      }
    } catch (err: any) {
      console.error("Submit Error:", err.code, err.message);
      let msg = "Une erreur est survenue lors de l'authentification.";
      
      switch (err.code) {
        case 'auth/invalid-credential':
          msg = "Email ou mot de passe incorrect.";
          break;
        case 'auth/user-not-found':
          msg = "Aucun compte trouvé avec cet email.";
          break;
        case 'auth/wrong-password':
          msg = "Mot de passe incorrect.";
          break;
        case 'auth/email-already-in-use':
          msg = "Cet email est déjà utilisé par un autre compte.";
          break;
        case 'auth/weak-password':
          msg = "Le mot de passe est trop faible.";
          break;
        case 'auth/invalid-email':
          msg = "L'adresse email n'est pas valide.";
          break;
        case 'auth/too-many-requests':
          msg = "Trop de tentatives échouées. Veuillez réessayer plus tard.";
          break;
        default:
          msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ivory flex z-50">
      <div className="fixed inset-0 zellij-pattern opacity-5 pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full h-full shadow-2xl overflow-hidden relative z-10 transition-all duration-500 overflow-y-auto"
      >
        <div className="flex flex-col md:flex-row min-h-full">
          {/* Left Side - Branding */}
          <div className="bg-moroccan-red w-full md:w-5/12 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden transition-all flex-shrink-0">
            <div className="absolute inset-0 zellij-pattern opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-moroccan-red via-moroccan-red to-moroccan-red/80"></div>
            
            <div className="relative z-10 flex flex-col items-center md:items-start">
              <div className="mb-4 md:mb-6 w-10 h-10 md:w-12 md:h-12 ml-1.5 mt-2 overflow-hidden rounded-full border-2 border-white/20 shadow-lg bg-white">
                <img src={regeneratedLogo} alt="3alem o t3alem logo" className="w-full h-full object-cover" />
              </div>
              <div className="w-10 md:w-12 h-1 bg-moroccan-green rounded-full mb-6"></div>
              <p className="text-white/90 text-base md:text-lg font-serif italic leading-relaxed text-center md:text-left drop-shadow-md">
                "La connaissance est un jardin que l'on cultive ensemble."
              </p>
            </div>

            <div className="relative z-10 mt-8 md:mt-12 bg-white/5 backdrop-blur-sm p-4 md:p-6 rounded-3xl border border-white/10 hidden sm:block">
              <div className="flex -space-x-3 mb-4">
                {[1, 2, 3, 4].map(i => (
                  <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl border-4 border-moroccan-red bg-white object-cover shadow-lg" alt="User" />
                ))}
                <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl border-4 border-moroccan-red bg-moroccan-green flex items-center justify-center text-[9px] md:text-[10px] font-black tracking-tighter text-white font-sans shrink-0">+2k</div>
              </div>
              <p className="text-[9px] md:text-xs font-black uppercase tracking-[0.2em] text-white/60">Communauté Active</p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex-1 p-6 md:p-14 bg-white relative">
            <div className="max-w-md mx-auto h-full flex flex-col justify-center">
              <div className="flex bg-slate-50 p-1 rounded-3xl mb-8 md:mb-10 border border-slate-100">
                <button 
                  onClick={() => handleTabSwitch(true)}
                  className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${isLogin ? 'bg-white shadow-lg text-moroccan-green' : 'text-slate-400 hover:text-slate-600'}`}
                >
                   Connexion
                </button>
                <button 
                  onClick={() => handleTabSwitch(false)}
                  className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${!isLogin ? 'bg-white shadow-lg text-moroccan-green' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Inscription
                </button>
              </div>

              <div className="text-center mb-8 md:mb-10">
                <h3 className="text-xl md:text-2xl font-serif italic font-bold text-slate-900 border-b-2 border-moroccan-red inline-block pb-1">
                  {isLogin ? "Bon retour parmi nous" : "Rejoins la communauté"}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="space-y-3 md:space-y-4">
                  <input 
                    type="email" 
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-3.5 md:px-6 md:py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-moroccan-green/20 outline-none transition-all font-medium text-sm md:text-base shadow-sm"
                    required
                  />
                  <input 
                    type="password" 
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-3.5 md:px-6 md:py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-moroccan-green/20 outline-none transition-all font-medium text-sm md:text-base shadow-sm"
                    required
                  />
                </div>

                {error && (
                  <motion.p 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="text-moroccan-red text-[10px] font-black uppercase tracking-widest text-center bg-moroccan-red/5 p-3 rounded-2xl border border-moroccan-red/10 whitespace-pre-wrap"
                  >
                    {error}
                  </motion.p>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-moroccan-green text-white py-4 md:py-5 rounded-[20px] md:rounded-[24px] font-black uppercase tracking-[0.2em] hover:bg-moroccan-green/90 transition-all shadow-xl shadow-moroccan-green/10 flex items-center justify-center gap-3 disabled:opacity-70 group active:scale-[0.98] text-xs md:text-sm"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      {isLogin ? <LogIn size={18} className="group-hover:translate-x-1 transition-transform" /> : <UserPlus size={18} className="group-hover:scale-110 transition-transform" />}
                      {isLogin ? 'Se connecter' : "Créer mon compte"}
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-8 md:my-10">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.4em]"><span className="bg-white px-4 text-slate-300">OU</span></div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4 pb-4">
                <button 
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="flex-1 border border-slate-200 py-3 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-slate-600 disabled:opacity-50 shadow-sm"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4 md:w-5 md:h-5" alt="Google" />
                  Google
                </button>

                <button 
                  onClick={handleAppleLogin}
                  disabled={loading}
                  className="flex-1 bg-slate-900 border border-slate-900 py-3 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 text-white disabled:opacity-50 shadow-lg"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5 fill-current" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 21.8-88.5 21.8-11.4 0-51.1-22.2-81.9-22.2C64.2 139.1 10 183.1 10 263.1c0 52.3 19.3 103.5 54.4 153.6 22.3 32.1 49.3 64.9 83.1 64.9 14.6 0 21.9-8.7 51.9-8.7 30.6 0 36.4 8.7 52.8 8.7 34.6 0 57.5-29.4 80.5-62.8 28.5-41.2 36.3-80.1 36.6-82.3-.6-.2-71.2-27.5-70.5-107.8zM286 110.1c16.3-19.4 27.6-46.7 24.3-73.6-22.1 1.1-49.8 15.3-64.9 33.7-13.6 15.5-25.9 43.1-22.3 69.1 24.6 1.8 50.1-13.5 62.9-29.2z"/></svg>
                  Apple
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
