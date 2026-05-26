import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
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

  app.post('/api/ai', async (req, res) => {
    const { message, history, profile, mode, fileData } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Clé API Gemini non configurée sur le serveur." });
    }

    try {
      const { getGeminiResponse } = await import('./src/services/geminiService.js');
      // Note: We need to handle the import carefully since it's a TS file being imported in server.ts (running via tsx)
      // Actually, since we use tsx, we can just import it.
      // But geminiService.ts might have client-only imports or logic?
      // It imports GoogleGenAI which works on both.
      
      const response = await getGeminiResponse(message, history, profile, mode, fileData);
      res.json({ response });
    } catch (error: any) {
      console.error('AI Route Error:', error);
      res.status(500).json({ error: error.message || "Erreur lors de la génération de la réponse." });
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
