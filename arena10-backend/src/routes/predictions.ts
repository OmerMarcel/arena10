// ============================================================
// ARENA 10 Backend — Routes Prédictions & Combinés IA
// ============================================================

import { Router, Request, Response } from 'express'
import { getFullMatches } from '../services/matchService'
import { getDailyCombinations, optimizeUserSelection } from '../services/aiPredictionService'
import { getPredictionHistory } from '../services/historyService'
import { logger } from '../utils/logger'
import { OptimizeRequest } from '../types'

const router = Router()

/**
 * GET /api/predictions/history
 * Retourne l'historique des pronostics & combinés sur 14 jours avec statuts (Validé/Perdu) et bilan ROI
 * Query params: ?days=14 (par défaut 14)
 */
router.get('/history', async (req: Request, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string, 10) || 14
    const historyData = await getPredictionHistory(days)

    res.json({
      success: true,
      data: historyData,
      source: 'live'
    })
  } catch (err: any) {
    logger.error('[PredictionsRoute] Erreur lors de la récupération de l\'historique:', err)
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'historique des pronostics.',
      detail: err?.message || String(err)
    })
  }
})

/**
 * GET /api/predictions/combinations
 * Retourne les 2 à 4 combinaisons de cotes ~3.00 du jour générées par l'IA
 * Query params: ?refresh=true pour forcer la régénération
 */
router.get('/combinations', async (req: Request, res: Response): Promise<void> => {
  try {
    const forceRefresh = req.query.refresh === 'true'
    const matchData = await getFullMatches(forceRefresh)

    if (!matchData.matches || matchData.matches.length === 0) {
      res.status(503).json({
        success: false,
        error: 'Aucun match disponible pour générer les combinaisons.'
      })
      return
    }

    const combinations = await getDailyCombinations(matchData.matches, forceRefresh)

    res.json({
      success: true,
      data: combinations,
      total: combinations.length,
      source: matchData.source
    })
  } catch (err: any) {
    logger.error('[PredictionsRoute] Erreur lors de la génération des combinaisons:', err)
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération des combinaisons IA.',
      detail: err?.message || String(err)
    })
  }
})

/**
 * POST /api/predictions/optimize
 * Optimise une liste de matchs sélectionnés par l'utilisateur
 * Body : { matchIds: number[], targetOdds?: number }
 */
router.post('/optimize', async (req: Request, res: Response): Promise<void> => {
  try {
    const { matchIds, targetOdds } = req.body as OptimizeRequest

    if (!Array.isArray(matchIds) || matchIds.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Veuillez sélectionner au moins un match (matchIds requis).'
      })
      return
    }

    const matchData = await getFullMatches()
    const allMatches = matchData.matches || []

    const selectedMatches = allMatches.filter(m => matchIds.includes(m.id))

    if (selectedMatches.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Aucun des matchs sélectionnés n\'a été trouvé.'
      })
      return
    }

    const optimized = await optimizeUserSelection(selectedMatches, targetOdds || 3.0)

    res.json({
      success: true,
      data: optimized,
      source: optimized.source
    })
  } catch (err: any) {
    logger.error('[PredictionsRoute] Erreur optimisation sélection:', err)
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'optimisation de la sélection.',
      detail: err?.message || String(err)
    })
  }
})

export default router

