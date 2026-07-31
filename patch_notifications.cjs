const fs = require('fs');

// 1. types.ts
let types = fs.readFileSync('src/types.ts', 'utf8');
types = types.replace('read: boolean;', 'read: boolean;\n  readBy?: string[];');
fs.writeFileSync('src/types.ts', types);

// 2. Notifications.tsx
let notifs = fs.readFileSync('src/components/Notifications.tsx', 'utf8');

// Add arrayUnion to imports
notifs = notifs.replace(
  "import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';",
  "import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, writeBatch, arrayUnion } from 'firebase/firestore';"
);

// We need to implement isRead helper
notifs = notifs.replace(
  "  const { user } = useAuth();",
  "  const { user } = useAuth();\n  const isRead = (notification: AppNotification) => notification.recipientId === 'all' ? (notification.readBy || []).includes(user?.uid || '') : notification.read;"
);

// update markAsRead
const oldMarkAsRead = `  const markAsRead = async (notificationId: string, recipientId: string) => {
    if (recipientId === 'all') return;
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };`;

const newMarkAsRead = `  const markAsRead = async (notificationId: string, recipientId: string) => {
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
  };`;
notifs = notifs.replace(oldMarkAsRead, newMarkAsRead);

// update markAllAsRead
const oldMarkAll = `  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      notifications.filter(n => !n.read && n.recipientId !== 'all').forEach(n => {
        batch.update(doc(db, 'notifications', n.id), { read: true });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };`;

const newMarkAll = `  const markAllAsRead = async () => {
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
  };`;
notifs = notifs.replace(oldMarkAll, newMarkAll);

// update unreadCount
notifs = notifs.replace(
  "const unreadCount = notifications.filter(n => !n.read).length;",
  "const unreadCount = notifications.filter(n => !isRead(n)).length;"
);

// update mapping inside render (notification.read -> isRead(notification))
// replace ALL \`!notification.read\` with \`!isRead(notification)\`
notifs = notifs.replace(/!notification\.read/g, '!isRead(notification)');
notifs = notifs.replace(/notification\.read \?/g, 'isRead(notification) ?');

fs.writeFileSync('src/components/Notifications.tsx', notifs);

// 3. useNotifications.ts
let useNotifs = fs.readFileSync('src/useNotifications.ts', 'utf8');

// remove where('read', '==', false) from qAll
useNotifs = useNotifs.replace(
  "const qAll = query(collection(db, 'notifications'), where('recipientId', '==', 'all'), where('read', '==', false));",
  "const qAll = query(collection(db, 'notifications'), where('recipientId', '==', 'all'));"
);

// update handleSnapshot
const oldAllUnread = "allUnread = snapshot.docs.length;";
const newAllUnread = "allUnread = snapshot.docs.filter((d: any) => !(d.data().readBy || []).includes(user.uid)).length;";
useNotifs = useNotifs.replace(oldAllUnread, newAllUnread);

fs.writeFileSync('src/useNotifications.ts', useNotifs);

