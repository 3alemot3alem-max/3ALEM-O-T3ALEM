import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, OAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import firebaseConfig from '../../firebase-applet-config.json';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, GraduationCap, School, Camera, Loader2 } from 'lucide-react';
import { SCHOOLS_DATA } from '../data/schools';

export const AuthModal: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [institution, setInstitution] = useState('');
  const [major, setMajor] = useState('');
  const [level, setLevel] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [role, setRole] = useState<'student' | 'mentor'>('student');
  const [error, setError] = useState('');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setError("L'image est trop lourde (max 1Mo)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const studentLevels = ['Tronc Commun', '1ère année Bac', '2ème année Bac'];
  const mentorLevels = ['1ère année', '2ème année', 'Licence', 'Master', 'Doctorat'];

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      if (!auth) throw new Error("Auth non initialisée");
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            displayName: user.displayName || '',
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            email: user.email || '',
            photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
            bannerURL: '',
            role: 'student',
            level: 'Non spécifié',
            createdAt: new Date().toISOString(),
          });
        }
    } catch (err: any) {
      console.error("Auth Error:", err.code, err.message);
      if (err.code === 'auth/operation-not-allowed') {
        setError(`La connexion Google n'est pas activée. Allez dans Console Firebase > Authentication > Sign-in method > Ajouter un fournisseur > Google (Activer).`);
      } else if (err.code === 'auth/argument-error') {
        setError("Une erreur technique est survenue (Argument Error). Veuillez rafraîchir la page ou vérifier la configuration.");
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError("La fenêtre de connexion a été fermée avant la fin.");
      } else {
        setError("Impossible de se connecter via Google pour le moment.");
      }
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
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          displayName: user.displayName || 'Utilisateur Apple',
          firstName: user.displayName?.split(' ')[0] || 'Apple',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || 'User',
          email: user.email || '',
          photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
          bannerURL: '',
          role: 'student',
          level: 'Non spécifié',
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.error("Apple Auth Error:", err.code);
      if (err.code === 'auth/operation-not-allowed') {
        setError("La connexion Apple n'est pas activée dans la console Firebase.");
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError("La fenêtre Apple a été fermée.");
      } else {
        setError("Erreur technique lors de la connexion Apple.");
      }
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
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      } else {
        if (!level) throw new Error('Veuillez choisir votre niveau');
        
        const result = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          displayName: `${firstName} ${lastName}`,
          firstName,
          lastName,
          email,
          photoURL: photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.user.uid}`,
          bannerURL: '',
          role,
          level,
          institution,
          major,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.error("Submit Error:", err.code, err.message);
      if (err.code === 'auth/operation-not-allowed') {
        setError(`La connexion E-mail n'est pas activée. Allez dans Console Firebase > Authentication > Sign-in method > Ajouter un fournisseur > E-mail/Mot de passe (Activer).`);
      } else if (err.code === 'auth/email-already-in-use') {
        setError("Cet e-mail est déjà utilisé par un autre compte.");
      } else if (err.code === 'auth/invalid-email') {
        setError("L'adresse e-mail n'est pas valide.");
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Email ou mot de passe incorrect.");
      } else if (err.code === 'auth/weak-password') {
        setError("Le mot de passe doit contenir au moins 6 caractères.");
      } else if (err.code === 'auth/argument-error') {
        setError("Une erreur est survenue dans les informations envoyées (Argument Error).");
      } else {
        setError("Une erreur s'est produite. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ivory flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="fixed inset-0 zellij-pattern opacity-5 pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden my-8 border border-white/50 relative z-10"
      >
        <div className="flex flex-col md:flex-row min-h-[600px]">
          {/* Left Side - Branding */}
          <div className="bg-moroccan-green md:w-5/12 p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 zellij-pattern opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-moroccan-green via-moroccan-green to-moroccan-green/80"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white font-serif italic font-bold text-3xl mb-8 border border-white/20 shadow-2xl">3</div>
              <h2 className="text-4xl font-serif italic font-bold mb-6 tracking-tight leading-tight">3ALEM O T3ALEM</h2>
              <div className="w-12 h-1 bg-moroccan-red rounded-full mb-6"></div>
              <p className="text-white/80 text-lg font-serif italic leading-relaxed">
                "La connaissance est un jardin que l&apos;on cultive ensemble."
              </p>
            </div>

            <div className="relative z-10 mt-12 bg-white/5 backdrop-blur-sm p-6 rounded-3xl border border-white/10">
              <div className="flex -space-x-3 mb-4">
                {[1, 2, 3, 4].map(i => (
                  <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} className="w-11 h-11 rounded-2xl border-4 border-moroccan-green bg-white object-cover" alt="User" />
                ))}
                <div className="w-11 h-11 rounded-2xl border-4 border-moroccan-green bg-moroccan-red flex items-center justify-center text-[10px] font-black tracking-tighter text-white">+2k</div>
              </div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Communaut&eacute; Active</p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="md:w-7/12 p-8 md:p-14 bg-white relative">
            <div className="flex bg-slate-50 p-1.5 rounded-[24px] mb-10 border border-slate-100">
              <button 
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3.5 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all duration-300 ${isLogin ? 'bg-white shadow-xl shadow-moroccan-green/5 text-moroccan-green' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Connexion
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3.5 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all duration-300 ${!isLogin ? 'bg-white shadow-xl shadow-moroccan-green/5 text-moroccan-green' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Inscription
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {!isLogin ? (
                  <motion.div 
                    key="register-fields"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div 
                           onClick={() => setRole('student')}
                           className={`flex flex-col items-center justify-center p-5 rounded-[24px] border-2 cursor-pointer transition-all duration-300 ${role === 'student' ? 'border-moroccan-green bg-moroccan-green/5 shadow-inner' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}>
                        <GraduationCap className={role === 'student' ? 'text-moroccan-green' : 'text-slate-400'} size={28} />
                        <span className={`text-[10px] mt-3 font-black uppercase tracking-widest ${role === 'student' ? 'text-moroccan-green' : 'text-slate-500'}`}>&Eacute;l&egrave;ve</span>
                      </div>
                      <div 
                           onClick={() => setRole('mentor')}
                           className={`flex flex-col items-center justify-center p-5 rounded-[24px] border-2 cursor-pointer transition-all duration-300 ${role === 'mentor' ? 'border-moroccan-green bg-moroccan-green/5 shadow-inner' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}>
                        <School className={role === 'mentor' ? 'text-moroccan-green' : 'text-slate-400'} size={28} />
                        <span className={`text-[10px] mt-3 font-black uppercase tracking-widest ${role === 'mentor' ? 'text-moroccan-green' : 'text-slate-500'}`}>&Eacute;tudiant</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="Pr&eacute;nom"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-moroccan-green/20 outline-none transition-all font-medium"
                        required
                      />
                      <input 
                        type="text" 
                        placeholder="Nom"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-moroccan-green/20 outline-none transition-all font-medium"
                        required
                      />
                    </div>

                    <input 
                      type="text" 
                      placeholder="&Eacute;cole / Universit&eacute;"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-moroccan-green/20 outline-none transition-all font-medium"
                      list="school-suggestions"
                      required
                    />
                    <datalist id="school-suggestions">
                      {SCHOOLS_DATA.map(school => (
                        <option key={school.id} value={school.name} />
                      ))}
                    </datalist>

                    <div className="grid grid-cols-2 gap-4">
                      <select 
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-moroccan-green/20 outline-none transition-all text-sm font-medium appearance-none"
                        required
                      >
                        <option value="">Niveau</option>
                        {(role === 'student' ? studentLevels : mentorLevels).map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                      <input 
                        type="text" 
                        placeholder="Fili&egrave;re"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-moroccan-green/20 outline-none transition-all font-medium"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 hover:border-moroccan-green/30 transition-colors group cursor-pointer relative" onClick={() => fileInputRef.current?.click()}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                      <div className="p-3 bg-white rounded-xl shadow-sm group-hover:text-moroccan-green transition-colors">
                        <Camera size={20} />
                      </div>
                      <span className="text-xs font-bold text-slate-500 truncate flex-1">
                        {photoURL ? "Photo s&eacute;lectionn&eacute;e \u2713" : "Choisir une photo de profil"}
                      </span>
                      {photoURL && (
                        <img src={photoURL} className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-md shadow-moroccan-green/5" alt="Aper&ccedil;u" />
                      )}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div className="space-y-4">
                <input 
                  type="email" 
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-moroccan-green/20 outline-none transition-all font-medium"
                  required
                />
                <input 
                  type="password" 
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-moroccan-green/20 outline-none transition-all font-medium"
                  required
                />
              </div>

              {error && (
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="text-moroccan-red text-xs font-black uppercase tracking-widest text-center bg-moroccan-red/10 p-4 rounded-2xl border border-moroccan-red/20"
                >
                  {error}
                </motion.p>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-moroccan-green text-white py-5 rounded-[24px] font-black uppercase tracking-[0.2em] hover:bg-moroccan-green/90 transition-all shadow-2xl shadow-moroccan-green/20 flex items-center justify-center gap-3 disabled:opacity-70 group active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    {isLogin ? <LogIn size={20} className="group-hover:translate-x-1 transition-transform" /> : <UserPlus size={20} className="group-hover:scale-110 transition-transform" />}
                    {isLogin ? 'Se connecter' : "Rejoindre l&apos;aventure"}
                  </>
                )}
              </button>
            </form>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.4em]"><span className="bg-white px-6 text-slate-300">OU</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex-1 border-2 border-slate-100 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3 text-slate-600 disabled:opacity-50"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                Google
              </button>

              <button 
                onClick={handleAppleLogin}
                disabled={loading}
                className="flex-1 bg-slate-900 border-2 border-slate-900 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3 text-white disabled:opacity-50 shadow-xl shadow-slate-200"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 21.8-88.5 21.8-11.4 0-51.1-22.2-81.9-22.2C64.2 139.1 10 183.1 10 263.1c0 52.3 19.3 103.5 54.4 153.6 22.3 32.1 49.3 64.9 83.1 64.9 14.6 0 21.9-8.7 51.9-8.7 30.6 0 36.4 8.7 52.8 8.7 34.6 0 57.5-29.4 80.5-62.8 28.5-41.2 36.3-80.1 36.6-82.3-.6-.2-71.2-27.5-70.5-107.8zM286 110.1c16.3-19.4 27.6-46.7 24.3-73.6-22.1 1.1-49.8 15.3-64.9 33.7-13.6 15.5-25.9 43.1-22.3 69.1 24.6 1.8 50.1-13.5 62.9-29.2z"/></svg>
                Apple
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
