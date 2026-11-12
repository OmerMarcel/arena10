// ============================================================
// ARENA 10 — Service API
// Connecte le frontend React au backend Express (port 4000)
// ============================================================

// URL de base de l'API — peut être surchargée via la variable d'environnement Vite
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// ── INTERFACES TYPESCRIPT ─────────────────────────────────────

/** Article d'actualité retourné par le backend */
export interface NewsArticle {
  id: string | number
  title: string
  summary: string
  content?: string
  url: string
  urlToImage?: string
  source: string
  author?: string
  publishedAt: string   // ISO 8601
  league: string
  tag: string
  hot: boolean
  img: string
}

/** Fiche complète d'un match (avec cotes, stats et analyse IA) */
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
  status?: 'live' | 'upcoming' | 'finished'
  score?: string
  homeScore?: number
  awayScore?: number
  dateIso?: string
  detail?: string
}

/** Match (en direct, à venir ou terminé) */
export interface LiveMatch {
  id: string | number
  league: string
  country: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  minute: number
  status: 'live' | 'upcoming' | 'finished'
  startTime: string    // ISO 8601
  venue?: string
}

/** Enveloppe générique des réponses API */
export interface ApiResponse<T> {
  success: boolean
  data: T
  source: 'live' | 'cache' | 'fallback'
  total?: number
  cachedAt?: string
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
  avatarUrl?: string
  favorites?: {
    clubs: string[]
    leagues: string[]
  }
  settings?: Record<string, any>
}

export interface AuthResponse {
  success: boolean
  user?: UserProfile
  token?: string
  error?: string
}

// ── OPTIONS DE REQUÊTE ────────────────────────────────────────

export interface FetchNewsOptions {
  league?: string
  tag?: string
  limit?: number
  refresh?: boolean
}

// ── HELPER : temps relatif ────────────────────────────────────

/**
 * Convertit une date ISO 8601 en texte relatif lisible.
 * Ex: "Il y a 2h", "Il y a 3j", "Il y a 5min"
 */
export function formatRelativeTime(isoDate: string): string {
  const now = Date.now()
  const then = new Date(isoDate).getTime()
  if (isNaN(then)) return 'Récemment'
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60_000)
  const diffH   = Math.floor(diffMs / 3_600_000)
  const diffJ   = Math.floor(diffMs / 86_400_000)

  if (diffMin < 1)  return 'À l\'instant'
  if (diffMin < 60) return `Il y a ${diffMin}min`
  if (diffH   < 24) return `Il y a ${diffH}h`
  if (diffJ   < 7)  return `Il y a ${diffJ}j`
  return new Date(isoDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// ── FONCTIONS ACTUALITÉS ──────────────────────────────────────

/**
 * Récupère la liste des actualités depuis le backend.
 * @param options  Filtres optionnels (ligue, tag, limite, forcer le rafraîchissement)
 * @returns        La réponse API avec les articles, ou null en cas d'erreur réseau
 */
export async function fetchNews(
  options?: FetchNewsOptions
): Promise<ApiResponse<NewsArticle[]> | null> {
  try {
    const params = new URLSearchParams()
    if (options?.league)  params.set('league',  options.league)
    if (options?.tag)     params.set('tag',     options.tag)
    if (options?.limit)   params.set('limit',   String(options.limit))
    if (options?.refresh) params.set('refresh', 'true')

    const query = params.toString() ? `?${params.toString()}` : ''
    const res = await fetch(`${API_BASE}/news${query}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json() as ApiResponse<NewsArticle[]>
  } catch (err) {
    // Fallback silencieux si le backend est indisponible
    console.warn('[ARENA10 API] fetchNews failed:', err)
    return null
  }
}

/**
 * Recherche des actualités par mot-clé.
 * @param query  Terme de recherche
 */
export async function searchNews(
  query: string
): Promise<ApiResponse<NewsArticle[]> | null> {
  try {
    const params = new URLSearchParams({ q: query })
    const res = await fetch(`${API_BASE}/news/search?${params.toString()}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json() as ApiResponse<NewsArticle[]>
  } catch (err) {
    console.warn('[ARENA10 API] searchNews failed:', err)
    return null
  }
}

// ── FONCTIONS MATCHS ──────────────────────────────────────────

/**
 * Récupère le calendrier complet des matchs avec stats, cotes et analyse IA.
 */
export async function fetchFullMatches(
  refresh?: boolean
): Promise<ApiResponse<FullMatch[]> | null> {
  try {
    const q = refresh ? '?refresh=true' : ''
    const res = await fetch(`${API_BASE}/matches/full${q}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json() as ApiResponse<FullMatch[]>
  } catch (err) {
    console.warn('[ARENA10 API] fetchFullMatches failed:', err)
    return null
  }
}

/**
 * Récupère les matchs en cours (statut "live").
 */
export async function fetchLiveMatches(): Promise<ApiResponse<LiveMatch[]> | null> {
  try {
    const res = await fetch(`${API_BASE}/matches/live`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json() as ApiResponse<LiveMatch[]>
  } catch (err) {
    console.warn('[ARENA10 API] fetchLiveMatches failed:', err)
    return null
  }
}

/**
 * Récupère les matchs à venir.
 * @param league  Filtre optionnel par compétition
 */
export async function fetchUpcomingMatches(
  league?: string
): Promise<ApiResponse<LiveMatch[]> | null> {
  try {
    const params = league ? new URLSearchParams({ league }) : null
    const query  = params ? `?${params.toString()}` : ''
    const res = await fetch(`${API_BASE}/matches/upcoming${query}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json() as ApiResponse<LiveMatch[]>
  } catch (err) {
    console.warn('[ARENA10 API] fetchUpcomingMatches failed:', err)
    return null
  }
}

/**
 * Récupère tous les matchs (live + à venir + terminés).
 */
export async function fetchAllMatches(): Promise<ApiResponse<LiveMatch[]> | null> {
  try {
    const res = await fetch(`${API_BASE}/matches/all`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json() as ApiResponse<LiveMatch[]>
  } catch (err) {
    console.warn('[ARENA10 API] fetchAllMatches failed:', err)
    return null
  }
}

// ── TYPES COMBINAISONS IA ─────────────────────────────────────

export type BetStatus = 'pending' | 'won' | 'lost' | 'void'

/** Un pied (match) dans une combinaison */
export interface CombinationLeg {
  matchId: number
  home: string
  away: string
  h: string
  a: string
  league: string
  date: string
  time: string
  option: string    // ex: "Victoire Domicile"
  market: string    // ex: "1X2"
  pick: string      // ex: "1"
  odds: number
  confidence: number
  reasoning: string
  status?: BetStatus
  score?: string     // ex: "2 - 1"
}

/** Combinaison complète générée par l'IA */
export interface AiCombination {
  id: string
  title: string
  badge: string
  targetOdds: number
  totalOdds: number
  totalConfidence: number
  legs: CombinationLeg[]
  justification: string
  expectedValue: string
  source: 'gemini' | 'groq' | 'arena-algo'
  status?: BetStatus
  date?: string
  dateLabel?: string
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

// ── FONCTIONS COMBINAISONS IA ─────────────────────────────────

/**
 * Récupère les combinaisons du jour générées par l'IA.
 * @param refresh  Forcer la régénération (ignore le cache)
 */
export async function fetchDailyCombinations(
  refresh?: boolean
): Promise<ApiResponse<AiCombination[]> | null> {
  try {
    const q = refresh ? '?refresh=true' : ''
    const res = await fetch(`${API_BASE}/predictions/combinations${q}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json() as ApiResponse<AiCombination[]>
  } catch (err) {
    console.warn('[ARENA10 API] fetchDailyCombinations failed:', err)
    return null
  }
}

/**
 * Optimise une sélection manuelle de matchs.
 * @param matchIds   IDs des matchs sélectionnés par l'utilisateur
 * @param targetOdds Cote totale cible (défaut: 3.0)
 */
export async function fetchOptimizedSelection(
  matchIds: number[],
  targetOdds?: number
): Promise<{ success: boolean; data: AiCombination; source: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/predictions/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchIds, targetOdds }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json() as { success: boolean; data: AiCombination; source: string }
  } catch (err) {
    console.warn('[ARENA10 API] fetchOptimizedSelection failed:', err)
    return null
  }
}

/**
 * Récupère l'historique des pronostics et combinés sur les X derniers jours (par défaut 14).
 * Permet de suivre les résultats (Validé / Perdu), le taux de réussite et le ROI.
 */
export async function fetchPredictionHistory(
  days = 14
): Promise<ApiResponse<PredictionHistoryResponse> | null> {
  try {
    const res = await fetch(`${API_BASE}/predictions/history?days=${days}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json() as ApiResponse<PredictionHistoryResponse>
  } catch (err) {
    console.warn('[ARENA10 API] fetchPredictionHistory failed:', err)
    return null
  }
}

// ── SANTÉ DU BACKEND ──────────────────────────────────────────

/**
 * Vérifie que le backend est en ligne.
 */
export async function checkHealth(): Promise<{ status: string; uptime: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/health`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json() as { status: string; uptime: string }
  } catch (err) {
    console.warn('[ARENA10 API] checkHealth failed:', err)
    return null
  }
}

// ── FONCTIONS D'AUTHENTIFICATION ──────────────────────────────

/**
 * Inscription d'un nouvel utilisateur.
 */
export async function registerApi(params: {
  name: string
  email: string
  password: string
  title?: string
}): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    const data = await res.json()
    return data as AuthResponse
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erreur réseau lors de l\'inscription.' }
  }
}

/**
 * Connexion d'un utilisateur existant.
 */
export async function loginApi(params: {
  email: string
  password: string
}): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    const data = await res.json()
    return data as AuthResponse
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erreur réseau lors de la connexion.' }
  }
}

/**
 * Récupère les informations de l'utilisateur actuellement connecté via son token.
 */
export async function getMeApi(token: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    const data = await res.json()
    return data as AuthResponse
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erreur réseau lors de la vérification de session.' }
  }
}

/**
 * Met à jour le profil de l'utilisateur.
 */
export async function updateProfileApi(token: string, updates: Partial<UserProfile>): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates),
    })
    const data = await res.json()
    return data as AuthResponse
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erreur réseau lors de la mise à jour.' }
  }
}

/**
 * Connexion / inscription via Google OAuth.
 * Envoie le Google ID Token au backend pour vérification et création de session ARENA10.
 */
export async function loginWithGoogleApi(idToken: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    })
    const data = await res.json()
    return data as AuthResponse
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erreur réseau lors de la connexion Google.' }
  }
}

/**
 * Déconnecte l'utilisateur côté serveur.
 */
export async function logoutApi(token: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  } catch (err) {
    console.warn('[ARENA10 API] logoutApi failed:', err)
  }
}

// ── FONCTIONS ESPACE PERSONNEL (POSTGRESQL & REDIS) ──────────

export interface UserBetDto {
  id?: number
  matchId?: number
  matchName: string
  league?: string
  pick: string
  odds: number
  stake: number
  result?: 'win' | 'loss' | 'pending' | 'void'
  profit?: number
  date: string
}

/**
 * Récupère le carnet de paris personnel de l'utilisateur (depuis PostgreSQL via Redis).
 */
export async function fetchUserNotebook(token: string): Promise<UserBetDto[]> {
  try {
    const res = await fetch(`${API_BASE}/auth/notebook`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    return data.success && Array.isArray(data.data) ? data.data : []
  } catch (err) {
    console.warn('[ARENA10 API] fetchUserNotebook failed:', err)
    return []
  }
}

/**
 * Enregistre un pari dans le carnet personnel PostgreSQL.
 */
export async function addUserBetApi(token: string, bet: UserBetDto): Promise<UserBetDto | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/notebook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bet)
    })
    const data = await res.json()
    return data.success ? data.data : null
  } catch (err) {
    console.warn('[ARENA10 API] addUserBetApi failed:', err)
    return null
  }
}

/**
 * Supprime un pari du carnet personnel.
 */
export async function deleteUserBetApi(token: string, betId: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/notebook/${betId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    return !!data.success
  } catch (err) {
    console.warn('[ARENA10 API] deleteUserBetApi failed:', err)
    return false
  }
}

/**
 * Vérifie l'état de PostgreSQL et Redis.
 */
export async function fetchDatabaseStatus(): Promise<{
  postgres: { connected: boolean; role: string }
  redis: { connected: boolean; role: string }
} | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/status`)
    const data = await res.json()
    return data.success ? data.data : null
  } catch {
    return null
  }
}
