"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { QuestionCard } from "@/components/QuestionCard";
import { ProgressPath, NodeStatus } from "@/components/ProgressPath";
import { SessionCompleteNote } from "@/components/SessionCompleteNote";
import { SessionReviewPanel } from "@/components/SessionReviewPanel";
import {
  getSession,
  getQuestions,
  getReponsesForSession,
  getFeedback,
  getSessionReview,
  saveSessionReview,
  getCVAnalysis,
} from "@/lib/store";
import Link from "next/link";
import { Question, Reponse, Session, SessionReview, SESSION_TYPE_LABELS } from "@/lib/types";

export default function SessionPage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [reponses, setReponses] = useState<Reponse[]>([]);
  const [statuses, setStatuses] = useState<NodeStatus[]>([]);
  const [review, setReview] = useState<SessionReview | null>(null);
  const [generatingReview, setGeneratingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [hasCVAnalysis, setHasCVAnalysis] = useState(false);

  useEffect(() => {
    const s = getSession(params.id);
    setSession(s ?? null);
    if (!s) return;

    const qs = getQuestions(params.id);
    setQuestions(qs);

    const rs = getReponsesForSession(
      params.id,
      qs.map((q) => q.id)
    );
    setReponses(rs);

    const computed = qs.map((q): NodeStatus => {
      const reponse = rs.find((r) => r.questionId === q.id);
      if (!reponse) return "a-faire";
      const feedback = getFeedback(reponse.id);
      return feedback ? "fait" : "en-attente";
    });
    setStatuses(computed);
    setReview(getSessionReview(params.id) ?? null);
    setHasCVAnalysis(!!getCVAnalysis(params.id));
  }, [params.id]);

  if (session === null) notFound();
  if (session === undefined) return null;

  const allDone = statuses.length > 0 && statuses.every((s) => s === "fait");

  async function handleGenerateReview() {
    if (!session) return;
    setGeneratingReview(true);
    setReviewError(null);

    const items = questions
      .map((q) => {
        const r = reponses.find((rep) => rep.questionId === q.id);
        const contenu = r?.contenuTexte ?? r?.transcription ?? "";
        return { question: q.contenu, reponse: contenu };
      })
      .filter((it) => it.reponse.trim().length > 0);

    try {
      const res = await fetch("/api/session-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: session.type, items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue.");

      const saved = saveSessionReview(session.id, data.review);
      setReview(saved);
    } catch (err) {
      setReviewError(
        err instanceof Error ? err.message : "Erreur lors de la génération de l'avis."
      );
    } finally {
      setGeneratingReview(false);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <p className="font-mono text-xs uppercase tracking-wide text-blue-soft">
          {SESSION_TYPE_LABELS[session.type]}
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-blue-deep">
          Tes questions
        </h1>

        <Link
          href={`/session/${session.id}/cv`}
          className="mt-6 flex items-center justify-between rounded-card border border-structural2 bg-white p-4 shadow-card transition hover:border-blue-soft"
        >
          <div>
            <span className="font-display text-sm font-semibold text-blue-deep">
              Analyse de CV
            </span>
            <p className="mt-1 text-sm text-ink/70">
              Comment présenter chaque expérience à l&apos;oral
            </p>
          </div>
          <span className="font-mono text-[11px] uppercase tracking-wide text-blue-soft">
            {hasCVAnalysis ? "Consulter" : "À faire"}
          </span>
        </Link>

        {statuses.length > 0 && (
          <div className="mt-6">
            <ProgressPath statuses={statuses} />
          </div>
        )}

        {allDone && (
          <div className="mt-6 space-y-4">
            <SessionCompleteNote type={session.type} total={statuses.length} />

            {review ? (
              <SessionReviewPanel review={review} />
            ) : (
              <div className="rounded-card border border-structural2 bg-white p-4">
                <p className="text-sm text-ink/70">
                  Envie d&apos;un avis d&apos;ensemble sur cette session, au-delà du
                  retour question par question ?
                </p>
                {reviewError && (
                  <p className="mt-2 text-xs text-amber-deep">{reviewError}</p>
                )}
                <button
                  type="button"
                  onClick={handleGenerateReview}
                  disabled={generatingReview}
                  className="mt-3 rounded-full bg-blue-deep px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-mid disabled:opacity-50"
                >
                  {generatingReview ? "Analyse de la session…" : "Générer l'avis global"}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 space-y-3">
          {questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              sessionId={session.id}
              question={q}
              index={i}
              status={statuses[i] ?? "a-faire"}
            />
          ))}
        </div>
      </main>
    </>
  );
}
