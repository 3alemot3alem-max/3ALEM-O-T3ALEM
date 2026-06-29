import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Initialize Firebase Admin SDK
try {
  const serviceAccountPath = path.join(process.cwd(), 'service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log("Firebase Admin SDK initialized from file");
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      })
    });
    console.log("Firebase Admin SDK initialized from environment variables");
  } else {
    console.warn("service-account.json and Firebase ENV vars not found, Firebase Admin features will not work");
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

      const response = await getMessaging().send(message);
      res.json({ success: true, messageId: response });
    } catch (error: any) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const systemInstruction = `Tu es un assistant IA éducatif marocain. Tu es basé exclusivement sur le cadre référentiel marocain de l'éducation (Minstère de l'Éducation Nationale). Tu dois uniquement répondre aux questions éducatives et d'apprentissage des élèves marocains. Si la question n'est pas éducative, tu dois poliment refuser de répondre et rappeler ton rôle. Réponds toujours en français ou en arabe de manière polie et pédagogique.`;

      const chat = ai.chats.create({
        model: 'gemini-3.5-flash',
        config: {
          systemInstruction: systemInstruction,
        }
      });

      if (history && Array.isArray(history) && history.length > 0) {
        // Since ai.chats.create doesn't natively accept history in this SDK version as simply, 
        // we might just format a string or let's check if the SDK supports history
      }

      // We'll just pass the whole context as a formatted string if needed or rely on single message for simplicity
      // But let's construct the conversation context
      let promptContext = '';
      if (history && history.length > 0) {
          promptContext = history.map((msg: any) => `${msg.role === 'user' ? 'Étudiant' : 'Assistant IA'}: ${msg.content}`).join('\\n') + '\\nÉtudiant: ' + message;
      } else {
          promptContext = message;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptContext,
        config: {
          systemInstruction: systemInstruction,
        }
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error('Error in AI chat:', error);
      res.status(500).json({ error: error.message || 'An error occurred during AI chat' });
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
