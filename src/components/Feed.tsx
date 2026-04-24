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
      <img 
        src={photo} 
        className={`${sizeClasses[size]} rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-blue-100 transition-all`} 
        alt={name}
        onClick={onClick}
      />
      <div>
        <h3 
          className={`font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors ${size === 'sm' ? 'text-xs' : 'text-sm'}`}
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
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
      {/* Quick Actions for Community */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button 
          onClick={onStartChat}
          className="flex items-center gap-4 bg-blue-600 text-white p-6 rounded-[2rem] shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all text-left"
        >
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="font-bold leading-tight">Poser une question</h3>
            <p className="text-[10px] opacity-70 font-medium">Réponse rapide par chat</p>
          </div>
        </button>

        {profile?.role === 'student' && (
          <button 
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-4 bg-green-500 text-white p-6 rounded-[2rem] shadow-lg shadow-green-100 hover:bg-green-600 transition-all text-left"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <GraduationCap size={24} />
            </div>
            <div>
              <h3 className="font-bold leading-tight">S'inscrire avec nous</h3>
              <p className="text-[10px] opacity-70 font-medium font-bold">Écoles partenaires</p>
            </div>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text"
          placeholder="Rechercher des conseils, écoles, mentors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-sm border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
      </div>

      {/* Create Post */}
      <div className="bg-white rounded-3xl shadow-sm p-6">
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div className="flex gap-4">
            <img 
              src={profile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
              className="w-12 h-12 rounded-full object-cover"
              alt="Profile"
            />
            <textarea 
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Partagez un conseil ou posez une question..."
              className="flex-1 bg-gray-50 rounded-2xl p-4 outline-none focus:ring-1 focus:ring-blue-100 resize-none min-h-[100px]"
            />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <div className="flex gap-2">
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
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2"
                title="Ajouter une image"
              >
                <ImageIcon size={20} />
                <span className="text-xs font-bold">Image</span>
              </button>
            </div>
            <button 
              disabled={isPosting || !newPostContent.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <Send size={16} />
              Publier
            </button>
          </div>
          {newPostImage && (
            <div className="relative rounded-2xl overflow-hidden mt-2">
              <img src={newPostImage} className="w-full h-48 object-cover" alt="Preview" />
              <button 
                onClick={() => setNewPostImage('')}
                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"
              >
                ×
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {filteredPosts.map((post) => (
          <motion.div 
            layout
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <UserDisplay 
                  uid={post.authorUid} 
                  fallbackName={post.authorName} 
                  fallbackPhoto={post.authorPhoto}
                  onClick={() => onViewProfile?.(post.authorUid)}
                />
                <div className="flex items-center gap-3">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{formatDate(post.createdAt)}</p>
                  {user?.uid === post.authorUid && (
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => {
                          setEditingPostId(post.id);
                          setEditingContent(post.content);
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deletingId === post.id}
                        className={`p-1.5 transition-colors ${deletingId === post.id ? 'text-gray-300' : 'text-gray-400 hover:text-red-500'}`}
                      >
                        {deletingId === post.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {editingPostId === post.id ? (
                <div className="mb-4 space-y-2">
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/10 min-h-[100px]"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setEditingPostId(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all"
                    >
                      Annuler
                    </button>
                    <button 
                      onClick={() => handleUpdatePost(post.id)}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                      <Check size={14} />
                      Mettre à jour
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-800 whitespace-pre-wrap mb-4">{post.content}</p>
              )}
              {post.imageUrl && (
                <img src={post.imageUrl} className="w-full rounded-2xl mb-4 object-cover max-h-96" alt="Post content" />
              )}
              <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
                <button 
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 transition-colors ${post.likedBy?.includes(user?.uid || '') ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                >
                  <Heart size={20} fill={post.likedBy?.includes(user?.uid || '') ? 'currentColor' : 'none'} />
                  <span className="text-sm font-medium">{post.likesCount}</span>
                </button>
                <button 
                  onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)}
                  className={`flex items-center gap-2 transition-colors ${expandedComments === post.id ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
                >
                  <MessageSquare size={20} />
                  <span className="text-sm font-medium">{post.commentsCount}</span>
                </button>
                <button 
                  onClick={() => handleShare(post)}
                  className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors"
                >
                  <Share2 size={20} />
                </button>
              </div>

              <AnimatePresence>
                {expandedComments === post.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-gray-50/50 rounded-b-3xl"
                  >
                    <div className="p-6 border-t border-gray-100">
                      <CommentSection postId={post.id} />
                      <p className="text-center text-xs text-gray-400 italic mt-6">Échangez avec {post.authorName} pour approfondir ce sujet.</p>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRegisterModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 relative z-10 shadow-2xl"
            >
              <h2 className="text-2xl font-black text-gray-900 mb-2">Choisir vos écoles</h2>
              <p className="text-sm text-gray-500 mb-6">Sélectionnez les écoles qui vous intéressent pour recevoir de l'aide à l'inscription.</p>
              
              <div className="space-y-3 mb-8 max-h-[300px] overflow-y-auto pr-2">
                {['ENSA', 'ENSAM', 'ENSIAS', 'EMI', 'BTS', 'CPGE'].map(school => (
                  <label key={school} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedSchools.includes(school) ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-blue-100'}`}>
                    <span className="font-bold text-gray-700">{school}</span>
                    <input 
                      type="checkbox"
                      className="w-5 h-5 rounded-lg text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={selectedSchools.includes(school)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedSchools([...selectedSchools, school]);
                        else setSelectedSchools(selectedSchools.filter(s => s !== school));
                      }}
                    />
                  </label>
                ))}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Annuler
                </button>
                <button 
                  disabled={selectedSchools.length === 0}
                  onClick={() => {
                    const info = `*Candidature via 3ALEM O T3ALEM*\n\n*Nom:* ${profile?.firstName} ${profile?.lastName}\n*Email:* ${profile?.email}\n*Niveau:* ${profile?.level}\n*Établissement actuel:* ${profile?.institution}\n*Écoles choisies:* ${selectedSchools.join(', ')}`;
                    window.open(`https://wa.me/212709793474?text=${encodeURIComponent(info)}`, '_blank');
                    setShowRegisterModal(false);
                  }}
                  className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-black hover:bg-green-600 disabled:opacity-50 transition-all shadow-lg shadow-green-100"
                >
                  Envoyer
                </button>
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
      <form onSubmit={handleAddComment} className="flex gap-3 mb-6">
        <img 
          src={profile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
          className="w-8 h-8 rounded-full object-cover"
          alt=""
        />
        <div className="flex-1 flex gap-2">
          <input 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Écrire un commentaire..."
            className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/10"
          />
          <button 
            type="submit"
            disabled={!newComment.trim()}
            className="bg-blue-600 text-white p-1.5 rounded-lg disabled:opacity-50"
          >
            <Send size={14} />
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <UserDisplay 
              uid={comment.authorUid} 
              fallbackName={comment.authorName} 
              fallbackPhoto={comment.authorPhoto}
              size="sm"
            />
            <div className="flex-1 bg-white p-3 rounded-2xl shadow-sm">
              <p className="text-xs text-gray-700">{comment.content}</p>
              <div className="mt-1 flex justify-end">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{formatDate(comment.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
