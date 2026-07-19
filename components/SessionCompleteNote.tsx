import { SessionType } from "@/lib/types";

const CLOSING_BY_TYPE: Record<SessionType, string> = {
  entretien:
    "Tu as travaillé l'ensemble des questions probables pour cet entretien. Relis tes retours la veille plutôt que le matin même — ça laisse le temps aux points à approfondir de s'installer.",
  soutenance:
    "Tu as travaillé l'ensemble des questions probables pour cette soutenance. Relis tes retours à tête reposée, et entraîne-toi à voix haute sur celles qui te semblaient les moins naturelles.",
  oral: "Tu as travaillé l'ensemble des questions probables pour cet oral. Relis tes retours à tête reposée, et entraîne-toi à voix haute sur celles qui te semblaient les moins naturelles.",
};

export function SessionCompleteNote({
  type,
  total,
}: {
  type: SessionType;
  total: number;
}) {
  return (
    <div className="rounded-card border border-amber-soft bg-amber-soft/20 p-5">
      <p className="font-mono text-[11px] uppercase tracking-wide text-amber-deep">
        Session terminée
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ink">
        {CLOSING_BY_TYPE[type]}
      </p>
      <p className="mt-3 text-xs text-ink/50">
        {total} question{total > 1 ? "s" : ""} travaillée{total > 1 ? "s" : ""} — les retours
        restent consultables à tout moment depuis cette page. Ils sont générés
        par IA et ne remplacent pas l&apos;avis d&apos;un coach ou d&apos;un
        recruteur pour les enjeux les plus importants.
      </p>
    </div>
  );
}
