const fs = require('fs');
let code = fs.readFileSync('src/components/Notifications.tsx', 'utf8');

code = code.replace(
`  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });`,
`  const markAsRead = async (notificationId: string, recipientId: string) => {
    if (recipientId === 'all') return;
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });`
);

code = code.replace(
`onClick={() => !notification.read && markAsRead(notification.id)}`,
`onClick={() => !notification.read && markAsRead(notification.id, notification.recipientId)}`
);

code = code.replace(
`                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notification.id);
                  }}`,
`                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notification.id, notification.recipientId);
                  }}`
);

code = code.replace(
`notifications.filter(n => !n.read).forEach(n => {`,
`notifications.filter(n => !n.read && n.recipientId !== 'all').forEach(n => {`
);

fs.writeFileSync('src/components/Notifications.tsx', code);
