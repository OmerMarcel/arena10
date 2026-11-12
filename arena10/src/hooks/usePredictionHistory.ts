// ============================================================
// ARENA 10 — Hook : Historique & Bilan des Pronostics (14 jours)
// Consomme GET /api/predictions/history?days=14
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import {
  fetchPredictionHistory,
  type PredictionHistoryResponse,
  type HistorySummary,
  type HistoryDay
} from '../services/api'

interface UsePredictionHistoryReturn {
  summary: HistorySummary | null
  days: HistoryDay[]
  loading: boolean
  error: string | null
  reload: () => void
}

export function usePredictionHistory(daysRequested = 14): UsePredictionHistoryReturn {
  const [summary, setSummary] = useState<HistorySummary | null>(null)
  const [days, setDays]       = useState<HistoryDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [tick, setTick]       = useState(0)

  const reload = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchPredictionHistory(daysRequested)
      .then(resp => {
        if (cancelled) return
        if (!resp || !resp.success || !resp.data) {
          setError('Impossible de charger l\'historique des pronostics.')
          return
        }
        setSummary(resp.data.summary)
        setDays(resp.data.days)
      })
      .catch(err => {
        if (!cancelled) setError(String(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [daysRequested, tick])

  return { summary, days, loading, error, reload }
}

