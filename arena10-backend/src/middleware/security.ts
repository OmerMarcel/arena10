// ============================================================
// ARENA 10 Backend — Middlewares de sécurité
// ============================================================

import { Request, Response, NextFunction } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import cors from 'cors'
import { config, isDev } from '../config'
import { logger } from '../utils/logger'
import { v4 as uuidv4 } from 'uuid'

// ── 1. HELMET — En-têtes HTTP sécurisées ────────────────────
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
})

// ── 2. CORS — Politique d'origine croisée stricte ───────────
const allowedOrigins = [
  config.frontendUrl,
  'https://arena10.games',
  'https://www.arena10.games',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
]

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (visite directe dans le navigateur, health check Render, curl)
    if (!origin) return callback(null, true)
    
    if (
      allowedOrigins.includes(origin) ||
      (origin && (origin.endsWith('.vercel.app') || origin.endsWith('arena10.games') || origin.includes('onrender.com')))
    ) {
      return callback(null, true)
    }
    
    logger.warn(`[CORS] Origine refusée: ${origin}`)
    return callback(new Error(`CORS: Origine ${origin} non autorisée`), false)
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Api-Key', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'X-Cache-Status'],
  credentials: false,
  maxAge: 86400, // Pre-flight cache 24h
})

// ── 3. RATE LIMITING — Limitation du débit par IP ───────────
export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // Fenêtre de 15 minutes
  max: 200,                  // Max 200 requêtes / 15min / IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Trop de requêtes depuis cette adresse IP. Réessayez dans 15 minutes.',
    code: 429,
  },
  skip: (req) => isDev && req.ip === '127.0.0.1',
  handler: (req, res) => {
    logger.warn(`[RateLimit] IP bloquée: ${req.ip} — Route: ${req.path}`)
    res.status(429).json({
      success: false,
      error: 'Trop de requêtes. Réessayez dans quelques minutes.',
      code: 429,
    })
  },
})

export const newsRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,             // Max 30 requêtes/min pour les actualités
  message: {
    success: false,
    error: 'Limite de requêtes actualités atteinte.',
    code: 429,
  },
})

// ── 4. AUTHENTIFICATION API KEY interne ─────────────────────
// Protège les routes admin/interne contre les appels non autorisés
export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  // En dev, on accepte aussi le header X-Api-Key pour les tests
  const providedKey = req.headers['x-api-key'] as string | undefined

  if (!providedKey || providedKey !== config.internalApiKey) {
    logger.warn(`[Auth] Clé API invalide depuis ${req.ip} sur ${req.path}`)
    res.status(401).json({
      success: false,
      error: 'Clé API manquante ou invalide.',
      code: 401,
    })
    return
  }
  next()
}

// ── 5. REQUEST ID — Traçabilité des requêtes ─────────────────
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = (req.headers['x-request-id'] as string) || uuidv4()
  req.headers['x-request-id'] = id
  res.setHeader('X-Request-ID', id)
  next()
}

// ── 6. SANITISATION des paramètres query ────────────────────
export function sanitizeQuery(req: Request, _res: Response, next: NextFunction): void {
  // Supprime les caractères dangereux des paramètres GET
  for (const key of Object.keys(req.query)) {
    const val = req.query[key]
    if (typeof val === 'string') {
      req.query[key] = val
        .replace(/[<>'"`;{}]/g, '')
        .substring(0, 200)
        .trim()
    }
  }
  next()
}

// ── 7. GESTION GLOBALE DES ERREURS ───────────────────────────
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.headers['x-request-id'] as string

  logger.error(`[ErrorHandler] ${err.message}`, {
    path: req.path,
    method: req.method,
    ip: req.ip,
    requestId,
  })

  if (err.message.includes('CORS') || err.message.includes('Origin')) {
    res.status(403).json({
      success: false,
      error: 'Accès refusé (CORS).',
      code: 403,
      requestId,
    })
    return
  }

  res.status(500).json({
    success: false,
    error: isDev ? err.message : 'Une erreur interne est survenue.',
    code: 500,
    requestId,
  })
}

