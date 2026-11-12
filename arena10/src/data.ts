// ============================================================
// ARENA 10 — Base de données centrale (données de démonstration)
// ============================================================

export type Match = {
  id: number
  league: string
  country: string
  flag: string
  home: string
  away: string
  h: string
  a: string
  time: string
  date: string
  day: string
  form: string
  confidence: number
  pick: string
  odds: { h: number; d: number; a: number }
  stats: { homeGoals: number; awayGoals: number; homePoss: number; awayPoss: number; homeShots: number; awayShots: number }
  analysis: string
  tags: string[]
  status?: 'live' | 'upcoming' | 'finished'
  score?: string
  homeScore?: number
  awayScore?: number
  dateIso?: string
  detail?: string
}

export type Club = {
  id: string
  name: string
  league: string
  country: string
  color: string
  stats: {
    pts: number; played: number; won: number; drawn: number; lost: number
    goalsFor: number; goalsAgainst: number; form: string[]
    xG: number; xGA: number; possession: number; shots: number
    passAcc: number; cleanSheets: number; btts: number
  }
}

export type Bet = {
  id: number
  matchId: number
  match: string
  pick: string
  odds: number
  stake: number
  result?: 'win' | 'loss' | 'void' | 'pending'
  profit?: number
  date: string
  league: string
}

export type News = {
  id: number
  title: string
  summary: string
  league: string
  tag: string
  time: string
  img: string
  hot: boolean
}

// ---- MATCHS (aucun mock par défaut, alimenté par ESPN) ----
export const matches: Match[] = []

// ---- CLUBS --------------------------------------------------------
export const clubs: Club[] = [
  {
    id:'ARS', name:'Arsenal', league:'Premier League', country:'Angleterre', color:'#d92332',
    stats:{pts:28, played:12, won:9, drawn:1, lost:2, goalsFor:28, goalsAgainst:12, form:['V','V','N','V','V'],
      xG:2.1, xGA:0.95, possession:60, shots:16, passAcc:88, cleanSheets:5, btts:4}
  },
  {
    id:'CHE', name:'Chelsea', league:'Premier League', country:'Angleterre', color:'#174b8b',
    stats:{pts:18, played:12, won:5, drawn:3, lost:4, goalsFor:19, goalsAgainst:18, form:['N','D','V','D','N'],
      xG:1.6, xGA:1.5, possession:52, shots:13, passAcc:85, cleanSheets:3, btts:6}
  },
  {
    id:'LIV', name:'Liverpool', league:'Premier League', country:'Angleterre', color:'#b91c2b',
    stats:{pts:26, played:12, won:8, drawn:2, lost:2, goalsFor:30, goalsAgainst:14, form:['V','V','D','V','N'],
      xG:2.4, xGA:1.1, possession:55, shots:18, passAcc:87, cleanSheets:4, btts:7}
  },
  {
    id:'MCI', name:'Man. City', league:'Premier League', country:'Angleterre', color:'#6bb8d8',
    stats:{pts:22, played:12, won:7, drawn:1, lost:4, goalsFor:24, goalsAgainst:16, form:['V','D','V','N','V'],
      xG:2.2, xGA:1.3, possession:65, shots:19, passAcc:91, cleanSheets:3, btts:5}
  },
  {
    id:'RMA', name:'Real Madrid', league:'LaLiga', country:'Espagne', color:'#d8b95b',
    stats:{pts:30, played:12, won:10, drawn:0, lost:2, goalsFor:34, goalsAgainst:11, form:['V','V','V','N','V'],
      xG:2.8, xGA:0.9, possession:60, shots:20, passAcc:90, cleanSheets:6, btts:3}
  },
  {
    id:'BAR', name:'Barcelona', league:'LaLiga', country:'Espagne', color:'#a71930',
    stats:{pts:27, played:12, won:9, drawn:0, lost:3, goalsFor:29, goalsAgainst:14, form:['V','N','V','V','D'],
      xG:2.5, xGA:1.1, possession:62, shots:19, passAcc:89, cleanSheets:4, btts:5}
  },
  {
    id:'BAY', name:'Bayern', league:'Bundesliga', country:'Allemagne', color:'#d62836',
    stats:{pts:28, played:11, won:9, drawn:1, lost:1, goalsFor:38, goalsAgainst:15, form:['V','V','V','D','V'],
      xG:3.1, xGA:1.3, possession:63, shots:22, passAcc:88, cleanSheets:4, btts:6}
  },
  {
    id:'BVB', name:'Dortmund', league:'Bundesliga', country:'Allemagne', color:'#e5c52e',
    stats:{pts:20, played:11, won:6, drawn:2, lost:3, goalsFor:26, goalsAgainst:19, form:['N','V','D','V','N'],
      xG:2.3, xGA:1.7, possession:48, shots:17, passAcc:83, cleanSheets:2, btts:8}
  },
  {
    id:'PSG', name:'Paris SG', league:'Ligue 1', country:'France', color:'#183b7a',
    stats:{pts:32, played:12, won:10, drawn:2, lost:0, goalsFor:35, goalsAgainst:9, form:['V','V','V','V','N'],
      xG:2.9, xGA:0.75, possession:63, shots:21, passAcc:90, cleanSheets:7, btts:2}
  },
  {
    id:'INT', name:'Inter', league:'Serie A', country:'Italie', color:'#1d3d81',
    stats:{pts:25, played:12, won:8, drawn:1, lost:3, goalsFor:22, goalsAgainst:13, form:['V','V','N','V','V'],
      xG:1.9, xGA:1.0, possession:52, shots:15, passAcc:86, cleanSheets:5, btts:4}
  },
]

// ---- PARIS HISTORIQUES (vide par défaut) ----
export const bets: Bet[] = []

// ---- ACTUALITÉS (vide par défaut) ----
export const news: News[] = []

// ---- LIGUE TABLE (simulation classements) ----------------------
export type StandingRow = { pos: number; club: string; abbr: string; color: string; pts: number; pld: number; w: number; d: number; l: number; gf: number; ga: number; gd: number; form: string[] }

export const standings: Record<string, StandingRow[]> = {
  'Premier League': [
    {pos:1, club:'Liverpool',      abbr:'LIV', color:'#b91c2b', pts:26, pld:12, w:8, d:2, l:2, gf:30, ga:14, gd:16, form:['V','V','D','V','N']},
    {pos:2, club:'Arsenal',        abbr:'ARS', color:'#d92332', pts:28, pld:12, w:9, d:1, l:2, gf:28, ga:12, gd:16, form:['V','V','N','V','V']},
    {pos:3, club:'Man. City',      abbr:'MCI', color:'#6bb8d8', pts:22, pld:12, w:7, d:1, l:4, gf:24, ga:16, gd:8,  form:['V','D','V','N','V']},
    {pos:4, club:'Chelsea',        abbr:'CHE', color:'#174b8b', pts:18, pld:12, w:5, d:3, l:4, gf:19, ga:18, gd:1,  form:['N','D','V','D','N']},
    {pos:5, club:'Tottenham',      abbr:'TOT', color:'#1f1f1f', pts:17, pld:12, w:5, d:2, l:5, gf:21, ga:20, gd:1,  form:['N','V','V','N','D']},
  ],
  'LaLiga': [
    {pos:1, club:'Real Madrid',    abbr:'RMA', color:'#d8b95b', pts:30, pld:12, w:10, d:0, l:2, gf:34, ga:11, gd:23, form:['V','V','V','N','V']},
    {pos:2, club:'Barcelona',      abbr:'BAR', color:'#a71930', pts:27, pld:12, w:9, d:0, l:3, gf:29, ga:14, gd:15, form:['V','N','V','V','D']},
    {pos:3, club:'Atletico',       abbr:'ATL', color:'#cb2f38', pts:25, pld:12, w:8, d:1, l:3, gf:20, ga:9,  gd:11, form:['V','V','V','N','V']},
    {pos:4, club:'Villarreal',     abbr:'VIL', color:'#f1d337', pts:16, pld:12, w:5, d:1, l:6, gf:18, ga:21, gd:-3, form:['D','N','V','D','N']},
    {pos:5, club:'Sevilla',        abbr:'SEV', color:'#d92d39', pts:14, pld:12, w:4, d:2, l:6, gf:15, ga:22, gd:-7, form:['D','N','D','V','N']},
  ],
}

