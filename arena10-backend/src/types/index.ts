// ============================================================
// ARENA 10 Backend — Types TypeScript centralisés
// ============================================================

export interface NewsArticle {
  id: string
  title: string
  summary: string
  content?: string
  url: string
  urlToImage?: string
  source: string
  author?: string
  publishedAt: string
  league: string
  tag: NewsTag
  hot: boolean
  img: string
}

export type NewsTag =
  | 'ANALYSE'
  | 'TRANSFERT'
  | 'AVANT-MATCH'
  | 'PERFORMANCE'
  | 'SÉLECTION'
  | 'ALGORITHME'
  | 'BLESSURE'
  | 'TACTIQUE'
  | 'RÉSULTAT'
  | 'MERCATO'

export interface FullMatch {
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
  stats: {
    homeGoals: number
    awayGoals: number
    homePoss: number
    awayPoss: number
    homeShots: number
    awayShots: number
  }
  analysis: string
  tags: string[]
  status: 'live' | 'upcoming' | 'finished'
  score?: string
  homeScore?: number
  awayScore?: number
  dateIso?: string
  detail?: string
}

export interface LiveMatch {
  id: number
  league: string
  country: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  minute: number
  status: 'live' | 'upcoming' | 'finished'
  startTime: string
  venue?: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  source: 'live' | 'cache' | 'fallback'
  cachedAt?: string
  total?: number
}

export interface ApiError {
  success: false
  error: string
  code: number
  requestId?: string
}

export interface ServerConfig {
  port: number
  frontendUrl: string
  internalApiKey: string
  newsApiKey: string
  footballDataApiKey: string
  rapidApiKey: string
  geminiApiKey: string
  groqApiKey: string
  cacheNewsttl: number
  cacheMatchesTtl: number
  nodeEnv: string
  databaseUrl?: string
  redisUrl?: string
}

export type BetStatus = 'pending' | 'won' | 'lost' | 'void'

export interface CombinationLeg {
  matchId: number
  home: string
  away: string
  h: string
  a: string
  league: string
  date: string
  time: string
  option: string    // ex: "Victoire Domicile", "Plus de 1.5 buts", "Double chance 1X"
  market: string    // "1X2" | "DOUBLE_CHANCE" | "OVER_UNDER" | "BTTS" | "CORNERS" | "CARDS" | "HANDICAP"
  pick: string      // "1" | "2" | "1X" | "X2" | "O1.5" | "O2.5" | "BTTS_YES"
  odds: number
  confidence: number
  reasoning: string
  status?: BetStatus // 'pending' | 'won' | 'lost'
  score?: string     // ex: "2 - 1"
}

export interface AiCombination {
  id: string
  title: string
  badge: string     // "SÉCURITÉ MAXIMALE" | "ÉQUILIBRÉ & VALEUR" | "CHOCS EUROPÉENS" | "OPTIMISÉ UTILISATEUR"
  targetOdds: number
  totalOdds: number
  totalConfidence: number
  legs: CombinationLeg[]
  justification: string
  expectedValue: string
  source: 'gemini' | 'groq' | 'arena-algo'
  status?: BetStatus // 'pending' | 'won' | 'lost'
  date?: string      // "YYYY-MM-DD"
  dateLabel?: string // "Dimanche 08 Novembre"
  settledAt?: string
}

export interface HistoryDay {
  date: string
  dateLabel: string
  combinations: AiCombination[]
  stats: {
    total: number
    won: number
    lost: number
    pending: number
    winRate: number
  }
}

export interface HistorySummary {
  daysCount: number
  totalCombinations: number
  wonCombinations: number
  lostCombinations: number
  pendingCombinations: number
  winRate: number
  totalOddsWon: number
  roiPercent: number
  unitsBalance: number
}

export interface PredictionHistoryResponse {
  summary: HistorySummary
  days: HistoryDay[]
}

export interface OptimizeRequest {
  matchIds: number[]
  targetOdds?: number
}

export interface NewsApiRawArticle {
  title: string | null
  description: string | null
  content: string | null
  url: string
  urlToImage: string | null
  source: { id: string | null; name: string }
  author: string | null
  publishedAt: string
}

export interface NewsApiResponse {
  status: string
  totalResults: number
  articles: NewsApiRawArticle[]
}

export interface SportsDbEvent {
  idEvent: string
  strEvent: string
  strLeague: string
  strHomeTeam: string
  strAwayTeam: string
  intHomeScore: string | null
  intAwayScore: string | null
  dateEvent: string
  strTime: string
  strStatus: string
  strCountry: string
}

// ── TYPES UTILISATEUR & AUTHENTIFICATION ─────────────────────
export interface UserProfile {
  id: string
  email: string
  name: string
  title: string
  role: 'user' | 'pro' | 'admin'
  createdAt: string
  lastLogin?: string
  avatarColor?: string
  avatarUrl?: string | null
  googleId?: string | null
  favorites?: {
    clubs: string[]
    leagues: string[]
  }
  settings?: Record<string, any>
}

export interface StoredUser extends UserProfile {
  passwordHash: string
  salt: string
}

export interface AuthSession {
  token: string
  userId: string
  createdAt: string
  expiresAt: string
}

export interface AuthResponse {
  success: boolean
  user?: UserProfile
  token?: string
  error?: string
}

// ── TYPES ESPACE PERSONNEL (POSTGRESQL & REDIS) ──────────────
export interface UserBet {
  id: number
  userId: string
  matchId?: number
  matchName: string
  league?: string
  pick: string
  odds: number
  stake: number
  result?: 'win' | 'loss' | 'pending' | 'void'
  profit?: number
  date: string
  createdAt?: string
}

export interface UserFavorite {
  id?: number
  userId: string
  type: 'club' | 'league'
  itemId: string
  createdAt?: string
}

