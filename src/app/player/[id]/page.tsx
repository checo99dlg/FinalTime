import { Suspense } from "react";
import Link from "next/link";
import { getPerson } from "../../../lib/api";

function Skeleton() {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl p-8 border border-[var(--border)]">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-[var(--bg-elevated)] rounded-full animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 bg-[var(--bg-elevated)] rounded w-48 animate-pulse" />
          <div className="h-4 bg-[var(--bg-elevated)] rounded w-32 animate-pulse" />
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

function positionLabel(pos: string): string {
  const map: Record<string, string> = {
    Goalkeeper: "Goalkeeper",
    Defence: "Defender",
    Midfield: "Midfielder",
    Offence: "Forward",
  };
  return map[pos] || pos;
}

async function PlayerContent({ id }: { id: number }) {
  try {
    const person = await getPerson(id);
    const team = person.currentTeam;

    return (
      <div className="space-y-4">
        {/* Player Header */}
        <div className="bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border)] p-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-[var(--bg-elevated)] rounded-full flex items-center justify-center text-3xl text-[var(--text-muted)] shrink-0">
              ⚽
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{person.name}</h1>
              {person.position && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-[var(--accent-muted)] text-[var(--accent)] text-xs rounded-full font-medium">
                  {positionLabel(person.position)}
                </span>
              )}
              {person.shirtNumber && (
                <span className="inline-block mt-1 ml-2 px-2 py-0.5 bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-xs rounded-full font-medium">
                  #{person.shirtNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Player Info */}
        <div className="bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border)]">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <h2 className="text-sm font-semibold text-white">Info</h2>
          </div>
          <div className="p-4 space-y-3">
            {person.nationality && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Nationality</span>
                <span className="text-[var(--text-secondary)]">{person.nationality}</span>
              </div>
            )}
            {person.dateOfBirth && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Age</span>
                <span className="text-[var(--text-secondary)]">
                  {calculateAge(person.dateOfBirth)} years
                </span>
              </div>
            )}
            {person.dateOfBirth && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Date of Birth</span>
                <span className="text-[var(--text-secondary)]">
                  {new Date(person.dateOfBirth + "T12:00:00").toLocaleDateString(
                    "en-US",
                    { year: "numeric", month: "long", day: "numeric" }
                  )}
                </span>
              </div>
            )}
            {person.section && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Position</span>
                <span className="text-[var(--text-secondary)]">
                  {positionLabel(person.position || person.section)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Current Team */}
        {team && (
          <div className="bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border)]">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <h2 className="text-sm font-semibold text-white">Current Team</h2>
            </div>
            <div className="p-4">
              <Link
                href={`/team/${team.id}`}
                className="flex items-center gap-4 hover:bg-[var(--bg-card-hover)] -m-2 p-2 rounded-lg transition-colors"
              >
                {team.crest && (
                  <img
                    src={team.crest}
                    alt=""
                    className="w-12 h-12 object-contain"
                  />
                )}
                <div>
                  <p className="text-white font-semibold">{team.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {team.area?.flag && (
                      <img
                        src={team.area.flag}
                        alt=""
                        className="w-3 h-3 object-contain"
                      />
                    )}
                    <span className="text-xs text-[var(--text-muted)]">
                      {team.area?.name}
                    </span>
                  </div>
                  {team.contract && (
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">
                      Contract: {team.contract.start} → {team.contract.until}
                    </p>
                  )}
                </div>
              </Link>

              {/* Competitions */}
              {team.runningCompetitions?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-[var(--border)]">
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
                          className="w-3 h-3 object-contain"
                        />
                      )}
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        {comp.name}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  } catch {
    return (
      <div className="bg-[var(--bg-card)] rounded-2xl p-8 text-center border border-[var(--border)]">
        <p className="text-red-400 text-sm">Failed to load player data</p>
      </div>
    );
  }
}

export default async function PlayerPage({
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
        <PlayerContent id={parseInt(id, 10)} />
      </Suspense>
    </div>
  );
}
