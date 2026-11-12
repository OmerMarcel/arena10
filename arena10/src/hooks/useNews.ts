// ============================================================
// ARENA 10 — Hook useNews
// Charge et gère les actualités depuis le service API
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { fetchNews, searchNews, formatRelativeTime, NewsArticle } from '../services/api'

// Réexporter pour commodité des consommateurs du hook
export type { NewsArticle }
export { formatRelativeTime }

export interface UseNewsOptions {
  league?: string
  tag?: string
  limit?: number
}

export interface UseNewsResult {
  articles: NewsArticle[]
  loading: boolean
  error: string | null
  source: 'live' | 'cache' | 'fallback' | null
  reload: () => void
  search: string
  setSearch: (q: string) => void
}

/**
 * Hook React pour charger et filtrer les actualités football.
 * - Charge automatiquement au montage
 * - Expose reload() pour forcer un rafraîchissement
 * - Expose search / setSearch pour la recherche côté client
 */
export function useNews(options?: UseNewsOptions): UseNewsResult {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading,  setLoading]  = useState<boolean>(true)
  const [error,    setError]    = useState<string | null>(null)
  const [source,   setSource]   = useState<'live' | 'cache' | 'fallback' | null>(null)
  const [search,   setSearch]   = useState<string>('')
  // Compteur interne pour déclencher un rechargement
  const [tick, setTick] = useState<number>(0)

  // Charge les articles depuis l'API (ou recherche si search est renseigné)
  const loadNews = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let response = null
      if (search.trim().length > 0) {
        // Mode recherche : appel /api/news/search
        response = await searchNews(search.trim())
      } else {
        // Mode normal : appel /api/news avec filtres optionnels
        response = await fetchNews({
          league: options?.league,
          tag:    options?.tag,
          limit:  options?.limit,
        })
      }

      if (response && response.success) {
        setArticles(response.data)
        setSource(response.source)
      } else if (response && !response.success) {
        setError('Le serveur a retourné une erreur.')
        setArticles([])
      } else {
        // null = erreur réseau / backend indisponible
        setError('Backend indisponible. Affichage des données de démonstration.')
        setArticles([])
      }
    } catch (e) {
      setError('Erreur inattendue lors du chargement des actualités.')
      setArticles([])
    } finally {
      setLoading(false)
    }
  }, [search, options?.league, options?.tag, options?.limit, tick])

  // Chargement initial + rechargement quand les dépendances changent
  useEffect(() => {
    loadNews()
  }, [loadNews])

  /** Force un rechargement immédiat des actualités */
  const reload = useCallback(() => {
    setTick(t => t + 1)
  }, [])

  return { articles, loading, error, source, reload, search, setSearch }
}
