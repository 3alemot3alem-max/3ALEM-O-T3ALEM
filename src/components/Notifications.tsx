import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, writeBatch, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { AppNotification } from '../types';
import { Bell, MessageSquare, Heart, Share2, Info, Check, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const Notifications: React.FC<{ onViewProfile?: (uid: string) => void }> = ({ onViewProfile }) => {
  const { user } = useAuth();
  const isRead = (notification: AppNotification) => notification.recipientId === 'all' ? (notification.readBy || []).includes(user?.uid || '') : notification.read;
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch notifications where recipient is current user OR 'all'
    // To do this simply without complex indexes, we can just fetch the user's notifications.
    // Official news will be handled by sending 'all' to a separate query or just checking admin posts if needed,
    // but the user requested UNLIKE COMMENT PARTAGE ET ACTUALITE. 
    // We will assume "actualité" notifications are created for all users or just fetched from posts.
    // For simplicity, let's fetch recipientId == user.uid
    const qUser = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid)
    );
    
    const qAll = query(
      collection(db, 'notifications'),
      where('recipientId', '==', 'all')
    );

    let userNotifs: AppNotification[] = [];
    let allNotifs: AppNotification[] = [];

    const mergeNotifs = () => {
      const merged = [...userNotifs, ...allNotifs].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNotifications(merged);
      setLoading(false);
    };

    const unsubUser = onSnapshot(qUser, (snapshot) => {
      userNotifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
      mergeNotifs();
    }, (error) => {
      console.error("Error fetching user notifs:", error);
    });

    const unsubAll = onSnapshot(qAll, (snapshot) => {
      allNotifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
      mergeNotifs();
    }, (error) => {
      console.error("Error fetching all notifs:", error);
    });

    return () => {
      unsubUser();
      unsubAll();
    };
  }, [user]);

  const markAsRead = async (notificationId: string, recipientId: string) => {
    if (!user) return;
    try {
      if (recipientId === 'all') {
        await updateDoc(doc(db, 'notifications', notificationId), {
          readBy: arrayUnion(user.uid)
        });
      } else {
        await updateDoc(doc(db, 'notifications', notificationId), {
          read: true
        });
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      notifications.filter(n => !isRead(n)).forEach(n => {
        if (n.recipientId === 'all') {
          batch.update(doc(db, 'notifications', n.id), { readBy: arrayUnion(user.uid) });
        } else {
          batch.update(doc(db, 'notifications', n.id), { read: true });
        }
      });
      await batch.commit();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-5 h-5 text-red-500 fill-current" />;
      case 'comment': return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'share': return <Share2 className="w-5 h-5 text-green-500" />;
      case 'news': return <Info className="w-5 h-5 text-moroccan-green" />;
      default: return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const getMessage = (notification: AppNotification) => {
    switch (notification.type) {
      case 'like': return `a aimé votre post.`;
      case 'comment': return `a commenté : "${notification.content}"`;
      case 'share': return `a partagé votre post.`;
      case 'news': return `Actualité : ${notification.content}`;
      default: return `nouvelle notification`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-moroccan-green"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !isRead(n)).length;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Bell className="w-8 h-8 text-moroccan-red" />
          Notifications
          {unreadCount > 0 && (
            <span className="bg-moroccan-red text-white text-sm py-1 px-3 rounded-full font-semibold">
              {unreadCount}
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-sm font-semibold text-moroccan-green hover:bg-moroccan-green/10 px-4 py-2 rounded-full transition-colors"
          >
            <CheckCircle2 size={18} />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-slate-100">
          <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Aucune notification</h3>
          <p className="text-slate-500">Vous n'avez pas encore de notifications.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={notification.id}
              className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${
                notification.read 
                  ? 'bg-white border-slate-100' 
                  : 'bg-green-50/50 border-moroccan-green/20 shadow-sm'
              }`}
              onClick={() => !isRead(notification) && markAsRead(notification.id, notification.recipientId)}
            >
              <img 
                src={notification.senderPhoto}
                alt={notification.senderName}
                className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-white cursor-pointer hover:opacity-90"
                onClick={(e) => { e.stopPropagation(); onViewProfile?.(notification.senderId); }}
              />
              <div className="flex-grow">
                <p className="text-slate-800">
                  <span className="font-semibold text-slate-900 cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); onViewProfile?.(notification.senderId); }}>{notification.senderName}</span>
                  {' '}
                  {getMessage(notification)}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-xs font-medium text-slate-500">
                  {getIcon(notification.type)}
                  <span>
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: fr })}
                  </span>
                </div>
              </div>
              {!isRead(notification) && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notification.id, notification.recipientId);
                  }}
                  className="p-2 text-moroccan-green hover:bg-moroccan-green/10 rounded-full transition-colors"
                  title="Marquer comme lu"
                >
                  <Check size={18} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
