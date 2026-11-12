// ============================================================
// ARENA 10 Backend — Routes Authentification & Espace Personnel
// ============================================================

import { Router, Request, Response } from 'express'
import {
  registerUser,
  loginUser,
  loginWithGoogle,
  getUserByToken,
  logoutUser,
  updateUserProfile,
  getUserBets,
  addUserBet,
  deleteUserBet
} from '../services/authService'
import { isPostgresConnected } from '../db/postgres'
import { isRedisConnected } from '../db/redis'
import { logger } from '../utils/logger'

const router = Router()

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim()
  }
  return (req.query.token as string) || null
}

/**
 * GET /api/auth/status
 * Diagnostic de connexion PostgreSQL et Redis
 */
router.get('/status', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    data: {
      postgres: {
        connected: isPostgresConnected(),
        role: 'Mémoire Permanente (Stockage utilisateurs, favoris, carnet SQL)'
      },
      redis: {
        connected: isRedisConnected(),
        role: 'Mémoire Rapide & Temporaire (Sessions ultra-rapides, cache profils)'
      }
    }
  })
})

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, title } = req.body
    const result = await registerUser({ name, email, password, title })

    res.status(201).json({
      success: true,
      user: result.user,
      token: result.token
    })
  } catch (err: any) {
    logger.warn('[AuthRoute] Échec inscription:', err?.message || err)
    res.status(400).json({
      success: false,
      error: err?.message || 'Erreur lors de l\'inscription.'
    })
  }
})

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur existant
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body
    const result = await loginUser(email, password)

    res.json({
      success: true,
      user: result.user,
      token: result.token
    })
  } catch (err: any) {
    logger.warn('[AuthRoute] Échec connexion:', err?.message || err)
    res.status(401).json({
      success: false,
      error: err?.message || 'Identifiants incorrects.'
    })
  }
})

/**
 * GET /api/auth/me
 * Récupère le profil de l'utilisateur connecté via son token
 */
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const token = extractToken(req)
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Aucun token d\'authentification fourni.'
      })
      return
    }

    const user = await getUserByToken(token)
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Session expirée ou invalide. Veuillez vous reconnecter.'
      })
      return
    }

    res.json({
      success: true,
      user
    })
  } catch (err: any) {
    logger.error('[AuthRoute] Erreur /me:', err)
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification de la session.'
    })
  }
})

/**
 * PUT /api/auth/profile
 * Met à jour le profil de l'utilisateur connecté
 */
router.put('/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    const token = extractToken(req)
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Non autorisé.'
      })
      return
    }

    const user = await getUserByToken(token)
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Session expirée.'
      })
      return
    }

    const updated = await updateUserProfile(user.id, req.body)
    res.json({
      success: true,
      user: updated
    })
  } catch (err: any) {
    logger.error('[AuthRoute] Erreur mise à jour profil:', err)
    res.status(400).json({
      success: false,
      error: err?.message || 'Erreur lors de la mise à jour du profil.'
    })
  }
})

/**
 * GET /api/auth/notebook
 * Récupère le carnet de paris personnel de l'utilisateur
 */
router.get('/notebook', async (req: Request, res: Response): Promise<void> => {
  try {
    const token = extractToken(req)
    if (!token) {
      res.status(401).json({ success: false, error: 'Non autorisé.' })
      return
    }

    const user = await getUserByToken(token)
    if (!user) {
      res.status(401).json({ success: false, error: 'Session invalide.' })
      return
    }

    const bets = await getUserBets(user.id)
    res.json({
      success: true,
      data: bets
    })
  } catch (err: any) {
    logger.error('[AuthRoute] Erreur notebook GET:', err)
    res.status(500).json({ success: false, error: 'Erreur lors du chargement du carnet.' })
  }
})

/**
 * POST /api/auth/notebook
 * Ajoute un pari au carnet personnel de l'utilisateur (enregistré dans PostgreSQL)
 */
router.post('/notebook', async (req: Request, res: Response): Promise<void> => {
  try {
    const token = extractToken(req)
    if (!token) {
      res.status(401).json({ success: false, error: 'Non autorisé.' })
      return
    }

    const user = await getUserByToken(token)
    if (!user) {
      res.status(401).json({ success: false, error: 'Session invalide.' })
      return
    }

    const newBet = await addUserBet(user.id, req.body)
    res.status(201).json({
      success: true,
      data: newBet
    })
  } catch (err: any) {
    logger.error('[AuthRoute] Erreur notebook POST:', err)
    res.status(400).json({ success: false, error: 'Erreur lors de l\'enregistrement du pari.' })
  }
})

/**
 * DELETE /api/auth/notebook/:id
 * Supprime un pari du carnet
 */
router.delete('/notebook/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const token = extractToken(req)
    if (!token) {
      res.status(401).json({ success: false, error: 'Non autorisé.' })
      return
    }

    const user = await getUserByToken(token)
    if (!user) {
      res.status(401).json({ success: false, error: 'Session invalide.' })
      return
    }

    const betId = parseInt(req.params.id, 10)
    const deleted = await deleteUserBet(user.id, betId)
    res.json({
      success: true,
      deleted
    })
  } catch (err: any) {
    logger.error('[AuthRoute] Erreur notebook DELETE:', err)
    res.status(400).json({ success: false, error: 'Erreur lors de la suppression.' })
  }
})

/**
 * POST /api/auth/google
 * Connexion / inscription via Google OAuth (ID Token envoyé depuis le frontend)
 */
router.post('/google', async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body
    if (!idToken) {
      res.status(400).json({ success: false, error: 'Token Google manquant.' })
      return
    }

    const result = await loginWithGoogle(idToken)
    res.json({
      success: true,
      user: result.user,
      token: result.token
    })
  } catch (err: any) {
    logger.warn('[AuthRoute] Échec connexion Google:', err?.message || err)
    res.status(401).json({
      success: false,
      error: err?.message || 'Connexion Google échouée.'
    })
  }
})

/**
 * POST /api/auth/logout
 * Déconnecte l'utilisateur et détruit le token de session dans Redis
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    const token = extractToken(req)
    if (token) {
      await logoutUser(token)
    }
    res.json({
      success: true,
      message: 'Déconnexion effectuée avec succès.'
    })
  } catch (err: any) {
    logger.error('[AuthRoute] Erreur logout:', err)
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la déconnexion.'
    })
  }
})

export default router
