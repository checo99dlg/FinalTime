import Link from "next/link";
import type { Match } from "../lib/types";
import { formatMatchTime, getStatusDisplay } from "../lib/utils";

export default function MatchCard({ match }: { match: Match }) {
  const status = getStatusDisplay(match.status);
  const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";
  const isFinished = match.status === "FINISHED";
  const hasScore = isLive || isFinished;

  return (
    <Link
      href={`/match/${match.id}`}
      className="block hover:bg-[var(--bg-card-hover)] rounded-xl press"
    >
      <div className="px-5 py-4 flex items-center gap-5">
        {/* Status / Time */}
        <div className="w-16 text-center shrink-0">
          {isLive && (
            <div className="flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse" />
              <span className="text-xs font-bold text-[var(--accent)]">{status}</span>
            </div>
          )}
          {isFinished && (
            <span className="text-xs font-semibold text-[var(--text-muted)]">{status}</span>
          )}
          {!isLive && !isFinished && (
            <span className="text-xs text-[var(--text-muted)]">
              {formatMatchTime(match.utcDate)}
            </span>
          )}
        </div>

        {/* Teams and Score */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 min-w-0">
              {match.homeTeam.crest && (
                <img
                  src={match.homeTeam.crest}
                  alt=""
                  className="w-6 h-6 object-contain"
                />
              )}
              <span
                className={`text-sm truncate ${
                  hasScore && match.score.winner === "HOME_TEAM"
                    ? "text-white font-bold"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                {match.homeTeam.shortName || match.homeTeam.name}
              </span>
            </div>
            {hasScore && (
              <span
                className={`text-base font-bold tabular-nums ml-3 ${
                  match.score.winner === "HOME_TEAM"
                    ? "text-white"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {match.score.fullTime.home}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {match.awayTeam.crest && (
                <img
                  src={match.awayTeam.crest}
                  alt=""
                  className="w-6 h-6 object-contain"
                />
              )}
              <span
                className={`text-sm truncate ${
                  hasScore && match.score.winner === "AWAY_TEAM"
                    ? "text-white font-bold"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                {match.awayTeam.shortName || match.awayTeam.name}
              </span>
            </div>
            {hasScore && (
              <span
                className={`text-base font-bold tabular-nums ml-3 ${
                  match.score.winner === "AWAY_TEAM"
                    ? "text-white"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {match.score.fullTime.away}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
