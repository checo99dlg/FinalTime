import Link from "next/link";
import type { Match, Competition } from "../lib/types";
import MatchCard from "./MatchCard";

export default function MatchGroup({
  competition,
  matches,
}: {
  competition: Competition;
  matches: Match[];
}) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl overflow-hidden mb-4 border border-[var(--border)] press">
      <Link
        href={`/league/${competition.code}`}
        className="flex items-center gap-3 px-5 py-3.5 border-b border-[var(--border)] hover:bg-[var(--bg-card-hover)] transition-all"
      >
        {competition.emblem && (
          <img
            src={competition.emblem}
            alt=""
            className="w-5 h-5 object-contain"
          />
        )}
        <span className="text-sm font-bold text-white">
          {competition.name}
        </span>
      </Link>
      <div className="divide-y divide-[var(--border)]">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}
