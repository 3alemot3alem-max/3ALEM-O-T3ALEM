import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Post } from '../types';
import { Newspaper } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { motion } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const NetworkNews: React.FC<{ onViewProfile?: (uid: string) => void }> = ({ onViewProfile }) => {
  const [officialNews, setOfficialNews] = useState<Post[]>([]);
  const { user } = useAuth();
  
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const allPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setOfficialNews(allPosts.filter(p => ['school', 'admin', 'official'].includes(p.authorRole || '')));
    });
    return unsub;
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Newspaper className="w-8 h-8 text-moroccan-red" />
          Actualités du réseau
        </h1>
        {user && (
          <button 
            onClick={() => {
              // We could navigate to feed to post, or just show a message.
              // For now, let's keep it simple.
            }}
            className="text-[12px] bg-[#1EBA64]/10 text-[#1EBA64] px-3 py-1.5 rounded font-bold uppercase tracking-wider hidden"
          >
            + Publier
          </button>
        )}
      </div>

      {officialNews.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-slate-100">
          <Newspaper className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Aucune actualité</h3>
          <p className="text-slate-500">Il n'y a pas encore d'actualités officielles.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {officialNews.map((news, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={news.id}
              className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <img 
                  src={news.authorPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${news.authorUid}`}
                  alt={news.authorName}
                  className="w-10 h-10 rounded-full object-cover cursor-pointer border border-slate-200"
                  onClick={() => onViewProfile?.(news.authorUid)}
                />
                <div>
                  <h4 className="font-semibold text-slate-900 cursor-pointer hover:underline hover:text-[#1EBA64] flex items-center gap-1" onClick={() => onViewProfile?.(news.authorUid)}>
                    {news.authorName}
                    <svg className="w-4 h-4 text-blue-500 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm-1.06 14.86l-4.14-4.13 1.41-1.42 2.73 2.72 6.03-6.02 1.41 1.41-7.44 7.44z" />
                    </svg>
                  </h4>
                  <p className="text-xs text-slate-500">
                    {news.createdAt ? formatDistanceToNow(new Date(news.createdAt), { addSuffix: true, locale: fr }) : 'Récemment'}
                  </p>
                </div>
              </div>
              <p className="text-slate-800 text-sm whitespace-pre-wrap">{news.content}</p>
              {news.imageUrl && (
                <div className="mt-2 rounded-lg overflow-hidden border border-slate-100">
                  <img src={news.imageUrl} alt="Actualité" className="w-full h-auto object-cover max-h-[300px]" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
