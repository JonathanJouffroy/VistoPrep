"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { SessionCard } from "@/components/SessionCard";
import { createSession, listSessions, saveQuestions } from "@/lib/store";
import { Session, SessionType, SESSION_TYPE_LABELS } from "@/lib/types";

const TYPES: SessionType[] = ["entretien", "soutenance", "oral"];

export default function HomePage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [type, setType] = useState<SessionType>("entretien");
  const [contexte, setContexte] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSessions(listSessions());
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (contexte.trim().length < 10) {
      setError("Décris ton contexte un peu plus en détail pour des questions pertinentes.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, contexte }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue.");

      const session = createSession(type, contexte);
      saveQuestions(session.id, data.questions);
      router.push(`/session/${session.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la génération des questions."
      );
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-blue-deep">
          Prépare ton prochain oral
        </h1>
        <p className="mt-2 max-w-xl text-sm text-ink/70">
          Colle l&apos;offre d&apos;emploi, le sujet de ta soutenance, ou décris simplement
          la situation. VistoPrep génère des questions probables et te donne un
          retour structuré sur tes réponses.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="flex gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  type === t
                    ? "border-blue-deep bg-blue-deep text-white"
                    : "border-structural2 bg-white text-ink/70 hover:border-blue-soft"
                }`}
              >
                {SESSION_TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          <textarea
            value={contexte}
            onChange={(e) => setContexte(e.target.value)}
            placeholder="Ex : offre d'emploi complète, sujet et plan de mémoire, ou description de la situation d'oral…"
            rows={8}
            className="w-full resize-none rounded-card border border-structural2 bg-white p-4 text-sm text-ink placeholder:text-ink/40 focus:border-blue-soft"
          />

          {error && <p className="text-xs text-amber-deep">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-blue-deep px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-mid disabled:opacity-50"
          >
            {loading ? "Génération des questions…" : "Générer mes questions"}
          </button>
        </form>

        {sessions.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-sm font-semibold text-blue-deep">
              Sessions précédentes
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {sessions.map((s) => (
                <SessionCard key={s.id} session={s} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
