import { Suspense } from "react";
import Link from "next/link";
import { getTeam, getTeamMatches } from "../../../lib/api";
import MatchCard from "../../../components/MatchCard";

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-[var(--bg-card)] rounded-2xl p-8 border border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-[var(--bg-elevated)] rounded-full animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 bg-[var(--bg-elevated)] rounded w-48 animate-pulse" />
            <div className="h-4 bg-[var(--bg-elevated)] rounded w-32 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

async function TeamContent({ id }: { id: number }) {
  try {
    const [team, matchesData] = await Promise.all([
      getTeam(id),
      getTeamMatches(id),
    ]);

    const rs = matchesData.resultSet;

    // Split matches into recent results and upcoming
    const now = new Date();
    const recentResults = matchesData.matches
      .filter((m) => m.status === "FINISHED")
      .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())
      .slice(0, 5);

    const upcoming = matchesData.matches
      .filter((m) => m.status !== "FINISHED" && new Date(m.utcDate) >= now)
      .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
      .slice(0, 5);

    // Group squad by position
    const positions: Record<string, typeof team.squad> = {
      Goalkeeper: [],
      Defence: [],
      Midfield: [],
      Offence: [],
    };
    for (const p of team.squad) {
      const pos = p.position || "Offence";
      if (!positions[pos]) positions[pos] = [];
      positions[pos].push(p);
    }

    return (
      <div className="space-y-4">
        {/* Team Header */}
        <div className="bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border)] p-6">
          <div className="flex items-center gap-5">
            {team.crest && (
              <img
                src={team.crest}
                alt=""
                className="w-20 h-20 object-contain"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">{team.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                {team.area.flag && (
                  <img
                    src={team.area.flag}
                    alt=""
                    className="w-4 h-4 object-contain"
                  />
                )}
                <span className="text-sm text-[var(--text-secondary)]">{team.area.name}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-[var(--text-muted)]">
                {team.venue && <span>🏟️ {team.venue}</span>}
                {team.founded && <span>Est. {team.founded}</span>}
                {team.clubColors && <span>🎨 {team.clubColors}</span>}
              </div>
            </div>
          </div>

          {/* Competitions */}
          {team.runningCompetitions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[var(--border)]">
              {team.runningCompetitions.map((comp) => (
                <Link
                  key={comp.id}
                  href={`/league/${comp.code}`}
                  className="flex items-center gap-1.5 px-2 py-1 bg-[var(--bg-elevated)] rounded-md hover:bg-[var(--bg-card-hover)] transition-colors"
                >
                  {comp.emblem && (
                    <img
                      src={comp.emblem}
                      alt=""
                      className="w-4 h-4 object-contain"
                    />
                  )}
                  <span className="text-xs text-[var(--text-secondary)]">{comp.name}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Season Record */}
          {rs.played > 0 && (
            <div className="flex gap-6 mt-4 pt-4 border-t border-[var(--border)]">
              <div className="text-center">
                <p className="text-lg font-bold text-white">{rs.played}</p>
                <p className="text-[10px] text-[var(--text-muted)] uppercase">Played</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-[var(--accent)]">{rs.wins}</p>
                <p className="text-[10px] text-[var(--text-muted)] uppercase">Won</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-[var(--text-secondary)]">{rs.draws}</p>
                <p className="text-[10px] text-[var(--text-muted)] uppercase">Drawn</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-red-400">{rs.losses}</p>
                <p className="text-[10px] text-[var(--text-muted)] uppercase">Lost</p>
              </div>
            </div>
          )}
        </div>

        {/* Coach */}
        {team.coach && (
          <div className="bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border)]">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <h2 className="text-sm font-semibold text-white">Manager</h2>
            </div>
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--bg-elevated)] rounded-full flex items-center justify-center text-[var(--text-muted)] text-sm">
                👔
              </div>
              <div>
                <p className="text-sm text-white font-medium">
                  {team.coach.name}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {team.coach.nationality}
                  {team.coach.contract?.until &&
                    ` · Contract until ${team.coach.contract.until}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Matches */}
        {upcoming.length > 0 && (
          <div className="bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border)]">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <h2 className="text-sm font-semibold text-white">
                Upcoming Matches
              </h2>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {upcoming.map((match) => (
                <div key={match.id} className="flex items-center">
                  <div className="flex-1">
                    <MatchCard match={match} />
                  </div>
                  <div className="pr-3 shrink-0">
                    {match.competition.emblem && (
                      <img
                        src={match.competition.emblem}
                        alt={match.competition.name}
                        className="w-4 h-4 object-contain opacity-50"
                        title={match.competition.name}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Results */}
        {recentResults.length > 0 && (
          <div className="bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border)]">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <h2 className="text-sm font-semibold text-white">
                Recent Results
              </h2>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {recentResults.map((match) => (
                <div key={match.id} className="flex items-center">
                  <div className="flex-1">
                    <MatchCard match={match} />
                  </div>
                  <div className="pr-3 shrink-0">
                    {match.competition.emblem && (
                      <img
                        src={match.competition.emblem}
                        alt={match.competition.name}
                        className="w-4 h-4 object-contain opacity-50"
                        title={match.competition.name}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Squad */}
        <div className="bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border)]">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <h2 className="text-sm font-semibold text-white">Squad</h2>
          </div>
          <div className="p-4 space-y-5">
            {Object.entries(positions).map(
              ([position, players]) =>
                players.length > 0 && (
                  <div key={position}>
                    <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                      {position === "Offence" ? "Forwards" : position === "Defence" ? "Defenders" : position === "Midfield" ? "Midfielders" : "Goalkeepers"}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {players.map((player) => (
                        <Link
                          key={player.id}
                          href={`/player/${player.id}`}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors"
                        >
                          <div className="w-8 h-8 bg-[var(--bg-elevated)] rounded-full flex items-center justify-center text-[10px] text-[var(--text-muted)] shrink-0">
                            {player.nationality?.slice(0, 3).toUpperCase() || "---"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-[var(--text-secondary)] truncate">
                              {player.name}
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)]">
                              {player.nationality}
                              {player.dateOfBirth &&
                                ` · ${calculateAge(player.dateOfBirth)} yrs`}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
            )}
          </div>
        </div>
      </div>
    );
  } catch {
    return (
      <div className="bg-[var(--bg-card)] rounded-2xl p-8 text-center border border-[var(--border)]">
        <p className="text-red-400 text-sm">Failed to load team data</p>
      </div>
    );
  }
}

export default async function TeamPage({
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
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
      </div>
      <Suspense fallback={<Skeleton />}>
        <TeamContent id={parseInt(id, 10)} />
      </Suspense>
    </div>
  );
}
