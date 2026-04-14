import type {
  MatchResponse,
  StandingsResponse,
  MatchDetailResponse,
  Match,
  ScorersResponse,
  TeamDetail,
  TeamMatchesResponse,
  Person,
} from "./types";

const BASE_URL = "https://api.football-data.org/v4";

async function fetchApi<T>(endpoint: string): Promise<T> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey || apiKey === "your_api_key_here") {
    throw new Error("FOOTBALL_DATA_API_KEY is not configured in .env.local");
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "X-Auth-Token": apiKey },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export async function getMatches(date?: string): Promise<Match[]> {
  const dateParam = date || new Date().toISOString().split("T")[0];
  const data = await fetchApi<MatchResponse>(
    `/matches?date=${dateParam}`
  );
  return data.matches;
}

export async function getCompetitionMatches(
  code: string,
  matchday?: number
): Promise<Match[]> {
  const params = matchday ? `?matchday=${matchday}` : "";
  const data = await fetchApi<MatchResponse>(
    `/competitions/${code}/matches${params}`
  );
  return data.matches;
}

export async function getStandings(code: string): Promise<StandingsResponse> {
  return fetchApi<StandingsResponse>(`/competitions/${code}/standings`);
}

export async function getMatch(id: number): Promise<MatchDetailResponse> {
  const match = await fetchApi<MatchDetailResponse>(`/matches/${id}`);
  return match;
}

export async function getScorers(code: string): Promise<ScorersResponse> {
  return fetchApi<ScorersResponse>(`/competitions/${code}/scorers`);
}

export async function getTeam(id: number): Promise<TeamDetail> {
  return fetchApi<TeamDetail>(`/teams/${id}`);
}

export async function getTeamMatches(
  id: number,
  status?: string
): Promise<TeamMatchesResponse> {
  const params = status ? `?status=${status}` : "";
  return fetchApi<TeamMatchesResponse>(`/teams/${id}/matches${params}`);
}

export async function getPerson(id: number): Promise<Person> {
  return fetchApi<Person>(`/persons/${id}`);
}

export function groupMatchesByCompetition(
  matches: Match[]
): Map<string, { competition: Match["competition"]; matches: Match[] }> {
  const grouped = new Map<
    string,
    { competition: Match["competition"]; matches: Match[] }
  >();

  for (const match of matches) {
    const key = match.competition.code;
    if (!grouped.has(key)) {
      grouped.set(key, { competition: match.competition, matches: [] });
    }
    grouped.get(key)!.matches.push(match);
  }

  return grouped;
}
