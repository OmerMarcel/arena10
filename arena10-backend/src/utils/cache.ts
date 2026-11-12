// ============================================================
// ARENA 10 Backend — Cache en mémoire (node-cache)
// ============================================================

import NodeCache from 'node-cache'
import { config } from '../config'
import { logger } from './logger'

// Cache principal — TTL par défaut 5 minutes, check toutes les 60s
const cache = new NodeCache({
  stdTTL:      config.cacheNewsttl,
  checkperiod: 60,
  useClones:   false,
})

cache.on('expired', (key: string) => {
  logger.cache(`Cache expiré → clé: ${key}`)
})

export function getFromCache<T>(key: string): T | undefined {
  const hit = cache.get<T>(key)
  if (hit !== undefined) {
    logger.cache(`Cache HIT ← ${key}`)
  }
  return hit
}

export function setCache<T>(key: string, value: T, ttl?: number): void {
  cache.set(key, value, ttl ?? config.cacheNewsttl)
  logger.cache(`Cache SET → ${key} (TTL: ${ttl ?? config.cacheNewsttl}s)`)
}

export function invalidateCache(key: string): void {
  cache.del(key)
  logger.cache(`Cache INVALIDATED → ${key}`)
}

export function getCacheStats() {
  return cache.getStats()
}

