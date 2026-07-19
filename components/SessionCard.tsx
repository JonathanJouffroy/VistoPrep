import Link from "next/link";
import { Session, SESSION_TYPE_LABELS } from "@/lib/types";

export function SessionCard({ session }: { session: Session }) {
  const date = new Date(session.creeLe).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Link
      href={`/session/${session.id}`}
      className="block rounded-card border border-structural2 bg-white p-4 shadow-card transition hover:border-blue-soft"
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-semibold text-blue-deep">
          {SESSION_TYPE_LABELS[session.type]}
        </span>
        <span className="font-mono text-xs text-blue-soft">{date}</span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-ink/70">
        {session.contexteSource}
      </p>
    </Link>
  );
}
