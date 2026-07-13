import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove, increment, getDoc, getDocs, where, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { Post, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Heart, Share2, Send, Image as ImageIcon, Search, BookOpen, GraduationCap, MoreHorizontal, Trash2, Edit2, Check, X, Zap, Crown, Briefcase, ChevronRight, ChevronLeft, ArrowLeft, Sparkles, Globe } from 'lucide-react';
import { formatDate } from '../lib/utils';

const compressImage = (file: File, maxWidth: number, maxHeight: number, quality: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * maxHeight / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          reject(new Error("Failed to get canvas context"));
        }
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper component to display up-to-date user info
const UserDisplay: React.FC<{ uid: string, fallbackName?: string, fallbackPhoto?: string, size?: 'sm' | 'md' | 'lg', onClick?: () => void, hideName?: boolean }> = ({ uid, fallbackName, fallbackPhoto, size = 'md', onClick, hideName = false }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // To prevent exceeding Firebase free quota, skip fetching if we already have the fallback data
    if (!uid || (fallbackName && fallbackPhoto)) return;
    
    // We only fetch if we don't have basic display data to save reads
    const fetchProfile = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'users', uid));
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      } catch (err) {
        console.warn("Could not fetch user profile details:", err);
      }
    };
    
    fetchProfile();
  }, [uid, fallbackName, fallbackPhoto]);

  // Use fallback data primarily, fall back to fetched profile if needed
  const name = fallbackName || profile?.displayName || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Utilisateur';
  const photo = fallbackPhoto || profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`;
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <img 
          src={photo} 
          className={`${sizeClasses[size]} rounded-2xl object-cover cursor-pointer hover:scale-105 transition-all duration-300 ring-2 ring-majorelle/5`} 
          alt={name}
          onClick={onClick}
        />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald border-2 border-white rounded-full"></div>
      </div>
      {!hideName && (
        <div>
          <h3 
            className={`font-serif italic font-bold text-slate-900 cursor-pointer hover:text-majorelle transition-colors flex items-center gap-1 ${size === 'sm' ? 'text-xs' : 'text-base'}`}
            onClick={onClick}
          >
            {name}
            {(profile?.isVerified || profile?.role === 'school' || profile?.role === 'admin' || profile?.email === '3alemot3alem@gmail.com' || fallbackName?.includes('Université') || fallbackName?.includes('Ecole') || fallbackName === '3alem o t3alem') && (
              <svg className="w-4 h-4 text-blue-500 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm-1.06 14.86l-4.14-4.13 1.41-1.42 2.73 2.72 6.03-6.02 1.41 1.41-7.44 7.44z" />
              </svg>
            )}
          </h3>
        </div>
      )}
    </div>
  );
};

const PACKS = [
  {
    id: 'basic',
    name: 'Pack Basic',
    price: '250 DH',
    color: 'emerald-500',
    icon: MoreHorizontal,
    description: 'Pour les étudiants qui veulent aller à l’essentiel',
    features: [
      'Inscription dans 25 écoles supérieures',
      'Liste personnalisée des écoles selon la filière',
      'Assistance WhatsApp (réponses simples)',
      'Guide PDF basique d’orientation',
      'Alertes ouverture/fermeture'
    ],
    objective: 'accessible, premier niveau'
  },
  {
    id: 'standard',
    name: 'Pack Standard',
    price: '300 DH',
    color: 'majorelle',
    icon: Zap,
    description: 'Le meilleur rapport qualité/prix',
    features: [
      'Inscription dans 30 écoles',
      'Liste personnalisée des écoles selon la filière',
      'Accès au groupe WhatsApp privé',
      'Alertes ouverture/fermeture',
      'Guide complet "3alem w T3alem"',
      'Séance d’orientation (collective)'
    ],
    objective: 'donner plus de valeur + accompagnement'
  },
  {
    id: 'gold',
    name: 'Pack GOLD',
    price: '400 DH',
    color: 'saffron',
    icon: Crown,
    isPremium: true,
    description: 'Pack premium avec accompagnement complet',
    features: [
      'Inscription dans 40 écoles supérieures',
      'Séances d’orientation chaque semaine (perso)',
      'Alertes en temps réel (ouverture)',
      'Groupe WhatsApp actif (questions illimitées)',
      'Guide complet "3alem w T3alem"',
      'Aide au choix (niveau & objectif)',
      'Préparation concours (CNC, médecine)',
      'Coaching personnalisé (individuel)'
    ],
    objective: 'maximiser ton bénéfice ici'
  }
];

export const Feed: React.FC<{ onStartChat?: (email: string) => void, onViewProfile?: (uid: string) => void }> = ({ onStartChat, onViewProfile }) => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [expandedTextPosts, setExpandedTextPosts] = useState<Record<string, boolean>>({});
  const [currentImageIndexes, setCurrentImageIndexes] = useState<Record<string, number>>({});
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [fullscreenImageObj, setFullscreenImageObj] = useState<{images: string[], currentIndex: number} | null>(null);
  const postFileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePostFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      if (newPostImages.length + files.length > 10) {
        alert("Vous pouvez uploader un maximum de 10 images.");
        return;
      }
      
      setIsPosting(true);
      try {
        const compressedImages = await Promise.all(
          files.map(file => compressImage(file, 800, 800, 0.6))
        );
        
        let currentSize = newPostImages.reduce((acc, img) => acc + img.length, 0);
        let newSize = compressedImages.reduce((acc, img) => acc + img.length, 0);
        
        if (currentSize + newSize > 700000) {
           alert("Les images sont trop lourdes pour Firestore (limite de 1Mo totale). Veuillez sélectionner moins d'images ou des images plus petites.");
           return;
        }

        setNewPostImages(prev => [...prev, ...compressedImages]);
      } catch (error) {
        console.error("Erreur de compression:", error);
        alert("Erreur lors de la préparation des images.");
      } finally {
        setIsPosting(false);
      }
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(postsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });
    return () => unsubscribe();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPostContent.trim()) return;
    setIsPosting(true);
    try {
      const postData: any = {
        authorUid: user.uid,
        authorName: profile ? `${profile.firstName} ${profile.lastName}` : (user.displayName || 'Utilisateur'),
        authorPhoto: profile?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        authorRole: profile?.role || 'student',
        content: newPostContent,
        likesCount: 0,
        commentsCount: 0,
        tags: [],
        createdAt: new Date().toISOString()
      };
      
      if (newPostImages.length > 0) {
        postData.imageUrl = newPostImages[0];
        postData.imageUrls = newPostImages;
      }
      
      const docRef = await addDoc(collection(db, 'posts'), postData);
      
      // Si l'utilisateur est admin, créer une notification d'actualité pour tout le monde
      if (profile?.role === 'admin') {
        await addDoc(collection(db, 'notifications'), {
          recipientId: 'all',
          senderId: user.uid,
          senderName: profile ? `${profile.firstName} ${profile.lastName}` : (user.displayName || 'Utilisateur'),
          senderPhoto: profile?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
          type: 'news',
          postId: docRef.id,
          content: newPostContent.substring(0, 50) + (newPostContent.length > 50 ? '...' : ''),
          read: false,
          createdAt: new Date().toISOString()
        });
      }

      setNewPostContent('');
      setNewPostImages([]);
    } catch (error: any) {
      console.error(error);
      alert("Erreur lors de la publication : " + (error.message || "Permissions insuffisantes."));
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    try {
      const postRef = doc(db, 'posts', postId);
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      const hasLiked = post.likedBy?.includes(user.uid);
      await updateDoc(postRef, {
        likesCount: increment(hasLiked ? -1 : 1),
        likedBy: hasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
      
      if (!hasLiked && post.authorUid !== user.uid) {
        await addDoc(collection(db, 'notifications'), {
          recipientId: post.authorUid,
          senderId: user.uid,
          senderName: profile ? `${profile.firstName} ${profile.lastName}` : (user.displayName || 'Utilisateur'),
          senderPhoto: profile?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
          type: 'like',
          postId: post.id,
          content: post.content.substring(0, 50),
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `posts/${postId}`);
    }
  };

  const handleShare = async (post: Post) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Conseil de ${post.authorName}`,
          text: post.content,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(`${window.location.href}\n\n${post.authorName} dit : ${post.content}`);
        alert("Lien copié dans le presse-papier !");
      }
      
      if (user && post.authorUid !== user.uid) {
        await addDoc(collection(db, 'notifications'), {
          recipientId: post.authorUid,
          senderId: user.uid,
          senderName: profile ? `${profile.firstName} ${profile.lastName}` : (user.displayName || 'Utilisateur'),
          senderPhoto: profile?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
          type: 'share',
          postId: post.id,
          content: post.content.substring(0, 50),
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleUpdatePost = async (postId: string) => {
    if (!editingContent.trim()) return;
    try {
      await updateDoc(doc(db, 'posts', postId), {
        content: editingContent,
        updatedAt: serverTimestamp()
      });
      setEditingPostId(null);
      setEditingContent('');
    } catch (error: any) {
      console.error(error);
      alert("Erreur lors de la modification : " + error.message);
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAllNews, setShowAllNews] = useState(false);

  const handleDeletePost = async (postId: string) => {
    setDeletingId(postId);
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (error: any) {
      console.error(error);
      alert("Erreur lors de la suppression : " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.authorName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const officialNews = posts.filter(p => ['school', 'admin', 'official'].includes(p.authorRole || ''));

  return (
    <div className="w-full mx-auto pb-8">
      <div className="bg-transparent md:rounded-t-[0px] lg:rounded-[24px] min-h-[85vh] p-0 sm:p-5 lg:p-8 flex justify-center">
        <div className="w-full xl:max-w-[1128px] flex flex-col md:flex-row gap-6 items-start mt-4 md:mt-0">
          
          {/* Left Sidebar */}
          <div className="w-full md:w-[225px] shrink-0 space-y-4 px-2 sm:px-0 order-1 md:order-1">
            {/* Identity Card */}
            <div className="bg-white rounded-xl shadow-[0_0_0_1px_rgba(0,0,0,0.08)] overflow-hidden relative">
              <div 
                className="h-14 bg-slate-200" 
                style={{ backgroundImage: profile?.bannerURL ? `url(${profile.bannerURL})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}
              ></div>
              <div className="px-4 pb-4 mt-[-24px] text-center flex flex-col items-center">
                <img 
                  src={profile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
                  className="w-16 h-16 rounded-full border-[3px] border-white object-cover bg-white mb-2 shadow-sm cursor-pointer hover:underline"
                  alt="Profile"
                  onClick={() => onViewProfile?.(user?.uid || '')}
                />
                <h3 onClick={() => onViewProfile?.(user?.uid || '')} className="font-semibold text-slate-900 text-sm hover:underline cursor-pointer leading-tight flex items-center justify-center gap-1">
                  {profile ? `${profile.firstName} ${profile.lastName}` : (user?.displayName || 'Utilisateur')}
                  {(profile?.isVerified || profile?.role === 'school' || profile?.role === 'admin' || user?.email === '3alemot3alem@gmail.com') && (
                    <svg className="w-4 h-4 text-blue-500 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <title>Institution Vérifiée</title>
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm-1.06 14.86l-4.14-4.13 1.41-1.42 2.73 2.72 6.03-6.02 1.41 1.41-7.44 7.44z" />
                    </svg>
                  )}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{profile?.bio || 'Étudiant'}</p>
              </div>
              <div className="border-t border-[#E0DFDC] px-4 py-3 bg-white hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => onViewProfile?.(user?.uid || '')}>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500 line-clamp-1">Vues de votre profil</span>
                  <span className="text-xs font-semibold text-[#1EBA64]">{profile?.profileViews || 0}</span>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-xl shadow-[0_0_0_1px_rgba(0,0,0,0.08)] p-3 space-y-1">
              <p className="text-xs font-semibold text-slate-900 mb-2 px-1">Accès rapide</p>
              {profile?.role === 'student' && (
                <button 
                  onClick={() => setShowRegisterModal(true)}
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  <GraduationCap size={16} className="text-[#1EBA64] shrink-0" />
                  <span className="font-semibold text-left">S'inscrire (Packs)</span>
                </button>
              )}
            </div>
          </div>

          {/* Main Feed */}
          <div className="flex-1 w-full max-w-full md:max-w-[552px] space-y-4 px-0 sm:px-0 mx-auto order-3 md:order-2">
            {/* Start a Post Card */}
            {user && (
              <div className="bg-white rounded-xl shadow-[0_0_0_1px_rgba(0,0,0,0.08)] p-3 sm:p-4 border-y border-slate-200 sm:border-none">
                <div className="flex gap-2 sm:gap-3 items-center mb-2">
                  <img 
                    src={profile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
                    className="w-12 h-12 rounded-full object-cover shrink-0 cursor-pointer"
                    alt="Profile"
                    onClick={() => onViewProfile?.(user?.uid || '')}
                  />
                  <textarea 
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Publier une actualité..."
                    className="flex-1 bg-white border border-slate-400 hover:bg-slate-100 focus:bg-white rounded-[32px] px-4 py-3 outline-none text-sm text-slate-700 transition-colors cursor-text resize-none min-h-[48px]"
                    rows={newPostContent ? 3 : 1}
                  />
                </div>

                {newPostImages.length > 0 && (
                  <div className="ml-0 sm:ml-14 relative rounded-xl overflow-hidden mb-3 border border-slate-200 flex gap-2 overflow-x-auto p-2 bg-slate-50">
                    {newPostImages.map((img, index) => (
                      <div key={index} className="relative shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-slate-300">
                        <img src={img} className="w-full h-full object-cover" alt="Preview" />
                        <button 
                          onClick={() => setNewPostImages(prev => prev.filter((_, i) => i !== index))}
                          className="absolute top-1 right-1 bg-slate-900/60 hover:bg-slate-900/90 text-white w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between ml-0 sm:ml-14">
                  <div className="flex gap-1">
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple
                      className="hidden" 
                      ref={postFileInputRef}
                      onChange={handlePostFileChange}
                    />
                    <button 
                      type="button"
                      onClick={() => postFileInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-3 hover:bg-slate-100 text-slate-600 rounded-md transition-colors text-sm font-semibold"
                    >
                      <ImageIcon size={20} className="text-[#1EBA64]" />
                      <span className="hidden sm:inline">Média</span>
                    </button>
                  </div>
                  <button 
                    onClick={handleCreatePost}
                    disabled={isPosting || !newPostContent.trim()}
                    className="bg-[#1EBA64] hover:bg-[#159c52] text-white px-4 py-1.5 rounded-full font-semibold text-sm disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
                  >
                    Publier
                  </button>
                </div>
              </div>
            )}

            {/* Sort Divider */}
            <div className="flex items-center gap-2 px-3 sm:px-1">
              <div className="flex-1 h-[1px] bg-slate-300"></div>
              <span className="text-xs text-slate-500 font-semibold cursor-pointer py-1 px-1">Classer par : <b className="text-slate-700">Pertinence</b></span>
            </div>

            {/* Posts List */}
            <div className="bg-white sm:rounded-xl shadow-[0_0_0_1px_rgba(0,0,0,0.08)] overflow-hidden border-y border-slate-200 sm:border-none divide-y divide-slate-100">
              {filteredPosts.map((post) => (
                <div 
                  key={post.id}
                  className="bg-white hover:bg-slate-50/50 transition-colors"
                >
                  <div className="p-4 flex gap-3 sm:gap-4">
                    {/* Avatar Col */}
                    <div className="shrink-0">
                      <img 
                        src={post.authorPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorUid}`} 
                        alt={post.authorName}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity ring-1 ring-slate-100"
                        onClick={() => onViewProfile?.(post.authorUid)}
                      />
                    </div>
                    
                    {/* Content Col */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 leading-tight">
                          <h4 
                            className="text-[15px] font-bold text-slate-900 hover:underline cursor-pointer flex items-center gap-1"
                            onClick={() => onViewProfile?.(post.authorUid)}
                          >
                            <span className="truncate max-w-[140px] sm:max-w-[200px]">{post.authorName}</span>
                            {(post.authorRole === 'school' || post.authorRole === 'admin' || post.authorName === '3alem o t3alem' || post.authorName?.includes('Université') || post.authorName?.includes('Ecole')) && (
                              <svg className="w-[15px] h-[15px] text-[#1EBA64] fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm-1.06 14.86l-4.14-4.13 1.41-1.42 2.73 2.72 6.03-6.02 1.41 1.41-7.44 7.44z" />
                              </svg>
                            )}
                          </h4>
                          <span className="text-[14px] text-slate-500 truncate max-w-[100px] sm:max-w-[150px]">
                            @{post.authorName.replace(/\s+/g, '').toLowerCase()}
                          </span>
                          <span className="text-slate-500 text-[14px]">·</span>
                          <span className="text-[14px] text-slate-500 hover:underline cursor-pointer whitespace-nowrap">
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                        
                        {user?.uid === post.authorUid && (
                          <div className="flex items-center gap-1 -mt-1 -mr-2">
                            <button 
                              onClick={() => {
                                setEditingPostId(post.id);
                                setEditingContent(post.content);
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-[#1EBA64]/10 hover:text-[#1EBA64] rounded-full transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeletePost(post.id)}
                              disabled={deletingId === post.id}
                              className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
                            >
                              {deletingId === post.id ? (
                                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      {editingPostId === post.id ? (
                        <div className="mb-3 mt-2 space-y-3 pr-2">
                          <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 outline-none focus:border-[#1EBA64] focus:ring-1 focus:ring-[#1EBA64] min-h-[100px] text-[15px]"
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setEditingPostId(null)}
                              className="px-4 py-1.5 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                              Annuler
                            </button>
                            <button 
                              onClick={() => handleUpdatePost(post.id)}
                              className="px-4 py-1.5 rounded-full bg-[#1EBA64] hover:bg-[#159c52] text-white text-sm font-semibold transition-colors"
                            >
                              Enregistrer
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-3">
                          <p className={`text-[15px] text-slate-900 leading-normal whitespace-pre-wrap break-words ${!expandedTextPosts[post.id] && (post.content.split('\n').length > 5 || post.content.length > 250) ? 'line-clamp-5' : ''}`}>
                            {post.content}
                          </p>
                          {(!expandedTextPosts[post.id] && (post.content.split('\n').length > 5 || post.content.length > 250)) && (
                            <button onClick={() => setExpandedTextPosts(prev => ({...prev, [post.id]: true}))} className="text-sm text-slate-500 hover:text-slate-700 font-semibold mt-1">Lire plus</button>
                          )}
                          {(expandedTextPosts[post.id] && (post.content.split('\n').length > 5 || post.content.length > 250)) && (
                            <button onClick={() => setExpandedTextPosts(prev => ({...prev, [post.id]: false}))} className="text-sm text-slate-500 hover:text-slate-700 font-semibold mt-1">Voir moins</button>
                          )}
                        </div>
                      )}

                      {/* Image */}
                      {(() => {
                        const images = post.imageUrls?.length > 0 ? post.imageUrls : (post.imageUrl ? [post.imageUrl] : []);
                        if (images.length === 0) return null;
                        const currentIndex = currentImageIndexes[post.id] || 0;
                        return (
                          <div 
                            className="mt-2 mb-3 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 relative group aspect-[4/3] w-full cursor-pointer"
                            onClick={() => setFullscreenImageObj({ images, currentIndex })}
                          >
                             {images.map((img, i) => (
                               <img 
                                 key={i}
                                 src={img} 
                                 className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${i === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} 
                                 alt={`Post image ${i + 1}`} 
                               />
                             ))}
                             {images.length > 1 && (
                               <>
                                 <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm z-20">
                                   {images.map((_, i) => (
                                     <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${i === currentIndex ? 'bg-white' : 'bg-white/50'}`} />
                                   ))}
                                 </div>
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); setCurrentImageIndexes(prev => ({...prev, [post.id]: currentIndex === 0 ? images.length - 1 : currentIndex - 1})) }}
                                   className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm z-20"
                                 >
                                   <ChevronLeft size={18} />
                                 </button>
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); setCurrentImageIndexes(prev => ({...prev, [post.id]: (currentIndex + 1) % images.length})) }}
                                   className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm z-20"
                                 >
                                   <ChevronRight size={18} />
                                 </button>
                               </>
                             )}
                          </div>
                        );
                      })()}

                      {/* Action Bar */}
                      <div className="flex justify-between items-center text-slate-500 mt-1 max-w-[425px] pr-4">
                        <button 
                          onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)}
                          className={`flex items-center gap-1 group transition-colors ${expandedComments === post.id ? 'text-[#1EBA64]' : ''}`}
                        >
                          <div className={`p-2 rounded-full transition-colors ${expandedComments === post.id ? 'bg-[#1EBA64]/10' : 'group-hover:bg-[#1EBA64]/10 group-hover:text-[#1EBA64]'}`}>
                            <MessageSquare size={18} />
                          </div>
                          <span className={`text-[13px] ${expandedComments === post.id ? '' : 'group-hover:text-[#1EBA64]'}`}>{post.commentsCount > 0 ? post.commentsCount : ''}</span>
                        </button>
                        
                        <button 
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-1 group transition-colors ${post.likedBy?.includes(user?.uid || '') ? 'text-pink-600' : ''}`}
                        >
                          <div className={`p-2 rounded-full transition-colors ${post.likedBy?.includes(user?.uid || '') ? 'hover:bg-pink-50' : 'group-hover:bg-pink-50 group-hover:text-pink-600'}`}>
                            <Heart size={18} fill={post.likedBy?.includes(user?.uid || '') ? 'currentColor' : 'none'} />
                          </div>
                          <span className={`text-[13px] ${post.likedBy?.includes(user?.uid || '') ? '' : 'group-hover:text-pink-600'}`}>{post.likesCount > 0 ? post.likesCount : ''}</span>
                        </button>

                        <button 
                          onClick={() => handleShare(post)}
                          className="flex items-center gap-1 group transition-colors"
                        >
                          <div className="p-2 rounded-full group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                            <Share2 size={18} />
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <AnimatePresence>
                    {expandedComments === post.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-white border-t border-slate-100"
                      >
                        <div className="p-4 pl-[3.5rem] sm:pl-[4.5rem]">
                          <CommentSection postId={post.id} postAuthorUid={post.authorUid} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-[300px] shrink-0 space-y-4 order-2 md:order-3">
                        <div className="bg-white rounded-xl shadow-[0_0_0_1px_rgba(0,0,0,0.08)] p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-900 text-base">Actualités du réseau</h3>
                {user && (
                  <button 
                    onClick={() => {
                      const input = document.querySelector('textarea[placeholder="Publier une actualité..."]') as HTMLTextAreaElement;
                      if (input) {
                        input.focus();
                        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className="text-[10px] bg-[#1EBA64]/10 text-[#1EBA64] px-2 py-1 rounded font-bold uppercase tracking-wider hover:bg-[#1EBA64]/20 transition-colors"
                  >
                    + Publier
                  </button>
                )}
              </div>
              <ul className="space-y-4">
                {officialNews.length > 0 ? officialNews.slice(0, showAllNews ? undefined : 3).map((news) => (
                  <li key={news.id} className="flex gap-2">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-slate-500 shrink-0"></div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 leading-tight cursor-pointer hover:text-[#1EBA64] hover:underline flex items-center gap-1" onClick={() => onViewProfile?.(news.authorUid)}>
                        {news.authorName}
                        {(news.authorRole === 'school' || news.authorRole === 'admin' || news.authorName === '3alem o t3alem' || news.authorName?.includes('Université') || news.authorName?.includes('Ecole')) && (
                          <svg className="w-3.5 h-3.5 text-blue-500 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm-1.06 14.86l-4.14-4.13 1.41-1.42 2.73 2.72 6.03-6.02 1.41 1.41-7.44 7.44z" />
                          </svg>
                        )}
                        <span className="text-slate-500 font-normal">a publié une mise à jour</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{news.content}</p>
                    </div>
                  </li>
                )) : (
                  <li className="text-xs text-slate-500">Aucune actualité pour le moment.</li>
                )}
              </ul>
              {officialNews.length > 3 && (
                <button onClick={() => setShowAllNews(!showAllNews)} className="flex items-center justify-center gap-1 mt-4 px-2 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-md transition-colors w-max">
                  {showAllNews ? 'Voir moins' : 'Voir plus'} <ChevronRight size={16} className={showAllNews ? 'rotate-180' : ''} />
                </button>
              )}
            </div>

            {profile?.role !== 'school' && (
              <div className="sticky top-24 overflow-hidden rounded-xl shadow-[0_0_0_1px_rgba(0,0,0,0.08)] text-center text-slate-500 bg-white relative">
                 <div className="p-6">
                   <div className="absolute top-2 right-4 text-[10px] text-slate-500">Ad</div>
                   <p className="text-xs text-slate-600 mb-4">{profile?.firstName ? `${profile.firstName}, mettez` : 'Mettez'} toutes les chances de votre côté.</p>
                   <div className="flex justify-center items-center gap-4 my-4">
                     <img src={profile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} className="w-16 h-16 rounded-full border border-slate-200 object-cover" alt="" />
                     <div className="w-16 h-16 rounded-full border border-slate-200 bg-[#1EBA64] flex items-center justify-center shadow-inner">
                       <GraduationCap size={24} className="text-white" />
                     </div>
                   </div>
                   <p className="text-[13px] text-slate-800 mb-4 leading-snug">Profitez d'un accompagnement personnalisé avec nos Packs GOLD et STANDARD.</p>
                   <button onClick={() => setShowRegisterModal(true)} className="px-5 py-1.5 border border-[#1EBA64] text-[#1EBA64] rounded-full font-semibold hover:bg-emerald-50 hover:ring-1 hover:ring-[#1EBA64] transition-all">
                     Voir les offres
                   </button>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowRegisterModal(false);
                setSelectedPackId(null);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-xl w-full max-w-4xl relative z-10 shadow-2xl overflow-hidden h-auto max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-white border-b border-slate-200 p-4 relative flex items-center justify-between sticky top-0 z-20">
                <h2 className="text-lg md:text-xl font-semibold text-slate-800">Nos Packs d'accompagnement</h2>
                <button 
                  onClick={() => setShowRegisterModal(false)}
                  className="text-slate-500 hover:text-slate-800 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4 md:p-6 bg-[#F3F2EF]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  {PACKS.map((pack) => (
                    <div
                      key={pack.id}
                      onClick={() => setSelectedPackId(pack.id)}
                      className={`relative p-5 bg-white rounded-xl shadow-sm border-2 transition-all cursor-pointer flex flex-col ${
                        selectedPackId === pack.id 
                          ? 'border-[#1EBA64] ring-2 ring-[#1EBA64]/20' 
                          : 'border-transparent hover:border-slate-200'
                      }`}
                    >
                      {pack.isPremium && (
                        <div className="absolute top-0 right-0 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-bl-xl rounded-tr-xl flex items-center gap-1 border-b border-l border-amber-200">
                          <Sparkles size={12} />
                          Populaire
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-slate-800">{pack.name}</h4>
                        <div className="text-2xl font-bold text-slate-900 mt-2">{pack.price}</div>
                        <p className="text-xs text-slate-500 mt-1">{pack.description}</p>
                      </div>

                      <div className="space-y-2.5 mb-6 flex-1">
                        {pack.features.map((feature, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                            <Check size={14} className="text-[#1EBA64] shrink-0 mt-0.5" />
                            <span className="leading-snug">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto pt-4 border-t border-slate-100">
                        {selectedPackId === pack.id ? (
                          <div className="w-full flex justify-center text-[#1EBA64]"><Check size={24} /></div>
                        ) : (
                          <div className="w-full text-center text-sm font-semibold text-slate-500">Sélectionner</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-200/50">
                  <button 
                    onClick={() => {
                      setShowRegisterModal(false);
                      setSelectedPackId(null);
                    }}
                    className="px-5 py-2 hover:bg-slate-200 text-slate-700 rounded-full font-semibold transition-colors text-sm"
                  >
                    Annuler
                  </button>
                  <button 
                    disabled={!selectedPackId}
                    onClick={() => {
                      const packName = PACKS.find(p => p.id === selectedPackId)?.name || 'Basic';
                      const info = `*Candidature via 3ALEM O T3ALEM*\n\n*Client:* ${profile?.firstName} ${profile?.lastName}\n*Pack choisi:* ${packName}\n*Niveau:* ${profile?.level}\n*ID Profil:* ${user?.uid}`;
                      window.open(`https://wa.me/212709793474?text=${encodeURIComponent(info)}`, '_blank');
                      setShowRegisterModal(false);
                      setSelectedPackId(null);
                    }}
                    className="px-6 py-2 bg-[#1EBA64] hover:bg-[#159c52] text-white rounded-full font-semibold transition-colors disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 text-sm flex items-center gap-2"
                  >
                    Continuer
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Image Modal */}
      {createPortal(
        <AnimatePresence>
          {fullscreenImageObj && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center backdrop-blur-md"
              onClick={() => setFullscreenImageObj(null)}
            >
              <button 
                onClick={(e) => { e.stopPropagation(); setFullscreenImageObj(null); }}
                className="absolute top-4 right-4 md:top-8 md:right-8 text-white/70 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all z-[10000] shadow-lg"
              >
                <X size={32} />
              </button>
              <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 relative" onClick={e => e.stopPropagation()}>
                <img 
                  src={fullscreenImageObj.images[fullscreenImageObj.currentIndex]} 
                  className="max-w-[95vw] max-h-[90vh] object-contain transition-opacity duration-300"
                  alt="Fullscreen view"
                />
                {fullscreenImageObj.images.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setFullscreenImageObj(prev => prev ? {...prev, currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1} : null) }}
                      className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-sm z-[10000]"
                    >
                      <ChevronLeft size={36} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setFullscreenImageObj(prev => prev ? {...prev, currentIndex: (prev.currentIndex + 1) % prev.images.length} : null) }}
                      className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-sm z-[10000]"
                    >
                      <ChevronRight size={36} />
                    </button>
                    <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-3 bg-black/60 px-4 py-3 rounded-full backdrop-blur-sm z-[10000]">
                      {fullscreenImageObj.images.map((_, i) => (
                        <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${i === fullscreenImageObj.currentIndex ? 'bg-white' : 'bg-white/30 cursor-pointer hover:bg-white/60'}`} onClick={(e) => { e.stopPropagation(); setFullscreenImageObj(prev => prev ? {...prev, currentIndex: i} : null) }} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
};

const CommentSection: React.FC<{ postId: string, postAuthorUid: string }> = ({ postId, postAuthorUid }) => {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, `posts/${postId}/comments`),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `posts/${postId}/comments`);
    });
    return () => unsubscribe();
  }, [postId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;
    try {
      await addDoc(collection(db, `posts/${postId}/comments`), {
        authorUid: user.uid,
        authorName: profile ? `${profile.firstName} ${profile.lastName}` : (user.displayName || 'Utilisateur'),
        authorPhoto: profile?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        content: newComment,
        createdAt: new Date().toISOString()
      });
      await updateDoc(doc(db, 'posts', postId), {
        commentsCount: increment(1)
      });
      
      if (postAuthorUid !== user.uid) {
        await addDoc(collection(db, 'notifications'), {
          recipientId: postAuthorUid,
          senderId: user.uid,
          senderName: profile ? `${profile.firstName} ${profile.lastName}` : (user.displayName || 'Utilisateur'),
          senderPhoto: profile?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
          type: 'comment',
          postId: postId,
          content: newComment.substring(0, 50),
          read: false,
          createdAt: new Date().toISOString()
        });
      }
      
      setNewComment('');
    } catch (error) {
      console.error("Comment error:", error);
    }
  };

  return (
    <div className="space-y-5 px-1 py-2">
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 group">
            <div className="shrink-0 mt-0.5">
              <UserDisplay 
                uid={comment.authorUid} 
                fallbackName={comment.authorName} 
                fallbackPhoto={comment.authorPhoto}
                size="sm"
                hideName={true}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] leading-snug break-words mt-1.5">
                <span className="font-semibold text-slate-900 mr-2">{comment.authorName}</span>
                <span className="text-slate-800">{comment.content}</span>
              </div>
              <div className="flex items-center gap-4 mt-1.5">
                <span className="text-[12px] text-slate-500">{formatDate(comment.createdAt)}</span>
                <button className="text-[12px] text-slate-500 font-semibold hover:text-slate-800 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100">Répondre</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddComment} className="flex gap-3 mt-6 pt-4 border-t border-slate-100 relative items-center">
        <img 
          src={profile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
          className="w-8 h-8 rounded-full object-cover shadow-sm shrink-0"
          alt=""
        />
        <div className="flex-1 relative">
          <input 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Écrivez un commentaire..."
            className="w-full bg-[#f0f2f5] hover:bg-[#e4e6eb] focus:bg-[#e4e6eb] border-none rounded-full px-4 py-2.5 text-[14px] outline-none transition-colors pr-12 text-slate-800 placeholder-slate-500"
          />
          <button 
            type="submit"
            disabled={!newComment.trim()}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-moroccan-green disabled:text-slate-400 hover:bg-moroccan-green/10 rounded-full transition-colors"
          >
            <Send size={18} className="translate-x-[1px]" />
          </button>
        </div>
      </form>
    </div>
  );
};
