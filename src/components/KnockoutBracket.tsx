"use client";

import type { Match } from "../lib/types";

interface Tie {
  teamA: { name: string; crest: string; id: number };
  teamB: { name: string; crest: string; id: number };
  leg1: Match | null;
  leg2: Match | null;
  aggA: number;
  aggB: number;
  winner: "A" | "B" | null;
  singleLeg: boolean;
}

interface Round {
  stage: string;
  name: string;
  ties: Tie[];
}

const STAGE_ORDER = [
  "LAST_32",
  "PLAYOFFS",
  "LAST_16",
  "QUARTER_FINALS",
  "SEMI_FINALS",
  "THIRD_PLACE",
  "FINAL",
];

const STAGE_LABELS: Record<string, string> = {
  LAST_32: "Round of 32",
  PLAYOFFS: "Playoffs",
  LAST_16: "Round of 16",
  QUARTER_FINALS: "Quarter-Finals",
  SEMI_FINALS: "Semi-Finals",
  THIRD_PLACE: "3rd Place",
  FINAL: "Final",
};

function detectCompetitionType(matches: Match[]): string {
  const knockoutMatches = matches.filter(
    (m) =>
      STAGE_ORDER.includes(m.stage) &&
      m.stage !== "FINAL" &&
      m.stage !== "THIRD_PLACE"
  );
  for (const m of knockoutMatches) {
    const hasReturnLeg = knockoutMatches.some(
      (m2) =>
        m2.id !== m.id &&
        m2.stage === m.stage &&
        m2.homeTeam.id === m.awayTeam.id &&
        m2.awayTeam.id === m.homeTeam.id
    );
    if (hasReturnLeg) return "CUP_TWO_LEG";
  }
  return "CUP_SINGLE_LEG";
}

function pairMatches(matches: Match[], competitionType: string): Tie[] {
  const ties: Tie[] = [];
  const used = new Set<number>();
  const stage = matches[0]?.stage || "";
  const isSingleLeg =
    competitionType === "CUP_SINGLE_LEG" ||
    stage === "FINAL" ||
    stage === "THIRD_PLACE";

  if (isSingleLeg) {
    for (const m of matches) {
      ties.push({
        teamA: {
          name: m.homeTeam.shortName || m.homeTeam.name,
          crest: m.homeTeam.crest,
          id: m.homeTeam.id,
        },
        teamB: {
          name: m.awayTeam.shortName || m.awayTeam.name,
          crest: m.awayTeam.crest,
          id: m.awayTeam.id,
        },
        leg1: m,
        leg2: null,
        aggA: m.score.fullTime.home ?? 0,
        aggB: m.score.fullTime.away ?? 0,
        winner:
          m.status === "FINISHED"
            ? m.score.winner === "HOME_TEAM"
              ? "A"
              : m.score.winner === "AWAY_TEAM"
                ? "B"
                : null
            : null,
        singleLeg: true,
      });
    }
    return ties;
  }

  for (const m of matches) {
    if (used.has(m.id)) continue;
    const teamAId = m.homeTeam.id;
    const teamBId = m.awayTeam.id;

    const returnLeg = matches.find(
      (m2) =>
        m2.id !== m.id &&
        !used.has(m2.id) &&
        m2.homeTeam.id === teamBId &&
        m2.awayTeam.id === teamAId
    );

    used.add(m.id);
    if (returnLeg) used.add(returnLeg.id);

    const leg1 = m;
    const leg2 = returnLeg || null;
    const scoreA =
      (leg1.score.fullTime.home ?? 0) + (leg2?.score.fullTime.away ?? 0);
    const scoreB =
      (leg1.score.fullTime.away ?? 0) + (leg2?.score.fullTime.home ?? 0);
    const allFinished =
      leg1.status === "FINISHED" && (!leg2 || leg2.status === "FINISHED");

    ties.push({
      teamA: {
        name: m.homeTeam.shortName || m.homeTeam.name,
        crest: m.homeTeam.crest,
        id: teamAId,
      },
      teamB: {
        name: m.awayTeam.shortName || m.awayTeam.name,
        crest: m.awayTeam.crest,
        id: teamBId,
      },
      leg1,
      leg2,
      aggA: scoreA,
      aggB: scoreB,
      winner: allFinished
        ? scoreA > scoreB
          ? "A"
          : scoreB > scoreA
            ? "B"
            : null
        : null,
      singleLeg: false,
    });
  }
  return ties;
}

// Get all team IDs that appear in a tie
function tieTeamIds(tie: Tie): number[] {
  const ids: number[] = [];
  if (tie.teamA.id) ids.push(tie.teamA.id);
  if (tie.teamB.id) ids.push(tie.teamB.id);
  return ids;
}

// Order ties so that adjacent ties in round N feed into the same tie in round N+1.
// Works backward from the deepest round with known teams:
// for each tie in round N+1, find its feeder ties in round N and place them adjacent.
function orderTiesByBracket(rounds: Round[]): Round[] {
  if (rounds.length <= 1) return rounds;

  const ordered = rounds.map((r) => ({ ...r, ties: [...r.ties] }));

  // Find deepest round with at least one known team
  let anchor = ordered.length - 1;
  while (
    anchor > 0 &&
    ordered[anchor].ties.every((t) => !t.teamA.id && !t.teamB.id)
  ) {
    anchor--;
  }

  // Work backward: reorder round r based on round r+1
  for (let r = anchor - 1; r >= 0; r--) {
    const currentTies = ordered[r].ties;
    const nextTies = ordered[r + 1].ties;
    const newOrder: Tie[] = [];
    const used = new Set<number>(); // indices already placed

    for (const nextTie of nextTies) {
      const nextIds = new Set(tieTeamIds(nextTie));

      // Find ties in current round containing a team from this next-round tie
      for (let i = 0; i < currentTies.length; i++) {
        if (used.has(i)) continue;
        const ids = tieTeamIds(currentTies[i]);
        if (ids.some((id) => nextIds.has(id))) {
          newOrder.push(currentTies[i]);
          used.add(i);
        }
      }
    }

    // Append any remaining ties (teams that entered at this round, not from prior)
    for (let i = 0; i < currentTies.length; i++) {
      if (!used.has(i)) newOrder.push(currentTies[i]);
    }

    ordered[r] = { ...ordered[r], ties: newOrder };
  }

  return ordered;
}

// After ordering, split into left/right by tracing team flow forward
function buildConsistentBracket(rounds: Round[]): {
  left: Round[];
  right: Round[];
} {
  if (rounds.length === 0) return { left: [], right: [] };

  const teamToSide = new Map<number, "left" | "right">();
  const left: Round[] = [];
  const right: Round[] = [];

  for (let r = 0; r < rounds.length; r++) {
    const round = rounds[r];
    const leftTies: Tie[] = [];
    const rightTies: Tie[] = [];

    if (r === 0) {
      const half = Math.ceil(round.ties.length / 2);
      for (let i = 0; i < round.ties.length; i++) {
        const tie = round.ties[i];
        const side: "left" | "right" = i < half ? "left" : "right";
        if (side === "left") leftTies.push(tie);
        else rightTies.push(tie);
        if (tie.teamA.id) teamToSide.set(tie.teamA.id, side);
        if (tie.teamB.id) teamToSide.set(tie.teamB.id, side);
      }
    } else {
      const unassigned: Tie[] = [];
      for (const tie of round.ties) {
        const sideA = tie.teamA.id
          ? teamToSide.get(tie.teamA.id)
          : undefined;
        const sideB = tie.teamB.id
          ? teamToSide.get(tie.teamB.id)
          : undefined;
        const side = sideA || sideB;
        if (side) {
          if (side === "left") leftTies.push(tie);
          else rightTies.push(tie);
          if (tie.teamA.id) teamToSide.set(tie.teamA.id, side);
          if (tie.teamB.id) teamToSide.set(tie.teamB.id, side);
        } else {
          unassigned.push(tie);
        }
      }
      for (const tie of unassigned) {
        const side: "left" | "right" =
          leftTies.length <= rightTies.length ? "left" : "right";
        if (side === "left") leftTies.push(tie);
        else rightTies.push(tie);
        if (tie.teamA.id) teamToSide.set(tie.teamA.id, side);
        if (tie.teamB.id) teamToSide.set(tie.teamB.id, side);
      }
    }

    left.push({ ...round, ties: leftTies });
    right.push({ ...round, ties: rightTies });
  }

  return { left, right };
}

function TieCard({ tie }: { tie: Tie }) {
  const tbd = !tie.teamA.id && !tie.teamB.id;

  return (
    <div className="bg-[var(--bg-elevated)] rounded-lg overflow-hidden w-44 shrink-0 border border-[var(--border)]">
      <div
        className={`flex items-center justify-between px-2.5 py-1.5 ${
          tie.winner === "A" ? "bg-[var(--accent-muted)]" : ""
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {tie.teamA.crest ? (
            <img
              src={tie.teamA.crest}
              alt=""
              className="w-4 h-4 object-contain shrink-0"
            />
          ) : (
            <div className="w-4 h-4 rounded-full bg-[var(--bg-elevated)] shrink-0" />
          )}
          <span
            className={`text-[11px] truncate ${
              tie.winner === "A" ? "text-white font-semibold" : "text-[var(--text-secondary)]"
            }`}
          >
            {tie.teamA.id ? tie.teamA.name : "TBD"}
          </span>
        </div>
        {!tbd && (
          <span
            className={`text-[11px] font-bold ml-1 ${
              tie.winner === "A" ? "text-white" : "text-[var(--text-muted)]"
            }`}
          >
            {tie.aggA}
          </span>
        )}
      </div>
      <div className="border-t border-[var(--border)]" />
      <div
        className={`flex items-center justify-between px-2.5 py-1.5 ${
          tie.winner === "B" ? "bg-[var(--accent-muted)]" : ""
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {tie.teamB.crest ? (
            <img
              src={tie.teamB.crest}
              alt=""
              className="w-4 h-4 object-contain shrink-0"
            />
          ) : (
            <div className="w-4 h-4 rounded-full bg-[var(--bg-elevated)] shrink-0" />
          )}
          <span
            className={`text-[11px] truncate ${
              tie.winner === "B" ? "text-white font-semibold" : "text-[var(--text-secondary)]"
            }`}
          >
            {tie.teamB.id ? tie.teamB.name : "TBD"}
          </span>
        </div>
        {!tbd && (
          <span
            className={`text-[11px] font-bold ml-1 ${
              tie.winner === "B" ? "text-white" : "text-[var(--text-muted)]"
            }`}
          >
            {tie.aggB}
          </span>
        )}
      </div>
      {!tie.singleLeg &&
        (tie.leg1?.status === "FINISHED" || tie.leg2?.status === "FINISHED") && (
          <div className="border-t border-[var(--border)] px-2.5 py-1 bg-[var(--bg-card)]">
            <div className="flex gap-2 text-[10px] text-[var(--text-muted)]">
              {tie.leg1 && tie.leg1.status === "FINISHED" && (
                <span>
                  1st: {tie.leg1.score.fullTime.home}-
                  {tie.leg1.score.fullTime.away}
                </span>
              )}
              {tie.leg2 && tie.leg2.status === "FINISHED" && (
                <span>
                  2nd: {tie.leg2.score.fullTime.home}-
                  {tie.leg2.score.fullTime.away}
                </span>
              )}
            </div>
          </div>
        )}
    </div>
  );
}

function BracketColumn({
  round,
  totalHeight,
}: {
  round: Round;
  totalHeight: number;
}) {
  return (
    <div className="flex flex-col items-center shrink-0">
      <h3 className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 whitespace-nowrap">
        {round.name}
      </h3>
      <div
        className="flex flex-col justify-around gap-3"
        style={{ minHeight: totalHeight }}
      >
        {round.ties.map((tie, i) => (
          <TieCard key={i} tie={tie} />
        ))}
      </div>
    </div>
  );
}

export default function KnockoutBracket({ matches }: { matches: Match[] }) {
  const competitionType = detectCompetitionType(matches);

  const stageMatches = new Map<string, Match[]>();
  for (const m of matches) {
    if (!STAGE_ORDER.includes(m.stage)) continue;
    if (!stageMatches.has(m.stage)) stageMatches.set(m.stage, []);
    stageMatches.get(m.stage)!.push(m);
  }

  const mainStages = STAGE_ORDER.filter(
    (s) => s !== "THIRD_PLACE" && s !== "FINAL" && stageMatches.has(s)
  );
  const hasThirdPlace = stageMatches.has("THIRD_PLACE");
  const hasFinal = stageMatches.has("FINAL");

  let rounds: Round[] = mainStages.map((stage) => ({
    stage,
    name: STAGE_LABELS[stage] || stage,
    ties: pairMatches(stageMatches.get(stage)!, competitionType),
  }));

  if (rounds.length === 0 && !hasFinal) return null;

  // 1) Order ties so feeders for the same next-round tie are adjacent
  rounds = orderTiesByBracket(rounds);

  // 2) Split into left/right by tracing team flow
  const { left: leftRounds, right: rightRounds } =
    buildConsistentBracket(rounds);

  const maxFirstRoundTies = Math.max(
    leftRounds[0]?.ties.length || 0,
    rightRounds[0]?.ties.length || 0
  );
  const totalHeight = Math.max(maxFirstRoundTies * 68, 300);

  return (
    <div className="bg-[var(--bg-card)] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold text-white">Knockout Stage</h2>
      </div>
      <div className="p-4 overflow-x-auto">
        <div className="flex gap-4 min-w-max items-start">
          {/* Left side: early rounds → center */}
          {leftRounds.map((round) => (
            <BracketColumn
              key={`L-${round.stage}`}
              round={round}
              totalHeight={totalHeight}
            />
          ))}

          {/* Center: Final + Trophy + 3rd Place */}
          <div
            className="flex flex-col items-center justify-center shrink-0 px-2"
            style={{ minHeight: totalHeight }}
          >
            {hasFinal && (
              <div className="mb-3">
                <h3 className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 text-center">
                  Final
                </h3>
                <TieCard
                  tie={
                    pairMatches(
                      stageMatches.get("FINAL")!,
                      competitionType
                    )[0]
                  }
                />
              </div>
            )}

            <span className="text-4xl my-2">🏆</span>
            <p className="text-[10px] text-[var(--text-muted)] mb-2">Champion</p>

            {hasThirdPlace && (
              <div className="mt-3">
                <h3 className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 text-center">
                  3rd Place
                </h3>
                <TieCard
                  tie={
                    pairMatches(
                      stageMatches.get("THIRD_PLACE")!,
                      competitionType
                    )[0]
                  }
                />
              </div>
            )}
          </div>

          {/* Right side: early rounds ← center (reversed) */}
          {[...rightRounds].reverse().map((round) => (
            <BracketColumn
              key={`R-${round.stage}`}
              round={round}
              totalHeight={totalHeight}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
