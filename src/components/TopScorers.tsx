import Link from "next/link";
import type { Scorer } from "../lib/types";

export default function TopScorers({ scorers }: { scorers: Scorer[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[var(--text-muted)] text-xs border-b border-[var(--border)]">
            <th className="text-left py-4 px-5 w-8">#</th>
            <th className="text-left py-4 px-5">Player</th>
            <th className="text-left py-4 px-5 hidden sm:table-cell">Team</th>
            <th className="text-center py-4 px-5 w-10">Apps</th>
            <th className="text-center py-4 px-5 w-10 font-bold text-[var(--text-secondary)]">G</th>
            <th className="text-center py-4 px-5 w-10">A</th>
          </tr>
        </thead>
        <tbody>
          {scorers.map((scorer, i) => (
            <tr
              key={scorer.player.id}
              className="border-b border-[var(--border)] hover:bg-[var(--bg-card-hover)] press"
            >
              <td className="py-4 px-5 text-[var(--text-muted)] text-xs">{i + 1}</td>
              <td className="py-4 px-5">
                <Link
                  href={`/player/${scorer.player.id}`}
                  className="text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors text-xs sm:text-sm"
                >
                  {scorer.player.name}
                </Link>
              </td>
              <td className="py-4 px-5 hidden sm:table-cell">
                <Link
                  href={`/team/${scorer.team.id}`}
                  className="flex items-center gap-2"
                >
                  {scorer.team.crest && (
                    <img
                      src={scorer.team.crest}
                      alt=""
                      className="w-4 h-4 object-contain"
                    />
                  )}
                  <span className="text-[var(--text-secondary)] text-xs hover:text-[var(--text-primary)] transition-colors">
                    {scorer.team.shortName || scorer.team.name}
                  </span>
                </Link>
              </td>
              <td className="py-4 px-5 text-center text-[var(--text-secondary)] text-xs">
                {scorer.playedMatches}
              </td>
              <td className="py-4 px-5 text-center text-[var(--text-primary)] font-bold text-sm">
                {scorer.goals}
              </td>
              <td className="py-4 px-5 text-center text-[var(--text-secondary)] text-xs">
                {scorer.assists ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
