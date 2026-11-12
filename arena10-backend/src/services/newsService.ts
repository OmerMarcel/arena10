// ============================================================
// ARENA 10 Backend — Service Actualités (NewsAPI + enrichissement)
// ============================================================

import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { config } from '../config'
import { getFromCache, setCache } from '../utils/cache'
import { logger } from '../utils/logger'
import { FALLBACK_NEWS } from '../utils/fallbackData'
import { NewsArticle, NewsApiResponse, NewsTag } from '../types'

const CACHE_KEY_NEWS = 'arena10:news:latest'
const CACHE_KEY_NEWS_SPORTS = 'arena10:news:sports'

// Mots-clés football pour requêtes NewsAPI
const FOOTBALL_QUERIES = [
  'football ligue 1 premier league',
  'Champions League transfert football',
  'Real Madrid Barcelona PSG Arsenal',
]

// Mapping automatique du tag à partir du titre/contenu
function detectTag(title: string, description: string): NewsTag {
  const text = `${title} ${description}`.toLowerCase()
  if (text.includes('bless') || text.includes('injury') || text.includes('forfait')) return 'BLESSURE'
  if (text.includes('transfert') || text.includes('mercato') || text.includes('recrut') || text.includes('signe') || text.includes('contrat')) return 'MERCATO'
  if (text.includes('sélection') || text.includes('équipe de france') || text.includes('national') || text.includes('coupe du monde')) return 'SÉLECTION'
  if (text.includes('avant-match') || text.includes('prévu') || text.includes('annonce') || text.includes('préparation')) return 'AVANT-MATCH'
  if (text.includes('résultat') || text.includes('victoire') || text.includes('défaite') || text.includes('nul') || text.includes('score')) return 'RÉSULTAT'
  if (text.includes('tactique') || text.includes('stratégie') || text.includes('formati') || text.includes('pressing')) return 'TACTIQUE'
  if (text.includes('stat') || text.includes('algorithme') || text.includes('prédic') || text.includes('arena 10')) return 'ALGORITHME'
  if (text.includes('performance') || text.includes('saison') || text.includes('classement') || text.includes('forme')) return 'PERFORMANCE'
  return 'ANALYSE'
}

// Mapping ligue à partir du contenu
function detectLeague(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase()
  if (text.includes('premier league') || text.includes('arsenal') || text.includes('chelsea') || text.includes('liverpool') || text.includes('manchester')) return 'Premier League'
  if (text.includes('laliga') || text.includes('real madrid') || text.includes('barcelona') || text.includes('atletico') || text.includes('séville')) return 'LaLiga'
  if (text.includes('ligue 1') || text.includes('psg') || text.includes('paris saint-germain') || text.includes('marseille') || text.includes('lyon')) return 'Ligue 1'
  if (text.includes('serie a') || text.includes('juventus') || text.includes('inter') || text.includes('milan') || text.includes('napoli')) return 'Serie A'
  if (text.includes('bundesliga') || text.includes('bayern') || text.includes('dortmund') || text.includes('leverkusen')) return 'Bundesliga'
  if (text.includes('champions league') || text.includes('ligue des champions') || text.includes('europa league')) return 'Champions League'
  if (text.includes('équipe de france') || text.includes('les bleus') || text.includes('world cup') || text.includes('coupe du monde') || text.includes('euro')) return 'International'
  return 'Football'
}

// Icône emoji selon le tag
function getEmoji(tag: NewsTag): string {
  const map: Record<NewsTag, string> = {
    'ANALYSE': '📊',
    'TRANSFERT': '📋',
    'AVANT-MATCH': '🔭',
    'PERFORMANCE': '🌟',
    'SÉLECTION': '🏳️',
    'ALGORITHME': '🤖',
    'BLESSURE': '🏥',
    'TACTIQUE': '🧠',
    'RÉSULTAT': '⚽',
    'MERCATO': '💰',
  }
  return map[tag] || '📰'
}

// Vérifie si un article est "hot" (trending)
function isHot(title: string, publishedAt: string): boolean {
  const ageHours = (Date.now() - new Date(publishedAt).getTime()) / 3600000
  const hotKeywords = ['breaking', 'exclusif', 'officiel', 'confirmé', 'accord', 'incroyable', 'historique']
  const hasHotWord = hotKeywords.some(k => title.toLowerCase().includes(k))
  return ageHours < 2 || hasHotWord
}

// Nettoie et transforme un article brut NewsAPI
function transformArticle(raw: NewsApiResponse['articles'][0]): NewsArticle | null {
  if (!raw.title || raw.title === '[Removed]') return null
  if (!raw.description) return null

  const title = raw.title.replace(/\s*-\s*[^-]+$/, '').trim() // Retire le nom de la source en fin
  const tag = detectTag(title, raw.description)
  const league = detectLeague(title, raw.description)

  return {
    id: uuidv4(),
    title,
    summary: raw.description.substring(0, 220),
    content: raw.content || undefined,
    url: raw.url,
    urlToImage: raw.urlToImage || undefined,
    source: raw.source.name,
    author: raw.author || undefined,
    publishedAt: raw.publishedAt,
    league,
    tag,
    hot: isHot(title, raw.publishedAt),
    img: getEmoji(tag),
  }
}

// ── Récupération depuis NewsAPI ──────────────────────────────
async function fetchFromNewsApi(): Promise<NewsArticle[]> {
  if (!config.newsApiKey) {
    logger.warn('[NewsService] NEWS_API_KEY non configurée — mode fallback activé')
    return []
  }

  const query = 'football OR soccer OR "ligue 1" OR "premier league" OR "champions league" OR "laliga" OR "bundesliga"'

  const response = await axios.get<NewsApiResponse>(
    'https://newsapi.org/v2/everything',
    {
      params: {
        q: query,
        language: 'fr',
        sortBy: 'publishedAt',
        pageSize: 30,
        from: new Date(Date.now() - 48 * 3600000).toISOString(), // 48h max
      },
      headers: {
        'X-Api-Key': config.newsApiKey,
        'User-Agent': 'ARENA10/1.0',
      },
      timeout: 8000,
    }
  )

  if (response.data.status !== 'ok') {
    throw new Error(`NewsAPI returned status: ${response.data.status}`)
  }

  const articles = response.data.articles
    .map(transformArticle)
    .filter((a): a is NewsArticle => a !== null)
    .slice(0, 20)

  logger.info(`[NewsService] ${articles.length} articles récupérés depuis NewsAPI`)
  return articles
}

// ── Récupération depuis The Sports DB (gratuite, sans clé) ───
async function fetchSportsDbNews(): Promise<NewsArticle[]> {
  // The Sports DB ne fournit pas d'articles écrits — on utilise les events récents
  // pour générer des articles enrichis automatiquement
  return []
}

// ── Service principal ────────────────────────────────────────
export async function getLatestNews(forceRefresh = false): Promise<{
  articles: NewsArticle[]
  source: 'live' | 'cache' | 'fallback'
}> {
  // 1. Vérifier le cache
  if (!forceRefresh) {
    const cached = getFromCache<NewsArticle[]>(CACHE_KEY_NEWS)
    if (cached) return { articles: cached, source: 'cache' }
  }

  // 2. Essayer NewsAPI
  try {
    const articles = await fetchFromNewsApi()
    if (articles.length > 0) {
      setCache(CACHE_KEY_NEWS, articles, config.cacheNewsttl)
      return { articles, source: 'live' }
    }
  } catch (err) {
    const error = err as Error
    logger.error('[NewsService] Échec NewsAPI:', error.message)
  }

  // 3. Fallback données enrichies
  logger.warn('[NewsService] Utilisation du fallback réaliste')
  const fallback = FALLBACK_NEWS.map(a => ({
    ...a,
    publishedAt: new Date(Date.now() - Math.random() * 24 * 3600000).toISOString(),
  }))
  setCache(CACHE_KEY_NEWS, fallback, 60) // Cache court pour le fallback
  return { articles: fallback, source: 'fallback' }
}

// ── Recherche dans les actualités ────────────────────────────
export async function searchNews(query: string): Promise<{
  articles: NewsArticle[]
  source: 'live' | 'cache' | 'fallback'
}> {
  const cacheKey = `arena10:news:search:${query.toLowerCase().trim()}`
  
  const cached = getFromCache<NewsArticle[]>(cacheKey)
  if (cached) return { articles: cached, source: 'cache' }

  if (!config.newsApiKey) {
    const { articles } = await getLatestNews()
    const filtered = articles.filter(a =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.summary.toLowerCase().includes(query.toLowerCase())
    )
    return { articles: filtered, source: 'fallback' }
  }

  try {
    const response = await axios.get<NewsApiResponse>(
      'https://newsapi.org/v2/everything',
      {
        params: {
          q: `${query} football`,
          language: 'fr',
          sortBy: 'relevancy',
          pageSize: 10,
        },
        headers: { 'X-Api-Key': config.newsApiKey },
        timeout: 6000,
      }
    )

    const articles = response.data.articles
      .map(transformArticle)
      .filter((a): a is NewsArticle => a !== null)
    
    setCache(cacheKey, articles, 180) // Cache 3min pour les recherches
    return { articles, source: 'live' }
  } catch {
    const { articles } = await getLatestNews()
    return { articles, source: 'fallback' }
  }
}

