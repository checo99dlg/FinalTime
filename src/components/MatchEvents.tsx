import type { AFEvent } from "../lib/api-football";

function EventIcon({ type, detail }: { type: string; detail: string }) {
  if (type === "Goal") {
    if (detail === "Own Goal") {
      return <span className="text-sm">⚽🔴</span>;
    }
    if (detail === "Penalty") {
      return <span className="text-sm">⚽ (P)</span>;
    }
    return <span className="text-sm">⚽</span>;
  }
  if (type === "Card") {
    if (detail.includes("Red") || detail.includes("Second Yellow")) {
      return (
        <span className="inline-block w-3 h-4 bg-red-500 rounded-[1px]" />
      );
    }
    return (
      <span className="inline-block w-3 h-4 bg-yellow-400 rounded-[1px]" />
    );
  }
  if (type === "subst") {
    return (
      <span className="text-sm">
        <span className="text-[var(--accent)]">↑</span>
        <span className="text-red-400">↓</span>
      </span>
    );
  }
  if (type === "Var") {
    return <span className="text-xs font-bold text-blue-400">VAR</span>;
  }
  return null;
}

function formatEventTime(time: { elapsed: number; extra: number | null }): string {
  if (time.extra) {
    return `${time.elapsed}+${time.extra}'`;
  }
  return `${time.elapsed}'`;
}

export default function MatchEvents({
  events,
  homeTeamId,
}: {
  events: AFEvent[];
  homeTeamId: number;
}) {
  if (events.length === 0) return null;

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border)]">
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold text-white">Match Events</h2>
      </div>
      <div className="p-4 space-y-2">
        {events.map((event, i) => {
          const isHome = event.team.id === homeTeamId;

          return (
            <div
              key={i}
              className={`flex items-center gap-3 py-1.5 ${
                isHome ? "" : "flex-row-reverse text-right"
              }`}
            >
              {/* Time */}
              <span className="text-xs text-[var(--text-muted)] w-12 shrink-0 text-center">
                {formatEventTime(event.time)}
              </span>

              {/* Icon */}
              <div className="shrink-0 w-8 flex justify-center">
                <EventIcon type={event.type} detail={event.detail} />
              </div>

              {/* Player Info */}
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-200 truncate">
                  {event.player.name}
                </p>
                {event.type === "subst" && event.assist.name && (
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    for {event.assist.name}
                  </p>
                )}
                {event.type === "Goal" && event.assist.name && (
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    Assist: {event.assist.name}
                  </p>
                )}
                {event.detail === "Own Goal" && (
                  <p className="text-xs text-red-400">Own Goal</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
