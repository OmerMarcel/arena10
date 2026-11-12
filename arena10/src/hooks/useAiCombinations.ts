// ============================================================
// ARENA 10 — Hook : Combinaisons IA du jour
// Consomme GET /api/predictions/combinations
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { fetchDailyCombinations, type AiCombination } from '../services/api'

interface UseAiCombinationsReturn {
  combinations: AiCombination[]
  loading: boolean
  error: string | null
  source: 'gemini' | 'groq' | 'arena-algo' | null
  reload: () => void
}

export function useAiCombinations(): UseAiCombinationsReturn {
  const [combinations, setCombinations] = useState<AiCombination[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [source, setSource]             = useState<'gemini' | 'groq' | 'arena-algo' | null>(null)
  const [tick, setTick]                 = useState(0)

  const reload = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchDailyCombinations(tick > 0)
      .then(resp => {
        if (cancelled) return
        if (!resp) {
          setError('Backend indisponible — démarrez le serveur (npm run dev)')
          setCombinations([])
          return
        }
        if (!resp.success || !Array.isArray(resp.data)) {
          setError('Réponse inattendue du serveur')
          setCombinations([])
          return
        }
        setCombinations(resp.data)
        // Déduit la source depuis la première combinaison
        if (resp.data.length > 0) setSource(resp.data[0].source)
      })
      .catch(err => {
        if (!cancelled) setError(String(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [tick])

  return { combinations, loading, error, source, reload }
}

