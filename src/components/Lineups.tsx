import type { AFLineup } from "../lib/api-football";

function PositionBadge({ pos }: { pos: string }) {
  const colors: Record<string, string> = {
    G: "bg-yellow-500",
    D: "bg-blue-500",
    M: "bg-[var(--accent)]",
    F: "bg-red-500",
  };
  return (
    <span
      className={`text-[10px] font-bold w-5 h-5 rounded flex items-center justify-center text-white ${colors[pos] || "bg-[var(--text-muted)]"}`}
    >
      {pos}
    </span>
  );
}

function TeamLineup({ lineup, side }: { lineup: AFLineup; side: "home" | "away" }) {
  const jerseyColor = lineup.team.colors?.player?.primary
    ? `#${lineup.team.colors.player.primary}`
    : side === "home"
      ? "#3b82f6"
      : "#ef4444";

  return (
    <div className="flex-1 min-w-0">
      {/* Team Header */}
      <div className="flex items-center gap-2 mb-3">
        {lineup.team.logo && (
          <img src={lineup.team.logo} alt="" className="w-5 h-5 object-contain" />
        )}
        <span className="text-sm font-semibold text-white truncate">
          {lineup.team.name}
        </span>
        <span className="text-xs text-[var(--text-muted)] shrink-0">{lineup.formation}</span>
      </div>

      {/* Starting XI */}
      <div className="space-y-1">
        {lineup.startXI.map(({ player }) => (
          <div key={player.id} className="flex items-center gap-2 py-1">
            <span
              className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: jerseyColor }}
            >
              {player.number}
            </span>
            <span className="text-sm text-[var(--text-secondary)] truncate">{player.name}</span>
            <PositionBadge pos={player.pos} />
          </div>
        ))}
      </div>

      {/* Substitutes */}
      {lineup.substitutes.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Substitutes
          </p>
          <div className="space-y-1">
            {lineup.substitutes.map(({ player }) => (
              <div key={player.id} className="flex items-center gap-2 py-0.5">
                <span className="text-xs text-[var(--text-muted)] w-6 text-center shrink-0">
                  {player.number}
                </span>
                <span className="text-xs text-[var(--text-muted)] truncate">
                  {player.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coach */}
      {lineup.coach && (
        <div className="mt-3 pt-3 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)]">
            Coach: <span className="text-[var(--text-secondary)]">{lineup.coach.name}</span>
          </p>
        </div>
      )}
    </div>
  );
}

export default function Lineups({ lineups }: { lineups: AFLineup[] }) {
  if (lineups.length < 2) return null;

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border)]">
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold text-white">Lineups</h2>
      </div>
      <div className="p-4 flex gap-6">
        <TeamLineup lineup={lineups[0]} side="home" />
        <div className="w-px bg-[var(--bg-elevated)] shrink-0" />
        <TeamLineup lineup={lineups[1]} side="away" />
      </div>
    </div>
  );
}
