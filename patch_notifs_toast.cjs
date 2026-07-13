const fs = require('fs');
let code = fs.readFileSync('src/useNotifications.ts', 'utf8');

const toastImport = "import toast from 'react-hot-toast';\n";

if (!code.includes("import toast")) {
  code = code.replace(
    "import { useAuth } from './AuthContext';",
    "import { useAuth } from './AuthContext';\n" + toastImport
  );
}

const soundAndToast = `
            if (notif.senderId !== user.uid) {
              // In-app toast
              toast('Vérifiez votre boîte de notifications, quelqu\\'un a réagi à votre activité !', {
                icon: '🔔',
              });

              // Notification API (Browser)
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('3alem o t3alem', {
                  body: 'Vérifiez votre boîte de notifications, quelqu\\'un a réagi à votre activité.',
                  icon: '/favicon.png'
                });
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
`;

code = code.replace(
/if \(notif\.senderId !== user\.uid\) \{[\s\S]*?\}\s*\}\s*\}/,
soundAndToast + "\n          }\n        }"
);

fs.writeFileSync('src/useNotifications.ts', code);
