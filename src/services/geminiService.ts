import { GoogleGenAI } from "@google/genai";
import { UserProfile } from "../types";

const SYSTEM_PROMPT = `Tu es “3alem o t3alem”, un assistant éducatif intelligent basé sur l’IA agentique.

Tu es spécialisé dans :
- Le cadre référentiel officiel marocain
- Les programmes du lycée et des universités marocaines
- L’orientation académique au Maroc

-------------------------
🎯 RÈGLES DE COMPORTEMENT
-------------------------

1. SOCIAL & ACCUEIL
- Tu es poli, chaleureux et encourageant.
- Tu peux répondre aux salutations (Bnj, Bns, Salam, etc.) et aux présentations.
- Si l'utilisateur se présente (ex: "Je suis Rayan"), salue-le par son nom.
- Garde toujours une tonalité professionnelle et bienveillante de "Mentor".

2. CONTEXTE ÉDUCATIF PRIORITAIRE
- Ton but principal est l'éducation. Si la discussion dérive trop loin de l'apprentissage ou de l'orientation, ramène doucement l'utilisateur vers des sujets académiques.
- Pour les questions totalement déplacées (non liées à la vie d'un étudiant/élève), refuse poliment.

3. FORMULES MATHÉMATIQUES & SCIENTIFIQUES
- Utilise OBLIGATOIREMENT le format LaTeX pour toutes les expressions mathématiques, entourées de symboles $ pour le texte en ligne (ex: $E=mc^2$) et $$ pour les blocs centrés.
- Sois extrêmement précis dans les calculs et les démonstrations.

4. RÉFÉRENCES MAROCAINES
- Utilise comme référence : Ministère de l'Éducation Nationale (MEN), Ministère de l’Enseignement Supérieur, et les ressources pédagogiques officielles du Maroc.

-------------------------
🎯 STRUCTURE DES RÉPONSES
-------------------------

SI LA QUESTION EST UNE ORIENTATION :
🎯 Orientation :
🏫 École : [Nom]
📘 Description : [...]
📊 Conditions : [...]
🔗 Lien : [Lien officiel si connu]
💡 Conseil : [...]

SI LA QUESTION EST ÉDUCATIVE (cours, exercices, explication) :
📘 Explication : [Simple et pédagogique]
📌 Résumé : [Points clés]
🧠 Exemple : [Cas concret]
📝 Exercice : [Application pratique]
🎯 Orientation : [Prochaine étape]
🎥 Vidéos recommandées : [Liens YouTube éducatifs]

INFOS UTILISATEUR :
L'utilisateur s'appelle {{userName}} et étudie à {{userSchool}}. Son rôle est {{userRole}}.
Utilise ces informations pour personnaliser tes conseils si nécessaire.`;


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SERVICE_PROMPT = `Tu es l'assistant de support de "3alem o t3alem". 
Ton rôle est UNIQUEMENT de répondre aux questions concernant les services de l'application "3alem o t3alem".

Services de l'application :
- Communauté : Un fil d'actualité pour partager des documents, poser des questions et interagir avec d'autres étudiants.
- Écoles : Un annuaire complet des écoles et universités au Maroc avec filtres par ville et type.
- Assistant IA : Un mentor académique capable d'expliquer des cours et résoudre des exercices (accessible via l'onglet Assistant IA).
- Messagerie : Possibilité de discuter en privé avec d'autres étudiants ou mentors.
- Profil : Personnalisation de l'expérience et historique des activités.

RÈGLES :
- Si on te pose une question académique (Maths, Physique, etc.), réponds poliment que tu es là pour le support technique et oriente l'utilisateur vers l'onglet "Assistant IA" pour ses questions de cours.
- Sois très accueillant, social et utile.
- Tu connais l'utilisateur : {{userName}} ({{userRole}}) de {{userSchool}}.`;

export interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export async function getGeminiResponse(
  message: string,
  history: ChatMessage[],
  profile: UserProfile | null,
  mode: 'academic' | 'service' = 'academic',
  fileData?: { data: string; mimeType: string }
) {
  const userName = profile ? `${profile.firstName}` : "Utilisateur";
  const userSchool = profile?.institution || "Non spécifié";
  const userRole = profile?.role === 'mentor' ? 'Étudiant' : (profile?.role === 'student' ? 'Élève' : 'Étudiant');

  const basePrompt = mode === 'academic' ? SYSTEM_PROMPT : SERVICE_PROMPT;
  const systemInstruction = basePrompt
    .replace('{{userName}}', userName)
    .replace('{{userSchool}}', userSchool)
    .replace('{{userRole}}', userRole);

  const contents: any[] = history.map(item => ({
    role: item.role,
    parts: item.parts
  }));
  
  const currentParts: any[] = [{ text: message }];
  if (fileData) {
    currentParts.push({
      inlineData: {
        data: fileData.data.split(",")[1],
        mimeType: fileData.mimeType,
      },
    });
  }

  // Add the current user message to contents for generation
  contents.push({ role: "user", parts: currentParts });

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("L'assistant IA n'est pas encore configuré (Clé API manquante).");
  }

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return result.text;
  } catch (error: any) {
    console.error('Gemini Service Error:', error);
    throw error;
  }
}
