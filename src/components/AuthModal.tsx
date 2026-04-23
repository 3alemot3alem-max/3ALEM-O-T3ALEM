import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, GraduationCap, School, Camera, Loader2 } from 'lucide-react';

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
      const provider = new GoogleAuthProvider();
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden my-8"
      >
        <div className="flex flex-col md:flex-row h-full">
          {/* Left Side - Branding */}
          <div className="bg-blue-600 md:w-5/12 p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}>
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 font-black text-2xl mb-6 shadow-xl">3</div>
              <h2 className="text-3xl font-black mb-4 tracking-tight">3ALEM O T3ALEM</h2>
              <p className="text-blue-100 leading-relaxed">La première plateforme marocaine d'orientation collaborative.</p>
            </div>
            <div className="relative z-10 mt-12">
              <div className="flex -space-x-3 mb-4">
                {[1, 2, 3, 4].map(i => (
                  <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} className="w-10 h-10 rounded-full border-2 border-blue-600 bg-white" alt="User" />
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-blue-600 bg-blue-500 flex items-center justify-center text-[10px] font-bold">+2k</div>
              </div>
              <p className="text-xs font-medium text-blue-200">Rejoignez des milliers d'étudiants marocains.</p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="md:w-7/12 p-8 md:p-12 bg-white">
            <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
              <button 
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${isLogin ? 'bg-white shadow-md text-blue-600' : 'text-gray-500'}`}
              >
                Connexion
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${!isLogin ? 'bg-white shadow-md text-blue-600' : 'text-gray-500'}`}
              >
                Inscription
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {!isLogin ? (
                  <motion.div 
                    key="register-fields"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div 
                           onClick={() => setRole('student')}
                           className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all hover:border-blue-200 ${role === 'student' ? 'border-blue-600 bg-blue-50' : 'border-gray-100'}`}>
                        <GraduationCap className={role === 'student' ? 'text-blue-600' : 'text-gray-400'} />
                        <span className={`text-xs mt-2 font-bold ${role === 'student' ? 'text-blue-600' : 'text-gray-500'}`}>Élève</span>
                      </div>
                      <div 
                           onClick={() => setRole('mentor')}
                           className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all hover:border-blue-200 ${role === 'mentor' ? 'border-blue-600 bg-blue-50' : 'border-gray-100'}`}>
                        <School className={role === 'mentor' ? 'text-blue-600' : 'text-gray-400'} />
                        <span className={`text-xs mt-2 font-bold ${role === 'mentor' ? 'text-blue-600' : 'text-gray-500'}`}>Étudiant</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="Prénom"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                      <input 
                        type="text" 
                        placeholder="Nom"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>

                    <input 
                      type="text" 
                      placeholder="École / Université"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <select 
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        required
                      >
                        <option value="">Niveau</option>
                        {(role === 'student' ? studentLevels : mentorLevels).map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                      <input 
                        type="text" 
                        placeholder="Filière"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 bg-white rounded-lg shadow-sm text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <Camera size={20} />
                      </button>
                      <span className="text-xs text-gray-500 truncate flex-1">
                        {photoURL ? "Photo sélectionnée ✓" : "Choisir une photo de profil"}
                      </span>
                      {photoURL && (
                        <img src={photoURL} className="w-8 h-8 rounded-lg object-cover border border-white shadow-sm" alt="Aperçu" />
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
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <input 
                  type="password" 
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              {error && (
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="text-red-500 text-xs font-bold text-center bg-red-50 p-3 rounded-xl"
                >
                  {error}
                </motion.p>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                    {isLogin ? 'Se connecter' : "Créer mon compte"}
                  </>
                )}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest"><span className="bg-white px-4 text-gray-400">Ou</span></div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full border-2 border-gray-100 py-3 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-3 text-gray-700"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              Continuer avec Google
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
