// ============================================================
// ARENA 10 Backend — Service d'Authentification & Espace Personnel
// PostgreSQL (Mémoire Permanente) + Redis (Mémoire Rapide)
// ============================================================

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { OAuth2Client } from 'google-auth-library'
import { UserProfile, StoredUser, AuthSession, UserBet, UserFavorite } from '../types'
import { isPostgresConnected, query } from '../db/postgres'
import {
  isRedisConnected,
  setRedisSession,
  getRedisSession,
  deleteRedisSession,
  cacheUserProfile,
  getCachedUserProfile,
  invalidateUserProfile
} from '../db/redis'
import { logger } from '../utils/logger'

const googleOAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '')

const DATA_DIR = path.resolve(__dirname, '../../data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json')
const BETS_FILE = path.join(DATA_DIR, 'user_bets.json')

// Durée de validité d'une session : 30 jours
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000

// Palette de couleurs pour les avatars
const AVATAR_COLORS = [
  '#f59a23', '#4ade80', '#60a5fa', '#f87171',
  '#c084fc', '#38bdf8', '#fbbf24', '#34d399'
]

// ── Helpers Cryptographiques ─────────────────────────────────
function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex')
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
}

function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  try {
    const hashToTest = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
    const bufA = Buffer.from(hashToTest, 'hex')
    const bufB = Buffer.from(storedHash, 'hex')
    if (bufA.length !== bufB.length) return false
    return crypto.timingSafeEqual(bufA, bufB)
  } catch {
    return false
  }
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

function sanitizeUser(u: StoredUser): UserProfile {
  const { passwordHash, salt, ...safeUser } = u
  return safeUser
}

// ── Fallback Stockage Fichier Local ───────────────────────────
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function loadLocalUsers(): Record<string, StoredUser> {
  ensureDataDir()
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'))
    }
  } catch (err) {
    logger.warn('[AuthService] Impossible de lire users.json:', err)
  }
  return {}
}

function saveLocalUsers(users: Record<string, StoredUser>): void {
  ensureDataDir()
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8')
  } catch (err) {
    logger.error('[AuthService] Erreur écriture users.json:', err)
  }
}

function loadLocalBets(): Record<string, UserBet[]> {
  ensureDataDir()
  try {
    if (fs.existsSync(BETS_FILE)) {
      return JSON.parse(fs.readFileSync(BETS_FILE, 'utf-8'))
    }
  } catch (err) {
    logger.warn('[AuthService] Impossible de lire user_bets.json:', err)
  }
  return {}
}

function saveLocalBets(bets: Record<string, UserBet[]>): void {
  ensureDataDir()
  try {
    fs.writeFileSync(BETS_FILE, JSON.stringify(bets, null, 2), 'utf-8')
  } catch (err) {
    logger.error('[AuthService] Erreur écriture user_bets.json:', err)
  }
}

// ── 1. INSCRIPTION D'UN NOUVEL UTILISATEUR ────────────────────
export async function registerUser(params: {
  name: string
  email: string
  password: string
  title?: string
}): Promise<{ user: UserProfile; token: string }> {
  const { name, email, password, title } = params

  if (!email || !email.includes('@')) {
    throw new Error('Adresse email invalide.')
  }
  if (!name || name.trim().length < 2) {
    throw new Error('Le nom doit contenir au moins 2 caractères.')
  }
  if (!password || password.length < 6) {
    throw new Error('Le mot de passe doit contenir au moins 6 caractères.')
  }

  const cleanEmail = email.toLowerCase().trim()
  const id = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
  const salt = generateSalt()
  const passwordHash = hashPassword(password, salt)
  const nowIso = new Date().toISOString()
  const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
  const userTitle = (title && title.trim()) || 'Analyste ARENA'

  // PostgreSQL : Vérification d'unicité et insertion permanente
  if (isPostgresConnected()) {
    const existing = await query('SELECT id FROM users WHERE email = $1', [cleanEmail])
    if (existing && existing.rows.length > 0) {
      throw new Error('Un compte existe déjà avec cette adresse email.')
    }

    await query(
      `INSERT INTO users (id, email, password_hash, salt, name, title, role, avatar_color, created_at, last_login)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, cleanEmail, passwordHash, salt, name.trim(), userTitle, 'user', avatarColor, nowIso, nowIso]
    )

    // Initialisation des préférences par défaut
    await query(
      `INSERT INTO user_settings (user_id, odds_format, currency, min_confidence, ai_model, theme)
       VALUES ($1, 'decimal', 'EUR', 75, 'v2.1_balanced', 'dark')
       ON CONFLICT (user_id) DO NOTHING`,
      [id]
    )
  } else {
    // Fallback fichier local
    const users = loadLocalUsers()
    const existing = Object.values(users).find(u => u.email.toLowerCase() === cleanEmail)
    if (existing) {
      throw new Error('Un compte existe déjà avec cette adresse email.')
    }

    const newUser: StoredUser = {
      id,
      email: cleanEmail,
      name: name.trim(),
      title: userTitle,
      role: 'user',
      createdAt: nowIso,
      lastLogin: nowIso,
      avatarColor,
      favorites: { clubs: [], leagues: [] },
      settings: { oddsFormat: 'decimal', currency: 'EUR', minConfidence: 75, theme: 'dark' },
      passwordHash,
      salt
    }

    users[id] = newUser
    saveLocalUsers(users)
  }

  const token = generateToken()
  const sessionData = {
    userId: id,
    email: cleanEmail,
    name: name.trim(),
    role: 'user',
    createdAt: nowIso
  }

  // Redis : Enregistrement ultra-rapide de la session active
  await setRedisSession(token, sessionData)

  const safeProfile: UserProfile = {
    id,
    email: cleanEmail,
    name: name.trim(),
    title: userTitle,
    role: 'user',
    createdAt: nowIso,
    lastLogin: nowIso,
    avatarColor,
    favorites: { clubs: [], leagues: [] },
    settings: { oddsFormat: 'decimal', currency: 'EUR', minConfidence: 75, theme: 'dark' }
  }

  // Cache Redis du profil
  await cacheUserProfile(id, safeProfile)

  logger.info(`[AuthService] Utilisateur enregistré (Postgres + Redis) : ${cleanEmail} (${id})`)
  return { user: safeProfile, token }
}

// ── 2. CONNEXION D'UN UTILISATEUR ─────────────────────────────
export async function loginUser(email: string, password: string): Promise<{ user: UserProfile; token: string }> {
  if (!email || !password) {
    throw new Error('Veuillez renseigner votre email et mot de passe.')
  }

  const cleanEmail = email.toLowerCase().trim()
  let user: StoredUser | null = null

  // PostgreSQL : Recherche permanente
  if (isPostgresConnected()) {
    const res = await query(
      `SELECT id, email, password_hash, salt, name, title, role, avatar_color, created_at, last_login
       FROM users WHERE email = $1`,
      [cleanEmail]
    )
    if (res && res.rows.length > 0) {
      const row = res.rows[0]
      user = {
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash,
        salt: row.salt,
        name: row.name,
        title: row.title,
        role: row.role,
        avatarColor: row.avatar_color,
        createdAt: row.created_at,
        lastLogin: row.last_login
      }
    }
  } else {
    // Fallback local
    const users = loadLocalUsers()
    user = Object.values(users).find(u => u.email.toLowerCase() === cleanEmail) || null
  }

  if (!user) {
    throw new Error('Adresse email ou mot de passe incorrect.')
  }

  const valid = verifyPassword(password, user.passwordHash, user.salt)
  if (!valid) {
    throw new Error('Adresse email ou mot de passe incorrect.')
  }

  const nowIso = new Date().toISOString()
  if (isPostgresConnected()) {
    await query('UPDATE users SET last_login = $1 WHERE id = $2', [nowIso, user.id])
  } else {
    const users = loadLocalUsers()
    if (users[user.id]) {
      users[user.id].lastLogin = nowIso
      saveLocalUsers(users)
    }
  }

  // Création du token
  const token = generateToken()
  const sessionData = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: nowIso
  }

  // Redis : Enregistrement de session temporaire rapide
  await setRedisSession(token, sessionData)

  const fullProfile = await getUserFullProfile(user.id)
  if (fullProfile) {
    await cacheUserProfile(user.id, fullProfile)
  }

  logger.info(`[AuthService] Connexion réussie (Redis + Postgres) : ${cleanEmail}`)
  return { user: fullProfile || sanitizeUser(user), token }
}

// ── 3. VÉRIFICATION DU TOKEN (REDIS PREMIER) ──────────────────
export async function getUserByToken(token: string): Promise<UserProfile | null> {
  if (!token) return null

  // 1. Consultation ultra-rapide dans Redis (< 1ms)
  const session = await getRedisSession(token)
  if (session && session.userId) {
    // Tenter de récupérer le profil depuis le cache Redis
    const cachedProfile = await getCachedUserProfile(session.userId)
    if (cachedProfile) return cachedProfile

    // Sinon récupérer le profil permanent depuis PostgreSQL
    const profile = await getUserFullProfile(session.userId)
    if (profile) {
      await cacheUserProfile(session.userId, profile)
      return profile
    }
  }

  // 2. Si non trouvé dans Redis, fallback sur les sessions locales
  ensureDataDir()
  if (fs.existsSync(SESSIONS_FILE)) {
    try {
      const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'))
      const localSess = sessions[token]
      if (localSess && localSess.userId) {
        return await getUserFullProfile(localSess.userId)
      }
    } catch {}
  }

  return null
}

// ── 4. DÉCONNEXION (DESTRUCTION SESSION REDIS) ─────────────────
export async function logoutUser(token: string): Promise<boolean> {
  if (!token) return false

  // Invalidation immédiate dans Redis
  const session = await getRedisSession(token)
  if (session && session.userId) {
    await invalidateUserProfile(session.userId)
  }
  await deleteRedisSession(token)

  // Nettoyage local de secours
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'))
      if (sessions[token]) {
        delete sessions[token]
        fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8')
      }
    }
  } catch {}

  return true
}

// ── 5. PROFIL COMPLET AVEC FAVORIS & RÉGLAGES ─────────────────
export async function getUserFullProfile(userId: string): Promise<UserProfile | null> {
  // PostgreSQL : Lecture permanente avec jointures ou requêtes ciblées
  if (isPostgresConnected()) {
    const userRes = await query(
      `SELECT id, email, name, title, role, avatar_color, avatar_url, google_id, created_at, last_login
       FROM users WHERE id = $1`,
      [userId]
    )
    if (!userRes || userRes.rows.length === 0) return null
    const row = userRes.rows[0]

    // Favoris
    const favRes = await query(
      `SELECT type, item_id FROM user_favorites WHERE user_id = $1`,
      [userId]
    )
    const clubs: string[] = []
    const leagues: string[] = []
    if (favRes) {
      for (const f of favRes.rows) {
        if (f.type === 'club') clubs.push(f.item_id)
        if (f.type === 'league') leagues.push(f.item_id)
      }
    }

    // Réglages
    const setRes = await query(
      `SELECT odds_format, currency, min_confidence, ai_model, theme
       FROM user_settings WHERE user_id = $1`,
      [userId]
    )
    const settings = setRes && setRes.rows.length > 0 ? setRes.rows[0] : {}

    return {
      id: row.id,
      email: row.email,
      name: row.name,
      title: row.title,
      role: row.role,
      avatarColor: row.avatar_color,
      avatarUrl: row.avatar_url || undefined,
      googleId: row.google_id || undefined,
      createdAt: row.created_at,
      lastLogin: row.last_login,
      favorites: { clubs, leagues },
      settings
    }
  }

  // Fallback fichier local
  const users = loadLocalUsers()
  const user = users[userId]
  if (!user) return null
  return sanitizeUser(user)
}

// ── 6. MISE À JOUR DU PROFIL ──────────────────────────────────
export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
  if (isPostgresConnected()) {
    if (data.name || data.title || data.avatarColor) {
      await query(
        `UPDATE users
         SET name = COALESCE($1, name),
             title = COALESCE($2, title),
             avatar_color = COALESCE($3, avatar_color)
         WHERE id = $4`,
        [data.name || null, data.title || null, data.avatarColor || null, userId]
      )
    }

    if (data.favorites) {
      // Re-synchronisation des favoris dans PostgreSQL
      await query('DELETE FROM user_favorites WHERE user_id = $1', [userId])
      for (const club of data.favorites.clubs || []) {
        await query(
          'INSERT INTO user_favorites (user_id, type, item_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [userId, 'club', club]
        )
      }
      for (const league of data.favorites.leagues || []) {
        await query(
          'INSERT INTO user_favorites (user_id, type, item_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [userId, 'league', league]
        )
      }
    }

    if (data.settings) {
      await query(
        `INSERT INTO user_settings (user_id, odds_format, currency, min_confidence, ai_model, theme, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           odds_format = EXCLUDED.odds_format,
           currency = EXCLUDED.currency,
           min_confidence = EXCLUDED.min_confidence,
           ai_model = EXCLUDED.ai_model,
           theme = EXCLUDED.theme,
           updated_at = NOW()`,
        [
          userId,
          data.settings.oddsFormat || 'decimal',
          data.settings.currency || 'EUR',
          data.settings.minConfidence || 75,
          data.settings.aiModel || 'v2.1_balanced',
          data.settings.theme || 'dark'
        ]
      )
    }
  } else {
    // Fallback local
    const users = loadLocalUsers()
    const user = users[userId]
    if (!user) throw new Error('Utilisateur introuvable.')

    if (data.name) user.name = data.name.trim()
    if (data.title !== undefined) user.title = data.title.trim()
    if (data.avatarColor) user.avatarColor = data.avatarColor
    if (data.favorites) user.favorites = data.favorites
    if (data.settings) user.settings = { ...user.settings, ...data.settings }

    users[userId] = user
    saveLocalUsers(users)
  }

  // Invalidation du cache Redis pour forcer le rafraîchissement
  await invalidateUserProfile(userId)

  const updated = await getUserFullProfile(userId)
  if (!updated) throw new Error('Erreur lors du rechargement du profil.')
  return updated
}

// ── 7. GESTION DU CARNET DE PARIS PERSONNEL (MON CARNET) ──────
export async function getUserBets(userId: string): Promise<UserBet[]> {
  if (isPostgresConnected()) {
    const res = await query(
      `SELECT id, user_id AS "userId", match_id AS "matchId", match_name AS "matchName",
              league, pick, odds, stake, result, profit, date, created_at AS "createdAt"
       FROM user_bets
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    )
    return res ? res.rows : []
  }

  const bets = loadLocalBets()
  return bets[userId] || []
}

export async function addUserBet(userId: string, bet: Omit<UserBet, 'id' | 'userId'>): Promise<UserBet> {
  if (isPostgresConnected()) {
    const res = await query(
      `INSERT INTO user_bets (user_id, match_id, match_name, league, pick, odds, stake, result, profit, date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, user_id AS "userId", match_id AS "matchId", match_name AS "matchName",
                 league, pick, odds, stake, result, profit, date, created_at AS "createdAt"`,
      [
        userId,
        bet.matchId || null,
        bet.matchName,
        bet.league || null,
        bet.pick,
        bet.odds,
        bet.stake || 10,
        bet.result || 'pending',
        bet.profit || 0,
        bet.date
      ]
    )
    if (res && res.rows.length > 0) {
      return res.rows[0]
    }
  }

  const bets = loadLocalBets()
  const userList = bets[userId] || []
  const newBet: UserBet = {
    id: Date.now(),
    userId,
    ...bet,
    createdAt: new Date().toISOString()
  }
  userList.unshift(newBet)
  bets[userId] = userList
  saveLocalBets(bets)
  return newBet
}

export async function deleteUserBet(userId: string, betId: number): Promise<boolean> {
  if (isPostgresConnected()) {
    const res = await query(
      'DELETE FROM user_bets WHERE id = $1 AND user_id = $2',
      [betId, userId]
    )
    return (res?.rowCount ?? 0) > 0
  }

  const bets = loadLocalBets()
  if (bets[userId]) {
    bets[userId] = bets[userId].filter(b => b.id !== betId)
    saveLocalBets(bets)
    return true
  }
  return false
}

// ── 8. CONNEXION VIA GOOGLE OAUTH ─────────────────────────────
export async function loginWithGoogle(idToken: string): Promise<{ user: UserProfile; token: string }> {
  const clientId = process.env.GOOGLE_CLIENT_ID || ''
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID non configuré sur le serveur.')
  }

  // Vérification du token Google
  let payload: any
  try {
    const client = new OAuth2Client(clientId)
    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId
    })
    payload = ticket.getPayload()
  } catch (err: any) {
    logger.warn('[AuthService] Token Google invalide:', err?.message)
    throw new Error('Token Google invalide ou expiré.')
  }

  if (!payload || !payload.email) {
    throw new Error('Impossible de récupérer les informations Google.')
  }

  const googleId = payload.sub as string
  const email = payload.email.toLowerCase().trim()
  const name = payload.name || email.split('@')[0]
  const avatarUrl: string | null = payload.picture || null
  const nowIso = new Date().toISOString()

  let userId: string
  let isNew = false

  if (isPostgresConnected()) {
    // Cherche d'abord par google_id, puis par email
    let res = await query(
      `SELECT id, email, name, title, role, avatar_color, avatar_url, created_at, last_login
       FROM users WHERE google_id = $1`,
      [googleId]
    )

    if (!res || res.rows.length === 0) {
      // Vérifie si un compte email existe déjà
      res = await query(
        `SELECT id, email, name, title, role, avatar_color, avatar_url, created_at, last_login
         FROM users WHERE email = $1`,
        [email]
      )
    }

    if (res && res.rows.length > 0) {
      // Compte existant : on lie le google_id et met à jour la photo
      userId = res.rows[0].id
      await query(
        `UPDATE users SET google_id = $1, avatar_url = COALESCE($2, avatar_url), last_login = $3 WHERE id = $4`,
        [googleId, avatarUrl, nowIso, userId]
      )
    } else {
      // Nouveau compte Google
      isNew = true
      userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
      const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]

      await query(
        `INSERT INTO users (id, email, password_hash, salt, name, title, role, avatar_color, avatar_url, google_id, created_at, last_login)
         VALUES ($1, $2, '', '', $3, 'Analyste ARENA', 'user', $4, $5, $6, $7, $8)`,
        [userId, email, name, avatarColor, avatarUrl, googleId, nowIso, nowIso]
      )

      await query(
        `INSERT INTO user_settings (user_id, odds_format, currency, min_confidence, ai_model, theme)
         VALUES ($1, 'decimal', 'EUR', 75, 'v2.1_balanced', 'dark')
         ON CONFLICT (user_id) DO NOTHING`,
        [userId]
      )
    }
  } else {
    // Fallback local
    const users = loadLocalUsers()
    const existing = Object.values(users).find(
      u => (u as any).googleId === googleId || u.email.toLowerCase() === email
    )

    if (existing) {
      userId = existing.id
      ;(existing as any).googleId = googleId
      ;(existing as any).avatarUrl = avatarUrl
      existing.lastLogin = nowIso
      users[userId] = existing
    } else {
      isNew = true
      userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
      const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
      const newUser: StoredUser = {
        id: userId,
        email,
        name,
        title: 'Analyste ARENA',
        role: 'user',
        createdAt: nowIso,
        lastLogin: nowIso,
        avatarColor,
        favorites: { clubs: [], leagues: [] },
        settings: { oddsFormat: 'decimal', currency: 'EUR', minConfidence: 75, theme: 'dark' },
        passwordHash: '',
        salt: '',
      }
      ;(newUser as any).googleId = googleId
      ;(newUser as any).avatarUrl = avatarUrl
      users[userId] = newUser
    }
    saveLocalUsers(users)
  }

  // Création du token ARENA10
  const token = generateToken()
  const sessionData = { userId, email, name, role: 'user', createdAt: nowIso }
  await setRedisSession(token, sessionData)

  const fullProfile = await getUserFullProfile(userId)
  if (fullProfile) {
    await cacheUserProfile(userId, fullProfile)
  }

  logger.info(`[AuthService] Connexion Google ${isNew ? '(nouveau compte)' : '(existant)'} : ${email}`)
  return { user: fullProfile!, token }
}
