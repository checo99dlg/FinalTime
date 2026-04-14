// API-Football (api-sports.io) client for lineups and events
// This is used as a secondary source until football-data.org is upgraded
// To switch to football-data.org later, just update the getMatchExtras() function

import { LEAGUE_MAP } from "./leagues";

const BASE_URL = "https://v3.football.api-sports.io";

export interface AFPlayer {
  id: number;
  name: string;
  number: number;
  pos: string;
  grid: string | null;
}

export interface AFLineup {
  team: {
    id: number;
    name: string;
    logo: string;
    colors: {
      player: { primary: string; number: string; border: string } | null;
      goalkeeper: { primary: string; number: string; border: string } | null;
    } | null;
  };
  formation: string;
  startXI: { player: AFPlayer }[];
  substitutes: { player: AFPlayer }[];
  coach: { id: number; name: string; photo: string } | null;
}

export interface AFEvent {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string; logo: string };
  player: { id: number; name: string };
  assist: { id: number | null; name: string | null };
  type: string; // "Goal", "Card", "subst", "Var"
  detail: string; // "Normal Goal", "Own Goal", "Penalty", "Yellow Card", "Red Card", "Substitution 1", etc.
  comments: string | null;
}

export interface MatchExtras {
  lineups: AFLineup[];
  events: AFEvent[];
  fixtureId: number | null;
}

async function fetchAF<T>(endpoint: string): Promise<T> {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    throw new Error("API_FOOTBALL_KEY is not configured in .env.local");
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "x-apisports-key": apiKey },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`API-Football error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\bfc\b/g, "")
    .replace(/\bsc\b/g, "")
    .replace(/\bcf\b/g, "")
    .replace(/\bafc\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function teamNamesMatch(name1: string, name2: string): boolean {
  const n1 = normalizeTeamName(name1);
  const n2 = normalizeTeamName(name2);
  return n1.includes(n2) || n2.includes(n1);
}

// Find the API-Football fixture ID that matches a football-data.org match
async function findFixtureId(
  date: string,
  homeTeamName: string,
  competitionCode: string
): Promise<number | null> {
  const league = LEAGUE_MAP[competitionCode];
  if (!league) return null;

  try {
    const season = new Date(date).getFullYear();
    const data = await fetchAF<{
      response: { fixture: { id: number }; teams: { home: { name: string } } }[];
    }>(`/fixtures?date=${date}&league=${league.apiFootballId}&season=${season}`);

    // Also try previous year season (e.g. 2025-26 season uses season=2025)
    let fixtures = data.response;
    if (fixtures.length === 0) {
      const altData = await fetchAF<{
        response: { fixture: { id: number }; teams: { home: { name: string } } }[];
      }>(`/fixtures?date=${date}&league=${league.apiFootballId}&season=${season - 1}`);
      fixtures = altData.response;
    }

    for (const f of fixtures) {
      if (teamNamesMatch(f.teams.home.name, homeTeamName)) {
        return f.fixture.id;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function getMatchExtras(
  date: string,
  homeTeamName: string,
  competitionCode: string
): Promise<MatchExtras> {
  const empty: MatchExtras = { lineups: [], events: [], fixtureId: null };

  const fixtureId = await findFixtureId(date, homeTeamName, competitionCode);
  if (!fixtureId) return empty;

  try {
    const [lineupsData, eventsData] = await Promise.all([
      fetchAF<{ response: AFLineup[] }>(`/fixtures/lineups?fixture=${fixtureId}`),
      fetchAF<{ response: AFEvent[] }>(`/fixtures/events?fixture=${fixtureId}`),
    ]);

    return {
      lineups: lineupsData.response || [],
      events: eventsData.response || [],
      fixtureId,
    };
  } catch {
    return empty;
  }
}
