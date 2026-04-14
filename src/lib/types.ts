export interface Competition {
  id: number;
  name: string;
  code: string;
  type: string;
  emblem: string;
}

export interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface Score {
  winner: string | null;
  duration: string;
  fullTime: { home: number | null; away: number | null };
  halfTime: { home: number | null; away: number | null };
}

export interface Referee {
  id: number;
  name: string;
  type: string;
  nationality: string;
}

export interface Match {
  id: number;
  utcDate: string;
  status: string;
  matchday: number | null;
  stage: string;
  group: string | null;
  lastUpdated: string;
  homeTeam: Team;
  awayTeam: Team;
  score: Score;
  competition: Competition;
  referees: Referee[];
}

export interface MatchResponse {
  matches: Match[];
  resultSet: {
    count: number;
    competitions: string;
    first: string;
    last: string;
    played: number;
  };
}

export interface StandingEntry {
  position: number;
  team: Team;
  playedGames: number;
  form: string | null;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface Standing {
  stage: string;
  type: string;
  group: string | null;
  table: StandingEntry[];
}

export interface StandingsResponse {
  competition: Competition;
  season: {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number;
  };
  standings: Standing[];
}

export interface MatchDetail extends Match {
  odds: { homeWin?: number; draw?: number; awayWin?: number };
}

export interface HeadToHead {
  numberOfMatches: number;
  totalGoals: number;
  homeTeam: { id: number; name: string; wins: number; draws: number; losses: number };
  awayTeam: { id: number; name: string; wins: number; draws: number; losses: number };
}

export interface MatchDetailResponse {
  match: MatchDetail;
  head2head?: HeadToHead;
}

export interface Scorer {
  player: {
    id: number;
    name: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    section: string;
    position: string | null;
    shirtNumber: number | null;
    lastUpdated: string;
  };
  team: Team;
  playedMatches: number;
  goals: number;
  assists: number | null;
  penalties: number | null;
}

export interface ScorersResponse {
  count: number;
  competition: Competition;
  season: { id: number; startDate: string; endDate: string; currentMatchday: number };
  scorers: Scorer[];
}

export interface SquadPlayer {
  id: number;
  name: string;
  position: string;
  dateOfBirth: string;
  nationality: string;
}

export interface Coach {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  dateOfBirth: string;
  nationality: string;
  contract: { start: string; until: string } | null;
}

export interface TeamDetail {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  address: string;
  website: string;
  founded: number;
  clubColors: string;
  venue: string;
  runningCompetitions: Competition[];
  coach: Coach;
  squad: SquadPlayer[];
  area: { id: number; name: string; code: string; flag: string };
}

export interface TeamMatchesResponse {
  resultSet: {
    count: number;
    competitions: string;
    first: string;
    last: string;
    played: number;
    wins: number;
    draws: number;
    losses: number;
  };
  matches: Match[];
}

export interface Person {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  section: string;
  position: string;
  shirtNumber: number | null;
  currentTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
    address: string;
    website: string;
    founded: number;
    clubColors: string;
    venue: string;
    area: { id: number; name: string; code: string; flag: string };
    runningCompetitions: Competition[];
    contract: { start: string; until: string } | null;
  };
}
