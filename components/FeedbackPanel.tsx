import { Feedback } from "@/lib/types";

const AXES: { key: keyof Omit<Feedback, "id" | "reponseId">; label: string }[] = [
  { key: "clarte", label: "Clarté du propos" },
  { key: "structure", label: "Structure de la réponse" },
  { key: "pointsACreuser", label: "À approfondir" },
];

export function FeedbackPanel({ feedback }: { feedback: Feedback }) {
  return (
    <div className="space-y-3">
      {AXES.map((axe) => (
        <div
          key={axe.key}
          className="rounded-card border border-structural2 bg-white p-4"
        >
          <p className="font-mono text-[11px] uppercase tracking-wide text-blue-soft">
            {axe.label}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink">
            {feedback[axe.key]}
          </p>
        </div>
      ))}
    </div>
  );
}
