import { SessionReview } from "@/lib/types";

const AXES: { key: keyof Omit<SessionReview, "id" | "sessionId">; label: string }[] = [
  { key: "pointsForts", label: "Points forts observés" },
  { key: "pointsVigilance", label: "Points de vigilance" },
  { key: "conseilJourJ", label: "Conseil pour le jour J" },
];

export function SessionReviewPanel({ review }: { review: SessionReview }) {
  return (
    <div className="space-y-3">
      <p className="font-mono text-[11px] uppercase tracking-wide text-blue-soft">
        Avis global sur la session
      </p>
      {AXES.map((axe) => (
        <div
          key={axe.key}
          className="rounded-card border border-structural2 bg-white p-4"
        >
          <p className="font-mono text-[11px] uppercase tracking-wide text-blue-soft">
            {axe.label}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink">
            {review[axe.key]}
          </p>
        </div>
      ))}
    </div>
  );
}
