export type SessionType = "entretien" | "soutenance" | "oral";

export type Theme = "technique" | "comportemental" | "motivation";

export type ReponseType = "ecrit" | "oral";

export interface Session {
  id: string;
  type: SessionType;
  contexteSource: string;
  creeLe: string; // ISO date
}

export interface Question {
  id: string;
  sessionId: string;
  contenu: string;
  theme: Theme;
  ordre: number;
}

export interface Reponse {
  id: string;
  questionId: string;
  type: ReponseType;
  contenuTexte?: string;
  urlAudio?: string;
  transcription?: string;
}

export interface Feedback {
  id: string;
  reponseId: string;
  clarte: string;
  structure: string;
  pointsACreuser: string;
  exempleReponse: string;
}

export const THEME_LABELS: Record<Theme, string> = {
  technique: "Technique",
  comportemental: "Comportemental",
  motivation: "Motivation",
};

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  entretien: "Entretien d'embauche",
  soutenance: "Soutenance",
  oral: "Oral / concours",
};
