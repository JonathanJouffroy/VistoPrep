export type NodeStatus = "a-faire" | "en-attente" | "fait";

interface ProgressPathProps {
  statuses: NodeStatus[];
  activeIndex?: number;
}

const STEP_X = 64;
const AMPLITUDE = 22;
const PADDING_X = 32;
const HEIGHT = 96;
const MID_Y = HEIGHT / 2;

/**
 * Représente la progression d'une session comme un chemin sinueux plutôt
 * qu'un pourcentage ou une note — l'idée est de donner une sensation
 * d'avancée sans jugement chiffré (cf. cahier des charges, section 6).
 */
export function ProgressPath({ statuses, activeIndex }: ProgressPathProps) {
  const points = statuses.map((_, i) => ({
    x: PADDING_X + i * STEP_X,
    y: MID_Y + (i % 2 === 0 ? -AMPLITUDE : AMPLITUDE),
  }));

  const width = PADDING_X * 2 + Math.max(0, statuses.length - 1) * STEP_X;

  const pathD = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const cx = (prev.x + p.x) / 2;
      return `Q ${cx} ${prev.y}, ${(cx + p.x) / 2} ${(prev.y + p.y) / 2} T ${p.x} ${p.y}`;
    })
    .join(" ");

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${Math.max(width, 100)} ${HEIGHT}`}
        width={width}
        height={HEIGHT}
        role="img"
        aria-label={`Progression : ${statuses.filter((s) => s === "fait").length} sur ${statuses.length} questions traitées`}
      >
        <path d={pathD} fill="none" stroke="#DDE3E9" strokeWidth={2} />
        {points.map((p, i) => {
          const status = statuses[i];
          const isActive = i === activeIndex;
          const fill =
            status === "fait"
              ? "#E0954B"
              : status === "en-attente"
              ? "#5C7A96"
              : "#F7F8FA";
          const stroke = status === "a-faire" ? "#DDE3E9" : "none";
          return (
            <g key={i}>
              {isActive && (
                <circle cx={p.x} cy={p.y} r={12} fill="none" stroke="#E0954B" strokeWidth={1.5} />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={7}
                fill={fill}
                stroke={stroke}
                strokeWidth={stroke === "none" ? 0 : 1.5}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
