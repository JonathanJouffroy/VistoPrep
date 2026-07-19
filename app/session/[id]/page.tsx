"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { QuestionCard } from "@/components/QuestionCard";
import { ProgressPath, NodeStatus } from "@/components/ProgressPath";
import {
  getSession,
  getQuestions,
  getReponsesForSession,
  getFeedback,
} from "@/lib/store";
import { Question, Session, SESSION_TYPE_LABELS } from "@/lib/types";

export default function SessionPage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [statuses, setStatuses] = useState<NodeStatus[]>([]);

  useEffect(() => {
    const s = getSession(params.id);
    setSession(s ?? null);
    if (!s) return;

    const qs = getQuestions(params.id);
    setQuestions(qs);

    const reponses = getReponsesForSession(
      params.id,
      qs.map((q) => q.id)
    );

    const computed = qs.map((q): NodeStatus => {
      const reponse = reponses.find((r) => r.questionId === q.id);
      if (!reponse) return "a-faire";
      const feedback = getFeedback(reponse.id);
      return feedback ? "fait" : "en-attente";
    });
    setStatuses(computed);
  }, [params.id]);

  if (session === null) notFound();
  if (session === undefined) return null;

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

        {statuses.length > 0 && (
          <div className="mt-6">
            <ProgressPath statuses={statuses} />
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
