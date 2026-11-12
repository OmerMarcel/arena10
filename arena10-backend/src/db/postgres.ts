// ============================================================
// ARENA 10 Backend — PostgreSQL : La Mémoire Permanente
// Gestion du pool de connexions et migrations automatiques
// ============================================================

import { Pool, QueryResult, QueryResultRow } from 'pg'
import fs from 'fs'
import path from 'path'
import { config } from '../config'
import { logger } from '../utils/logger'

let pool: Pool | null = null
let postgresReady = false

export function isPostgresConnected(): boolean {
  return postgresReady
}

export function getPostgresPool(): Pool | null {
  return pool
}

/**
 * Initialise la connexion à PostgreSQL et exécute les migrations automatiques.
 */
export async function initPostgres(): Promise<boolean> {
  const connectionString = config.databaseUrl || process.env.DATABASE_URL

  if (!connectionString) {
    logger.info('[PostgreSQL] ℹ️ Aucune variable DATABASE_URL configurée — Mode stockage local persistant actif.')
    postgresReady = false
    return false
  }

  try {
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('sslmode=require') || connectionString.includes('neon.tech') || connectionString.includes('supabase')
        ? { rejectUnauthorized: false }
        : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })

    // Test de connexion
    const client = await pool.connect()
    try {
      const res = await client.query('SELECT NOW() AS now, current_database() AS db')
      logger.info(`[PostgreSQL] 🐘 Connecté avec succès à la base "${res.rows[0].db}" (${res.rows[0].now})`)

      // Exécution automatique du schéma
      const schemaPath = path.resolve(__dirname, 'schema.sql')
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8')
        await client.query(schemaSql)
        logger.info('[PostgreSQL] ✅ Tables de l\'espace personnel initialisées (users, user_favorites, user_bets, user_settings).')
      }

      postgresReady = true
      return true
    } finally {
      client.release()
    }
  } catch (err: any) {
    logger.warn(`[PostgreSQL] ⚠️ Échec de connexion (${err?.message || err}). Bascule vers le stockage local sans interruption de service.`)
    postgresReady = false
    return false
  }
}

/**
 * Exécute une requête SQL paramétrée sur PostgreSQL.
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T> | null> {
  if (!pool || !postgresReady) return null
  try {
    return await pool.query<T>(text, params)
  } catch (err: any) {
    logger.error(`[PostgreSQL] Erreur SQL (${text}):`, err?.message || err)
    throw err
  }
}

/**
 * Fermeture propre du pool de connexions (pour l'arrêt du serveur).
 */
export async function closePostgres(): Promise<void> {
  if (pool) {
    await pool.end()
    postgresReady = false
  }
}

