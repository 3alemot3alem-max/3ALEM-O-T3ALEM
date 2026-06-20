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
import { LogIn, UserPlus, Loader2, GraduationCap } from 'lucide-react';

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
                throw err;
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
    <div className="fixed inset-0 bg-[#f8f9fa] flex items-center justify-center z-50 p-0 md:p-8 overflow-y-auto">
      {/* Background decorations tracking the image (subtle waves) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute left-0 top-1/4 w-1/3 h-auto text-blue-50/50 -translate-x-1/2 hidden md:block" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M44.7,-76.4C58.3,-69.2,69.7,-56.3,77.5,-41.5C85.3,-26.7,89.5,-10,88.1,6.5C86.7,23,79.7,39.3,68.6,52.3C57.5,65.3,42.3,75,25.6,81.4C8.9,87.8,-9.3,90.9,-25.6,86.6C-41.9,82.3,-56.3,70.6,-67.2,56.5C-78.1,42.4,-85.5,25.9,-86.8,8.8C-88.1,-8.3,-83.3,-26,-73.4,-40.8C-63.5,-55.6,-48.5,-67.5,-33.1,-73.9C-17.7,-80.3, -1.8,-81.2,14.6,-78.9C31,-76.6,44.7,-76.4" transform="translate(100 100)" />
        </svg>
        <svg className="absolute right-0 bottom-0 w-1/2 h-auto text-blue-50/50 translate-x-1/4 translate-y-1/4 hidden md:block" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M39.9,-65.4C54.1,-58.5,69.5,-51.7,78.2,-39.3C86.9,-26.9,88.9,-8.9,85.1,7.2C81.3,23.3,71.7,37.5,60.1,49.1C48.5,60.7,34.9,69.7,20.1,74.1C5.3,78.5,-10.7,78.3,-24.5,73C-38.3,67.7,-49.9,57.3,-60.1,44.8C-70.3,32.3,-79.1,17.7,-80.5,2.1C-81.9,-13.5,-75.9,-30.1,-65.1,-42.6C-54.3,-55.1,-38.7,-63.5,-23.9,-69.5C-9.1,-75.5,4.9,-79.1,18.9,-75C32.9,-70.9,44.9,-59.1,39.9,-65.4Z" transform="translate(100 100)" />
        </svg>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-5xl bg-white md:rounded-3xl md:shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden relative z-10 flex flex-col md:flex-row min-h-screen md:min-h-[550px] m-auto"
      >
        {/* Left Side - Welcome Brand */}
        <div className="w-full md:w-[45%] p-8 md:p-14 flex flex-col justify-center relative bg-slate-50 md:bg-transparent">
          <div className="relative mb-8 md:mb-16 flex items-center justify-center md:justify-start">
            <h1 className="text-3xl lg:text-4xl font-serif text-moroccan-red tracking-wide">3alem</h1>
            <div className="relative mx-3 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
              <div className="absolute w-6 h-6 md:w-8 md:h-8 border-[1.5px] border-moroccan-red"></div>
              <div className="absolute w-6 h-6 md:w-8 md:h-8 border-[1.5px] border-moroccan-red rotate-45"></div>
              <GraduationCap 
                size={28} 
                className="text-moroccan-green absolute -top-4 -left-3 md:-top-5 md:-left-4 transform -rotate-[20deg] z-10 md:w-[34px] md:h-[34px]" 
                fill="currentColor" 
                strokeWidth={1.5}
              />
            </div>
            <h1 className="text-3xl lg:text-4xl font-serif text-moroccan-red tracking-wide">t3alem</h1>
          </div>

          <div className="max-w-xs mx-auto md:mx-0 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-slate-800 tracking-tight">Bienvenue</h2>
            <p className="text-slate-600 text-[1rem] md:text-[1.1rem] leading-relaxed font-light">
              Rejoignez la communauté 3alem o t3alem, partagez vos connaissances et découvrez de nouvelles opportunités.
            </p>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden md:flex flex-col justify-center py-12">
          <div className="w-[1px] h-full bg-gray-100"></div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full md:w-[55%] p-6 md:p-14 flex flex-col justify-center bg-white relative flex-grow">
          <div className="max-w-md w-full mx-auto">
            <h3 className="text-2xl md:text-[2rem] font-bold mb-6 md:mb-8 text-[#1a1f36] tracking-tight text-center md:text-left">
              {isLogin ? "Connexion" : "Créer un compte"}
            </h3>

            {/* Custom Tab Switcher */}
            <div className="flex bg-gray-50/80 p-1.5 rounded-lg mb-8 border border-gray-100">
              <button 
                onClick={() => handleTabSwitch(true)}
                className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${isLogin ? 'bg-white shadow-sm text-moroccan-green' : 'text-gray-500 hover:text-gray-700'}`}
              >
                 Déjà inscrit ?
              </button>
              <button 
                onClick={() => handleTabSwitch(false)}
                className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${!isLogin ? 'bg-white shadow-sm text-moroccan-green' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Nouveau compte
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-0.5">Adresse email</label>
                  <input 
                    type="email" 
                    placeholder="Etudiant@ump.ac.ma"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-moroccan-green focus:ring-2 focus:ring-moroccan-green/20 outline-none transition-all placeholder-gray-400 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-0.5">Mot de passe</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-moroccan-green focus:ring-2 focus:ring-moroccan-green/20 outline-none transition-all placeholder-gray-400 text-gray-900"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100"
                >
                  {error}
                </motion.p>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-moroccan-green text-white py-3.5 rounded-lg font-medium hover:bg-moroccan-green/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.99] mt-2 shadow-sm shadow-emerald-900/20"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    {isLogin ? "Se connecter" : "S'inscrire"}
                  </>
                )}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 text-gray-500 bg-white">Ou continuer avec</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 flex-wrap mt-6">
                <button 
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                  Google
                </button>

                <button 
                  onClick={handleAppleLogin}
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 21.8-88.5 21.8-11.4 0-51.1-22.2-81.9-22.2C64.2 139.1 10 183.1 10 263.1c0 52.3 19.3 103.5 54.4 153.6 22.3 32.1 49.3 64.9 83.1 64.9 14.6 0 21.9-8.7 51.9-8.7 30.6 0 36.4 8.7 52.8 8.7 34.6 0 57.5-29.4 80.5-62.8 28.5-41.2 36.3-80.1 36.6-82.3-.6-.2-71.2-27.5-70.5-107.8zM286 110.1c16.3-19.4 27.6-46.7 24.3-73.6-22.1 1.1-49.8 15.3-64.9 33.7-13.6 15.5-25.9 43.1-22.3 69.1 24.6 1.8 50.1-13.5 62.9-29.2z"/></svg>
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

