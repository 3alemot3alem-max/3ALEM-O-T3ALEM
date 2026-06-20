import React, { useState } from 'react';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useAuth } from '../AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, School, Camera, Loader2, Sparkles, CheckCircle, LogOut } from 'lucide-react';
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

  // School fields
  const isSchool = localStorage.getItem('is_school_auth') === 'true';
  const [schoolName, setSchoolName] = useState('');
  const [schoolCity, setSchoolCity] = useState('');
  const [schoolMajors, setSchoolMajors] = useState('');
  const [schoolBio, setSchoolBio] = useState('');

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

  const getSchoolLogo = (name: string) => {
    const uppercaseName = name.toUpperCase();
    if (uppercaseName.includes('ENSA') && !uppercaseName.includes('ENSAM')) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlC0dLhH_WguGxnzLOEQuiCP_DuT7ENWQNKQ&s';
    if (uppercaseName.includes('ENSEM')) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-8gAATYCsIsCYrpE0bQFQ50psQOq215IyZA&s';
    if (uppercaseName.includes('ENSAM')) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBETqRTwuRitB0q-b0bYw0-YY_6hnRjtjtvg&s';
    if (uppercaseName.includes('ENCG')) return 'https://upload.wikimedia.org/wikipedia/commons/6/60/ENCG-Casablanca.png';
    if (uppercaseName.includes('ISCAE')) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUDVL5HqKF3YNfs8MNbmhsL8bpE-FGtErWDw&s';
    if (uppercaseName.includes('INSEA')) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-kM0CodOXM0iDZL2FNKtcrKhmwWVkir0fvQ&s';
    if (uppercaseName.includes('ERN')) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_3-mfO7sYxygeONqkD9pfT45q';
    return `https://api.dicebear.com/7.x/initials/svg?seed=${name}&backgroundColor=159c52`;
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
    
    if (isSchool) {
      if (!schoolName || !schoolCity || !schoolMajors) {
        setError("Veuillez remplir les informations de l'établissement.");
        return;
      }
    } else {
      if (step === 1) {
        handleNextStep();
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      if (isSchool) {
        const q = query(collection(db, 'users'), where('displayName', '==', schoolName));
        const currentSchools = await getDocs(q);
        if (!currentSchools.empty) {
          setError(`Un compte pour l'établissement "${schoolName}" existe déjà.`);
          setLoading(false);
          return;
        }
      }
    } catch (err: any) {
      console.error(err);
    }

    const pendingPack = localStorage.getItem('pending_pack');

    try {
      if (isSchool) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          role: 'school',
          displayName: schoolName,
          firstName: 'Université',
          lastName: schoolName,
          institution: schoolName,
          city: schoolCity,
          major: schoolMajors,
          bio: schoolBio || `Bienvenue sur le profil officiel de ${schoolName}.`,
          level: 'Supérieure',
          photoURL: photoURL || user.photoURL || getSchoolLogo(schoolName),
          createdAt: new Date().toISOString(),
          // include required defaults
        });
      } else {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          displayName: `${firstName} ${lastName}`,
          firstName,
          lastName,
          email: user.email,
          photoURL: photoURL || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
          role: role,
          institution: role === 'mentor' ? institution : '',
          selectedPack: pendingPack || 'basic',
          createdAt: new Date().toISOString(),
        });
        localStorage.removeItem('pending_pack');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 md:p-6 py-10 relative overflow-y-auto">
      <div className="fixed inset-0 zellij-pattern opacity-[0.03] pointer-events-none"></div>
      
      {/* Background accents */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-moroccan-red/5 rounded-full blur-[100px] hidden md:block"></div>
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-moroccan-green/5 rounded-full blur-[100px] hidden md:block"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[32px] md:rounded-[48px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] w-full max-w-2xl overflow-hidden relative z-10 border border-slate-100/50 m-auto"
      >
        <div className="absolute top-6 right-6 z-20">
          <button 
            type="button"
            onClick={() => {
              localStorage.removeItem('is_school_auth');
              signOut(auth);
            }}
            className="text-xs font-semibold text-gray-500 hover:text-moroccan-red transition-colors flex items-center gap-2 bg-gray-50/80 p-2 rounded-lg border border-gray-100"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sortir</span>
          </button>
        </div>
        <div className="p-8 md:p-14">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3 tracking-tight">
              {isSchool ? "Compte Institutionnel" : "Sculptez votre profil"}
            </h2>
            <p className="text-slate-600 text-[1rem] md:text-[1.1rem] leading-relaxed font-light">
              {isSchool 
                ? "Configurez le profil officiel de votre établissement." 
                : "Aidez-nous à personnaliser votre expérience."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {isSchool ? (
                <motion.div 
                  key="school-form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-0.5">Nom de l'établissement</label>
                    <input 
                      type="text" 
                      placeholder="Ex: EMI, ENSIAS"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-moroccan-green focus:ring-2 focus:ring-moroccan-green/20 outline-none transition-all placeholder-gray-400 text-gray-900"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-0.5">Ville</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Rabat"
                        value={schoolCity}
                        onChange={(e) => setSchoolCity(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-moroccan-green focus:ring-2 focus:ring-moroccan-green/20 outline-none transition-all placeholder-gray-400 text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-0.5">Filières</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Ingénierie, Commerce"
                        value={schoolMajors}
                        onChange={(e) => setSchoolMajors(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-moroccan-green focus:ring-2 focus:ring-moroccan-green/20 outline-none transition-all placeholder-gray-400 text-gray-900"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-0.5">À propos</label>
                    <textarea 
                      placeholder="Description, spécialités, mots du directeur..."
                      value={schoolBio}
                      onChange={(e) => setSchoolBio(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-moroccan-green focus:ring-2 focus:ring-moroccan-green/20 outline-none transition-all placeholder-gray-400 text-gray-900 resize-none h-28"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-0.5">Logo Officiel</label>
                    <div 
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 hover:border-moroccan-green/40 transition-all cursor-pointer group" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                      <div className="w-14 h-14 bg-white rounded-md flex items-center justify-center text-gray-400 border border-gray-200 overflow-hidden">
                        {photoURL ? (
                          <img src={photoURL} className="w-full h-full object-cover" alt="Profile preview" />
                        ) : (
                          <Camera size={24} />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700 block">
                          {photoURL ? "Logo ajouté ! ✓" : "Ajouter le logo"}
                        </span>
                        <span className="text-xs text-gray-500">Format JPG/PNG • Max 1Mo</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-moroccan-green text-white py-3.5 rounded-lg font-medium hover:bg-moroccan-green/90 transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-70 shadow-sm shadow-emerald-900/20 active:scale-[0.99]"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Créer le compte officiel"}
                  </button>
                </motion.div>
              ) : step === 1 ? (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col gap-4 mb-4">
                    <label className="block text-sm font-medium text-gray-700 ml-0.5">Je suis un(e)...</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div 
                        onClick={() => setRole('student')}
                        className={`group relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-300 overflow-hidden ${role === 'student' ? 'border-moroccan-green bg-moroccan-green/[0.03] shadow-md shadow-moroccan-green/10' : 'border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer'}`}>
                        <div className={`p-3 rounded-xl mb-3 transition-colors duration-300 ${role === 'student' ? 'bg-moroccan-green text-white' : 'bg-white text-gray-400 group-hover:text-gray-600 shadow-sm'}`}>
                          <GraduationCap size={28} />
                        </div>
                        <span className={`text-sm font-semibold transition-colors ${role === 'student' ? 'text-moroccan-green' : 'text-gray-600'}`}>Élève</span>
                      </div>
                      <div 
                        onClick={() => setRole('mentor')}
                        className={`group relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-300 overflow-hidden ${role === 'mentor' ? 'border-moroccan-green bg-moroccan-green/[0.03] shadow-md shadow-moroccan-green/10' : 'border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer'}`}>
                        <div className={`p-3 rounded-xl mb-3 transition-colors duration-300 ${role === 'mentor' ? 'bg-moroccan-green text-white' : 'bg-white text-gray-400 group-hover:text-gray-600 shadow-sm'}`}>
                          <School size={28} />
                        </div>
                        <span className={`text-sm font-semibold transition-colors ${role === 'mentor' ? 'text-moroccan-green' : 'text-gray-600'}`}>Étudiant</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-0.5">Mon identité</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="Prénom"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-moroccan-green focus:ring-2 focus:ring-moroccan-green/20 outline-none transition-all placeholder-gray-400 text-gray-900"
                        required
                      />
                      <input 
                        type="text" 
                        placeholder="Nom"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-moroccan-green focus:ring-2 focus:ring-moroccan-green/20 outline-none transition-all placeholder-gray-400 text-gray-900"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={handleNextStep}
                    className="w-full bg-moroccan-green text-white py-3.5 rounded-lg font-medium hover:bg-moroccan-green/90 transition-colors flex items-center justify-center gap-2 mt-4 shadow-sm shadow-emerald-900/20 active:scale-[0.99]"
                  >
                    Suivant
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="space-y-6"
                >
                  {role === 'mentor' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-0.5">Établissement actuel</label>
                      <input 
                        type="text" 
                        placeholder="Ex: EMI, ENIM, FST Marrakech..."
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-moroccan-green focus:ring-2 focus:ring-moroccan-green/20 outline-none transition-all placeholder-gray-400 text-gray-900"
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
                    <div className="p-8 bg-gray-50 rounded-xl border border-gray-200 text-center relative overflow-hidden group mb-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-moroccan-green mx-auto mb-4 shadow-sm border border-gray-100">
                        <CheckCircle size={24} />
                      </div>
                      <p className="text-slate-700 font-medium text-lg">
                        Bienvenue, futur bâchelier !
                      </p>
                      <span className="text-slate-500 text-sm mt-1 block">Accédez bientôt à votre coaching sur mesure.</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-0.5">Avatar Personnel</label>
                    <div 
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 hover:border-moroccan-green/40 transition-all cursor-pointer group" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                      <div className="w-14 h-14 bg-white rounded-md flex items-center justify-center text-gray-400 border border-gray-200 overflow-hidden">
                        {photoURL ? (
                          <img src={photoURL} className="w-full h-full object-cover" alt="Profile preview" />
                        ) : (
                          <Camera size={24} />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700 block">
                          {photoURL ? "Photo parfaite ! ✓" : "Ajouter un portrait"}
                        </span>
                        <span className="text-xs text-gray-500">Format JPG/PNG • Max 1Mo</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-100 text-gray-600 py-3.5 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center active:scale-[0.99]"
                    >
                      Retour
                    </button>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="flex-[2] bg-moroccan-green text-white py-3.5 rounded-lg font-medium hover:bg-moroccan-green/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm shadow-emerald-900/20 active:scale-[0.99]"
                    >
                      {loading ? <Loader2 className="animate-spin text-white" size={20} /> : "Finaliser"}
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
              className="mt-6 text-moroccan-red text-sm text-center bg-red-50 p-4 rounded-lg border border-red-100 font-medium"
            >
              {error}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
