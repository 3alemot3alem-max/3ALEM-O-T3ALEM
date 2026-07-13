const fs = require('fs');
let code = fs.readFileSync('src/useNotifications.ts', 'utf8');

const swNotification = `
              // Notification API (Browser)
              if ('Notification' in window && Notification.permission === 'granted') {
                if (navigator.serviceWorker) {
                  navigator.serviceWorker.ready.then((registration) => {
                    registration.showNotification('3alem o t3alem', {
                      body: "Vérifiez votre boîte de notifications, quelqu'un a réagi à votre activité.",
                      icon: '/favicon.png',
                      vibrate: [200, 100, 200, 100, 200, 100, 200],
                      tag: 'interaction',
                      data: { url: window.location.origin }
                    });
                  });
                } else {
                  new Notification('3alem o t3alem', {
                    body: "Vérifiez votre boîte de notifications, quelqu'un a réagi à votre activité.",
                    icon: '/favicon.png'
                  });
                }
              }
`;

code = code.replace(
/              \/\/ Notification API \(Browser\)[\s\S]*?              \/\/ Jouer un son simple/,
swNotification + "\n              // Jouer un son simple"
);

fs.writeFileSync('src/useNotifications.ts', code);
