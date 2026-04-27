import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove, increment, getDoc, getDocs, where, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { Post, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Heart, Share2, Send, Image as ImageIcon, Search, BookOpen, GraduationCap, MoreHorizontal, Trash2, Edit2, Check, X } from 'lucide-react';
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
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
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
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-12">
      <div className="text-center relative py-10">
        <div className="absolute inset-0 zellij-pattern opacity-[0.03] pointer-events-none"></div>
        <h1 className="text-5xl font-serif italic font-bold text-slate-900 mb-4 tracking-tight relative z-10">Le Mur de Sagesse</h1>
        <div className="w-24 h-1.5 bg-gradient-to-r from-moroccan-red via-moroccan-green to-moroccan-red mx-auto rounded-full"></div>
        <p className="mt-6 text-slate-500 font-serif italic text-lg leading-relaxed max-w-md mx-auto">Partagez votre exp&eacute;rience, demandez conseil, et grandissez ensemble dans l&apos;esprit de l&apos;entraide.</p>
      </div>

      {/* Quick Actions for Community */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4">
        <button 
          onClick={() => onStartChat?.('')}
          className="group relative flex items-center gap-5 bg-majorelle text-white p-7 rounded-[40px] shadow-2xl shadow-majorelle/20 hover:-translate-y-1 transition-all duration-500 text-left overflow-hidden"
        >
          <div className="absolute inset-0 zellij-pattern opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="w-14 h-14 bg-white/20 rounded-[20px] flex items-center justify-center shrink-0 border border-white/30 backdrop-blur-md">
            <BookOpen size={28} />
          </div>
          <div className="relative z-10">
            <h3 className="font-serif italic text-xl font-bold leading-tight">Poser une question</h3>
            <p className="text-xs opacity-80 font-medium">Réponse par la communauté</p>
          </div>
        </button>

        {profile?.role === 'student' && (
          <button 
            onClick={() => setShowRegisterModal(true)}
            className="group relative flex items-center gap-5 bg-terracotta text-white p-7 rounded-[40px] shadow-2xl shadow-terracotta/20 hover:-translate-y-1 transition-all duration-500 text-left overflow-hidden"
          >
            <div className="absolute inset-0 zellij-pattern opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="w-14 h-14 bg-white/20 rounded-[20px] flex items-center justify-center shrink-0 border border-white/30 backdrop-blur-md">
              <GraduationCap size={28} />
            </div>
            <div className="relative z-10">
              <h3 className="font-serif italic text-xl font-bold leading-tight">S'inscrire avec nous</h3>
              <p className="text-xs opacity-80 font-medium font-bold">Écoles partenaires</p>
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
          placeholder="Rechercher des conseils, mentors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-14 pr-5 py-5 bg-white rounded-[28px] shadow-lg shadow-black/5 border-2 border-transparent focus:border-majorelle/20 outline-none transition-all relative z-10 text-slate-700 placeholder:text-slate-300"
        />
      </div>

      {/* Create Post */}
      <div className="maroccan-card p-1">
        <div className="bg-slate-50/50 maroccan-arch-top h-8 mb-4 border-b border-slate-100"></div>
        <div className="px-7 pb-7">
          <form onSubmit={handleCreatePost} className="space-y-6">
            <div className="flex gap-5">
              <div className="relative">
                <img 
                  src={profile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
                  className="w-14 h-14 rounded-2xl object-cover ring-4 ring-majorelle/5"
                  alt="Profile"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald border-2 border-white rounded-full"></div>
              </div>
              <textarea 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Quel est votre conseil pour aujourd'hui ?"
                className="flex-1 bg-transparent border-none rounded-2xl py-2 outline-none resize-none min-h-[120px] text-lg text-slate-700 placeholder:text-slate-300 font-serif italic"
              />
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <div className="flex gap-3">
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
                  className="px-4 py-2.5 text-slate-500 hover:bg-majorelle/5 rounded-2xl transition-all flex items-center gap-2 group/btn"
                  title="Ajouter une image"
                >
                  <ImageIcon size={22} className="group-hover/btn:text-majorelle transition-colors" />
                  <span className="text-xs font-bold uppercase tracking-widest opacity-60">Photo</span>
                </button>
              </div>
              <button 
                disabled={isPosting || !newPostContent.trim()}
                className="bg-majorelle text-white px-8 py-3 rounded-full font-bold shadow-xl shadow-majorelle/20 hover:shadow-majorelle/40 hover:-translate-y-0.5 disabled:opacity-50 transition-all flex items-center gap-3"
              >
                <div className="flex items-center justify-center w-6 h-6 bg-white/20 rounded-full">
                  <Send size={12} />
                </div>
                <span>Partager le conseil</span>
              </button>
            </div>
            {newPostImage && (
              <div className="relative rounded-3xl overflow-hidden mt-4 shadow-inner ring-1 ring-black/5">
                <img src={newPostImage} className="w-full h-56 object-cover" alt="Preview" />
                <button 
                  onClick={() => setNewPostImage('')}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-slate-800 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                >
                  <X size={16} />
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
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <UserDisplay 
                  uid={post.authorUid} 
                  fallbackName={post.authorName} 
                  fallbackPhoto={post.authorPhoto}
                  onClick={() => onViewProfile?.(post.authorUid)}
                />
                <div className="flex items-center gap-4">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{formatDate(post.createdAt)}</p>
                  {user?.uid === post.authorUid && (
                    <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
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
                <div className="relative mb-8 rounded-[32px] overflow-hidden shadow-2xl shadow-black/10 transition-transform duration-700 group-hover/card:scale-[1.02]">
                  <img src={post.imageUrl} className="w-full object-cover max-h-[500px]" alt="Post content" />
                </div>
              )}
              
              <div className="flex items-center gap-8 pt-6 border-t border-slate-50">
                <button 
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-3 group/like transition-all ${post.likedBy?.includes(user?.uid || '') ? 'text-red-500 scale-105' : 'text-slate-400 hover:text-red-500'}`}
                >
                  <div className={`p-2.5 rounded-2xl transition-colors ${post.likedBy?.includes(user?.uid || '') ? 'bg-red-50' : 'bg-slate-50 group-hover/like:bg-red-50' } `}>
                    <Heart size={22} fill={post.likedBy?.includes(user?.uid || '') ? 'currentColor' : 'none'} className="transition-transform duration-300 group-active/like:scale-150" />
                  </div>
                  <span className="text-sm font-black italic">{post.likesCount}</span>
                </button>
                <button 
                  onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)}
                  className={`flex items-center gap-3 transition-all ${expandedComments === post.id ? 'text-majorelle' : 'text-slate-400 hover:text-majorelle'}`}
                >
                  <div className={`p-2.5 rounded-2xl transition-colors ${expandedComments === post.id ? 'bg-majorelle/5' : 'bg-slate-50' } `}>
                    <MessageSquare size={22} />
                  </div>
                  <span className="text-sm font-black italic">{post.commentsCount}</span>
                </button>
                <button 
                  onClick={() => handleShare(post)}
                  className="flex items-center gap-3 text-slate-400 hover:text-emerald transition-all"
                >
                  <div className="p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald/10 transition-colors">
                    <Share2 size={22} />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRegisterModal(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="bg-white rounded-[40px] w-full max-w-lg relative z-10 shadow-3xl overflow-hidden border-4 border-terracotta/10"
            >
              <div className="h-32 bg-terracotta relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 zellij-pattern opacity-30"></div>
                <h2 className="relative z-10 text-3xl font-serif italic font-bold text-white uppercase tracking-widest">Candidature</h2>
              </div>
              
              <div className="p-10">
                <p className="text-slate-500 font-serif italic text-lg mb-8 leading-relaxed">S&eacute;lectionnez l'institution qui vous int&eacute;resse pour une aide &agrave; l'orientation personnalis&eacute;e.</p>
                
                <div className="grid grid-cols-2 gap-4 mb-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {['ENSA', 'ENSAM', 'ENSIAS', 'EMI', 'BTS', 'CPGE', 'UM6P', 'IAV'].map(school => (
                    <label key={school} className={`group flex items-center justify-between p-5 rounded-3xl border-2 transition-all cursor-pointer ${selectedSchools.includes(school) ? 'border-terracotta bg-terracotta/5 shadow-inner' : 'border-slate-50 hover:border-terracotta/20 bg-slate-50/50'}`}>
                      <span className={`font-bold italic transition-colors ${selectedSchools.includes(school) ? 'text-terracotta' : 'text-slate-500'}`}>{school}</span>
                      <input 
                        type="checkbox"
                        className="hidden"
                        checked={selectedSchools.includes(school)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedSchools([...selectedSchools, school]);
                          else setSelectedSchools(selectedSchools.filter(s => s !== school));
                        }}
                      />
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedSchools.includes(school) ? 'bg-terracotta border-terracotta' : 'border-slate-200 group-hover:border-terracotta/40'}`}>
                        {selectedSchools.includes(school) && <Check size={14} className="text-white" />}
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowRegisterModal(false)}
                    className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-3xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Fermer
                  </button>
                  <button 
                    disabled={selectedSchools.length === 0}
                    onClick={() => {
                      const info = `*Candidature via 3ALEM O T3ALEM*\n\n*Nom:* ${profile?.firstName} ${profile?.lastName}\n*Email:* ${profile?.email}\n*Niveau:* ${profile?.level}\n*Établissement actuel:* ${profile?.institution}\n*Écoles choisies:* ${selectedSchools.join(', ')}`;
                      window.open(`https://wa.me/212709793474?text=${encodeURIComponent(info)}`, '_blank');
                      setShowRegisterModal(false);
                    }}
                    className="flex-1 py-5 bg-terracotta text-white rounded-3xl font-bold hover:bg-terracotta/90 disabled:opacity-50 transition-all shadow-xl shadow-terracotta/20"
                  >
                    Confirmer
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
