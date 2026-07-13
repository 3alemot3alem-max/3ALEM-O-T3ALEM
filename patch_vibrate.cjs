const fs = require('fs');
let code = fs.readFileSync('src/useNotifications.ts', 'utf8');

code = code.replace(
`                    registration.showNotification('3alem o t3alem', {
                      body: "Vérifiez votre boîte de notifications, quelqu'un a réagi à votre activité.",
                      icon: '/favicon.png',
                      vibrate: [200, 100, 200, 100, 200, 100, 200],
                      tag: 'interaction',
                      data: { url: window.location.origin }
                    });`,
`                    registration.showNotification('3alem o t3alem', {
                      body: "Vérifiez votre boîte de notifications, quelqu'un a réagi à votre activité.",
                      icon: '/favicon.png',
                      vibrate: [200, 100, 200, 100, 200, 100, 200],
                      tag: 'interaction',
                      data: { url: window.location.origin }
                    } as any);`
);

fs.writeFileSync('src/useNotifications.ts', code);
