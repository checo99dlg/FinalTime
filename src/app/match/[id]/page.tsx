import { Suspense } from "react";
import Link from "next/link";
import { getMatch, getTeamMatches } from "../../../lib/api";
import { getMatchExtras } from "../../../lib/api-football";
import {
  formatMatchTime,
  getStatusDisplay,
  getStatusColor,
} from "../../../lib/utils";
import Lineups from "../../../components/Lineups";
import MatchEvents from "../../../components/MatchEvents";

function FormDot({ result }: { result: "W" | "D" | "L" }) {
  const colors = {
    W: "bg-green-600 text-white",
    D: "bg-gray-600 text-white",
    L: "bg-red-600 text-white",
  };
  return (
    <span
      className={`w-6 h-6 rounded-full text-[10px] flex items-center justify-center font-bold ${colors[result]}`}
    >
      {result}
    </span>
  );
}

async function TeamFormSection({
  homeTeamId,
  homeTeamName,
  awayTeamId,
  awayTeamName,
}: {
  homeTeamId: number;
  homeTeamName: string;
  awayTeamId: number;
  awayTeamName: string;
}) {
  if (!homeTeamId || !awayTeamId) return null;

  try {
    const [homeData, awayData] = await Promise.all([
      getTeamMatches(homeTeamId, "FINISHED"),
      getTeamMatches(awayTeamId, "FINISHED"),
    ]);

    function getForm(teamId: number, matches: typeof homeData.matches) {
      return matches
        .sort(
          (a, b) =>
            new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime()
        )
        .slice(0, 5)
        .map((m) => {
          const isHome = m.homeTeam.id === teamId;
          const winner = m.score.winner;
          if (
            (isHome && winner === "HOME_TEAM") ||
            (!isHome && winner === "AWAY_TEAM")
          )
            return "W" as const;
          if (winner === "DRAW") return "D" as const;
          return "L" as const;
        });
    }

    const homeForm = getForm(homeTeamId, homeData.matches);
    const awayForm = getForm(awayTeamId, awayData.matches);

    if (homeForm.length === 0 && awayForm.length === 0) return null;

    return (
      <div className="bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border)]">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold text-white">Form</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Last 5 matches</p>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)] w-24 truncate">
              {homeTeamName}
            </span>
            <div className="flex gap-1">
              {homeForm.map((r, i) => (
                <FormDot key={i} result={r} />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)] w-24 truncate">
              {awayTeamName}
            </span>
            <div className="flex gap-1">
              {awayForm.map((r, i) => (
                <FormDot key={i} result={r} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

function MatchSkeleton() {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl p-8 border border-[var(--border)]">
      <div className="flex items-center justify-center gap-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-[var(--bg-elevated)] rounded-full animate-pulse mx-auto" />
          <div className="h-4 bg-[var(--bg-elevated)] rounded w-24 animate-pulse" />
        </div>
        <div className="h-10 bg-[var(--bg-elevated)] rounded w-20 animate-pulse" />
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-[var(--bg-elevated)] rounded-full animate-pulse mx-auto" />
          <div className="h-4 bg-[var(--bg-elevated)] rounded w-24 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

async function MatchDetailContent({ id }: { id: number }) {
  try {
    const data = await getMatch(id);
    const match = data.match || (data as any);
    const h2h = data.head2head;

    const status = getStatusDisplay(match.status);
    const statusColor = getStatusColor(match.status);
    const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";
    const isFinished = match.status === "FINISHED";
    const hasScore = isLive || isFinished;

    const matchDate = new Date(match.utcDate);
    const matchDateStr = match.utcDate.split("T")[0];

    // Fetch lineups and events from API-Football
    const extras = await getMatchExtras(
      matchDateStr,
      match.homeTeam.name,
      match.competition.code
    );

    return (
      <div className="space-y-4">
        {/* Match Header */}
        <div className="bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border)]">
          {/* Competition Bar */}
          <Link
            href={`/league/${match.competition.code}`}
            className="flex items-center gap-2 px-5 py-2 border-b border-[var(--border)] hover:bg-[var(--bg-card-hover)] transition-colors"
          >
            {match.competition.emblem && (
              <img
                src={match.competition.emblem}
                alt=""
                className="w-4 h-4 object-contain"
              />
            )}
            <span className="text-xs text-[var(--text-secondary)]">
              {match.competition.name}
            </span>
            {match.matchday && (
              <span className="text-xs text-[var(--text-muted)]">
                · Matchday {match.matchday}
              </span>
            )}
          </Link>

          {/* Score Area */}
          <div className="px-6 py-8">
            <div className="flex items-center justify-center gap-6 sm:gap-12">
              {/* Home Team */}
              <Link
                href={match.homeTeam.id ? `/team/${match.homeTeam.id}` : "#"}
                className="flex-1 text-center press"
              >
                {match.homeTeam.crest && (
                  <img
                    src={match.homeTeam.crest}
                    alt=""
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto mb-2 pop"
                  />
                )}
                <p className="text-white font-semibold text-sm sm:text-base">
                  {match.homeTeam.shortName || match.homeTeam.name}
                </p>
              </Link>

              {/* Score */}
              <div className="text-center shrink-0">
                {hasScore ? (
                  <div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-4xl sm:text-5xl font-bold ${
                          match.score.winner === "HOME_TEAM"
                            ? "text-white"
                            : "text-[var(--text-muted)]"
                        }`}
                      >
                        {match.score.fullTime.home}
                      </span>
                      <span className="text-[var(--text-muted)] text-2xl">-</span>
                      <span
                        className={`text-4xl sm:text-5xl font-bold ${
                          match.score.winner === "AWAY_TEAM"
                            ? "text-white"
                            : "text-[var(--text-muted)]"
                        }`}
                      >
                        {match.score.fullTime.away}
                      </span>
                    </div>
                    {match.score.halfTime.home !== null && (
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        HT: {match.score.halfTime.home} -{" "}
                        {match.score.halfTime.away}
                      </p>
                    )}
                    <p className={`text-xs font-medium mt-2 ${statusColor}`}>
                      {isLive && (
                        <span className="inline-block w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-pulse mr-1 align-middle" />
                      )}
                      {status}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-2xl font-bold text-[var(--text-secondary)]">vs</p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      {formatMatchTime(match.utcDate)}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {matchDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Away Team */}
              <Link
                href={match.awayTeam.id ? `/team/${match.awayTeam.id}` : "#"}
                className="flex-1 text-center press"
              >
                {match.awayTeam.crest && (
                  <img
                    src={match.awayTeam.crest}
                    alt=""
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto mb-2 pop"
                  />
                )}
                <p className="text-white font-semibold text-sm sm:text-base">
                  {match.awayTeam.shortName || match.awayTeam.name}
                </p>
              </Link>
            </div>
          </div>
        </div>

        {/* Team Form */}
        <TeamFormSection
          homeTeamId={match.homeTeam.id}
          homeTeamName={match.homeTeam.shortName || match.homeTeam.name}
          awayTeamId={match.awayTeam.id}
          awayTeamName={match.awayTeam.shortName || match.awayTeam.name}
        />

        {/* Match Events */}
        {extras.events.length > 0 && extras.lineups.length > 0 && (
          <MatchEvents
            events={extras.events}
            homeTeamId={extras.lineups[0].team.id}
          />
        )}

        {/* Lineups */}
        {extras.lineups.length >= 2 && <Lineups lineups={extras.lineups} />}

        {/* Match Info */}
        <div className="bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border)]">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <h2 className="text-sm font-semibold text-white">Match Info</h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Date</span>
              <span className="text-[var(--text-secondary)]">
                {matchDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Kick-off</span>
              <span className="text-[var(--text-secondary)]">
                {formatMatchTime(match.utcDate)}
              </span>
            </div>
            {match.stage && match.stage !== "REGULAR_SEASON" && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Stage</span>
                <span className="text-[var(--text-secondary)]">
                  {match.stage.replace(/_/g, " ")}
                </span>
              </div>
            )}
            {match.group && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Group</span>
                <span className="text-[var(--text-secondary)]">{match.group}</span>
              </div>
            )}
            {match.referees?.length > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Referee</span>
                <span className="text-[var(--text-secondary)]">
                  {match.referees.find((r) => r.type === "REFEREE")?.name ||
                    match.referees[0].name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Head to Head */}
        {h2h && h2h.numberOfMatches > 0 && (
          <div className="bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border)]">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <h2 className="text-sm font-semibold text-white">Head to Head</h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Last {h2h.numberOfMatches} meetings
              </p>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-[var(--accent)]">
                    {h2h.homeTeam.wins}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {match.homeTeam.shortName || match.homeTeam.name}
                  </p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-[var(--text-secondary)]">
                    {h2h.homeTeam.draws}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Draws</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-blue-400">
                    {h2h.awayTeam.wins}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {match.awayTeam.shortName || match.awayTeam.name}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex rounded-full overflow-hidden h-2">
                <div
                  className="bg-[var(--accent)]"
                  style={{
                    width: `${(h2h.homeTeam.wins / h2h.numberOfMatches) * 100}%`,
                  }}
                />
                <div
                  className="bg-[var(--text-muted)]"
                  style={{
                    width: `${(h2h.homeTeam.draws / h2h.numberOfMatches) * 100}%`,
                  }}
                />
                <div
                  className="bg-blue-500"
                  style={{
                    width: `${(h2h.awayTeam.wins / h2h.numberOfMatches) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="bg-[var(--bg-card)] rounded-2xl p-8 text-center border border-[var(--border)]">
        <p className="text-red-400 text-sm mb-2">Failed to load match details</p>
        <p className="text-[var(--text-muted)] text-xs">
          This match may not be available on the free API tier
        </p>
      </div>
    );
  }
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/"
          className="text-sm text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to matches
        </Link>
      </div>
      <Suspense fallback={<MatchSkeleton />}>
        <MatchDetailContent id={parseInt(id, 10)} />
      </Suspense>
    </div>
  );
}
