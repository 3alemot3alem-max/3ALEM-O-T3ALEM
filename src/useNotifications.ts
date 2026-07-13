import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { AppNotification } from './types';
import { useAuth } from './AuthContext';

export function useNotifications() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    const qUser = query(collection(db, 'notifications'), where('recipientId', '==', user.uid), where('read', '==', false));
    const qAll = query(collection(db, 'notifications'), where('recipientId', '==', 'all'), where('read', '==', false));

    let userUnread = 0;
    let allUnread = 0;
    let userInitialized = false;
    let allInitialized = false;

    const updateCount = () => {
      setUnreadCount(userUnread + allUnread);
    };

    const handleSnapshot = (snapshot: any, isAll: boolean) => {
      const isInitialized = isAll ? allInitialized : userInitialized;
      
      if (isInitialized) {
        snapshot.docChanges().forEach((change: any) => {
          if (change.type === 'added') {
            const notif = change.doc.data() as AppNotification;
            if (notif.senderId !== user.uid) {
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('3alem o t3alem', {
                  body: 'Vérifiez votre boîte de notifications, quelqu\'un a réagi à votre activité.',
                  icon: '/favicon.png'
                });
              } else if ('Notification' in window && Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                    new Notification('3alem o t3alem', {
                      body: 'Vérifiez votre boîte de notifications, quelqu\'un a réagi à votre activité.',
                      icon: '/favicon.png'
                    });
                  }
                });
              }
            }
          }
        });
      }

      if (isAll) {
        allUnread = snapshot.docs.length;
        allInitialized = true;
      } else {
        userUnread = snapshot.docs.length;
        userInitialized = true;
      }
      
      updateCount();
    };

    const unsubUser = onSnapshot(qUser, (snapshot) => handleSnapshot(snapshot, false));
    const unsubAll = onSnapshot(qAll, (snapshot) => handleSnapshot(snapshot, true));

    return () => {
      unsubUser();
      unsubAll();
    };
  }, [user]);

  return { unreadCount };
}
