import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { AppNotification } from './types';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

export function useNotifications() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    const qUser = query(collection(db, 'notifications'), where('recipientId', '==', user.uid), where('read', '==', false));
    const qAll = query(collection(db, 'notifications'), where('recipientId', '==', 'all'));

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
              // In-app toast
              toast("Vérifiez votre boîte de notifications, quelqu'un a réagi à votre activité !", {
                icon: '🔔',
              });


              // Notification API (Browser)
              if ('Notification' in window && Notification.permission === 'granted') {
                if (navigator.serviceWorker) {
                  navigator.serviceWorker.ready.then((registration) => {
                    registration.showNotification('3alem o t3alem', {
                      body: "Vérifiez votre boîte de notifications, quelqu'un a réagi à votre activité.",
                      icon: '/favicon.png',
                      vibrate: [200, 100, 200, 100, 200, 100, 200],
                      tag: 'interaction',
                      data: { url: window.location.origin + '?tab=notifications' }
                    } as any);
                  });
                } else {
                  new Notification('3alem o t3alem', {
                    body: "Vérifiez votre boîte de notifications, quelqu'un a réagi à votre activité.",
                    icon: '/favicon.png'
                  });
                }
              }

              // Jouer un son simple
              try {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
                oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1); // A5
                
                gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
                
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 0.3);
              } catch (e) {
                console.error("Audio error", e);
              }
            }
          }
        });
      }

      if (isAll) {
        allUnread = snapshot.docs.filter((d: any) => !(d.data().readBy || []).includes(user.uid)).length;
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
