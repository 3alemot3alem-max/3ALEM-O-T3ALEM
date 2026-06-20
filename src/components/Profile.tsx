import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { doc, updateDoc, collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, MapPin, BookOpen, Building2, Save, LogOut, GraduationCap, Image as ImageIcon, Mail, Briefcase, Zap, Crown, Heart, MessageSquare, Bell } from 'lucide-react';
import { auth, messaging } from '../firebase';
import { getToken } from 'firebase/messaging';

import { UserProfile, Post } from '../types';
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
  const [userPosts, setUserPosts] = useState<Post[]>([]);
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
        setTargetProfile(null);
        try {
          const docRef = doc(db, 'users', targetUserId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setTargetProfile(data);
            
            // Increment view count
            try {
              await updateDoc(docRef, {
                profileViews: (data.profileViews || 0) + 1
              });
            } catch (err) {
              console.error("Could not increment views:", err);
            }

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
          
          const docsSnap = await getDocs(q);
          setUserPosts(docsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Post)).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
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

  const requestNotificationPermission = async () => {
    try {
      if (Notification.permission === 'denied') {
        alert("Vous avez précédemment bloqué les notifications pour ce site. Veuillez cliquer sur l'icône de cadenas à côté de l'URL dans votre navigateur, autoriser les notifications, puis réessayer.");
        return;
      }
      
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const msg = await messaging();
        if (msg) {
          const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
          const token = await getToken(msg, vapidKey ? { vapidKey } : undefined);
          if (token) {
            await updateDoc(doc(db, 'users', user.uid), {
              fcmToken: token
            });
            alert('Notifications push activées avec succès ! Vous recevrez des alertes sur cet appareil.');
          } else {
             alert('Impossible d\'obtenir le jeton de notification. Assurez-vous d\'être sur un domaine sécurisé (HTTPS).');
          }
        } else {
             alert('Les notifications ne sont pas supportées sur ce navigateur.');
        }
      } else {
        alert('Permission des notifications refusée. Vous devez autoriser les notifications dans votre navigateur.');
      }
    } catch (error: any) {
      console.error('Error requesting notification permission:', error);
      alert('Erreur lors de l\'activation des notifications: ' + (error?.message || error));
    }
  };

  const testNotification = async () => {
    if (!profile.fcmToken) {
      alert("Veuillez d'abord activer les notifications");
      return;
    }
    
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: profile.fcmToken,
          title: '3alem O T3alem',
          body: 'Ceci est un test de notification push!'
        })
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      console.log('Notification envoyée:', result);
    } catch (error: any) {
      console.error('Erreur test notification:', error);
      alert('Erreur: ' + error.message);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto md:py-8 pt-0">
      <div className="bg-white md:rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        {/* Banner Section */}
        <div 
          className="h-40 md:h-64 relative bg-slate-100 group"
        >
          {profile.bannerURL ? (
            <img src={profile.bannerURL} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          )}
          
          {isEditing && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
               <input 
                 type="file" 
                 accept="image/*" 
                 className="hidden" 
                 ref={bannerInputRef}
                 onChange={(e) => handleFileChange(e, 'banner')}
               />
               <button 
                 onClick={() => bannerInputRef.current?.click()}
                 className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-slate-800 shadow-xl flex items-center gap-2 font-medium text-sm hover:scale-105 active:scale-95 transition-all"
               >
                 <ImageIcon size={16} />
                 Modifier la couverture
               </button>
             </div>
          )}
        </div>

        {/* Profile Head */}
        <div className="px-6 md:px-10 pb-8 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-16 sm:-mt-20 mb-4 sm:mb-6 gap-4">
            <div className="relative group shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-50 relative z-10">
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
                    className="absolute inset-0 z-20 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]"
                  >
                    <Camera size={24} />
                  </button>
                </>
              )}
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              {isOwnProfile ? (
                 <>
                  {isEditing ? (
                    <button 
                      onClick={handleSave}
                      className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-semibold shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 text-sm"
                    >
                      <Save size={16} />
                      Enregistrer
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 text-slate-800 px-6 py-2.5 rounded-full font-semibold transition-all text-sm"
                    >
                      Modifier le profil
                    </button>
                  )}
                  {!isEditing && (
                    <>
                      <button 
                        onClick={requestNotificationPermission}
                        className="bg-slate-50 text-slate-600 border border-slate-200 p-2.5 rounded-full hover:bg-moroccan-green hover:text-white hover:border-moroccan-green transition-all flex items-center justify-center active:scale-95 shrink-0"
                        title="Activer les notifications"
                      >
                        <Bell size={20} />
                      </button>
                      {profile.fcmToken && (
                        <button 
                          onClick={testNotification}
                          className="bg-slate-50 text-slate-600 border border-slate-200 p-2.5 rounded-full hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all flex items-center justify-center active:scale-95 shrink-0"
                          title="Tester les notifications"
                        >
                          <Zap size={20} />
                        </button>
                      )}
                    </>
                  )}
                  <button 
                    onClick={() => auth.signOut()}
                    className="bg-red-50 text-red-600 p-2.5 rounded-full hover:bg-red-100 transition-all flex items-center justify-center active:scale-95 shrink-0"
                    title="Se déconnecter"
                  >
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => onMessage?.(profile.uid)}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-full font-semibold shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 text-sm"
                >
                  <Mail size={16} />
                  Message
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Header Info */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {isEditing ? (
                  <div className="flex gap-2 w-full max-w-md">
                    <input 
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full bg-slate-50 rounded-lg px-3 py-2 outline-none border border-slate-200 focus:border-blue-500 font-bold text-lg"
                      placeholder="Prénom"
                    />
                    <input 
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full bg-slate-50 rounded-lg px-3 py-2 outline-none border border-slate-200 focus:border-blue-500 font-bold text-lg"
                      placeholder="Nom"
                    />
                  </div>
                ) : (
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                    {profile.firstName} {profile.lastName}
                    {profile.role === 'school' && (
                      <svg className="w-5 h-5 text-blue-500 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.1 14.9l-4.1-4.1 1.4-1.4 2.7 2.7 6-6 1.4 1.4-7.4 7.4z" />
                      </svg>
                    )}
                  </h1>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-slate-600 font-medium">{profile.email}</span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-slate-600">
                  {profile.role === 'admin' ? 'Administrateur' : profile.role === 'school' ? 'Institution' : profile.role === 'mentor' ? 'Mentor' : 'Étudiant'}
                </span>
                {(profile.level || profile.major) && (
                  <>
                    <span className="text-slate-300">&bull;</span>
                    {isEditing ? (
                       <div className="flex gap-2 mt-2 sm:mt-0">
                         <input 
                           value={formData.level}
                           onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                           className="bg-slate-50 rounded-md px-2 py-1 outline-none border border-slate-200 text-sm"
                           placeholder="Niveau"
                         />
                         <input 
                           value={formData.major}
                           onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                           className="bg-slate-50 rounded-md px-2 py-1 outline-none border border-slate-200 text-sm"
                           placeholder="Filière"
                         />
                       </div>
                    ) : (
                      <span className="text-slate-600">{profile.level} {profile.major ? `- ${profile.major}` : ''}</span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="pt-2">
              {isEditing ? (
                <textarea 
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl p-3 outline-none border border-slate-200 focus:border-blue-500 min-h-[100px] text-slate-700"
                  placeholder="Écrivez une courte description sur vous..."
                />
              ) : (
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap max-w-3xl">
                  {profile.bio || "Aucune description fournie."}
                </p>
              )}
            </div>

            {/* Metadata tags */}
            <div className="flex flex-wrap gap-4 pt-2">
              {(profile.institution || isEditing) && (
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <Building2 size={16} className="text-slate-400" />
                  {isEditing ? (
                    <input 
                      value={formData.institution}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      className="bg-slate-50 rounded-md px-2 py-1 outline-none border border-slate-200"
                      placeholder="Établissement"
                    />
                  ) : (
                    <span className="font-medium">{profile.institution}</span>
                  )}
                </div>
              )}

              {(profile.city || isEditing) && (
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <MapPin size={16} className="text-slate-400" />
                  {isEditing ? (
                    <input 
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="bg-slate-50 rounded-md px-2 py-1 outline-none border border-slate-200"
                      placeholder="Ville"
                    />
                  ) : (
                    <span className="font-medium">{profile.city}</span>
                  )}
                </div>
              )}
              
              {profile.role !== 'school' && profile.selectedPack && PACK_INFO[profile.selectedPack] && !isEditing && (
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${PACK_INFO[profile.selectedPack].color}`}>
                  {React.createElement(PACK_INFO[profile.selectedPack].icon, { size: 12 })}
                  {PACK_INFO[profile.selectedPack].name}
                </div>
              )}
            </div>

            {/* Stats Row */}
            {profile.role !== 'school' && !isEditing && (
              <div className="flex gap-6 pt-4 mt-4 border-t border-slate-100">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900">{stats.posts}</span>
                  <span className="text-sm text-slate-500">Publications</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900">{stats.impact}</span>
                  <span className="text-sm text-slate-500">Impact</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900">{stats.posts * 2}h</span>
                  <span className="text-sm text-slate-500">Aide</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="bg-white md:rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8 p-6 md:p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <BookOpen size={20} className="text-blue-500" />
          Activité récente
        </h3>
        <div className="space-y-6">
          {userPosts.length > 0 ? (
            userPosts.map(post => (
              <div key={post.id} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-slate-100 px-3 py-1 rounded-full text-xs font-medium text-slate-600">
                    Publication
                  </div>
                  <span className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-800 leading-relaxed mb-4">{post.content}</p>
                {post.imageUrl && (
                  <div className="w-full max-h-80 rounded-xl overflow-hidden bg-slate-50 mb-4 border border-slate-100">
                    <img src={post.imageUrl} className="w-full h-full object-contain" alt="" />
                  </div>
                )}
                <div className="flex gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5"><Heart size={16} /> {post.likesCount}</span>
                  <span className="flex items-center gap-1.5"><MessageSquare size={16} /> {post.commentsCount}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-slate-50 rounded-2xl">
              <BookOpen size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">Aucune publication récente.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
