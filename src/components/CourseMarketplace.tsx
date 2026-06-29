import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, FileText, Video, Image as ImageIcon, Upload, Star, Download, Lock, Search, Filter, AlertCircle, CheckCircle } from 'lucide-react';
import { collection, addDoc, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../AuthContext';
import { Course } from '../types';

export const CourseMarketplace: React.FC = () => {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [userPoints, setUserPoints] = useState(profile?.coursePoints || 0);

  // Upload Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState<'pdf' | 'video' | 'photo'>('pdf');
  const [level, setLevel] = useState('');
  const [pages, setPages] = useState<number>(10);
  const [videoDuration, setVideoDuration] = useState<number>(5);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchCourses();
    if (profile && profile.coursePoints !== undefined) {
      setUserPoints(profile.coursePoints);
    } else if (profile) {
      // Initialize if undefined
      const initPoints = async () => {
        try {
          if (user) {
            await updateDoc(doc(db, 'users', user.uid), { coursePoints: 50 }); // Starter points
            setUserPoints(50);
          }
        } catch (e) {}
      };
      initPoints();
    }
  }, [profile]);

  const fetchCourses = async () => {
    try {
      const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRewardPoints = () => {
    if (fileType === 'pdf') {
      return Math.min(Math.max(pages * 2, 10), 100); // 2 points per page, max 100
    } else if (fileType === 'video') {
      return Math.min(Math.max(videoDuration * 5, 20), 150); // 5 points per min, max 150
    }
    return 15; // Photo
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    if (!selectedFile) {
      setNotification({ message: "Veuillez sélectionner un fichier.", type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    setIsUploading(true);

    try {
      // 1. Upload File
      setUploadProgress(0);
      const fileRef = ref(storage, `courses/${user.uid}/${Date.now()}_${selectedFile.name}`);
      const uploadTask = uploadBytesResumable(fileRef, selectedFile);
      
      await new Promise<void>((resolve, reject) => {
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          }, 
          (error) => {
            reject(error);
          }, 
          () => {
            resolve();
          }
        );
      });

      const downloadURL = await getDownloadURL(fileRef);

      const rewardPoints = calculateRewardPoints();
      const newCourse: Omit<Course, 'id'> = {
        title,
        description,
        authorUid: user.uid,
        authorName: profile.firstName + ' ' + profile.lastName,
        fileUrl: downloadURL,
        fileType,
        pages: fileType === 'pdf' ? pages : undefined,
        level,
        pointsCost: Math.floor(rewardPoints * 0.8), // Cost is 80% of reward
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'courses'), newCourse);
      
      // Update User Points
      const newBalance = userPoints + rewardPoints;
      await updateDoc(doc(db, 'users', user.uid), { coursePoints: newBalance });
      setUserPoints(newBalance);
      
      setNotification({ message: `Cours partagé avec succès ! Vous avez gagné ${rewardPoints} points.`, type: 'success' });
      setShowUploadModal(false);
      
      // Reset form
      setTitle('');
      setDescription('');
      setLevel('');
      setPages(10);
      setSelectedFile(null);
      
      fetchCourses();
    } catch (error) {
      setNotification({ message: "Erreur lors du partage du cours.", type: 'error' });
    } finally {
      setIsUploading(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleUnlock = async (course: Course) => {
    if (!user) return;
    
    if (course.authorUid === user.uid) {
      window.open(course.fileUrl, '_blank');
      return;
    }

    if (profile?.unlockedCourses?.includes(course.id)) {
      window.open(course.fileUrl, '_blank');
      return;
    }

    if (userPoints < course.pointsCost) {
      setNotification({ message: `Il vous manque ${course.pointsCost - userPoints} points. Partagez un cours pour en gagner !`, type: 'error' });
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    try {
      const newBalance = userPoints - course.pointsCost;
      const newUnlocked = [...(profile?.unlockedCourses || []), course.id];
      await updateDoc(doc(db, 'users', user.uid), { 
        coursePoints: newBalance,
        unlockedCourses: newUnlocked
      });
      setUserPoints(newBalance);
      setNotification({ message: "Cours débloqué avec succès !", type: 'success' });
      setTimeout(() => setNotification(null), 3000);
      window.open(course.fileUrl, '_blank');
    } catch (error) {
      setNotification({ message: "Erreur lors du déblocage.", type: 'error' });
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="text-red-500" />;
      case 'video': return <Video className="text-blue-500" />;
      case 'photo': return <ImageIcon className="text-green-500" />;
      default: return <BookOpen className="text-gray-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <BookOpen className="text-moroccan-green" />
            Place de Cours
          </h1>
          <p className="text-slate-500 mt-2">Partagez vos connaissances, gagnez des points, débloquez des cours.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl flex items-center gap-2">
            <Star className="text-amber-500" fill="currentColor" size={20} />
            <span className="font-bold text-amber-700">{userPoints} points</span>
          </div>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="bg-moroccan-green text-white px-5 py-2.5 rounded-2xl font-semibold flex items-center gap-2 hover:bg-moroccan-green/90 transition-colors shadow-lg shadow-moroccan-green/20"
          >
            <Upload size={18} />
            Partager un cours
          </button>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}
          >
            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Course Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moroccan-green"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-600 mb-2">Aucun cours disponible</h3>
          <p className="text-slate-500 mb-6">Soyez le premier à partager un cours et gagnez des points !</p>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="bg-white border-2 border-moroccan-green text-moroccan-green px-6 py-2 rounded-xl font-semibold hover:bg-moroccan-green hover:text-white transition-colors"
          >
            Partager maintenant
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <motion.div 
              key={course.id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  {getIconForType(course.fileType)}
                </div>
                <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Star size={12} fill="currentColor" />
                  {course.pointsCost}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">{course.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow">{course.description}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
                  <span className="font-semibold text-slate-700">{course.level}</span>
                  <span>{course.fileType.toUpperCase()} {course.pages ? `• ${course.pages} pages` : ''}</span>
                </div>
                <div className="text-xs text-slate-400">
                  Par <span className="font-medium text-slate-600">{course.authorName}</span>
                </div>
              </div>
              
              <button 
                onClick={() => handleUnlock(course)}
                disabled={course.authorUid === user?.uid || profile?.unlockedCourses?.includes(course.id) ? false : userPoints < course.pointsCost}
                className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  course.authorUid === user?.uid || profile?.unlockedCourses?.includes(course.id)
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                    : userPoints >= course.pointsCost
                      ? 'bg-moroccan-green text-white hover:bg-moroccan-green/90 shadow-md shadow-moroccan-green/20'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {course.authorUid === user?.uid ? (
                  <>Ouvrir (Votre cours)</>
                ) : profile?.unlockedCourses?.includes(course.id) ? (
                  <>Ouvrir le cours</>
                ) : userPoints >= course.pointsCost ? (
                  <><Download size={16} /> Débloquer le cours</>
                ) : (
                  <><Lock size={16} /> Points insuffisants</>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUploadModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[32px] p-6 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Upload className="text-moroccan-green" />
                Partager un cours
              </h2>
              
              <form onSubmit={handleUpload} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Titre du cours</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-moroccan-green focus:ring-2 focus:ring-moroccan-green/20 outline-none transition-all"
                    placeholder="Ex: Résumé Mécanique du Point"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Niveau / Filière</label>
                  <input 
                    type="text" 
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-moroccan-green focus:ring-2 focus:ring-moroccan-green/20 outline-none transition-all"
                    placeholder="Ex: 1ère année CPGE MPSI"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Description courte</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-moroccan-green focus:ring-2 focus:ring-moroccan-green/20 outline-none transition-all resize-none h-24"
                    placeholder="De quoi parle ce cours ?"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {(['pdf', 'video', 'photo'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFileType(type)}
                      className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${fileType === type ? 'border-moroccan-green bg-moroccan-green/5 text-moroccan-green ring-1 ring-moroccan-green' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                    >
                      {getIconForType(type)}
                      <span className="text-xs font-semibold uppercase">{type}</span>
                    </button>
                  ))}
                </div>

                {/* Dynamic fields based on type for points calculation */}
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <div className="flex items-start gap-3">
                    <Star className="text-amber-500 shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm font-semibold text-amber-800 mb-2">Critères de points</p>
                      
                      {fileType === 'pdf' && (
                        <div>
                          <label className="block text-xs text-amber-700 mb-1">Nombre de pages du document</label>
                          <input 
                            type="number" 
                            min="1" 
                            max="500"
                            value={pages}
                            onChange={(e) => setPages(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg bg-white border border-amber-200 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none"
                          />
                          <p className="text-[10px] text-amber-600 mt-1 italic">Vous gagnerez {calculateRewardPoints()} points (2 pts/page)</p>
                        </div>
                      )}

                      {fileType === 'video' && (
                        <div>
                          <label className="block text-xs text-amber-700 mb-1">Durée de la vidéo (minutes)</label>
                          <input 
                            type="number" 
                            min="1" 
                            max="120"
                            value={videoDuration}
                            onChange={(e) => setVideoDuration(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg bg-white border border-amber-200 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none"
                          />
                          <p className="text-[10px] text-amber-600 mt-1 italic">Vous gagnerez {calculateRewardPoints()} points (5 pts/min)</p>
                        </div>
                      )}

                      {fileType === 'photo' && (
                        <p className="text-xs text-amber-700">Les fiches photo rapportent un montant fixe de 15 points.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* File Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Fichier du cours</label>
                  <input 
                    type="file"
                    id="course-file-upload"
                    className="hidden"
                    accept={fileType === 'pdf' ? '.pdf' : fileType === 'video' ? 'video/mp4,video/x-m4v,video/*' : 'image/png,image/jpeg,image/jpg'}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />
                  <label 
                    htmlFor="course-file-upload"
                    className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer group ${selectedFile ? 'border-moroccan-green bg-moroccan-green/5' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
                  >
                    {selectedFile ? (
                      <>
                        <CheckCircle className="text-moroccan-green mb-2" />
                        <span className="text-sm font-bold text-moroccan-green">{selectedFile.name}</span>
                        <span className="text-xs text-moroccan-green/70 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      </>
                    ) : (
                      <>
                        <Upload className="text-slate-400 group-hover:text-moroccan-green mb-2 transition-colors" />
                        <span className="text-sm font-medium text-slate-600 group-hover:text-moroccan-green transition-colors">Cliquez pour sélectionner un fichier</span>
                        <span className="text-xs text-slate-400 mt-1">
                          {fileType === 'pdf' ? 'Format accepté : PDF' : fileType === 'video' ? 'Formats : MP4, MOV, etc.' : 'Formats : JPG, PNG'}
                        </span>
                      </>
                    )}
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    disabled={isUploading}
                    className="flex-[2] px-4 py-3 bg-moroccan-green text-white rounded-xl font-semibold hover:bg-moroccan-green/90 transition-colors shadow-lg shadow-moroccan-green/20 disabled:opacity-70 flex flex-col items-center justify-center overflow-hidden relative"
                  >
                    {isUploading ? (
                      <>
                        <div className="absolute inset-0 bg-black/10 z-0">
                          <div className="h-full bg-white/20 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        <span className="relative z-10 flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 
                          {Math.round(uploadProgress)}%
                        </span>
                      </>
                    ) : "Partager et gagner des points"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
