"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { AudioRecorder } from "@/components/AudioRecorder";
import { getQuestions, saveReponse, saveFeedback } from "@/lib/store";
import { Question, THEME_LABELS } from "@/lib/types";

type Mode = "ecrit" | "oral";

export default function QuestionPage({
  params,
}: {
  params: { id: string; qid: string };
}) {
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null | undefined>(undefined);
  const [mode, setMode] = useState<Mode>("ecrit");
  const [texte, setTexte] = useState("");
  const [transcription, setTranscription] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const qs = getQuestions(params.id);
    setQuestion(qs.find((q) => q.id === params.qid) ?? null);
  }, [params.id, params.qid]);

  if (question === null) notFound();
  if (question === undefined) return null;

  const contenuFinal = mode === "ecrit" ? texte : transcription ?? "";
  const canSubmit = contenuFinal.trim().length >= 5;

  async function handleSubmit() {
    if (!canSubmit || !question) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.contenu, reponse: contenuFinal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue.");

      const reponse = saveReponse(question.id, {
        type: mode,
        contenuTexte: mode === "ecrit" ? texte : undefined,
        transcription: mode === "oral" ? transcription ?? undefined : undefined,
      });
      saveFeedback(reponse.id, data.feedback);

      router.push(`/session/${params.id}/feedback?q=${question.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <span className="inline-block rounded-full bg-structural px-2 py-0.5 text-xs font-medium text-blue-deep">
          {THEME_LABELS[question.theme]}
        </span>
        <h1 className="mt-3 font-display text-xl font-semibold leading-snug text-ink">
          {question.contenu}
        </h1>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => setMode("ecrit")}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              mode === "ecrit"
                ? "border-blue-deep bg-blue-deep text-white"
                : "border-structural2 bg-white text-ink/70"
            }`}
          >
            Réponse écrite
          </button>
          <button
            type="button"
            onClick={() => setMode("oral")}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              mode === "oral"
                ? "border-blue-deep bg-blue-deep text-white"
                : "border-structural2 bg-white text-ink/70"
            }`}
          >
            Réponse orale
          </button>
        </div>

        <div className="mt-4">
          {mode === "ecrit" ? (
            <textarea
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              placeholder="Prends le temps de structurer ta réponse…"
              rows={10}
              className="w-full resize-none rounded-card border border-structural2 bg-white p-4 text-sm text-ink placeholder:text-ink/40 focus:border-blue-soft"
            />
          ) : (
            <div className="space-y-3">
              <AudioRecorder onTranscribed={setTranscription} />
              {transcription && (
                <div className="rounded-card border border-structural2 bg-white p-4">
                  <p className="font-mono text-[11px] uppercase tracking-wide text-blue-soft">
                    Transcription
                  </p>
                  <p className="mt-1.5 text-sm text-ink">{transcription}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {error && <p className="mt-3 text-xs text-amber-deep">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="mt-6 rounded-full bg-blue-deep px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-mid disabled:opacity-50"
        >
          {submitting ? "Analyse de ta réponse…" : "Recevoir mon retour"}
        </button>
      </main>
    </>
  );
}
