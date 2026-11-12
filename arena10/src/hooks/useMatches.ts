// ============================================================
// ARENA 10 — Hook useMatches
// Charge le calendrier complet des matchs (FullMatch) depuis l'API
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { fetchFullMatches, FullMatch } from '../services/api'

export type { FullMatch }

export interface UseMatchesResult {
  matches: FullMatch[]
  liveMatches: FullMatch[]
  upcomingMatches: FullMatch[]
  loading: boolean
  error: string | null
  source: 'live' | 'cache' | 'fallback' | null
  reload: () => void
}

export function useMatches(): UseMatchesResult {
  const [matches,  setMatches]  = useState<FullMatch[]>([])
  const [loading,  setLoading]  = useState<boolean>(true)
  const [error,    setError]    = useState<string | null>(null)
  const [source,   setSource]   = useState<'live' | 'cache' | 'fallback' | null>(null)
  const [tick,     setTick]     = useState<number>(0)

  const loadMatches = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetchFullMatches(tick > 0)
      if (response && response.success && Array.isArray(response.data)) {
        setMatches(response.data)
        setSource(response.source)
      } else {
        setMatches([])
        setSource(null)
        setError('Aucun match retourné par le serveur.')
      }
    } catch {
      setMatches([])
      setSource(null)
      setError('Impossible de joindre le backend des matchs.')
    } finally {
      setLoading(false)
    }
  }, [tick])

  useEffect(() => {
    loadMatches()
  }, [loadMatches])

  const reload = useCallback(() => {
    setTick(t => t + 1)
  }, [])

  const liveMatches     = matches.filter(m => m.status === 'live')
  const upcomingMatches = matches.filter(m => m.status === 'upcoming')

  return { matches, liveMatches, upcomingMatches, loading, error, source, reload }
}
