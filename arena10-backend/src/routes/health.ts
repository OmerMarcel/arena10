// ============================================================
// ARENA 10 Backend — Route : Health Check & Status
// ============================================================

import { Router, Request, Response } from 'express'
import { getCacheStats } from '../utils/cache'
import { config, isDev } from '../config'
import { requireApiKey } from '../middleware/security'

const router = Router()
const startedAt = new Date()

// ── GET /api/health ───────────────────────────────────────────
// Health check public (pour load balancer, monitoring)
router.get('/', (_req: Request, res: Response) => {
  const uptime = Math.floor((Date.now() - startedAt.getTime()) / 1000)

  res.json({
    success: true,
    status: 'healthy',
    service: 'ARENA 10 API',
    version: '1.0.0',
    uptime: `${Math.floor(uptime / 60)}m ${uptime % 60}s`,
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  })
})

// ── GET /api/health/detailed ──────────────────────────────────
// Status détaillé (accès restreint via clé API interne)
router.get('/detailed', requireApiKey, (_req: Request, res: Response) => {
  const uptime = Math.floor((Date.now() - startedAt.getTime()) / 1000)
  const cacheStats = getCacheStats()

  res.json({
    success: true,
    status: 'healthy',
    service: 'ARENA 10 API',
    version: '1.0.0',
    startedAt: startedAt.toISOString(),
    uptime: `${Math.floor(uptime / 60)}m ${uptime % 60}s`,
    environment: config.nodeEnv,
    integrations: {
      newsApi: config.newsApiKey ? 'configured' : 'missing (using fallback)',
      rapidApi: config.rapidApiKey ? 'configured' : 'missing (optional)',
      sportsDb: 'free (no key required)',
    },
    cache: {
      keys:   cacheStats.keys,
      hits:   cacheStats.hits,
      misses: cacheStats.misses,
      ksize:  cacheStats.ksize,
      vsize:  cacheStats.vsize,
    },
    memory: isDev ? process.memoryUsage() : undefined,
  })
})

export default router

