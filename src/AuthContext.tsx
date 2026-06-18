import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, messaging } from './firebase';
import { onMessage } from 'firebase/messaging';
import { UserProfile } from './types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthReady: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAuthReady: false,
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthReady(true);
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          if (data.email === '3alemot3alem@gmail.com' && data.role !== 'admin') {
            import('firebase/firestore').then(({ updateDoc }) => {
               updateDoc(doc(db, 'users', user.uid), { role: 'admin' });
            });
            data.role = 'admin';
          }
          setProfile(data);
        } else {
          setProfile(null);
        }
        setLoading(false);
        setIsAuthReady(true);
      }, (error) => {
        console.error("Profile fetch error:", error);
        setLoading(false);
        setIsAuthReady(true);
      });
      return () => unsubscribeProfile();
    }
  }, [user]);

  useEffect(() => {
    const setupMessaging = async () => {
      try {
        const msg = await messaging();
        if (msg) {
          onMessage(msg, (payload) => {
            console.log('Received foreground message', payload);
            if (payload.notification) {
              // Custom toast or browser notification via simple alert when in app
               alert(`NOUVELLE NOTIFICATION: ${payload.notification.title}\n${payload.notification.body}`);
            }
          });
        }
      } catch (err) {
        console.error("Foreground message error:", err);
      }
    };
    setupMessaging();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAuthReady, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
