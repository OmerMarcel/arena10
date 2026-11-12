// ============================================================
// ARENA 10 — Page Actualités (connectée au backend)
// Remplace l'import statique depuis ../data par useNews()
// ============================================================

import { useState, useMemo } from 'react'
import { Fire as Flame, ArrowRight, ArrowsClockwise as RefreshCw } from '@phosphor-icons/react'
import { useNews }             from '../hooks/useNews'
import { formatRelativeTime }  from '../services/api'

// ── Badge indiquant la source des données ──────────────────────
function SourceBadge({ source }: { source: 'live' | 'cache' | 'fallback' | null }) {
  if (!source) return null
  const configs = {
    live:     { icon: '🟢', label: 'LIVE',  color: '#4ade80' },
    cache:    { icon: '🟠', label: 'CACHE', color: '#f59a23' },
    fallback: { icon: '⚫', label: 'HORS LIGNE',  color: '#94a3b8' },
  }
  const { icon, label, color } = configs[source]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 700, color,
      border: `1px solid ${color}`, borderRadius: 6,
      padding: '2px 8px', letterSpacing: 1,
    }}>
      {icon} {label}
    </span>
  )
}

// ── Skeleton loader pendant le chargement ─────────────────────
function SkeletonCard() {
  return (
    <article className="news-article" style={{ opacity: 0.6 }}>
      <div
        className="news-article-icon"
        style={{ background: '#1e293b', borderRadius: 8, minWidth: 56, height: 56, animation: 'pulse 1.5s infinite' }}
      />
      <div className="news-article-body" style={{ flex: 1 }}>
        <div style={{ height: 12, background: '#1e293b', borderRadius: 4, marginBottom: 8, width: '40%', animation: 'pulse 1.5s infinite' }} />
        <div style={{ height: 16, background: '#1e293b', borderRadius: 4, marginBottom: 8, width: '90%', animation: 'pulse 1.5s infinite' }} />
        <div style={{ height: 12, background: '#1e293b', borderRadius: 4, width: '70%', animation: 'pulse 1.5s infinite' }} />
      </div>
    </article>
  )
}

// ── Composant principal ────────────────────────────────────────
export function NewsPage() {
  const [leagueFilter, setLeagueFilter] = useState('Toutes')
  const [tagFilter,    setTagFilter]    = useState('Tous')

  // Hook connecté au backend — search géré par le hook
  const { articles: apiArticles, loading, error, source, reload, search, setSearch } = useNews()

  // Pas de fausses actualités par défaut : on affiche les vrais articles retournés par l'API
  const rawArticles = apiArticles

  // Calcul des filtres disponibles à partir des articles chargés (ou démo)
  const leagues = useMemo(
    () => ['Toutes', ...Array.from(new Set(rawArticles.map(n => n.league)))],
    [rawArticles]
  )
  const tags = useMemo(
    () => ['Tous', ...Array.from(new Set(rawArticles.map(n => n.tag)))],
    [rawArticles]
  )

  // Application des filtres côté client
  const visible = useMemo(() =>
    rawArticles.filter(n =>
      (leagueFilter === 'Toutes' || n.league === leagueFilter) &&
      (tagFilter    === 'Tous'   || n.tag    === tagFilter)    &&
      (search.length === 0 ||
        `${n.title} ${n.summary} ${n.league}`.toLowerCase().includes(search.toLowerCase()))
    ),
    [rawArticles, leagueFilter, tagFilter, search]
  )

  const featured = visible.find(n => n.hot) || visible[0]
  const rest      = visible.filter(n => n !== featured)

  return (
    <div className="news-page">
      {/* ══ EN-TÊTE ════════════════════════════════════════════ */}
      <div className="page-header">
        <div className="eyebrow"><span className="eyebrow-line" /> FOOTBALL LIVE</div>
        <h2>ACTUALITÉS <span>DU FOOTBALL</span></h2>
        <p>Les dernières nouvelles des clubs, transferts et analyses de match</p>
      </div>

      {/* ══ BARRE D'ÉTAT API ══════════════════════════════════ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
        <SourceBadge source={error ? 'fallback' : source} />
        {error && (
          <span style={{ fontSize: 12, color: '#f87171' }}>
            ⚠ {error}
          </span>
        )}
        <button
          className="text-btn"
          onClick={reload}
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}
          title="Rafraîchir les actualités"
        >
          <RefreshCw size={13} />
          Rafraîchir
        </button>
      </div>

      {/* ══ FILTRES ══════════════════════════════════════════ */}
      <div className="news-filters">
        <div className="search-box" style={{ maxWidth: 280 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une actualité..."
          />
        </div>
        <div className="news-filter-pills">
          {leagues.map(l => (
            <button
              key={l}
              className={`filter-pill${leagueFilter === l ? ' active' : ''}`}
              onClick={() => setLeagueFilter(l)}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="news-filter-pills">
          {tags.map(t => (
            <button
              key={t}
              className={`filter-pill tag-pill${tagFilter === t ? ' active' : ''}`}
              onClick={() => setTagFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ══ SKELETON LOADER ══════════════════════════════════ */}
      {loading && (
        <div className="news-grid">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* ══ CONTENU CHARGÉ ═══════════════════════════════════ */}
      {!loading && visible.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text3)' }}>
          <p style={{ fontSize: 14 }}>Aucune actualité disponible pour le moment.</p>
        </div>
      )}

      {!loading && visible.length > 0 && (
        <>
          {/* Article vedette */}
          {featured && (
            <div className="news-featured">
              <div className="news-featured-icon">{featured.img}</div>
              <div className="news-featured-content">
                <div className="news-meta">
                  {featured.hot && <span className="hot-badge"><Flame size={11} /> TRENDING</span>}
                  <span className="news-tag">{featured.tag}</span>
                  <span className="news-league">{featured.league}</span>
                  <span className="news-time">{formatRelativeTime(featured.publishedAt)}</span>
                </div>
                <h2>{featured.title}</h2>
                <p>{featured.summary}</p>
                {featured.url && featured.url !== '#' ? (
                  <a
                    href={featured.url}
                    className="text-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    Lire la suite <ArrowRight size={14} />
                  </a>
                ) : (
                  <button className="text-btn">
                    Lire la suite <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Grille d'articles */}
          <div className="news-grid">
            {rest.map(n => (
              <article key={n.id} className="news-article">
                <div className="news-article-icon">{n.img}</div>
                <div className="news-article-body">
                  <div className="news-meta">
                    {n.hot && <span className="hot-badge"><Flame size={10} /> HOT</span>}
                    <span className="news-tag">{n.tag}</span>
                    <span className="news-league">{n.league}</span>
                  </div>
                  <h3>{n.title}</h3>
                  <p>{n.summary}</p>
                  <div className="news-article-foot">
                    <span className="news-time">{formatRelativeTime(n.publishedAt)}</span>
                    {n.url && n.url !== '#' ? (
                      <a
                        href={n.url}
                        className="text-btn"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        Lire <ArrowRight size={12} />
                      </a>
                    ) : (
                      <button className="text-btn">Lire <ArrowRight size={12} /></button>
                    )}
                  </div>
                </div>
              </article>
            ))}

            {/* Aucun résultat */}
            {visible.length === 0 && (
              <div className="empty" style={{ gridColumn: '1/-1', padding: 48 }}>
                Aucune actualité ne correspond à vos filtres.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
