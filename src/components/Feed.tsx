import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove, increment, getDoc, getDocs, where, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { Post, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Heart, Share2, Send, Image as ImageIcon, Search, BookOpen, GraduationCap, MoreHorizontal, Trash2, Edit2, Check, X, Zap, Crown, Briefcase, ChevronRight, ArrowLeft, Sparkles } from 'lucide-react';
import { formatDate } from '../lib/utils';

// Helper component to display up-to-date user info
const UserDisplay: React.FC<{ uid: string, fallbackName?: string, fallbackPhoto?: string, size?: 'sm' | 'md' | 'lg', onClick?: () => void }> = ({ uid, fallbackName, fallbackPhoto, size = 'md', onClick }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = onSnapshot(doc(db, 'users', uid), (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
      }
    });
    return () => unsubscribe();
  }, [uid]);

  const name = profile?.displayName || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || fallbackName || 'Utilisateur';
  const photo = profile?.photoURL || fallbackPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`;
  
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
      <div>
        <h3 
          className={`font-serif italic font-bold text-slate-900 cursor-pointer hover:text-majorelle transition-colors ${size === 'sm' ? 'text-xs' : 'text-base'}`}
          onClick={onClick}
        >
          {name}
        </h3>
      </div>
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
  const [newPostImage, setNewPostImage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const postFileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePostFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("L'image est trop lourde (max 2Mo)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImage(reader.result as string);
      };
      reader.readAsDataURL(file);
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
      await addDoc(collection(db, 'posts'), {
        authorUid: user.uid,
        authorName: profile ? `${profile.firstName} ${profile.lastName}` : (user.displayName || 'Utilisateur'),
        authorPhoto: profile?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        content: newPostContent,
        imageUrl: newPostImage,
        likesCount: 0,
        commentsCount: 0,
        tags: [],
        createdAt: new Date().toISOString()
      });
      setNewPostContent('');
      setNewPostImage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'posts');
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
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `posts/${postId}`);
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeletePost = async (postId: string) => {
    setDeletingId(postId);
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `posts/${postId}`);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.authorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-2xl mx-auto py-6 md:py-12 px-4 space-y-8 md:space-y-12">
      <div className="text-center relative py-6 md:py-10">
        <div className="absolute inset-0 zellij-pattern opacity-[0.03] pointer-events-none"></div>
        <h1 className="text-3xl md:text-5xl font-serif italic font-bold text-slate-900 mb-4 tracking-tight relative z-10 leading-tight">Le Mur de Sagesse</h1>
        <div className="w-16 md:w-24 h-1.5 bg-gradient-to-r from-moroccan-red via-moroccan-green to-moroccan-red mx-auto rounded-full"></div>
        <p className="mt-4 md:mt-6 text-slate-500 font-serif italic text-base md:text-lg leading-relaxed max-w-md mx-auto">Partagez votre exp&eacute;rience, demandez conseil, et grandissez ensemble dans l&apos;esprit de l&apos;entraide.</p>
      </div>

      {/* Quick Actions for Community */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 pb-2 md:pb-4">
        <button 
          onClick={() => onStartChat?.('')}
          className="group relative flex items-center gap-4 md:gap-5 bg-majorelle text-white p-5 md:p-7 rounded-[32px] md:rounded-[40px] shadow-2xl shadow-majorelle/20 hover:-translate-y-1 transition-all duration-500 text-left overflow-hidden w-full"
        >
          <div className="absolute inset-0 zellij-pattern opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-[16px] md:rounded-[20px] flex items-center justify-center shrink-0 border border-white/30 backdrop-blur-md">
            <BookOpen size={24} className="md:w-[28px] md:h-[28px]" />
          </div>
          <div className="relative z-10">
            <h3 className="font-serif italic text-lg md:text-xl font-bold leading-tight">Poser une question</h3>
            <p className="text-[10px] md:text-xs opacity-80 font-medium tracking-wide">Réponse par la communauté</p>
          </div>
        </button>

        {profile?.role === 'student' && (
          <button 
            onClick={() => setShowRegisterModal(true)}
            className="group relative flex items-center gap-4 md:gap-5 bg-terracotta text-white p-5 md:p-7 rounded-[32px] md:rounded-[40px] shadow-2xl shadow-terracotta/20 hover:-translate-y-1 transition-all duration-500 text-left overflow-hidden w-full"
          >
            <div className="absolute inset-0 zellij-pattern opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-[16px] md:rounded-[20px] flex items-center justify-center shrink-0 border border-white/30 backdrop-blur-md">
              <GraduationCap size={24} className="md:w-[28px] md:h-[28px]" />
            </div>
            <div className="relative z-10">
              <h3 className="font-serif italic text-lg md:text-xl font-bold leading-tight">S'inscrire avec nous</h3>
              <p className="text-[10px] md:text-xs opacity-80 font-bold tracking-wide">Écoles partenaires</p>
            </div>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-majorelle/10 via-saffron/10 to-terracotta/10 rounded-[30px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-majorelle transition-colors" size={20} />
        <input 
          type="text"
          placeholder="Rechercher des conseils, étudiants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-14 pr-5 py-5 bg-white rounded-[28px] shadow-lg shadow-black/5 border-2 border-transparent focus:border-majorelle/20 outline-none transition-all relative z-10 text-slate-700 placeholder:text-slate-300"
        />
      </div>

      {/* Create Post */}
      <div className="maroccan-card p-1">
        <div className="bg-slate-50/50 maroccan-arch-top h-6 md:h-8 mb-2 md:mb-4 border-b border-slate-100"></div>
        <div className="px-5 md:px-7 pb-5 md:pb-7">
          <form onSubmit={handleCreatePost} className="space-y-4 md:space-y-6">
            <div className="flex gap-3 md:gap-5">
              <div className="relative shrink-0">
                <img 
                  src={profile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
                  className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl object-cover ring-4 ring-majorelle/5"
                  alt="Profile"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-4 md:h-4 bg-emerald border-2 border-white rounded-full"></div>
              </div>
              <textarea 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Quel est votre conseil ?"
                className="flex-1 bg-transparent border-none rounded-2xl py-1 md:py-2 outline-none resize-none min-h-[80px] md:min-h-[120px] text-base md:text-lg text-slate-700 placeholder:text-slate-300 font-serif italic"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between pt-4 md:pt-6 border-t border-slate-100 gap-3">
              <div className="flex gap-2 md:gap-3">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={postFileInputRef}
                  onChange={handlePostFileChange}
                />
                <button 
                  type="button"
                  onClick={() => postFileInputRef.current?.click()}
                  className="px-3 md:px-4 py-2 text-slate-500 hover:bg-majorelle/5 rounded-xl md:rounded-2xl transition-all flex items-center gap-2 group/btn"
                >
                  <ImageIcon size={20} className="group-hover/btn:text-majorelle transition-colors" />
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-60">Photo</span>
                </button>
              </div>
              <button 
                disabled={isPosting || !newPostContent.trim()}
                className="w-full sm:w-auto bg-majorelle text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full font-bold shadow-xl shadow-majorelle/20 hover:shadow-majorelle/40 hover:-translate-y-0.5 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
              >
                <div className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 bg-white/20 rounded-full">
                  <Send size={10} className="md:w-3 md:h-3" />
                </div>
                <span className="text-sm md:text-base">Partager le conseil</span>
              </button>
            </div>
            {newPostImage && (
              <div className="relative rounded-2xl md:rounded-3xl overflow-hidden mt-4 shadow-inner ring-1 ring-black/5">
                <img src={newPostImage} className="w-full h-48 md:h-56 object-cover" alt="Preview" />
                <button 
                  onClick={() => setNewPostImage('')}
                  className="absolute top-2 md:top-4 right-2 md:right-4 bg-white/90 backdrop-blur-md text-slate-800 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-10">
        {filteredPosts.map((post) => (
          <motion.div 
            layout
            key={post.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="maroccan-card group/card"
          >
            <div className="p-5 md:p-8">
              <div className="flex items-start md:items-center justify-between mb-6 md:mb-8 gap-4">
                <UserDisplay 
                  uid={post.authorUid} 
                  fallbackName={post.authorName} 
                  fallbackPhoto={post.authorPhoto}
                  size="md"
                  onClick={() => onViewProfile?.(post.authorUid)}
                />
                <div className="flex flex-col md:flex-row items-end md:items-center gap-2 md:gap-4 shrink-0">
                  <p className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{formatDate(post.createdAt)}</p>
                  {user?.uid === post.authorUid && (
                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover/card:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingPostId(post.id);
                          setEditingContent(post.content);
                        }}
                        className="p-2 text-slate-300 hover:text-majorelle hover:bg-majorelle/5 rounded-xl transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deletingId === post.id}
                        className={`p-2 rounded-xl transition-all ${deletingId === post.id ? 'text-slate-200' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}
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
              </div>
              
              {editingPostId === post.id ? (
                <div className="mb-6 space-y-4">
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-majorelle/10 rounded-[28px] p-6 text-slate-700 outline-none focus:border-majorelle/30 min-h-[150px] font-serif italic text-lg"
                    autoFocus
                  />
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => setEditingPostId(null)}
                      className="px-6 py-3 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all"
                    >
                      Annuler
                    </button>
                    <button 
                      onClick={() => handleUpdatePost(post.id)}
                      className="px-8 py-3 rounded-full bg-majorelle text-white text-sm font-bold shadow-lg shadow-majorelle/20 hover:shadow-majorelle/40 transition-all flex items-center gap-2"
                    >
                      <Check size={16} />
                      Enregistrer
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-700 text-xl font-serif italic leading-relaxed mb-6 whitespace-pre-wrap">{post.content}</p>
              )}
              {post.imageUrl && (
                <div className="relative mb-6 md:mb-8 rounded-2xl md:rounded-[32px] overflow-hidden shadow-2xl shadow-black/10 transition-transform duration-700 hover:scale-[1.01]">
                  <img src={post.imageUrl} className="w-full object-cover max-h-[300px] md:max-h-[500px]" alt="Post content" />
                </div>
              )}
              
              <div className="flex flex-wrap items-center gap-4 md:gap-8 pt-4 md:pt-6 border-t border-slate-50">
                <button 
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 md:gap-3 group/like transition-all ${post.likedBy?.includes(user?.uid || '') ? 'text-red-500 scale-105' : 'text-slate-400 hover:text-red-500'}`}
                >
                  <div className={`p-2 md:p-2.5 rounded-xl md:rounded-2xl transition-colors ${post.likedBy?.includes(user?.uid || '') ? 'bg-red-50' : 'bg-slate-50 group-hover/like:bg-red-50' } `}>
                    <Heart size={20} fill={post.likedBy?.includes(user?.uid || '') ? 'currentColor' : 'none'} className="md:w-[22px] md:h-[22px] transition-transform duration-300 group-active/like:scale-150" />
                  </div>
                  <span className="text-xs md:text-sm font-black italic">{post.likesCount}</span>
                </button>
                <button 
                  onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)}
                  className={`flex items-center gap-2 md:gap-3 transition-all ${expandedComments === post.id ? 'text-majorelle' : 'text-slate-400 hover:text-majorelle'}`}
                >
                  <div className={`p-2 md:p-2.5 rounded-xl md:rounded-2xl transition-colors ${expandedComments === post.id ? 'bg-majorelle/5' : 'bg-slate-50' } `}>
                    <MessageSquare size={20} className="md:w-[22px] md:h-[22px]" />
                  </div>
                  <span className="text-xs md:text-sm font-black italic">{post.commentsCount}</span>
                </button>
                <button 
                  onClick={() => handleShare(post)}
                  className="flex items-center gap-2 md:gap-3 text-slate-400 hover:text-emerald transition-all"
                >
                  <div className="p-2 md:p-2.5 rounded-xl md:rounded-2xl bg-slate-50 hover:bg-emerald/10 transition-colors">
                    <Share2 size={20} className="md:w-[22px] md:h-[22px]" />
                  </div>
                </button>
              </div>

              <AnimatePresence>
                {expandedComments === post.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-6 bg-ivory/50 rounded-[32px] p-2"
                  >
                    <div className="p-6">
                      <CommentSection postId={post.id} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
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
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="bg-white rounded-t-[32px] md:rounded-[40px] w-full max-w-6xl relative z-10 shadow-3xl overflow-hidden border border-white/20 h-[92vh] md:h-auto md:max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-terracotta p-5 md:p-8 relative overflow-hidden flex flex-col items-center justify-center text-center sticky top-0 z-20">
                <div className="absolute inset-0 zellij-pattern opacity-10"></div>
                <button 
                  onClick={() => setShowRegisterModal(false)}
                  className="absolute top-4 right-4 text-white/60 hover:text-white p-2"
                >
                  <X size={20} />
                </button>
                <div className="relative z-10">
                  <h2 className="text-xl md:text-3xl font-serif italic font-bold text-white mb-1 leading-tight tracking-tight">💼 INSCRIPTIONS</h2>
                  <p className="text-white/70 font-serif italic text-xs md:text-base">Choisissez votre pack d&apos;accompagnement</p>
                </div>
              </div>
              
              <div className="p-4 md:p-12">
                <div className="space-y-6 md:space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {PACKS.map((pack) => (
                      <motion.div
                        key={pack.id}
                        whileHover={{ y: -5 }}
                        onClick={() => setSelectedPackId(pack.id)}
                        className={`relative p-5 md:p-8 rounded-[24px] md:rounded-[40px] border-2 transition-all cursor-pointer flex flex-col ${
                          selectedPackId === pack.id 
                            ? `border-${pack.id === 'basic' ? 'emerald-500' : pack.id === 'standard' ? 'majorelle' : 'saffron'} bg-slate-50 ring-4 ring-terracotta/5` 
                            : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                      >
                        {pack.isPremium && (
                          <div className="absolute -top-3 left-6 md:left-1/2 md:-translate-x-1/2 bg-amber-400 text-slate-900 text-[8px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 shrink-0 z-10">
                            <Sparkles size={10} />
                            <span>Recommandé</span>
                          </div>
                        )}
                        
                        <div className="flex md:flex-col items-center gap-4 md:gap-0 mb-4 md:mb-6">
                          <div className={`w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${
                            selectedPackId === pack.id ? 'bg-terracotta text-white' : 'bg-slate-50 text-slate-400'
                          }`}>
                            <pack.icon size={20} className="md:w-8 md:h-8" />
                          </div>
                          <div className="md:text-center md:mt-4">
                            <h4 className="text-base md:text-xl font-serif italic font-bold text-slate-900 leading-none">{pack.name}</h4>
                            <div className="text-lg md:text-3xl font-black text-moroccan-green md:mt-1">{pack.price}</div>
                          </div>
                        </div>

                        <div className="space-y-2 md:space-y-3 mb-6 flex-1">
                          {pack.features.slice(0, 5).map((feature, i) => (
                            <div key={i} className="flex items-start gap-2 text-[11px] md:text-sm text-slate-600">
                              <Check size={14} className={`mt-0.5 flex-shrink-0 ${selectedPackId === pack.id ? 'text-terracotta' : 'text-slate-300'}`} />
                              <span className="leading-tight">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <div className={`mt-auto pt-4 border-t border-slate-100 text-[9px] md:text-[10px] font-black uppercase tracking-widest ${selectedPackId === pack.id ? 'text-terracotta' : 'text-slate-400'}`}>
                          🎯 {pack.objective}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 md:pt-4">
                    <button 
                      onClick={() => {
                        setShowRegisterModal(false);
                        setSelectedPackId(null);
                      }}
                      className="order-2 sm:order-1 w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold transition-all uppercase text-[10px] tracking-widest"
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
                      className="order-1 sm:order-2 w-full bg-terracotta text-white py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest md:tracking-[0.2em] hover:bg-terracotta/90 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-30 text-xs md:text-sm"
                    >
                      Confirmer via WhatsApp
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CommentSection: React.FC<{ postId: string }> = ({ postId }) => {
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
      setNewComment('');
    } catch (error) {
      console.error("Comment error:", error);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddComment} className="flex gap-4 mb-8">
        <img 
          src={profile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
          className="w-10 h-10 rounded-xl object-cover ring-2 ring-majorelle/5"
          alt=""
        />
        <div className="flex-1 flex gap-3">
          <input 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Apporter une précision..."
            className="flex-1 bg-white border border-slate-100 rounded-2xl px-5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-majorelle/10 transition-all"
          />
          <button 
            type="submit"
            disabled={!newComment.trim()}
            className="bg-majorelle text-white p-2.5 rounded-xl disabled:opacity-50 shadow-lg shadow-majorelle/10"
          >
            <Send size={18} />
          </button>
        </div>
      </form>

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <UserDisplay 
              uid={comment.authorUid} 
              fallbackName={comment.authorName} 
              fallbackPhoto={comment.authorPhoto}
              size="sm"
            />
            <div className="flex-1 bg-white p-5 rounded-3xl shadow-sm border border-slate-50">
              <p className="text-sm text-slate-700 leading-relaxed italic">{comment.content}</p>
              <div className="mt-2 flex justify-end">
                <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest">{formatDate(comment.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
