import Link from "next/link";
import { Question, THEME_LABELS } from "@/lib/types";
import { NodeStatus } from "./ProgressPath";

const THEME_STYLES: Record<Question["theme"], string> = {
  technique: "bg-structural text-blue-deep",
  comportemental: "bg-amber-soft text-amber-deep",
  motivation: "bg-blue-deep/10 text-blue-deep",
};

export function QuestionCard({
  sessionId,
  question,
  index,
  status,
}: {
  sessionId: string;
  question: Question;
  index: number;
  status: NodeStatus;
}) {
  const statusLabel =
    status === "fait"
      ? "Retour reçu"
      : status === "en-attente"
      ? "Réponse enregistrée"
      : "À préparer";

  return (
    <Link
      href={`/session/${sessionId}/question/${question.id}`}
      className="flex items-start gap-4 rounded-card border border-structural2 bg-white p-4 shadow-card transition hover:border-blue-soft"
    >
      <span className="mt-0.5 font-mono text-xs text-blue-soft">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="flex-1">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${THEME_STYLES[question.theme]}`}
        >
          {THEME_LABELS[question.theme]}
        </span>
        <p className="mt-2 text-sm text-ink">{question.contenu}</p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-wide text-blue-soft">
          {statusLabel}
        </p>
      </div>
    </Link>
  );
}
