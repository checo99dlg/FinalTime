export interface League {
  code: string;
  name: string;
  country: string;
  flag: string;
  type: "LEAGUE" | "CUP";
  apiFootballId: number;
}

export const LEAGUES: League[] = [
  { code: "PL", name: "Premier League", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", type: "LEAGUE", apiFootballId: 39 },
  { code: "PD", name: "La Liga", country: "Spain", flag: "🇪🇸", type: "LEAGUE", apiFootballId: 140 },
  { code: "SA", name: "Serie A", country: "Italy", flag: "🇮🇹", type: "LEAGUE", apiFootballId: 135 },
  { code: "BL1", name: "Bundesliga", country: "Germany", flag: "🇩🇪", type: "LEAGUE", apiFootballId: 78 },
  { code: "FL1", name: "Ligue 1", country: "France", flag: "🇫🇷", type: "LEAGUE", apiFootballId: 61 },
  { code: "PPL", name: "Primeira Liga", country: "Portugal", flag: "🇵🇹", type: "LEAGUE", apiFootballId: 94 },
  { code: "DED", name: "Eredivisie", country: "Netherlands", flag: "🇳🇱", type: "LEAGUE", apiFootballId: 88 },
  { code: "CL", name: "Champions League", country: "Europe", flag: "🏆", type: "CUP", apiFootballId: 2 },
  { code: "WC", name: "FIFA World Cup", country: "World", flag: "🌍", type: "CUP", apiFootballId: 1 },
];

export const LEAGUE_MAP = Object.fromEntries(LEAGUES.map((l) => [l.code, l]));
