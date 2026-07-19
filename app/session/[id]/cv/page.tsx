"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { CVAnalysisPanel } from "@/components/CVAnalysisPanel";
import { getSession, getCVAnalysis, saveCVAnalysis } from "@/lib/store";
import { CVAnalysis, Session, SESSION_TYPE_LABELS } from "@/lib/types";

export default function CVPage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [texteColle, setTexteColle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const s = getSession(params.id);
    setSession(s ?? null);
    if (s) setAnalysis(getCVAnalysis(params.id) ?? null);
  }, [params.id]);

  if (session === null) notFound();
  if (session === undefined) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;

    const file = fileInputRef.current?.files?.[0];
    if (!file && texteColle.trim().length < 30) {
      setError("Importe un fichier (PDF ou texte) ou colle le contenu de ton CV.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("type", session.type);
      formData.append("contexte", session.contexteSource);
      if (file) formData.append("file", file);
      if (texteColle.trim()) formData.append("cvTexte", texteColle);

      const res = await fetch("/api/cv", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur inconnue.");

      const saved = saveCVAnalysis(session.id, data.analysis);
      setAnalysis(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'analyse.");
    } finally {
      setLoading(false);
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
          Analyse de CV
        </h1>
        <p className="mt-2 max-w-xl text-sm text-ink/70">
          Importe ton CV pour un conseil sur comment présenter chaque expérience
          à l&apos;oral, en lien avec le contexte de cette session.
        </p>

        {analysis ? (
          <div className="mt-8">
            <CVAnalysisPanel analysis={analysis} />
            <button
              type="button"
              onClick={() => setAnalysis(null)}
              className="mt-4 text-xs text-blue-deep underline"
            >
              Analyser un autre CV
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="rounded-card border border-structural2 bg-white p-4">
              <label className="block text-xs font-medium text-ink/70">
                Fichier CV (PDF ou texte)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,text/plain,application/pdf"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
                className="mt-2 text-sm text-ink/70 file:mr-3 file:rounded-full file:border-0 file:bg-structural file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-blue-deep"
              />
              {fileName && (
                <p className="mt-2 font-mono text-xs text-blue-soft">{fileName}</p>
              )}
            </div>

            <p className="text-center text-xs text-ink/40">— ou —</p>

            <textarea
              value={texteColle}
              onChange={(e) => setTexteColle(e.target.value)}
              placeholder="Colle directement le texte de ton CV ici…"
              rows={8}
              className="w-full resize-none rounded-card border border-structural2 bg-white p-4 text-sm text-ink placeholder:text-ink/40 focus:border-blue-soft"
            />

            {error && <p className="text-xs text-amber-deep">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-blue-deep px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-mid disabled:opacity-50"
            >
              {loading ? "Analyse en cours…" : "Analyser mon CV"}
            </button>
          </form>
        )}

        <Link
          href={`/session/${session.id}`}
          className="mt-10 inline-block text-sm text-blue-deep underline"
        >
          Retour à la session
        </Link>
      </main>
    </>
  );
}
