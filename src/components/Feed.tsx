import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove, increment, getDoc, getDocs, where, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { Post, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Heart, Share2, Send, Image as ImageIcon, Search, BookOpen, GraduationCap, MoreHorizontal, Trash2, Edit2, Check, X, Zap, Crown, Briefcase, ChevronRight, ArrowLeft, Sparkles, Globe } from 'lucide-react';
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
          className={`font-serif italic font-bold text-slate-900 cursor-pointer hover:text-majorelle transition-colors flex items-center gap-1 ${size === 'sm' ? 'text-xs' : 'text-base'}`}
          onClick={onClick}
        >
          {name}
          {profile?.role === 'school' && (
            <svg className="w-4 h-4 text-blue-500 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm-1.06 14.86l-4.14-4.13 1.41-1.42 2.73 2.72 6.03-6.02 1.41 1.41-7.44 7.44z" />
            </svg>
          )}
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
        authorRole: profile?.role || 'student',
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
                  {profile?.role === 'school' && (
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
              <button 
                onClick={() => onStartChat?.('')}
                className="w-full flex items-center gap-2 px-2 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                <BookOpen size={16} className="text-slate-500 shrink-0" />
                <span className="font-semibold text-left">Poser une question</span>
              </button>
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
                  placeholder="Commencer un post"
                  className="flex-1 bg-white border border-slate-400 hover:bg-slate-100 focus:bg-white rounded-[32px] px-4 py-3 outline-none text-sm text-slate-700 transition-colors cursor-text resize-none min-h-[48px]"
                  rows={newPostContent ? 3 : 1}
                />
              </div>

              {newPostImage && (
                <div className="ml-0 sm:ml-14 relative rounded-xl overflow-hidden mb-3 border border-slate-200">
                  <img src={newPostImage} className="w-full max-h-[300px] object-cover" alt="Preview" />
                  <button 
                    onClick={() => setNewPostImage('')}
                    className="absolute top-2 right-2 bg-slate-900/60 hover:bg-slate-900/90 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between ml-0 sm:ml-14">
                <div className="flex gap-1">
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

            {/* Sort Divider */}
            <div className="flex items-center gap-2 px-3 sm:px-1">
              <div className="flex-1 h-[1px] bg-slate-300"></div>
              <span className="text-xs text-slate-500 font-semibold cursor-pointer py-1 px-1">Classer par : <b className="text-slate-700">Pertinence</b></span>
            </div>

            {/* Posts List */}
            <div className="space-y-2 sm:space-y-3">
              {filteredPosts.map((post) => (
                <div 
                  key={post.id}
                  className="bg-white sm:rounded-xl shadow-[0_0_0_1px_rgba(0,0,0,0.08)] overflow-hidden border-y border-slate-200 sm:border-none"
                >
                  <div className="p-4 bg-white">
                    {/* Post Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-3 items-center">
                        <img 
                          src={post.authorPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorUid}`} 
                          alt={post.authorName}
                          className="w-12 h-12 rounded-full object-cover cursor-pointer hover:shadow-sm"
                          onClick={() => onViewProfile?.(post.authorUid)}
                        />
                        <div>
                          <h4 
                            className="text-sm font-semibold text-slate-900 hover:underline hover:text-[#1EBA64] cursor-pointer flex items-center gap-1"
                            onClick={() => onViewProfile?.(post.authorUid)}
                          >
                            {post.authorName}
                            {post.authorRole === 'school' && (
                              <svg className="w-3.5 h-3.5 text-blue-500 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm-1.06 14.86l-4.14-4.13 1.41-1.42 2.73 2.72 6.03-6.02 1.41 1.41-7.44 7.44z" />
                              </svg>
                            )}
                          </h4>
                          <p className="text-xs text-slate-500">{post.authorRole === 'school' ? "Institution d'Enseignement Supérieur" : post.authorRole === 'mentor' ? 'Mentor' : 'Étudiant'}</p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            {formatDate(post.createdAt)} • <Globe className="w-3 h-3" />
                          </p>
                        </div>
                      </div>
                      {user?.uid === post.authorUid && (
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => {
                              setEditingPostId(post.id);
                              setEditingContent(post.content);
                            }}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeletePost(post.id)}
                            disabled={deletingId === post.id}
                            className="p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
                          >
                            {deletingId === post.id ? (
                              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Post Content */}
                    {editingPostId === post.id ? (
                      <div className="mb-3 space-y-3">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-md p-3 text-slate-800 outline-none focus:border-[#1EBA64] min-h-[100px] text-sm"
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
                      <p className="text-sm text-slate-900 leading-normal mb-1 whitespace-pre-wrap">{post.content}</p>
                    )}
                  </div>

                  {/* Post Image */}
                  {post.imageUrl && (
                    <div className="bg-[#F3F2EF] border-y border-slate-200">
                      <img src={post.imageUrl} className="w-full max-h-[500px] object-cover" alt="Post content" />
                    </div>
                  )}

                  {/* Post Stats */}
                  <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center"><Heart size={10} className="text-emerald-600 fill-emerald-600" /></div>
                      <span>{post.likesCount}</span>
                    </div>
                    <div>
                      <span className="hover:text-[#1EBA64] hover:underline cursor-pointer" onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)}>
                        {post.commentsCount} commentaires
                      </span>
                    </div>
                  </div>

                  {/* Post Actions */}
                  <div className="px-2 py-1 flex items-center justify-between bg-white sm:px-4">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md hover:bg-slate-100 transition-colors ${post.likedBy?.includes(user?.uid || '') ? 'text-[#1EBA64]' : 'text-slate-600'}`}
                    >
                      <Heart size={18} fill={post.likedBy?.includes(user?.uid || '') ? 'currentColor' : 'none'} className="mb-0.5" />
                      <span className="text-xs sm:text-sm font-semibold hidden sm:inline">J'aime</span>
                    </button>
                    <button 
                      onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md hover:bg-slate-100 transition-colors ${expandedComments === post.id ? 'text-slate-900' : 'text-slate-600'}`}
                    >
                      <MessageSquare size={18} className="mb-0.5" />
                      <span className="text-xs sm:text-sm font-semibold hidden sm:inline">Commenter</span>
                    </button>
                    <button 
                      onClick={() => handleShare(post)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-md hover:bg-slate-100 transition-colors text-slate-600"
                    >
                      <Share2 size={18} className="mb-0.5" />
                      <span className="text-xs sm:text-sm font-semibold hidden sm:inline">Partager</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  <AnimatePresence>
                    {expandedComments === post.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-white"
                      >
                        <div className="p-4 border-t border-slate-100">
                          <CommentSection postId={post.id} />
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
                {profile?.role === 'school' && (
                  <button 
                    onClick={() => {
                      const input = document.querySelector('textarea[placeholder="Commencer un post"]') as HTMLTextAreaElement;
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
                        {news.authorRole === 'school' && (
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
