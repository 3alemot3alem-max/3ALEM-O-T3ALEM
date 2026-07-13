importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

const firebaseConfig = {
  "projectId": "gen-lang-client-0504001153",
  "appId": "1:171003070112:web:f415a4c10644c833cbabc5",
  "apiKey": "AIzaSyAxjeqww5jhb4N_zLvlkPPYI8PYIxKStdU",
  "authDomain": "gen-lang-client-0504001153.firebaseapp.com",
  "firestoreDatabaseId": "ai-studio-9fd24213-c9b8-4b70-a8ec-b887617340ae",
  "storageBucket": "gen-lang-client-0504001153.firebasestorage.app",
  "messagingSenderId": "171003070112"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'Nouvelle notification';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: 'https://api.dicebear.com/7.x/initials/svg?seed=3A&backgroundColor=1aa653',
    badge: 'https://api.dicebear.com/7.x/initials/svg?seed=3A&backgroundColor=1aa653'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const urlToOpen = (event.notification.data && event.notification.data.url) ? event.notification.data.url : self.location.origin;
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
