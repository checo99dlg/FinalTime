import { Suspense } from "react";
import Link from "next/link";
import { getMatches, groupMatchesByCompetition } from "../lib/api";
import { getTodayStr, formatMatchTime } from "../lib/utils";
import DateNav from "../components/DateNav";
import MatchGroup from "../components/MatchGroup";
import MatchCard from "../components/MatchCard";
import SortToggle from "../components/SortToggle";

function MatchesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border)]">
          <div className="px-5 py-3.5 border-b border-[var(--border)]">
            <div className="h-5 bg-[var(--bg-elevated)] rounded-lg w-40 animate-pulse" />
          </div>
          {[1, 2, 3].map((j) => (
            <div key={j} className="px-5 py-4 flex items-center gap-5">
              <div className="w-16 h-4 bg-[var(--bg-elevated)] rounded-lg animate-pulse" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-[var(--bg-elevated)] rounded-lg w-48 animate-pulse" />
                <div className="h-4 bg-[var(--bg-elevated)] rounded-lg w-44 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

async function MatchesList({
  date,
  sort,
}: {
  date: string;
  sort: string;
}) {
  let matches;
  try {
    matches = await getMatches(date);
  } catch (error) {
    return (
      <div className="bg-[var(--bg-card)] rounded-xl p-8 text-center">
        <p className="text-red-400 text-sm mb-2">Failed to load matches</p>
        <p className="text-[var(--text-muted)] text-xs">
          Make sure your API key is set in .env.local
        </p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="bg-[var(--bg-card)] rounded-xl p-8 text-center">
        <p className="text-[var(--text-secondary)] text-sm">
          No matches scheduled for this date
        </p>
      </div>
    );
  }

  if (sort === "time") {
    const sorted = [...matches].sort(
      (a, b) =>
        new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
    );

    // Group by kick-off time
    const byTime = new Map<string, typeof sorted>();
    for (const m of sorted) {
      const timeKey = formatMatchTime(m.utcDate);
      if (!byTime.has(timeKey)) byTime.set(timeKey, []);
      byTime.get(timeKey)!.push(m);
    }

    return (
      <div className="bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border)]">
        {Array.from(byTime.entries()).map(([time, timeMatches]) => (
          <div key={time}>
            <div className="px-4 py-2 bg-[var(--bg-elevated)] border-b border-[var(--border)]">
              <p className="text-xs font-medium text-[var(--text-secondary)]">{time}</p>
            </div>
            <div className="divide-y divide-gray-800/50">
              {timeMatches.map((match) => (
                <div key={match.id} className="flex items-center">
                  <div className="flex-1">
                    <MatchCard match={match} />
                  </div>
                  <Link
                    href={`/league/${match.competition.code}`}
                    className="pr-3 shrink-0"
                  >
                    {match.competition.emblem && (
                      <img
                        src={match.competition.emblem}
                        alt={match.competition.name}
                        className="w-5 h-5 object-contain opacity-50 hover:opacity-100 transition-opacity"
                        title={match.competition.name}
                      />
                    )}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default: group by league
  const grouped = groupMatchesByCompetition(matches);

  return (
    <div>
      {Array.from(grouped.values()).map(({ competition, matches }) => (
        <MatchGroup
          key={competition.code}
          competition={competition}
          matches={matches}
        />
      ))}
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const date =
    typeof params.date === "string" ? params.date : getTodayStr();
  const sort =
    typeof params.sort === "string" ? params.sort : "league";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <DateNav currentDate={date} />
        <SortToggle />
      </div>
      <Suspense fallback={<MatchesSkeleton />}>
        <MatchesList date={date} sort={sort} />
      </Suspense>
    </div>
  );
}
