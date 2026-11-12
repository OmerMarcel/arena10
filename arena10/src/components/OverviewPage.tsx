// ============================================================
// ARENA 10 — Page Vue d'ensemble (Hero + Métriques + Matchs vedettes)
// ============================================================

import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  ArrowRight, ArrowDownRight, CalendarDots as CalendarDays, Sparkle as Sparkles, Shield, Users,
  Trophy, Lightning as Zap, CaretRight as ChevronRight, Star, TrendUp as TrendingUp, Pulse as Activity
} from '@phosphor-icons/react'
import { useNews, formatRelativeTime }  from '../hooks/useNews'
import { useMatches } from '../hooks/useMatches'
import { PlayerScene, AnimControls, AnimMode } from './Player3D'
import { Crest } from './Crest'
import { formatTeamName } from '../utils/formatters'

export function OverviewPage({ onNav, selected, onToggle }: {
  onNav: (page: string) => void
  selected: number[]
  onToggle: (id: number) => void
}) {
  const [animMode, setAnimMode] = useState<AnimMode>('idle')
  const { matches } = useMatches()
  const liveMatch  = matches.find(m => m.status === 'live')
  const topMatches = matches.filter(m => m.status === 'upcoming').slice(0, 4)
  const leaguesCount = new Set(matches.map(m => m.league)).size

  // ── Actualités dynamiques depuis le backend (sans mock statique) ──
  const { articles: apiArticles } = useNews({ limit: 6 })
  const rawHot = apiArticles.filter(n => n.hot)
  const hotNews = (rawHot.length > 0 ? rawHot : apiArticles).slice(0, 3)

  return (
    <div className="overview-page">
      {/* ══ HERO ══════════════════════════════════════════════════ */}
      <section className="hero-v2">
        <div className="hero-left">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            LA NOUVELLE DIMENSION DU FOOTBALL
          </div>
          <h1>
            PENSEZ LE JEU.<br />
            <span>LISEZ L'AVENIR.</span>
          </h1>
          <p>
            Intelligence artificielle, statistiques avancées et analyses prédictives —
            réunis dans l'expérience football ultime.
          </p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={() => onNav('Programme')}>
              Explorer les matchs <ArrowRight size={16} />
            </button>
            <button className="text-btn" onClick={() => onNav('Pronostics')}>
              Voir les analyses <ArrowDownRight size={16} />
            </button>
          </div>
          <div className="hero-stats">
            <div><b>{matches.length.toString().padStart(2, '0')}</b><span>MATCHS CETTE SEMAINE</span></div>
            <div><b>{leaguesCount.toString().padStart(2, '0')}</b><span>COMPÉTITIONS</span></div>
            <div><b>83%</b><span>RÉUSSITE ALGO</span></div>
          </div>

          {/* Live match badge */}
          {liveMatch && (
            <div className="live-banner" onClick={() => onNav('Programme')}>
              <i className="live-dot" />
              <span>EN DIRECT</span>
              <b>{formatTeamName(liveMatch.home)} {liveMatch.score} {formatTeamName(liveMatch.away)}</b>
              <span className="live-league">{liveMatch.league}</span>
              <ChevronRight size={14} />
            </div>
          )}
        </div>

        {/* ── JOUEUR 3D ──────────────────────────────────────── */}
        <div className="hero-right">
          <div className="visual-grid" />
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="player-stage-v2">
            <Canvas camera={{ position: [0, 0.8, 4.2], fov: 42 }} shadows dpr={[1, 1.8]}>
              <PlayerScene animMode={animMode} />
            </Canvas>
          </div>
          <div className="player-number-v2">10</div>
          <AnimControls current={animMode} onChange={setAnimMode} />
          <div className="hero-tag">
            <span className="tag-dot" /> THE GAME NEVER STOPS
          </div>
          <div className="float-card">
            <div className="float-card-icon"><Trophy size={17} /></div>
            <div>
              <small>ALGORITHME IA</small>
              <b>Analyse en temps réel</b>
              <span>83% de réussite ce mois</span>
            </div>
            <TrendingUp size={17} className="float-arrow" />
          </div>
        </div>
        <div className="hero-bottom-line" />
      </section>

      {/* ══ MÉTRIQUES ═══════════════════════════════════════════ */}
      <section className="metrics">
        <div className="metric">
          <div className="metric-icon orange"><CalendarDays size={18} /></div>
          <div>
            <small>MATCHS CETTE SEMAINE</small>
            <b>14 <span>à suivre</span></b>
          </div>
          <div className="metric-trend">+3 <ArrowDownRight size={13} /></div>
        </div>
        <div className="metric">
          <div className="metric-icon red"><Sparkles size={18} /></div>
          <div>
            <small>ANALYSES DISPONIBLES</small>
            <b>14 <span>pronostics</span></b>
          </div>
          <div className="metric-trend neutral">LIVE</div>
        </div>
        <div className="metric">
          <div className="metric-icon green"><Shield size={18} /></div>
          <div>
            <small>CONFIANCE MOYENNE</small>
            <b>76% <span>sur la sélection</span></b>
          </div>
          <div className="metric-trend">+2.4%</div>
        </div>
        <div className="metric">
          <div className="metric-icon blue"><Users size={18} /></div>
          <div>
            <small>COMPÉTITIONS</small>
            <b>05 <span>à l'affiche</span></b>
          </div>
          <div className="metric-trend neutral">UEFA + 4</div>
        </div>
      </section>

      {/* ══ MATCHS VEDETTES ════════════════════════════════════ */}
      <section className="section-head">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> SÉLECTION DU JOUR</div>
          <h2>MATCHS <span>VEDETTES</span></h2>
          <p>Les affiches les plus attendues de la semaine</p>
        </div>
        <button className="text-btn" onClick={() => onNav('Programme')}>
          Voir tout le programme <ArrowRight size={14} />
        </button>
      </section>

      <div className="featured-grid">
        {topMatches.map(m => (
          <article key={m.id} className="featured-card">
            <div className="fc-league">
              <span>{m.flag}</span>
              <span>{m.league}</span>
            </div>
            <div className="fc-teams">
              <div className="fc-team">
                <Crest name={m.h || m.home} size={32} />
                <b title={m.home}>{formatTeamName(m.home)}</b>
              </div>
              <div className="fc-vs">
                <small>VS</small>
                <span className="fc-time">{m.time}</span>
                <span className="fc-date">{m.date}</span>
              </div>
              <div className="fc-team">
                <Crest name={m.a || m.away} size={32} />
                <b title={m.away}>{formatTeamName(m.away)}</b>
              </div>
            </div>
            <div className="fc-pick">
              <div>
                <small>ANALYSE IA</small>
                <b>{m.pick}</b>
              </div>
              <div>
                <small>CONFIANCE</small>
                <div className="conf-bar">
                  <div style={{ width: `${m.confidence}%`, background: m.confidence > 80 ? '#4ade80' : m.confidence > 70 ? '#f59a23' : '#f06b7a' }} />
                </div>
                <span>{m.confidence}%</span>
              </div>
            </div>
            <div className="fc-odds">
              <span>1 · {m.odds.h}</span>
              <span>N · {m.odds.d}</span>
              <span>2 · {m.odds.a}</span>
            </div>
            <button className={`fc-select${selected.includes(m.id) ? ' chosen' : ''}`} onClick={() => onToggle(m.id)}>
              {selected.includes(m.id) ? '✓ Sélectionné' : '+ Ajouter'}
            </button>
          </article>
        ))}
      </div>

      {/* ══ BANNIÈRE INSIGHT ═══════════════════════════════════ */}
      <section className="insight-banner">
        <div className="insight-symbol"><Sparkles size={22} /></div>
        <div>
          <small>ARENA INTELLIGENCE</small>
          <h3>Les chiffres racontent une histoire. <span>À vous de la lire.</span></h3>
          <p>Explorez les facteurs statistiques derrière chaque rencontre.</p>
        </div>
        <button onClick={() => onNav('Pronostics')}>
          Explorer les analyses <ArrowRight size={15} />
        </button>
      </section>

      {/* ══ ACTUALITÉS FLASH ═══════════════════════════════════ */}
      <section className="section-head" style={{ marginTop: 32 }}>
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> FLASH INFO</div>
          <h2>ACTUALITÉS <span>DU JOUR</span></h2>
        </div>
        <button className="text-btn" onClick={() => onNav('Actualités')}>
          Toutes les actualités <ArrowRight size={14} />
        </button>
      </section>

      <div className="news-flash">
        {hotNews.map(n => (
          <div key={n.id} className="news-card">
            <div className="news-icon">{n.img}</div>
            <div>
              <div className="news-meta">
                <span className="news-tag">{n.tag}</span>
                <span className="news-league">{n.league}</span>
                {/* publishedAt pour les données API, time pour le fallback statique */}
                <span className="news-time">{formatRelativeTime(n.publishedAt)}</span>
              </div>
              <b>{n.title}</b>
              <p>{n.summary}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ══ PERFORMANCE ALGO ════════════════════════════════════ */}
      <section className="algo-section">
        <div className="algo-header">
          <div className="eyebrow"><span className="eyebrow-line" /> ARENA INTELLIGENCE</div>
          <h2>PERFORMANCE <span>DE L'ALGORITHME</span></h2>
        </div>
        <div className="algo-stats">
          <div className="algo-stat">
            <Activity size={22} />
            <b>83%</b>
            <span>Réussite globale</span>
          </div>
          <div className="algo-stat">
            <Star size={22} />
            <b>91%</b>
            <span>Favoris confirmés</span>
          </div>
          <div className="algo-stat">
            <Zap size={22} />
            <b>74%</b>
            <span>Over/Under</span>
          </div>
          <div className="algo-stat">
            <Trophy size={22} />
            <b>+18%</b>
            <span>ROI moyen</span>
          </div>
        </div>
        <button className="primary-btn" style={{ margin: '0 auto', display: 'flex' }} onClick={() => onNav('Performances')}>
          Voir les statistiques complètes <ArrowRight size={16} />
        </button>
      </section>

      <footer>
        <div className="brand">
          <div className="brand-mark"><span>A</span><i>10</i></div>
          <div><b>ARENA<span>10</span></b><small>FOOTBALL INTELLIGENCE</small></div>
        </div>
        <span>© 2026 ARENA 10. Tous droits réservés.</span>
        <div>
          <a>Confidentialité</a>
          <a>Jeu responsable</a>
          <a>Aide</a>
        </div>
      </footer>
    </div>
  )
}
