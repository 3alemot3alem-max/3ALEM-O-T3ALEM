import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
try {
  const serviceAccountPath = path.join(process.cwd(), 'service-account.json');
  const fs = require('fs');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin SDK initialized");
  } else {
    console.warn("service-account.json not found, Firebase Admin features will not work");
  }
} catch (error) {
  console.error("Failed to initialize Firebase Admin SDK", error);
}

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

  app.post('/api/notifications/send', async (req, res) => {
    const { token, title, body, data } = req.body;
    
    if (!token || !title || !body) {
      return res.status(400).json({ error: 'Missing required parameters (token, title, body)' });
    }

    try {
      const message = {
        notification: {
          title: title,
          body: body
        },
        data: data || {},
        token: token
      };

      const response = await admin.messaging().send(message);
      res.json({ success: true, messageId: response });
    } catch (error: any) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: error.message });
    }
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
