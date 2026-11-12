// ============================================================
// ARENA 10 Backend — Redis : La Mémoire Rapide & Temporaire
// Cache ultra-rapide des sessions, profils et états utilisateurs
// ============================================================

import Redis from 'ioredis'
import { config } from '../config'
import { logger } from '../utils/logger'

let redisClient: Redis | null = null
let redisReady = false

// Mémoire temporaire locale de secours (si Redis n'est pas encore démarré)
const memoryCache = new Map<string, { value: string; expiresAt: number }>()

export function isRedisConnected(): boolean {
  return redisReady
}

/**
 * Initialise la connexion au serveur Redis.
 */
export async function initRedis(): Promise<boolean> {
  const redisUrl = config.redisUrl || process.env.REDIS_URL

  if (!redisUrl) {
    logger.info('[Redis] ℹ️ Aucune variable REDIS_URL configurée — Mémoire cache RAM locale active.')
    redisReady = false
    return false
  }

  try {
    const isTls = redisUrl.startsWith('rediss://') || redisUrl.includes('upstash.io')
    redisClient = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 2,
      connectTimeout: 5000,
      tls: isTls ? { rejectUnauthorized: false } : undefined,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.warn('[Redis] ⚠️ Trop de tentatives de reconnexion. Bascule temporaire sur le cache local.')
          return null
        }
        return Math.min(times * 1000, 3000)
      }
    })

    redisClient.on('error', (err) => {
      logger.warn(`[Redis] Avertissement client (${err.message})`)
      redisReady = false
    })

    redisClient.on('connect', () => {
      logger.info('[Redis] ⚡ Connecté au serveur Redis avec succès.')
      redisReady = true
    })

    await redisClient.connect()
    redisReady = true
    return true
  } catch (err: any) {
    logger.warn(`[Redis] ⚠️ Serveur Redis inaccessible (${err?.message || err}). Cache RAM local utilisé en relais.`)
    redisReady = false
    return false
  }
}

/**
 * Stocke une valeur clé/valeur avec durée de vie (TTL en secondes).
 */
export async function redisSet(key: string, value: string, ttlSeconds = 3600): Promise<void> {
  if (redisClient && redisReady) {
    try {
      if (ttlSeconds > 0) {
        await redisClient.set(key, value, 'EX', ttlSeconds)
      } else {
        await redisClient.set(key, value)
      }
      return
    } catch (err) {
      logger.warn(`[Redis] Erreur SET ${key}:`, err)
    }
  }

  // Fallback mémoire locale
  const expiresAt = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : Infinity
  memoryCache.set(key, { value, expiresAt })
}

/**
 * Récupère une valeur par sa clé.
 */
export async function redisGet(key: string): Promise<string | null> {
  if (redisClient && redisReady) {
    try {
      return await redisClient.get(key)
    } catch (err) {
      logger.warn(`[Redis] Erreur GET ${key}:`, err)
    }
  }

  // Fallback mémoire locale
  const item = memoryCache.get(key)
  if (!item) return null
  if (Date.now() > item.expiresAt) {
    memoryCache.delete(key)
    return null
  }
  return item.value
}

/**
 * Supprime une clé du cache.
 */
export async function redisDel(key: string): Promise<void> {
  if (redisClient && redisReady) {
    try {
      await redisClient.del(key)
      return
    } catch (err) {
      logger.warn(`[Redis] Erreur DEL ${key}:`, err)
    }
  }

  memoryCache.delete(key)
}

// ── FONCTIONS DÉDIÉES À L'ESPACE PERSONNEL & SESSIONS ─────────

const SESSION_TTL = 30 * 24 * 60 * 60 // 30 jours en secondes
const USER_CACHE_TTL = 3600           // 1 heure en secondes

/**
 * Enregistre une session utilisateur dans la mémoire rapide Redis.
 */
export async function setRedisSession(token: string, sessionData: any): Promise<void> {
  const key = `arena10:session:${token}`
  await redisSet(key, JSON.stringify(sessionData), SESSION_TTL)
}

/**
 * Récupère la session utilisateur depuis Redis (< 1ms).
 */
export async function getRedisSession(token: string): Promise<any | null> {
  const key = `arena10:session:${token}`
  const raw = await redisGet(key)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Détruit instantanément la session dans Redis (déconnexion immédiate).
 */
export async function deleteRedisSession(token: string): Promise<void> {
  const key = `arena10:session:${token}`
  await redisDel(key)
}

/**
 * Met en cache le profil complet d'un utilisateur pour accélérer les requêtes.
 */
export async function cacheUserProfile(userId: string, profile: any): Promise<void> {
  const key = `arena10:user:${userId}`
  await redisSet(key, JSON.stringify(profile), USER_CACHE_TTL)
}

/**
 * Récupère le profil en cache Redis.
 */
export async function getCachedUserProfile(userId: string): Promise<any | null> {
  const key = `arena10:user:${userId}`
  const raw = await redisGet(key)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Invalide le cache du profil (appelé lors d'une modification de nom, favoris ou réglages).
 */
export async function invalidateUserProfile(userId: string): Promise<void> {
  await redisDel(`arena10:user:${userId}`)
  await redisDel(`arena10:favorites:${userId}`)
  await redisDel(`arena10:bets:${userId}`)
}

/**
 * Ferme la connexion Redis proprement.
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisReady = false
  }
}

