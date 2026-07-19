import Groq from "groq-sdk";
import { SessionType, Theme } from "./types";

const QUESTION_MODEL = "llama-3.3-70b-versatile";
const TRANSCRIPTION_MODEL = "whisper-large-v3-turbo";

// Instancié à la demande plutôt qu'au chargement du module : sinon, le
// build Next.js plante dès que GROQ_API_KEY n'est pas encore définie dans
// l'environnement (ex. avant configuration sur Vercel).
let _groq: Groq | null = null;
function getGroqClient(): Groq {
  if (!_groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error(
        "GROQ_API_KEY n'est pas définie. Ajoute-la dans les variables d'environnement du projet."
      );
    }
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

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

  const completion = await getGroqClient().chat.completions.create({
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
  exempleReponse: string;
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
{"clarte": "...", "structure": "...", "pointsACreuser": "...", "exempleReponse": "..."}

Les axes :
- clarte : le propos est-il compréhensible, direct, sans détour inutile ?
- structure : la réponse a-t-elle une progression logique (ex. situation → action → résultat) ?
- pointsACreuser : ce qui manque ou mériterait d'être creusé pour une réponse plus convaincante.
- exempleReponse : un exemple concret de réponse solide à cette question précise, dans le même contexte que celui de l'utilisateur (même métier, même situation). Ce n'est pas un corrigé unique à réciter, mais une illustration de ce à quoi peut ressembler une bonne réponse — 3 à 5 phrases, rédigée à la première personne.`;

  const completion = await getGroqClient().chat.completions.create({
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
    exempleReponse: parsed.exempleReponse ?? "",
  };
}

/**
 * Transcrit un enregistrement audio (réponse orale) via l'API Whisper de Groq.
 */
export async function transcribeAudio(file: File): Promise<string> {
  const transcription = await getGroqClient().audio.transcriptions.create({
    file,
    model: TRANSCRIPTION_MODEL,
    language: "fr",
    response_format: "text",
  });
  return typeof transcription === "string"
    ? transcription
    : (transcription as { text: string }).text;
}

export interface GeneratedSessionReview {
  pointsForts: string;
  pointsVigilance: string;
  conseilJourJ: string;
}

/**
 * Avis global sur l'ensemble d'une session, une fois toutes les questions
 * traitées. Reste qualitatif (pas de note), et se concentre sur des
 * tendances qui ne ressortent pas d'un feedback question par question.
 */
export async function generateSessionReview(
  type: SessionType,
  items: { question: string; reponse: string }[]
): Promise<GeneratedSessionReview> {
  const typeLabel =
    type === "entretien"
      ? "un entretien d'embauche"
      : type === "soutenance"
      ? "une soutenance de mémoire ou de thèse"
      : "un oral d'école ou de concours";

  const systemPrompt = `Tu es un coach de préparation aux oraux. Tu donnes un avis global sur l'ensemble d'une session d'entraînement pour ${typeLabel}, à partir de toutes les questions et réponses fournies.

Règles :
- Pas de note chiffrée, pas de verdict global du type "prêt / pas prêt". Reste qualitatif et actionnable.
- Base-toi sur des tendances observées à travers plusieurs réponses, pas sur une seule réponse isolée.
- Sois constructif sans être complaisant.
- Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ou après, au format :
{"pointsForts": "...", "pointsVigilance": "...", "conseilJourJ": "..."}

Les axes :
- pointsForts : ce qui revient comme solide à travers plusieurs réponses.
- pointsVigilance : ce qui revient comme fragile ou à travailler à travers plusieurs réponses.
- conseilJourJ : un conseil concret et pratique pour le jour de l'entretien/oral, en lien avec ce qui a été observé.`;

  const transcript = items
    .map((it, i) => `Question ${i + 1} : ${it.question}\nRéponse : ${it.reponse}`)
    .join("\n\n");

  const completion = await getGroqClient().chat.completions.create({
    model: QUESTION_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: transcript },
    ],
    temperature: 0.4,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = parseJsonObject<GeneratedSessionReview>(raw);
  return {
    pointsForts: parsed.pointsForts ?? "",
    pointsVigilance: parsed.pointsVigilance ?? "",
    conseilJourJ: parsed.conseilJourJ ?? "",
  };
}

export interface GeneratedCVExperience {
  titre: string;
  conseil: string;
}

export interface GeneratedCVAnalysis {
  syntheseGlobale: string;
  pointsForts: string;
  experiences: GeneratedCVExperience[];
}

/**
 * Analyse un CV en le mettant en regard du contexte de la session (offre,
 * sujet…), et donne un conseil de présentation orale pour chaque expérience
 * identifiée. Section volontairement distincte du feedback par question.
 */
export async function generateCVAnalysis(
  type: SessionType,
  contexte: string,
  cvTexte: string
): Promise<GeneratedCVAnalysis> {
  const typeLabel =
    type === "entretien"
      ? "un entretien d'embauche"
      : type === "soutenance"
      ? "une soutenance de mémoire ou de thèse"
      : "un oral d'école ou de concours";

  const systemPrompt = `Tu es un coach de préparation aux oraux. On te donne le contexte d'une préparation pour ${typeLabel}, ainsi que le CV de la personne. Ton rôle est d'aider à présenter ce CV à l'oral, pas de le réécrire.

Règles :
- Identifie les expériences clés du CV (postes, stages, projets significatifs, formations pertinentes) — entre 3 et 6 en général.
- Pour chaque expérience, donne un conseil concret sur comment la présenter à l'oral en lien avec le contexte fourni : quoi mettre en avant, quel angle prendre, quel résultat concret citer si le CV en donne un.
- Ne réécris pas le CV, ne liste pas juste ce qu'il contient : donne un vrai conseil de présentation orale.
- Reste constructif et concret, jamais vague ("mets en avant tes compétences" n'est pas un conseil utile).
- Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ou après, au format :
{"syntheseGlobale": "...", "pointsForts": "...", "experiences": [{"titre": "...", "conseil": "..."}]}

Les champs :
- syntheseGlobale : en 2-3 phrases, comment ce profil se positionne par rapport au contexte fourni.
- pointsForts : ce qui ressort comme le plus solide dans ce CV pour ce contexte précis.
- experiences : la liste des expériences avec leur conseil de présentation.`;

  const completion = await getGroqClient().chat.completions.create({
    model: QUESTION_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Contexte de la préparation :\n${contexte}\n\nCV :\n${cvTexte}`,
      },
    ],
    temperature: 0.4,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = parseJsonObject<GeneratedCVAnalysis>(raw);
  return {
    syntheseGlobale: parsed.syntheseGlobale ?? "",
    pointsForts: parsed.pointsForts ?? "",
    experiences: Array.isArray(parsed.experiences) ? parsed.experiences : [],
  };
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
