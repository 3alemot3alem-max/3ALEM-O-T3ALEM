import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing large bodies (for file uploads in AI chat)
  app.use(express.json({ limit: '10mb' }));
  app.use(cors());

  // API routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Serve firebase-messaging-sw.js dynamically to inject config
  app.get('/firebase-messaging-sw.js', (req, res) => {
    try {
      const fs = require('fs');
      const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
      if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configContent);
        res.type('application/javascript');
        res.send(`
          importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
          importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');
          firebase.initializeApp(${JSON.stringify(config)});
          const messaging = firebase.messaging();
          messaging.onBackgroundMessage((payload) => {
            const notificationTitle = payload.notification?.title || 'Nouvelle notification 3alem O T3alem';
            const notificationOptions = {
              body: payload.notification?.body,
              icon: 'https://api.dicebear.com/7.x/initials/svg?seed=3A&backgroundColor=1aa653',
              badge: 'https://api.dicebear.com/7.x/initials/svg?seed=3A&backgroundColor=1aa653'
            };
            self.registration.showNotification(notificationTitle, notificationOptions);
          });
        `);
      } else {
        res.status(404).send('Config not found');
      }
    } catch (e) {
      console.error(e);
      res.status(500).send('Error loading config');
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
