import Link from "next/link";
import type { StandingEntry } from "../lib/types";

export default function StandingsTable({
  entries,
}: {
  entries: StandingEntry[];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[var(--text-muted)] text-xs border-b border-[var(--border)]">
            <th className="text-left py-4 px-5 w-8">#</th>
            <th className="text-left py-4 px-5">Team</th>
            <th className="text-center py-4 px-5 w-8">P</th>
            <th className="text-center py-4 px-5 w-8">W</th>
            <th className="text-center py-4 px-5 w-8">D</th>
            <th className="text-center py-4 px-5 w-8">L</th>
            <th className="text-center py-4 px-5 w-10">GD</th>
            <th className="text-center py-4 px-5 w-10 font-bold text-[var(--text-secondary)]">
              Pts
            </th>
            <th className="text-center py-4 px-5 w-20 hidden sm:table-cell">
              Form
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.team.id}
              className="border-b border-[var(--border)] hover:bg-[var(--bg-card-hover)] press"
            >
              <td className="py-4 px-5 text-[var(--text-muted)] text-xs">
                {entry.position}
              </td>
              <td className="py-4 px-5">
                <Link
                  href={`/team/${entry.team.id}`}
                  className="flex items-center gap-2 hover:text-[var(--accent)] transition-colors"
                >
                  {entry.team.crest && (
                    <img
                      src={entry.team.crest}
                      alt=""
                      className="w-5 h-5 object-contain pop"
                    />
                  )}
                  <span className="text-[var(--text-primary)] truncate text-xs sm:text-sm">
                    {entry.team.shortName || entry.team.name}
                  </span>
                </Link>
              </td>
              <td className="py-4 px-5 text-center text-[var(--text-secondary)]">
                {entry.playedGames}
              </td>
              <td className="py-4 px-5 text-center text-[var(--text-secondary)]">
                {entry.won}
              </td>
              <td className="py-4 px-5 text-center text-[var(--text-secondary)]">
                {entry.draw}
              </td>
              <td className="py-4 px-5 text-center text-[var(--text-secondary)]">
                {entry.lost}
              </td>
              <td
                className={`py-4 px-5 text-center ${
                  entry.goalDifference > 0
                    ? "text-[var(--accent)]"
                    : entry.goalDifference < 0
                      ? "text-red-400"
                      : "text-[var(--text-secondary)]"
                }`}
              >
                {entry.goalDifference > 0
                  ? `+${entry.goalDifference}`
                  : entry.goalDifference}
              </td>
              <td className="py-4 px-5 text-center text-[var(--text-primary)] font-bold">
                {entry.points}
              </td>
              <td className="py-4 px-5 text-center hidden sm:table-cell">
                <div className="flex justify-center gap-0.5">
                  {entry.form
                    ?.split(",")
                    .slice(-5)
                    .map((result, i) => (
                      <span
                        key={i}
                        className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                          result === "W"
                            ? "bg-[var(--accent)] text-[var(--text-primary)]"
                            : result === "D"
                              ? "bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                              : "bg-red-600 text-[var(--text-primary)]"
                        }`}
                      >
                        {result}
                      </span>
                    ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
