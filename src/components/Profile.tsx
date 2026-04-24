import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { doc, updateDoc, collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, MapPin, BookOpen, Building2, Save, LogOut, GraduationCap, Image as ImageIcon, Mail } from 'lucide-react';
import { auth } from '../firebase';

import { UserProfile } from '../types';
import { getDoc } from 'firebase/firestore';

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
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-[40px] shadow-sm overflow-hidden">
        {/* Banner */}
        <div 
          className="h-48 relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700"
          style={profile.bannerURL ? { backgroundImage: `url(${profile.bannerURL})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/zellige.png")' }}></div>
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
                className="bg-white/90 p-3 rounded-full text-blue-600 shadow-lg flex items-center gap-2 font-bold"
              >
                <ImageIcon size={20} />
                Changer la bannière
              </button>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 mb-8">
            <div className="relative group">
              <img 
                src={isEditing ? formData.photoURL : (profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUserId || user.uid}`)} 
                className="w-32 h-32 rounded-3xl border-4 border-white shadow-lg object-cover bg-white"
                alt="Profile"
              />
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
                    className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera size={24} />
                  </button>
                </>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-3xl font-black text-gray-900">{profile.firstName} {profile.lastName}</h2>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${profile.role === 'mentor' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                  {profile.role === 'mentor' ? 'Étudiant / Mentor' : 'Élève'}
                </span>
              </div>
              <p className="text-gray-500 font-medium">{profile.email} • {profile.level}</p>
            </div>
            <div className="flex gap-3">
              {isOwnProfile ? (
                 <>
                  {isEditing ? (
                    <button 
                      onClick={handleSave}
                      className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                      <Save size={18} />
                      Enregistrer
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="bg-gray-100 text-gray-700 px-6 py-2 rounded-xl font-bold hover:bg-gray-200 transition-all"
                    >
                      Modifier le profil
                    </button>
                  )}
                  <button 
                    onClick={() => auth.signOut()}
                    className="bg-red-50 text-red-600 p-2 rounded-xl hover:bg-red-100 transition-all"
                  >
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => onMessage?.(profile.uid)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
                >
                  <Mail size={18} />
                  Contacter
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              {isEditing && (
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded-3xl">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Prénom</label>
                    <input 
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full bg-white rounded-xl px-4 py-2 outline-none border border-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Nom</label>
                    <input 
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full bg-white rounded-xl px-4 py-2 outline-none border border-gray-100"
                    />
                  </div>
                </div>
              )}

              <section>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <BookOpen size={16} />
                  À propos
                </h3>
                {isEditing ? (
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full bg-gray-50 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[120px]"
                    placeholder="Parlez-nous de votre parcours..."
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-6 rounded-3xl italic">
                    {profile.bio || "Aucune biographie renseignée."}
                  </p>
                )}
              </section>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Building2 size={14} />
                    Établissement
                  </h4>
                  {isEditing ? (
                    <input 
                      value={formData.institution}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      className="w-full bg-gray-50 rounded-xl px-4 py-2 outline-none"
                    />
                  ) : (
                    <p className="font-bold text-gray-900">{profile.institution || "Non renseigné"}</p>
                  )}
                </div>
                <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MapPin size={14} />
                    Ville
                  </h4>
                  {isEditing ? (
                    <input 
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-gray-50 rounded-xl px-4 py-2 outline-none"
                    />
                  ) : (
                    <p className="font-bold text-gray-900">{profile.city || "Non renseigné"}</p>
                  )}
                </div>
                <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <GraduationCap size={14} />
                    Niveau & Filière
                  </h4>
                  {isEditing ? (
                    <div className="space-y-2">
                      <input 
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        className="w-full bg-gray-50 rounded-xl px-4 py-2 outline-none"
                        placeholder="Niveau"
                      />
                      <input 
                        value={formData.major}
                        onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                        className="w-full bg-gray-50 rounded-xl px-4 py-2 outline-none"
                        placeholder="Filière"
                      />
                    </div>
                  ) : (
                    <p className="font-bold text-gray-900">{profile.level} - {profile.major || "Non renseigné"}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-600 rounded-3xl p-6 text-white">
                <h3 className="font-bold mb-2">Statistiques</h3>
                <div className="space-y-4 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="opacity-70 text-sm">Publications</span>
                    <span className="font-bold">{stats.posts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-70 text-sm">Mentorat</span>
                    <span className="font-bold">{stats.posts * 2}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-70 text-sm">Impact</span>
                    <span className="font-bold">{stats.impact}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
