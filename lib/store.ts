"use client";

import { Session, Question, Reponse, Feedback } from "./types";

/**
 * Couche d'accès aux données.
 *
 * Pour le MVP, tout est persisté dans localStorage afin que l'app soit
 * utilisable immédiatement sans configurer Supabase. Chaque fonction
 * correspond à une table du modèle de données du cahier des charges
 * (sessions / questions / reponses / feedbacks), donc le passage à
 * Supabase plus tard consiste à remplacer le corps de ces fonctions par
 * des appels `supabase.from(...)`, sans toucher aux composants qui les
 * appellent.
 */

const KEYS = {
  sessions: "vistoprep:sessions",
  questions: "vistoprep:questions",
  reponses: "vistoprep:reponses",
  feedbacks: "vistoprep:feedbacks",
};

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function write<T>(key: string, items: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(items));
}

function uid() {
  return crypto.randomUUID();
}

// --- Sessions ---

export function listSessions(): Session[] {
  return read<Session>(KEYS.sessions).sort((a, b) =>
    b.creeLe.localeCompare(a.creeLe)
  );
}

export function getSession(id: string): Session | undefined {
  return read<Session>(KEYS.sessions).find((s) => s.id === id);
}

export function createSession(
  type: Session["type"],
  contexteSource: string
): Session {
  const session: Session = {
    id: uid(),
    type,
    contexteSource,
    creeLe: new Date().toISOString(),
  };
  const all = read<Session>(KEYS.sessions);
  all.push(session);
  write(KEYS.sessions, all);
  return session;
}

// --- Questions ---

export function getQuestions(sessionId: string): Question[] {
  return read<Question>(KEYS.questions)
    .filter((q) => q.sessionId === sessionId)
    .sort((a, b) => a.ordre - b.ordre);
}

export function saveQuestions(
  sessionId: string,
  items: { contenu: string; theme: Question["theme"] }[]
): Question[] {
  const questions: Question[] = items.map((item, i) => ({
    id: uid(),
    sessionId,
    contenu: item.contenu,
    theme: item.theme,
    ordre: i,
  }));
  const all = read<Question>(KEYS.questions);
  write(KEYS.questions, [...all, ...questions]);
  return questions;
}

// --- Réponses ---

export function getReponse(questionId: string): Reponse | undefined {
  return read<Reponse>(KEYS.reponses).find((r) => r.questionId === questionId);
}

export function getReponsesForSession(sessionId: string, questionIds: string[]): Reponse[] {
  return read<Reponse>(KEYS.reponses).filter((r) =>
    questionIds.includes(r.questionId)
  );
}

export function saveReponse(
  questionId: string,
  data: Partial<Omit<Reponse, "id" | "questionId">>
): Reponse {
  const all = read<Reponse>(KEYS.reponses);
  const existingIdx = all.findIndex((r) => r.questionId === questionId);
  if (existingIdx >= 0) {
    all[existingIdx] = { ...all[existingIdx], ...data };
    write(KEYS.reponses, all);
    return all[existingIdx];
  }
  const reponse: Reponse = {
    id: uid(),
    questionId,
    type: data.type ?? "ecrit",
    ...data,
  };
  all.push(reponse);
  write(KEYS.reponses, all);
  return reponse;
}

// --- Feedbacks ---

export function getFeedback(reponseId: string): Feedback | undefined {
  return read<Feedback>(KEYS.feedbacks).find((f) => f.reponseId === reponseId);
}

export function saveFeedback(
  reponseId: string,
  data: Omit<Feedback, "id" | "reponseId">
): Feedback {
  const all = read<Feedback>(KEYS.feedbacks);
  const existingIdx = all.findIndex((f) => f.reponseId === reponseId);
  const feedback: Feedback = { id: uid(), reponseId, ...data };
  if (existingIdx >= 0) {
    all[existingIdx] = feedback;
  } else {
    all.push(feedback);
  }
  write(KEYS.feedbacks, all);
  return feedback;
}
