// ============================================================
// ARENA 10 Backend — Configuration & Validation des variables
// ============================================================

import dotenv from 'dotenv'
import { ServerConfig } from '../types'

dotenv.config()

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] || fallback
  if (!value) {
    throw new Error(
      `[CONFIG] Variable d'environnement manquante: ${key}\n` +
      `  → Copiez .env.example en .env et remplissez les valeurs.`
    )
  }
  return value
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] || fallback
}

export const config: ServerConfig = {
  port:            parseInt(optionalEnv('PORT', '4000'), 10),
  frontendUrl:     optionalEnv('FRONTEND_URL', 'http://localhost:5173'),
  internalApiKey:  requireEnv('INTERNAL_API_KEY', 'arena10-dev-secret-key-32chars'),
  newsApiKey:      optionalEnv('NEWS_API_KEY', ''),
  footballDataApiKey: optionalEnv('FOOTBALL_DATA_API_KEY', ''),
  rapidApiKey:     optionalEnv('RAPID_API_KEY', ''),
  geminiApiKey:    optionalEnv('GEMINI_API_KEY', ''),
  groqApiKey:      optionalEnv('GROQ_API_KEY', ''),
  cacheNewsttl:    parseInt(optionalEnv('CACHE_TTL_NEWS', '300'), 10),
  cacheMatchesTtl: parseInt(optionalEnv('CACHE_TTL_MATCHES', '120'), 10),
  nodeEnv:         optionalEnv('NODE_ENV', 'development'),
  databaseUrl:     optionalEnv('DATABASE_URL', ''),
  redisUrl:        optionalEnv('REDIS_URL', ''),
}

export const isDev = config.nodeEnv === 'development'
export const isProd = config.nodeEnv === 'production'

