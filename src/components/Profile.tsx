import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { doc, updateDoc, collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, MapPin, BookOpen, Building2, Save, LogOut, GraduationCap, Image as ImageIcon, Mail, Briefcase, Zap, Crown } from 'lucide-react';
import { auth } from '../firebase';

import { UserProfile } from '../types';
import { getDoc } from 'firebase/firestore';

const PACK_INFO: Record<string, { name: string; color: string; icon: any }> = {
  basic: { name: 'Pack Basic', color: 'bg-moroccan-green/5 text-moroccan-green border-moroccan-green/10', icon: Briefcase },
  standard: { name: 'Pack Standard', color: 'bg-majorelle/5 text-majorelle border-majorelle/10', icon: Zap },
  gold: { name: 'Pack GOLD', color: 'bg-saffron/10 text-amber-600 border-saffron/20', icon: Crown },
};

interface ProfileProps {
  targetUserId?: string | null;
  onMessage?: (uid: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({ targetUserId, onMessage }) => {
  const { user, profile: myProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [targetProfile, setTargetProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({ posts: 0, impact: 'Normal' });
  const [formData, setFormData] = useState({
    displayName: '',
    firstName: '',
    lastName: '',
    bio: '',
    institution: '',
    major: '',
    level: '',
    city: '',
    photoURL: '',
    bannerURL: ''
  });

  const isOwnProfile = !targetUserId || targetUserId === user?.uid;
  const profile = isOwnProfile ? myProfile : targetProfile;

  useEffect(() => {
    if (myProfile && isOwnProfile) {
      setFormData({
        displayName: myProfile.displayName || '',
        firstName: myProfile.firstName || '',
        lastName: myProfile.lastName || '',
        bio: myProfile.bio || '',
        institution: myProfile.institution || '',
        major: myProfile.major || '',
        level: myProfile.level || '',
        city: myProfile.city || '',
        photoURL: myProfile.photoURL || '',
        bannerURL: myProfile.bannerURL || ''
      });
    }
  }, [myProfile, isOwnProfile]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (targetUserId && targetUserId !== user?.uid) {
        setLoading(true);
        setTargetProfile(null); // Clear previous profile while loading
        try {
          const docRef = doc(db, 'users', targetUserId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setTargetProfile(docSnap.data() as UserProfile);
          }
        } catch (error) {
          console.error("Error fetching target profile:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setTargetProfile(null);
      }
    };
    fetchProfile();
  }, [targetUserId, user?.uid]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const bannerInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const uid = targetUserId || user?.uid;
      if (uid) {
        try {
          const q = query(collection(db, 'posts'), where('authorUid', '==', uid));
          const snapshot = await getCountFromServer(q);
          const count = snapshot.data().count;
          setStats({ 
            posts: count,
            impact: count > 10 ? 'Élite' : count > 5 ? 'Actif' : 'Membre'
          });
        } catch (error) {
          console.error("Error fetching stats:", error);
        }
      }
    };
    fetchStats();
  }, [user, targetUserId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("L'image est trop lourde (max 1Mo)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'photo') {
          setFormData({ ...formData, photoURL: reader.result as string });
        } else {
          setFormData({ ...formData, bannerURL: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !profile) return (
    <div className="p-8 text-center text-gray-500 font-medium">
      Profil introuvable
    </div>
  );

  const handleSave = async () => {
    try {
      const updatedData = {
        ...formData,
        displayName: `${formData.firstName} ${formData.lastName}`
      };
      await updateDoc(doc(db, 'users', user.uid), updatedData);
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };
  return (
    <div className="w-full max-w-4xl mx-auto py-6 md:py-8 px-4">
      <div className="maroccan-card">
        {/* Banner */}
        <div 
          className="h-48 md:h-64 relative overflow-hidden bg-moroccan-green"
          style={profile.bannerURL ? { backgroundImage: `url(${profile.bannerURL})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          <div className="absolute inset-0 zellij-pattern opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-moroccan-green/60 to-transparent"></div>
          {isEditing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={bannerInputRef}
                onChange={(e) => handleFileChange(e, 'banner')}
              />
              <button 
                onClick={() => bannerInputRef.current?.click()}
                className="bg-white/90 backdrop-blur-md p-4 rounded-2xl text-majorelle shadow-xl flex items-center gap-2 font-bold"
              >
                <ImageIcon size={20} />
                Changer la bannière
              </button>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="px-6 md:px-10 pb-8 md:pb-10 relative">
          <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-10 -mt-20 mb-8 md:mb-12 relative z-10 items-center md:items-end text-center md:text-left">
            <div className="relative group shrink-0">
              <div className="w-36 md:w-44 h-48 md:h-52 rounded-t-[80px] md:rounded-t-[100px] rounded-b-3xl border-8 border-white shadow-2xl overflow-hidden bg-slate-50 ring-4 ring-majorelle/5">
                <img 
                  src={isEditing ? formData.photoURL : (profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUserId || user.uid}`)} 
                  className="w-full h-full object-cover"
                  alt="Profile"
                />
              </div>
              {isEditing && (
                <>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={(e) => handleFileChange(e, 'photo')}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-majorelle/40 rounded-t-[80px] md:rounded-t-[100px] rounded-b-3xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                  >
                    <Camera size={28} />
                  </button>
                </>
              )}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-2 md:gap-4 mb-2">
                <h2 className="text-2xl md:text-4xl font-serif italic font-bold text-slate-900 leading-tight">{profile.firstName} {profile.lastName}</h2>
                <span className={`px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${profile.role === 'mentor' ? 'bg-moroccan-red/20 text-moroccan-red' : 'bg-moroccan-green/10 text-moroccan-green'}`}>
                  {profile.role === 'mentor' ? 'Mentorat' : 'Étudiant'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 md:gap-4 items-center justify-center md:justify-start mb-4">
                <p className="text-slate-400 font-bold text-xs md:text-sm tracking-tight">{profile.email}</p>
                <div className="hidden md:block w-1 h-1 bg-slate-200 rounded-full"></div>
                <p className="text-moroccan-green font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em]">{profile.level}</p>
                {profile.selectedPack && PACK_INFO[profile.selectedPack] && (
                  <>
                    <div className="hidden md:block w-1 h-1 bg-slate-200 rounded-full"></div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-[9px] md:text-[10px] font-black uppercase tracking-widest ${PACK_INFO[profile.selectedPack].color}`}>
                      {React.createElement(PACK_INFO[profile.selectedPack].icon, { size: 10 })}
                      {PACK_INFO[profile.selectedPack].name}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-3 md:gap-4 w-full md:w-auto justify-center">
              {isOwnProfile ? (
                 <>
                  {isEditing ? (
                    <button 
                      onClick={handleSave}
                      className="flex-grow md:flex-grow-0 bg-moroccan-green text-white px-6 md:px-8 py-3 rounded-full font-bold shadow-xl shadow-moroccan-green/20 hover:shadow-moroccan-green/40 transition-all flex items-center justify-center gap-2 group"
                    >
                      <Save size={18} className="group-hover:scale-110 transition-transform" />
                      <span className="text-sm md:text-base">Enregistrer</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex-grow md:flex-grow-0 bg-ivory border border-majorelle/10 text-slate-600 px-6 md:px-8 py-3 rounded-full font-bold hover:bg-majorelle/5 transition-all text-sm md:text-base"
                    >
                      Modifier
                    </button>
                  )}
                  <button 
                    onClick={() => auth.signOut()}
                    className="bg-terracotta/5 text-terracotta p-3 rounded-2xl hover:bg-terracotta/10 transition-all shadow-md active:scale-95 flex-shrink-0"
                  >
                    <LogOut size={22} />
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => onMessage?.(profile.uid)}
                  className="w-full md:w-auto bg-majorelle text-white px-8 md:px-10 py-3 md:py-4 rounded-full font-bold shadow-2xl shadow-majorelle/20 hover:shadow-majorelle/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <Mail size={18} />
                  <span className="text-sm md:text-base">Contacter</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            <div className="lg:col-span-2 space-y-8 md:space-y-12">
              {isEditing && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 bg-slate-50/50 p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-slate-100">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prénom</label>
                    <input 
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full bg-white rounded-2xl px-5 py-3 outline-none border border-slate-100 focus:border-moroccan-green/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom</label>
                    <input 
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full bg-white rounded-2xl px-5 py-3 outline-none border border-slate-100 focus:border-moroccan-green/20 transition-all"
                    />
                  </div>
                </div>
              )}

              <section className="relative">
                <div className="absolute top-0 left-0 w-12 md:w-16 h-1 bg-gradient-to-r from-moroccan-green to-transparent rounded-full mb-6"></div>
                <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4 md:mb-6 pt-6 flex items-center gap-3">
                  <BookOpen size={16} className="text-moroccan-green" />
                  À propos
                </h3>
                {isEditing ? (
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full bg-slate-50/50 rounded-[24px] md:rounded-[32px] p-6 md:p-8 outline-none border-2 border-transparent focus:border-majorelle/10 min-h-[150px] md:min-h-[180px] text-base md:text-xl font-serif italic text-slate-700"
                    placeholder="Partagez votre histoire..."
                  />
                ) : (
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-majorelle/5 rounded-[32px] md:rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <p className="relative text-slate-700 text-lg md:text-xl font-serif italic leading-relaxed">
                      {profile.bio || "Ce membre n’a pas encore partagé sa biographie."}
                    </p>
                  </div>
                )}
              </section>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 pt-4">
                {[
                  { icon: Building2, label: 'Établissement', value: profile.institution, field: 'institution' },
                  { icon: MapPin, label: 'Ville', value: profile.city, field: 'city' },
                  { icon: GraduationCap, label: 'Niveau & Filière', value: `${profile.level} - ${profile.major || ''}`, field: ['level', 'major'] }
                ].map((item, idx) => (
                  <div key={idx} className="bg-ivory/50 border border-slate-100 p-6 md:p-8 rounded-[24px] md:rounded-[32px] group hover:bg-white hover:shadow-xl hover:shadow-majorelle/5 transition-all duration-500">
                    <h4 className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 flex items-center gap-3 group-hover:text-majorelle transition-colors">
                      <item.icon size={14} className="md:w-4 md:h-4" />
                      <span dangerouslySetInnerHTML={{ __html: item.label }}></span>
                    </h4>
                    {isEditing ? (
                      Array.isArray(item.field) ? (
                        <div className="space-y-3">
                          <input 
                            value={formData.level}
                            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                            className="w-full bg-white rounded-xl px-4 py-2 outline-none border border-slate-100 text-sm"
                            placeholder="Niveau"
                          />
                          <input 
                            value={formData.major}
                            onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                            className="w-full bg-white rounded-xl px-4 py-2 outline-none border border-slate-100 text-sm"
                            placeholder="Filière"
                          />
                        </div>
                      ) : (
                        <input 
                          value={(formData as any)[item.field as string]}
                          onChange={(e) => setFormData({ ...formData, [item.field as string]: e.target.value })}
                          className="w-full bg-white rounded-xl px-4 py-2 outline-none border border-slate-100 text-sm"
                        />
                      )
                    ) : (
                      <p className="font-serif italic text-base md:text-lg text-slate-800">{item.value || "Non renseigné"}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 md:space-y-8 pb-8 lg:pb-0">
              <div className="relative group overflow-hidden bg-moroccan-green rounded-[32px] md:rounded-[40px] p-8 md:p-10 text-white shadow-2xl shadow-moroccan-green/20">
                <div className="absolute inset-0 zellij-pattern opacity-10 group-hover:scale-110 transition-transform duration-700"></div>
                <h3 className="relative z-10 font-serif italic text-xl md:text-2xl font-bold mb-6 md:mb-8">Statistiques</h3>
                <div className="relative z-10 space-y-6 md:space-y-8">
                  {[
                    { label: 'Publications', value: stats.posts },
                    { label: 'Impact Social', value: stats.impact },
                    { label: 'Aide Mentors', value: `${stats.posts * 2}h` }
                  ].map((stat, idx) => (
                    <div key={idx} className="flex justify-between items-end border-b border-white/10 pb-4 md:pb-4">
                      <span className="opacity-60 text-[10px] md:text-xs font-black uppercase tracking-widest">{stat.label}</span>
                      <span className="text-xl md:text-2xl font-serif italic font-bold">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
