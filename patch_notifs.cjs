const fs = require('fs');
let code = fs.readFileSync('src/components/Notifications.tsx', 'utf8');

const newCode = code.replace(
`    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification)));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    });

    return () => unsubscribe();`,
`    const qUser = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const qAll = query(
      collection(db, 'notifications'),
      where('recipientId', '==', 'all'),
      orderBy('createdAt', 'desc')
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
    };`
);

fs.writeFileSync('src/components/Notifications.tsx', newCode);
