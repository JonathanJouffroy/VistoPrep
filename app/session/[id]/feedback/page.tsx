"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { getQuestions, getReponse, getFeedback } from "@/lib/store";
import { Feedback, Question } from "@/lib/types";

export default function FeedbackPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const qid = searchParams.get("q");

  const [question, setQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [nextQuestion, setNextQuestion] = useState<Question | null>(null);

  useEffect(() => {
    if (!qid) return;
    const questions = getQuestions(params.id);
    const current = questions.find((q) => q.id === qid) ?? null;
    setQuestion(current);

    if (current) {
      const reponse = getReponse(current.id);
      if (reponse) setFeedback(getFeedback(reponse.id) ?? null);

      const idx = questions.findIndex((q) => q.id === qid);
      setNextQuestion(questions[idx + 1] ?? null);
    }
  }, [params.id, qid]);

  if (!question || !feedback) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-6 py-10">
          <p className="text-sm text-ink/60">Retour introuvable pour cette question.</p>
          <Link
            href={`/session/${params.id}`}
            className="mt-4 inline-block text-sm text-blue-deep underline"
          >
            Retour à la liste des questions
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <p className="font-mono text-xs uppercase tracking-wide text-blue-soft">
          Ton retour
        </p>
        <h1 className="mt-1 font-display text-lg font-semibold leading-snug text-ink">
          {question.contenu}
        </h1>

        <div className="mt-6">
          <FeedbackPanel feedback={feedback} />
        </div>

        <p className="mt-6 text-xs text-ink/50">
          Ce retour est généré par IA et ne remplace pas l&apos;avis d&apos;un
          coach ou d&apos;un recruteur pour les enjeux les plus importants.
        </p>

        <div className="mt-8 flex gap-3">
          {nextQuestion ? (
            <Link
              href={`/session/${params.id}/question/${nextQuestion.id}`}
              className="rounded-full bg-blue-deep px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-mid"
            >
              Question suivante
            </Link>
          ) : (
            <Link
              href={`/session/${params.id}`}
              className="rounded-full bg-blue-deep px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-mid"
            >
              Voir toutes les questions
            </Link>
          )}
          <Link
            href={`/session/${params.id}`}
            className="rounded-full border border-structural2 px-5 py-2.5 text-sm font-medium text-ink/70 transition hover:border-blue-soft"
          >
            Vue d&apos;ensemble
          </Link>
        </div>
      </main>
    </>
  );
}
