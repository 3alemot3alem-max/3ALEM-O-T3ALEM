import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from '../AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, School, Camera, Loader2, Sparkles, CheckCircle } from 'lucide-react';
import { SCHOOL_ACRONYMS } from '../data/schools';

export const CompleteProfile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [institution, setInstitution] = useState('');
  const [role, setRole] = useState<'student' | 'mentor'>('student');
  const [photoURL, setPhotoURL] = useState('');
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

  const handleNextStep = () => {
    if (step === 1 && (!firstName.trim() || !lastName.trim())) {
      setError('Veuillez entrer votre nom et prénom.');
      return;
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (step === 1) {
      handleNextStep();
      return;
    }

    setLoading(true);
    setError('');

    const pendingPack = localStorage.getItem('pending_pack');

    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: `${firstName} ${lastName}`,
        firstName,
        lastName,
        email: user.email,
        photoURL: photoURL || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        role: role,
        institution: role === 'mentor' ? institution : '',
        selectedPack: pendingPack || 'basic', // Default to basic if none found
        createdAt: new Date().toISOString(),
      });
      localStorage.removeItem('pending_pack');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-6 relative overflow-hidden">
      <div className="fixed inset-0 zellij-pattern opacity-[0.03] pointer-events-none"></div>
      
      {/* Background accents */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-moroccan-red/5 rounded-full blur-[100px]"></div>
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-moroccan-green/5 rounded-full blur-[100px]"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[48px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] w-full max-w-2xl overflow-hidden relative z-10 border border-white/50"
      >
        <div className="p-10 md:p-14">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-moroccan-red rounded-[28px] flex items-center justify-center text-white font-serif italic font-bold text-3xl mx-auto mb-8 shadow-2xl shadow-moroccan-red/20 rotate-3 transform-gpu">3</div>
            <h2 className="text-4xl font-serif italic font-bold text-slate-900 mb-3 tracking-tight">Sculptez votre profil</h2>
            <p className="text-slate-400 font-serif italic text-lg">Donnez une âme à votre jardin de la connaissance.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col gap-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Je suis un(e)...</label>
                    <div className="grid grid-cols-2 gap-6">
                      <div 
                        onClick={() => setRole('student')}
                        className={`group relative flex flex-col items-center justify-center p-8 rounded-[36px] border-2 transition-all duration-500 overflow-hidden ${role === 'student' ? 'border-moroccan-green bg-moroccan-green/[0.03] shadow-2xl shadow-moroccan-green/10' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200 cursor-pointer'}`}>
                        {role === 'student' && <motion.div layoutId="role-bg" className="absolute inset-0 bg-gradient-to-br from-moroccan-green/5 to-transparent" />}
                        <div className={`p-4 rounded-2xl mb-4 transition-colors duration-300 ${role === 'student' ? 'bg-moroccan-green text-white shadow-xl' : 'bg-white text-slate-400 group-hover:text-slate-600'}`}>
                          <GraduationCap size={32} />
                        </div>
                        <span className={`text-xs font-black uppercase tracking-[0.2em] relative z-10 transition-colors ${role === 'student' ? 'text-moroccan-green' : 'text-slate-500'}`}>Élève</span>
                      </div>
                      <div 
                        onClick={() => setRole('mentor')}
                        className={`group relative flex flex-col items-center justify-center p-8 rounded-[36px] border-2 transition-all duration-500 overflow-hidden ${role === 'mentor' ? 'border-moroccan-green bg-moroccan-green/[0.03] shadow-2xl shadow-moroccan-green/10' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200 cursor-pointer'}`}>
                        {role === 'mentor' && <motion.div layoutId="role-bg" className="absolute inset-0 bg-gradient-to-br from-moroccan-green/5 to-transparent" />}
                        <div className={`p-4 rounded-2xl mb-4 transition-colors duration-300 ${role === 'mentor' ? 'bg-moroccan-green text-white shadow-xl' : 'bg-white text-slate-400 group-hover:text-slate-600'}`}>
                          <School size={32} />
                        </div>
                        <span className={`text-xs font-black uppercase tracking-[0.2em] relative z-10 transition-colors ${role === 'mentor' ? 'text-moroccan-green' : 'text-slate-500'}`}>Étudiant</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Identité</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="Prénom"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-8 py-5 rounded-[24px] bg-slate-50 border-2 border-transparent focus:bg-white focus:border-moroccan-green/30 outline-none transition-all font-medium placeholder:text-slate-300"
                        required
                      />
                      <input 
                        type="text" 
                        placeholder="Nom"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-8 py-5 rounded-[24px] bg-slate-50 border-2 border-transparent focus:bg-white focus:border-moroccan-green/30 outline-none transition-all font-medium placeholder:text-slate-300"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={handleNextStep}
                    className="w-full bg-moroccan-green text-white py-6 rounded-[28px] font-black uppercase tracking-[0.25em] hover:bg-moroccan-green/90 transition-all shadow-[0_20px_40px_-12px_rgba(42,110,95,0.3)] flex items-center justify-center gap-4 group"
                  >
                    Continuer l&apos;aventure
                    <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="space-y-8"
                >
                  {role === 'mentor' ? (
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Établissement actuel</label>
                      <input 
                        type="text" 
                        placeholder="Ex: EMI, ENIM, FST Marrakech..."
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        className="w-full px-8 py-5 rounded-[24px] bg-slate-50 border-2 border-transparent focus:bg-white focus:border-moroccan-green/30 outline-none transition-all font-medium placeholder:text-slate-300 shadow-inner"
                        list="school-suggestions"
                        required
                      />
                      <datalist id="school-suggestions">
                        {SCHOOL_ACRONYMS.map(name => (
                          <option key={name} value={name} />
                        ))}
                      </datalist>
                    </div>
                  ) : (
                    <div className="p-10 bg-gradient-to-br from-moroccan-green/5 to-slate-50 rounded-[40px] border border-dashed border-moroccan-green/20 text-center relative overflow-hidden group">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-moroccan-green/5 rounded-full blur-2xl group-hover:bg-moroccan-green/10 transition-colors"></div>
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-moroccan-green mx-auto mb-6 shadow-xl relative z-10">
                        <CheckCircle size={32} />
                      </div>
                      <p className="text-slate-600 font-serif italic text-lg leading-relaxed relative z-10">
                        Bienvenue, futur bâchelier ! <br/>
                        <span className="text-slate-400 text-sm mt-2 block">Accédez bientôt à votre coaching sur mesure.</span>
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Avatar Personnel</label>
                    <div 
                      className="flex items-center gap-6 p-6 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 hover:border-moroccan-green/40 transition-all group cursor-pointer relative" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                      <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-moroccan-green group-hover:shadow-lg transition-all overflow-hidden border border-slate-100">
                        {photoURL ? (
                          <img src={photoURL} className="w-full h-full object-cover" alt="Profile preview" />
                        ) : (
                          <Camera size={32} strokeWidth={1.5} />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-bold text-slate-700 block mb-1">
                          {photoURL ? "Photo parfaite ! ✓" : "Ajouter un portrait"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Format JPG/PNG • Max 1Mo</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4">
                    <button 
                      type="button"
                      onClick={() => setStep(1)}
                      className="bg-slate-100 text-slate-500 py-6 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center"
                    >
                      Retour
                    </button>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="bg-moroccan-green text-white py-6 rounded-[28px] font-black uppercase tracking-[0.25em] hover:bg-moroccan-green/90 transition-all shadow-2xl shadow-moroccan-green/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                    >
                      {loading ? <Loader2 className="animate-spin text-white" size={24} /> : "Finaliser"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 text-moroccan-red text-[10px] font-black uppercase tracking-[0.2em] text-center bg-moroccan-red/5 p-5 rounded-[24px] border border-moroccan-red/10"
            >
              {error}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
