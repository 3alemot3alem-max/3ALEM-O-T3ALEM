import { getGeminiResponse } from '../src/services/geminiService';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history, profile, mode, fileData } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Clé API Gemini non configurée sur le serveur." });
  }

  try {
    const response = await getGeminiResponse(message, history, profile, mode, fileData);
    return res.status(200).json({ response });
  } catch (error: any) {
    console.error('Vercel AI Route Error:', error);
    return res.status(500).json({ error: error.message || "Erreur serveur" });
  }
}
