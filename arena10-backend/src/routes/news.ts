// ============================================================
// ARENA 10 Backend — Route : Actualités Football
// ============================================================

import { Router, Request, Response } from 'express'
import { query, validationResult } from 'express-validator'
import { getLatestNews, searchNews } from '../services/newsService'
import { newsRateLimit } from '../middleware/security'
import { logger } from '../utils/logger'
import { ApiResponse, NewsArticle } from '../types'

const router = Router()

// ── GET /api/news ─────────────────────────────────────────────
// Récupère les dernières actualités football
router.get(
  '/',
  newsRateLimit,
  [
    query('league').optional().isString().isLength({ max: 50 }),
    query('tag').optional().isString().isLength({ max: 30 }),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('refresh').optional().isBoolean().toBoolean(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, error: 'Paramètres invalides', code: 400 })
      return
    }

    const leagueFilter = req.query.league as string | undefined
    const tagFilter    = req.query.tag as string | undefined
    const limit        = (req.query.limit as unknown as number | undefined) ?? 20
    const forceRefresh = req.query.refresh === 'true'

    try {
      const { articles, source } = await getLatestNews(forceRefresh)

      let filtered = articles
      if (leagueFilter) {
        filtered = filtered.filter(a => a.league.toLowerCase() === leagueFilter.toLowerCase())
      }
      if (tagFilter) {
        filtered = filtered.filter(a => a.tag.toLowerCase() === tagFilter.toLowerCase())
      }

      filtered = filtered.slice(0, limit)

      res.setHeader('X-Cache-Status', source)
      res.setHeader('Cache-Control', 'public, max-age=120') // CDN cache 2min

      const response: ApiResponse<NewsArticle[]> = {
        success: true,
        data: filtered,
        source,
        total: filtered.length,
        cachedAt: source === 'cache' ? new Date().toISOString() : undefined,
      }

      logger.info(`[GET /news] ${filtered.length} articles → source: ${source}`)
      res.json(response)
    } catch (err) {
      const error = err as Error
      logger.error('[GET /news] Erreur:', error.message)
      res.status(500).json({ success: false, error: 'Erreur serveur', code: 500 })
    }
  }
)

// ── GET /api/news/search ───────────────────────────────────────
// Recherche dans les actualités
router.get(
  '/search',
  newsRateLimit,
  [
    query('q').notEmpty().isString().isLength({ min: 2, max: 100 }).trim(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Paramètre q requis (2-100 caractères)',
        code: 400,
      })
      return
    }

    const searchQuery = req.query.q as string

    try {
      const { articles, source } = await searchNews(searchQuery)
      
      res.setHeader('X-Cache-Status', source)
      res.json({
        success: true,
        data: articles,
        source,
        total: articles.length,
        query: searchQuery,
      })
    } catch (err) {
      const error = err as Error
      logger.error('[GET /news/search] Erreur:', error.message)
      res.status(500).json({ success: false, error: 'Erreur serveur', code: 500 })
    }
  }
)

// ── GET /api/news/leagues ──────────────────────────────────────
// Liste des ligues disponibles dans les actualités
router.get('/leagues', async (_req: Request, res: Response) => {
  const { articles } = await getLatestNews()
  const leagues = [...new Set(articles.map(a => a.league))].sort()
  res.json({ success: true, data: leagues })
})

// ── GET /api/news/tags ─────────────────────────────────────────
// Liste des tags disponibles
router.get('/tags', async (_req: Request, res: Response) => {
  const { articles } = await getLatestNews()
  const tags = [...new Set(articles.map(a => a.tag))].sort()
  res.json({ success: true, data: tags })
})

export default router

