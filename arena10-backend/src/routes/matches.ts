// ============================================================
// ARENA 10 Backend — Route : Matchs
// ============================================================

import { Router, Request, Response } from 'express'
import { query, validationResult } from 'express-validator'
import { getLiveMatches, getUpcomingMatches, getFullMatches } from '../services/matchService'
import { logger } from '../utils/logger'

const router = Router()

// ── GET /api/matches/full ──────────────────────────────────────
// Renvoie les fiches matchs complètes (avec stats, cotes et analyse IA)
router.get('/full', async (req: Request, res: Response) => {
  const forceRefresh = req.query.refresh === 'true'
  try {
    const { matches, source } = await getFullMatches(forceRefresh)
    res.setHeader('X-Cache-Status', source)
    res.setHeader('Cache-Control', 'public, max-age=60')
    res.json({ success: true, data: matches, source, total: matches.length })
  } catch (err) {
    const error = err as Error
    logger.error('[GET /matches/full]', error.message)
    res.status(500).json({ success: false, error: 'Erreur serveur', code: 500 })
  }
})

// ── GET /api/matches/live ──────────────────────────────────────
router.get('/live', async (_req: Request, res: Response) => {
  try {
    const { matches, source } = await getLiveMatches()
    const liveOnly = matches.filter(m => m.status === 'live')

    res.setHeader('X-Cache-Status', source)
    res.setHeader('Cache-Control', 'public, max-age=30') // 30s pour le live
    res.json({ success: true, data: liveOnly, source, total: liveOnly.length })
  } catch (err) {
    const error = err as Error
    logger.error('[GET /matches/live]', error.message)
    res.status(500).json({ success: false, error: 'Erreur serveur', code: 500 })
  }
})

// ── GET /api/matches/upcoming ──────────────────────────────────
router.get(
  '/upcoming',
  [query('league').optional().isString().isLength({ max: 50 })],
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, error: 'Paramètre invalide', code: 400 })
      return
    }

    const leagueKey = req.query.league as string | undefined

    try {
      const { matches, source } = await getUpcomingMatches(leagueKey)
      res.setHeader('X-Cache-Status', source)
      res.setHeader('Cache-Control', 'public, max-age=120')
      res.json({ success: true, data: matches, source, total: matches.length })
    } catch (err) {
      const error = err as Error
      logger.error('[GET /matches/upcoming]', error.message)
      res.status(500).json({ success: false, error: 'Erreur serveur', code: 500 })
    }
  }
)

// ── GET /api/matches/all ───────────────────────────────────────
router.get('/all', async (_req: Request, res: Response) => {
  try {
    const { matches, source } = await getFullMatches()
    res.setHeader('X-Cache-Status', source)
    res.json({ success: true, data: matches, source, total: matches.length })
  } catch (err) {
    const error = err as Error
    logger.error('[GET /matches/all]', error.message)
    res.status(500).json({ success: false, error: 'Erreur serveur', code: 500 })
  }
})

export default router
