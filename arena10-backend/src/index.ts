// ============================================================
// ARENA 10 Backend — Point d'entrée principal
// ============================================================

import express from 'express'
import compression from 'compression'
import morgan from 'morgan'

import { config, isDev } from './config'
import { logger } from './utils/logger'

import {
  helmetMiddleware,
  corsMiddleware,
  globalRateLimit,
  requestId,
  sanitizeQuery,
  errorHandler,
} from './middleware/security'

import newsRouter        from './routes/news'
import matchesRouter     from './routes/matches'
import healthRouter      from './routes/health'
import predictionsRouter from './routes/predictions'
import authRouter        from './routes/auth'
import { initPostgres, closePostgres, isPostgresConnected } from './db/postgres'
import { initRedis, closeRedis, isRedisConnected }       from './db/redis'

// ── Création de l'application Express ───────────────────────
const app = express()

// ── Middlewares globaux (ordre important) ────────────────────

// 1. Génération de l'ID de requête (traçabilité)
app.use(requestId)

// 2. Sécurité HTTP (Helmet — en-têtes sécurisées)
app.use(helmetMiddleware)

// 3. CORS — Politique d'origine croisée stricte
app.use(corsMiddleware)

// 4. Rate Limiting global — anti-flood
app.use(globalRateLimit)

// 5. Compression gzip des réponses
app.use(compression())

// 6. Parser JSON (taille limitée à 10kb)
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: false, limit: '10kb' }))

// 7. Sanitisation des paramètres GET
app.use(sanitizeQuery)

// 8. Logs HTTP (format court en dev, combiné en prod)
app.use(morgan(isDev ? 'dev' : 'combined'))

// ── En-têtes de sécurité supplémentaires ────────────────────
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.setHeader('X-Powered-By-Override', 'ARENA10/1.0') // masque Express
  res.removeHeader('X-Powered-By')
  next()
})

// ── Routes de l'API ──────────────────────────────────────────
app.use('/api/health',      healthRouter)
app.use('/api/news',        newsRouter)
app.use('/api/matches',     matchesRouter)
app.use('/api/predictions', predictionsRouter)
app.use('/api/auth',        authRouter)

// ── Route racine (info rapide) ───────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    service: '⚽ ARENA 10 Football Intelligence API',
    version: '1.0.0',
    status: 'running',
    docs: '/api/health',
    endpoints: {
      news:          'GET /api/news',
      newsSearch:    'GET /api/news/search?q=...',
      newsLeagues:   'GET /api/news/leagues',
      newsTags:      'GET /api/news/tags',
      matchesLive:   'GET /api/matches/live',
      matchesNext:   'GET /api/matches/upcoming',
      matchesAll:    'GET /api/matches/all',
      health:        'GET /api/health',
    },
  })
})

// ── 404 — Route introuvable ───────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route introuvable.',
    code: 404,
  })
})

// ── Gestionnaire d'erreurs global ────────────────────────────
app.use(errorHandler)

// ── Démarrage du serveur ─────────────────────────────────────
const PORT = config.port
const server = app.listen(PORT, async () => {
  logger.info('════════════════════════════════════════')
  logger.info(`  ⚽ ARENA 10 Backend — DÉMARRÉ`)
  logger.info(`  Port     : ${PORT}`)
  logger.info(`  Env      : ${config.nodeEnv.toUpperCase()}`)
  logger.info(`  Frontend : ${config.frontendUrl}`)
  logger.info(`  NewsAPI  : ${config.newsApiKey ? '✅ Configurée' : '⚠️  Manquante (fallback)'}`)
  logger.info(`  RapidAPI : ${config.rapidApiKey ? '✅ Configurée' : 'ℹ️  Optionnelle'}`)

  // Initialisation de la Mémoire Permanente (PostgreSQL) et Rapide (Redis)
  await initPostgres()
  await initRedis()

  logger.info(`  Postgres : ${isPostgresConnected() ? '🐘 Connecté (Mémoire Permanente)' : '📁 Mode Local (Fichier)'}`)
  logger.info(`  Redis    : ${isRedisConnected() ? '⚡ Connecté (Mémoire Rapide)' : '🧠 Cache RAM Local'}`)
  logger.info('════════════════════════════════════════')
})

// ── Arrêt propre (Graceful Shutdown) ─────────────────────────
async function shutdown(signal: string): Promise<void> {
  logger.warn(`[Shutdown] Signal ${signal} reçu — arrêt propre...`)
  await closePostgres()
  await closeRedis()
  server.close(() => {
    logger.info('[Shutdown] Serveur fermé proprement.')
    process.exit(0)
  })

  setTimeout(() => {
    logger.error('[Shutdown] Délai dépassé — arrêt forcé.')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))
process.on('uncaughtException', (err) => {
  logger.error('[UncaughtException]', err)
  process.exit(1)
})
process.on('unhandledRejection', (reason) => {
  logger.error('[UnhandledRejection]', reason)
  process.exit(1)
})

export default app

