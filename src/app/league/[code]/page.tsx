import { Suspense } from "react";
import Link from "next/link";
import { getStandings, getCompetitionMatches, getScorers } from "../../../lib/api";
import { LEAGUE_MAP } from "../../../lib/leagues";
import StandingsTable from "../../../components/StandingsTable";
import MatchCard from "../../../components/MatchCard";
import MatchdaySelector from "../../../components/MatchdaySelector";
import KnockoutBracket from "../../../components/KnockoutBracket";
import TopScorers from "../../../components/TopScorers";

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-8">
        <div className="h-6 bg-[var(--bg-elevated)] rounded w-32 animate-pulse mb-4" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-8 bg-[var(--bg-elevated)]/50 rounded mb-1 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

async function LeagueStandings({ code }: { code: string }) {
  try {
    const data = await getStandings(code);
    const totalStandings = data.standings.filter((s) => s.type === "TOTAL");

    if (totalStandings.length === 0) {
      return (
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-8 text-center">
          <p className="text-[var(--text-secondary)] text-sm">No standings available</p>
        </div>
      );
    }

    const hasGroups = totalStandings.length > 1;

    return (
      <div className="space-y-4">
        {totalStandings.map((standing) => (
          <div
            key={standing.group || "main"}
            className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <h2 className="text-sm font-bold text-white">
                {hasGroups ? standing.group || "Standings" : "Standings"}
              </h2>
              {!hasGroups && data.season.currentMatchday && (
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Matchday {data.season.currentMatchday}
                </p>
              )}
            </div>
            <div className="p-3">
              <StandingsTable entries={standing.table} />
            </div>
          </div>
        ))}
      </div>
    );
  } catch {
    return (
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-8 text-center">
        <p className="text-red-400 text-sm">Failed to load standings</p>
      </div>
    );
  }
}

async function LeagueKnockout({ code }: { code: string }) {
  try {
    const matches = await getCompetitionMatches(code);
    const knockoutStages = [
      "PLAYOFFS",
      "LAST_32",
      "LAST_16",
      "QUARTER_FINALS",
      "SEMI_FINALS",
      "FINAL",
    ];
    const hasKnockout = matches.some((m) => knockoutStages.includes(m.stage));

    if (!hasKnockout) return null;

    return <KnockoutBracket matches={matches} />;
  } catch {
    return null;
  }
}

async function LeagueMatches({
  code,
  matchday,
}: {
  code: string;
  matchday?: number;
}) {
  try {
    const matches = await getCompetitionMatches(code, matchday);

    // If a specific matchday is requested, show all matches for it
    // Otherwise show recent/upcoming ±14 days
    let filtered;
    if (matchday) {
      filtered = matches
        .filter((m) => m.matchday === matchday)
        .sort(
          (a, b) =>
            new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
        );
    } else {
      const now = new Date();
      filtered = matches
        .sort(
          (a, b) =>
            new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
        )
        .filter((m) => {
          const matchDate = new Date(m.utcDate);
          const diffDays =
            (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          return diffDays > -14 && diffDays < 14;
        });
    }

    if (filtered.length === 0) {
      return (
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-8 text-center">
          <p className="text-[var(--text-secondary)] text-sm">No matches for this round</p>
        </div>
      );
    }

    // Group by date for display
    const byDate = new Map<string, typeof filtered>();
    for (const m of filtered) {
      const dateKey = new Date(m.utcDate).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      if (!byDate.has(dateKey)) byDate.set(dateKey, []);
      byDate.get(dateKey)!.push(m);
    }

    return (
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden">
        {Array.from(byDate.entries()).map(([date, dayMatches]) => (
          <div key={date}>
            <div className="px-5 py-3 bg-[var(--bg-elevated)] border-b border-[var(--border)]">
              <p className="text-xs text-[var(--text-muted)]">{date}</p>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {dayMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  } catch {
    return (
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-8 text-center">
        <p className="text-red-400 text-sm">Failed to load matches</p>
      </div>
    );
  }
}

async function LeagueTopScorers({ code }: { code: string }) {
  try {
    const data = await getScorers(code);
    if (!data.scorers || data.scorers.length === 0) return null;

    return (
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h2 className="text-sm font-bold text-white">Top Scorers</h2>
        </div>
        <div className="p-3">
          <TopScorers scorers={data.scorers} />
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

async function MatchdaySelectorWrapper({
  code,
  selectedMatchday,
}: {
  code: string;
  selectedMatchday?: number;
}) {
  try {
    const data = await getStandings(code);
    const currentMatchday = data.season.currentMatchday;

    if (!currentMatchday) return null;

    // Estimate total matchdays based on league type
    // Most leagues: (teams - 1) * 2 for home and away
    const totalStandings = data.standings.filter((s) => s.type === "TOTAL");
    const teamsInLeague =
      totalStandings.length === 1 ? totalStandings[0].table.length : 0;
    const totalMatchdays =
      teamsInLeague > 0 ? (teamsInLeague - 1) * 2 : currentMatchday;

    return (
      <MatchdaySelector
        code={code}
        currentMatchday={currentMatchday}
        totalMatchdays={totalMatchdays}
        selectedMatchday={selectedMatchday || currentMatchday}
      />
    );
  } catch {
    return null;
  }
}

export default async function LeaguePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { code } = await params;
  const sp = await searchParams;
  const league = LEAGUE_MAP[code];
  const isCup = league?.type === "CUP";

  const matchday =
    typeof sp.matchday === "string" ? parseInt(sp.matchday, 10) : undefined;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-2">
          <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[var(--text-secondary)]">{league?.name || code}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {league && <span className="text-3xl">{league.flag}</span>}
            <div>
              <h1 className="text-2xl font-bold text-white">
                {league?.name || code}
              </h1>
              {league && (
                <p className="text-sm text-[var(--text-muted)]">{league.country}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Suspense fallback={<LoadingSkeleton />}>
          <LeagueStandings code={code} />
        </Suspense>

        <Suspense fallback={<LoadingSkeleton />}>
          <LeagueTopScorers code={code} />
        </Suspense>

        {isCup && (
          <Suspense fallback={<LoadingSkeleton />}>
            <LeagueKnockout code={code} />
          </Suspense>
        )}

        {/* Matchday selector + matches */}
        {!isCup && (
          <Suspense>
            <MatchdaySelectorWrapper
              code={code}
              selectedMatchday={matchday}
            />
          </Suspense>
        )}

        <Suspense fallback={<LoadingSkeleton />}>
          <LeagueMatches code={code} matchday={matchday} />
        </Suspense>
      </div>
    </div>
  );
}
