import { CVAnalysis } from "@/lib/types";

export function CVAnalysisPanel({ analysis }: { analysis: CVAnalysis }) {
  return (
    <div className="space-y-3">
      <div className="rounded-card border border-structural2 bg-white p-4">
        <p className="font-mono text-[11px] uppercase tracking-wide text-blue-soft">
          Synthèse
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink">
          {analysis.syntheseGlobale}
        </p>
      </div>

      <div className="rounded-card border border-structural2 bg-white p-4">
        <p className="font-mono text-[11px] uppercase tracking-wide text-blue-soft">
          Points forts du profil
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink">
          {analysis.pointsForts}
        </p>
      </div>

      {analysis.experiences.length > 0 && (
        <div className="space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-wide text-blue-soft">
            Comment présenter chaque expérience
          </p>
          {analysis.experiences.map((exp, i) => (
            <div
              key={i}
              className="rounded-card border border-amber-soft bg-amber-soft/20 p-4"
            >
              <p className="font-display text-sm font-semibold text-blue-deep">
                {exp.titre}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink">
                {exp.conseil}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
