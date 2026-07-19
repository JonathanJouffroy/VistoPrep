import Groq from "groq-sdk";
import { SessionType, Theme } from "./types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const QUESTION_MODEL = "llama-3.3-70b-versatile";
const TRANSCRIPTION_MODEL = "whisper-large-v3-turbo";

export interface GeneratedQuestion {
  contenu: string;
  theme: Theme;
}

/**
 * Génère 8 à 12 questions probables à partir du contexte fourni
 * (offre d'emploi, sujet de soutenance, description libre).
 */
export async function generateQuestions(
  type: SessionType,
  contexte: string
): Promise<GeneratedQuestion[]> {
  const typeLabel =
    type === "entretien"
      ? "un entretien d'embauche"
      : type === "soutenance"
      ? "une soutenance de mémoire ou de thèse"
      : "un oral d'école ou de concours";

  const systemPrompt = `Tu es un préparateur d'oraux expérimenté. Tu génères des questions probables et réalistes pour ${typeLabel}, à partir du contexte fourni par l'utilisateur.

Règles :
- Génère entre 8 et 12 questions.
- Classe chaque question dans un thème parmi : "technique", "comportemental", "motivation".
- Les questions doivent être concrètes et spécifiques au contexte fourni, pas génériques.
- Réponds UNIQUEMENT avec un tableau JSON valide, sans texte avant ou après, au format :
[{"contenu": "...", "theme": "technique"}, ...]`;

  const completion = await groq.chat.completions.create({
    model: QUESTION_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: contexte },
    ],
    temperature: 0.6,
  });

  const raw = completion.choices[0]?.message?.content ?? "[]";
  return parseJsonArray<GeneratedQuestion>(raw);
}

export interface GeneratedFeedback {
  clarte: string;
  structure: string;
  pointsACreuser: string;
}

/**
 * Retour structuré sur une réponse, calibré pour être constructif sans
 * être complaisant ni décourageant (cf. point d'attention #8 du CDC).
 */
export async function generateFeedback(
  question: string,
  reponse: string
): Promise<GeneratedFeedback> {
  const systemPrompt = `Tu es un coach de préparation aux oraux, bienveillant mais exigeant. Tu donnes un retour structuré sur une réponse à une question d'entretien ou de soutenance.

Règles :
- Pas de note chiffrée, pas de jugement global. Le retour porte sur le fond, pas sur la personne.
- Sois concret : chaque axe doit s'appuyer sur ce qui a été effectivement dit, pas des généralités.
- Reste constructif sans être complaisant : si la réponse est faible, dis-le clairement mais avec des pistes d'amélioration concrètes.
- Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ou après, au format :
{"clarte": "...", "structure": "...", "pointsACreuser": "..."}

Les trois axes :
- clarte : le propos est-il compréhensible, direct, sans détour inutile ?
- structure : la réponse a-t-elle une progression logique (ex. situation → action → résultat) ?
- pointsACreuser : ce qui manque ou mériterait d'être creusé pour une réponse plus convaincante.`;

  const completion = await groq.chat.completions.create({
    model: QUESTION_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Question posée : ${question}\n\nRéponse donnée : ${reponse}`,
      },
    ],
    temperature: 0.4,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = parseJsonObject<GeneratedFeedback>(raw);
  return {
    clarte: parsed.clarte ?? "",
    structure: parsed.structure ?? "",
    pointsACreuser: parsed.pointsACreuser ?? "",
  };
}

/**
 * Transcrit un enregistrement audio (réponse orale) via l'API Whisper de Groq.
 */
export async function transcribeAudio(file: File): Promise<string> {
  const transcription = await groq.audio.transcriptions.create({
    file,
    model: TRANSCRIPTION_MODEL,
    language: "fr",
    response_format: "text",
  });
  return typeof transcription === "string"
    ? transcription
    : (transcription as { text: string }).text;
}

function parseJsonArray<T>(raw: string): T[] {
  const cleaned = stripCodeFence(raw);
  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseJsonObject<T>(raw: string): Partial<T> {
  const cleaned = stripCodeFence(raw);
  try {
    return JSON.parse(cleaned) as Partial<T>;
  } catch {
    return {};
  }
}

function stripCodeFence(raw: string): string {
  return raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "");
}
