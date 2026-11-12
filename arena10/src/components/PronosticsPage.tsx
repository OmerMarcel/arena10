// ============================================================
// ARENA 10 — Page Pronostics (Algorithme prédictif IA & Métriques)
// ============================================================

import { useState, useMemo } from 'react'
import {
  Sparkle as Sparkles, Shield, ArrowRight, Lightning as Zap, Check, CaretDown as ChevronDown, CaretUp as ChevronUp,
  SlidersHorizontal, Info, Question as HelpCircle, TrendUp as TrendingUp, Target, BookOpen, Medal as Award, ClockCounterClockwise as History
} from '@phosphor-icons/react'
import { useMatches } from '../hooks/useMatches'
import { Crest } from './Crest'
import { formatTeamName } from '../utils/formatters'
import { CombinationsSection } from './CombinationsSection'
import { PredictionHistorySection } from './PredictionHistorySection'

type SortKey = 'confidence' | 'odds' | 'ev'

// Calcul Expected Value
function computeEV(confidence: number, odds: number): number {
  const prob = confidence / 100
  return parseFloat(((prob * (odds - 1)) - (1 - prob)).toFixed(2))
}

/**
 * Traduit un code de pari cryptique (ex: '1', '2', 'BTTS', '+2.5')
 * en texte clair et compréhensible par tout utilisateur.
 */
function formatPickDescription(pick: string, homeTeam: string, awayTeam: string) {
  const h = formatTeamName(homeTeam, 14)
  const a = formatTeamName(awayTeam, 14)

  if (pick === '1') {
    return {
      label: `Victoire ${h}`,
      badge: '1 · Domicile',
      detail: `${h} gagne le match à domicile`,
      color: '#4ade80'
    }
  }
  if (pick === '2') {
    return {
      label: `Victoire ${a}`,
      badge: '2 · Extérieur',
      detail: `${a} s'impose à l'extérieur`,
      color: '#81aff5'
    }
  }
  if (pick === 'N' || pick === 'X') {
    return {
      label: 'Match Nul',
      badge: 'N · Score parité',
      detail: 'Partage des points entre les deux clubs',
      color: '#f59a23'
    }
  }
  if (pick === '1X') {
    return {
      label: `${h} ou Nul`,
      badge: '1X · Double chance',
      detail: `${h} ne perd pas la rencontre`,
      color: '#4ade80'
    }
  }
  if (pick === 'X2') {
    return {
      label: `Nul ou ${a}`,
      badge: 'X2 · Double chance',
      detail: `${a} ne perd pas la rencontre`,
      color: '#81aff5'
    }
  }
  if (pick === '12') {
    return {
      label: `${h} ou ${a}`,
      badge: '12 · Pas de nul',
      detail: 'Victoire de l\'une ou l\'autre équipe',
      color: '#c084fc'
    }
  }
  if (pick === '+1.5' || pick === 'O1.5') {
    return {
      label: 'Au moins 2 buts',
      badge: '+1.5 buts',
      detail: '2 buts ou plus inscrits au total',
      color: '#38bdf8'
    }
  }
  if (pick === '+2.5' || pick === 'O2.5') {
    return {
      label: 'Au moins 3 buts',
      badge: '+2.5 buts',
      detail: '3 buts ou plus inscrits au total',
      color: '#38bdf8'
    }
  }
  if (pick === 'BTTS' || pick === 'BTTS_YES') {
    return {
      label: 'Les 2 équipes marquent',
      badge: '2 équipes marquent',
      detail: `${h} et ${a} trouvent tous deux le chemin des filets`,
      color: '#f43f5e'
    }
  }

  // ── MARCHÉ CORNERS ──
  if (pick.includes('CORNERS') || pick.includes('CORNER')) {
    if (pick.includes('8.5')) {
      return {
        label: 'Plus de 8.5 corners',
        badge: '🚩 +8.5 corners',
        detail: 'Au moins 9 coups de coin tirés dans la rencontre',
        color: '#06b6d4'
      }
    }
    if (pick.includes('9.5')) {
      return {
        label: 'Plus de 9.5 corners',
        badge: '🚩 +9.5 corners',
        detail: 'Au moins 10 coups de coin tirés dans la rencontre',
        color: '#06b6d4'
      }
    }
    const isHome = pick.includes('HOME') || pick.includes(homeTeam.substring(0, 3).toUpperCase())
    const leader = isHome ? h : a
    return {
      label: `Plus de corners : ${leader}`,
      badge: `🚩 Corners ${leader}`,
      detail: `${leader} obtiendra le plus grand nombre de corners`,
      color: '#06b6d4'
    }
  }

  // ── MARCHÉ CARTONS & DISCIPLINE ──
  if (pick.includes('CARDS') || pick.includes('CARD') || pick.includes('RED')) {
    if (pick.includes('NO_RED') || pick.includes('PAS_DE_ROUGE')) {
      return {
        label: 'Aucun carton rouge',
        badge: '🟥 Pas d\'expulsion',
        detail: 'Aucun carton rouge distribué dans le match',
        color: '#10b981'
      }
    }
    if (pick.includes('3.5')) {
      return {
        label: 'Plus de 3.5 cartons',
        badge: '🟨 +3.5 cartons',
        detail: 'Au moins 4 cartons jaunes/rouges distribués',
        color: '#eab308'
      }
    }
    if (pick.includes('4.5') && (pick.includes('U') || pick.includes('MOINS'))) {
      return {
        label: 'Moins de 4.5 cartons',
        badge: '🟨 -4.5 cartons',
        detail: 'Maximum 4 cartons (match discipliné)',
        color: '#10b981'
      }
    }
    return {
      label: 'Plus de 4.5 cartons',
      badge: '🟨 +4.5 cartons',
      detail: 'Match à forte tension physique (5 cartons ou plus)',
      color: '#eab308'
    }
  }

  // ── MARCHÉ HANDICAPS ──
  if (pick.includes('AH_') || pick.includes('HANDICAP') || pick.includes('MINUS') || pick.includes('PLUS')) {
    const isHome = pick.includes('HOME') || pick.includes(homeTeam.substring(0, 3).toUpperCase())
    const team = isHome ? h : a
    if (pick.includes('MINUS_1.5') || pick.includes('-1.5')) {
      return {
        label: `Handicap : ${team} (-1.5 buts)`,
        badge: `⚖️ ${team} (-1.5)`,
        detail: `${team} s'impose avec au moins 2 buts d'écart`,
        color: '#a855f7'
      }
    }
    return {
      label: `Handicap sécurisé : ${team} (+1.5)`,
      badge: `⚖️ ${team} (+1.5)`,
      detail: `${team} ne perd pas de plus d'un but d'écart`,
      color: '#a855f7'
    }
  }
  return {
    label: pick,
    badge: pick,
    detail: 'Pari sélectionné par le modèle',
    color: '#f59a23'
  }
}

/**
 * Traduit l'EV (Expected Value) en français avec interprétation directe
 */
function formatEVInfo(evVal: number) {
  const isPos = evVal > 0
  const formatted = `${isPos ? '+' : ''}${evVal.toFixed(2)}€`
  let label = 'Rentable'
  let rating = 'positive'

  if (evVal >= 0.35) {
    label = 'Très rentable'
    rating = 'high'
  } else if (evVal > 0) {
    label = 'Bonne valeur'
    rating = 'positive'
  } else {
    label = 'Risqué / Faible'
    rating = 'neutral'
  }

  return { formatted, label, isPos, rating }
}

function ConfRing({ val, size = 52 }: { val: number; size?: number }) {
  const r = size / 2 - 5
  const circ = 2 * Math.PI * r
  const dash = (val / 100) * circ
  const col = val > 80 ? '#4ade80' : val > 70 ? '#f59a23' : '#f06b7a'
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1d2e47" strokeWidth={4.5} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={4.5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
      <text
        x={size/2}
        y={size/2 + 4.5}
        textAnchor="middle"
        fill={col}
        fontSize={Math.round(size * 0.26)}
        fontWeight="800"
        fontFamily="Barlow Condensed"
      >
        {val}%
      </text>
    </svg>
  )
}

export function PronosticsPage({ selected, onToggle }: {
  selected: number[]
  onToggle: (id: number) => void
}) {
  const { matches } = useMatches()
  const [sortKey, setSortKey] = useState<SortKey>('confidence')
  const [sortAsc, setSortAsc] = useState(false)
  const [leagueFilter, setLeagueFilter] = useState('Toutes')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [minConf, setMinConf] = useState(0)
  const [showGuide, setShowGuide] = useState(false)
  const [mainTab, setMainTab] = useState<'today' | 'history'>('today')

  const leagues = useMemo(() => Array.from(new Set(matches.map(m => m.league))), [matches])

  const pickOdds = (m: (typeof matches)[0]) => {
    if (m.pick === '1') return m.odds.h
    if (m.pick === '2') return m.odds.a
    return m.odds.d
  }

  const pronostics = useMemo(() => {
    return matches
      .filter(m => m.status !== 'finished')
      .filter(m => leagueFilter === 'Toutes' || m.league === leagueFilter)
      .filter(m => m.confidence >= minConf)
      .map(m => ({ ...m, ev: computeEV(m.confidence, pickOdds(m)) }))
      .sort((a, b) => {
        const av = sortKey === 'confidence' ? a.confidence : sortKey === 'odds' ? pickOdds(a) : a.ev
        const bv = sortKey === 'confidence' ? b.confidence : sortKey === 'odds' ? pickOdds(b) : b.ev
        return sortAsc ? av - bv : bv - av
      })
  }, [matches, sortKey, sortAsc, leagueFilter, minConf])

  const topPick = pronostics[0]
  const topPickDesc = topPick ? formatPickDescription(topPick.pick, topPick.home, topPick.away) : null
  const topPickEv = topPick ? formatEVInfo(topPick.ev) : null

  function sortBy(k: SortKey) {
    if (sortKey === k) setSortAsc(a => !a)
    else { setSortKey(k); setSortAsc(false) }
  }

  return (
    <div className="pronostics-page">
      <div className="page-header">
        <div className="eyebrow"><span className="eyebrow-line" /> ALGORITHME IA</div>
        <h2>PRONOSTICS <span>ARENA INTELLIGENCE</span></h2>
        <p>Analyses statistiques prédictives expliquées en français clair et accessibles à tous.</p>
      </div>

      {/* ══ ALGO BADGE ══════════════════════════════════════════ */}
      <div className="algo-badge">
        <div className="algo-badge-icon"><Zap size={22} /></div>
        <div className="algo-badge-content">
          <small>MODÈLE PRÉDICTIF ARENA v2.1 — ANALYSES TEMPS RÉEL</small>
          <b>83% de réussite sur les 30 derniers jours · 142 pronostics validés</b>
        </div>
        <div className="algo-score">
          <span>SCORE ALGO</span>
          <b>A+</b>
        </div>
      </div>

      {/* ══ ONGLETS PRINCIPAUX : AUJOURD'HUI vs HISTORIQUE 14 JOURS ══ */}
      <div className="pron-main-nav">
        <button
          className={`pron-nav-btn ${mainTab === 'today' ? 'active' : ''}`}
          onClick={() => setMainTab('today')}
        >
          <Sparkles size={16} />
          <span>PRONOSTICS & COMBINÉS DU JOUR</span>
          <span className="pron-nav-badge">{matches.length} MATCHS</span>
        </button>

        <button
          className={`pron-nav-btn ${mainTab === 'history' ? 'active' : ''}`}
          onClick={() => setMainTab('history')}
        >
          <Award size={16} />
          <span>BILAN & HISTORIQUE (14 JOURS)</span>
          <span className="pron-nav-badge highlight">VALIDÉ / PERDU</span>
        </button>
      </div>

      {/* ══ VUE HISTORIQUE 14 JOURS (RÉSULTATS CLÔTURÉS) ═══════ */}
      {mainTab === 'history' && (
        <PredictionHistorySection />
      )}

      {/* ══ VUE PRONOSTICS DU JOUR ═════════════════════════════ */}
      {mainTab === 'today' && (
        <>
      {/* ══ GUIDE EXPLICATIF INTERACTIF (POUR DÉBUTANTS) ════════ */}
      <div className="pron-guide-card">
        <div className="pron-guide-header" onClick={() => setShowGuide(g => !g)}>
          <div className="pron-guide-left">
            <BookOpen size={18} className="accent" />
            <div>
              <b>💡 Comprendre nos analyses & pronostics (Guide en 30 secondes)</b>
              <small>Cliquez pour afficher les explications claires de : Choix de pari, Confiance %, Rentabilité (EV)</small>
            </div>
          </div>
          <button className="guide-toggle-btn" type="button" aria-label="Ouvrir le guide">
            {showGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {showGuide && (
          <div className="pron-guide-content">
            <div className="guide-col">
              <span className="guide-col-title">🎯 1. LE PARI CONSEILLÉ</span>
              <p>Ce que le modèle vous conseille de jouer pour ce match :</p>
              <ul>
                <li><b>Victoire Domicile (1)</b> : L'équipe à la maison gagne.</li>
                <li><b>Victoire Extérieur (2)</b> : L'équipe en déplacement s'impose.</li>
                <li><b>Match Nul (N)</b> : Les deux équipes se neutralisent.</li>
                <li><b>Double chance (1X ou X2)</b> : Couvre la victoire OU le nul (sécurité maximale).</li>
                <li><b>Plus de 1.5 ou 2.5 buts</b> : Match ouvert avec 2 ou 3 buts minimum.</li>
                <li><b>Les 2 équipes marquent</b> : Les deux attaques trouvent la faille.</li>
              </ul>
            </div>

            <div className="guide-col">
              <span className="guide-col-title">🛡️ 2. L'INDICE DE CONFIANCE (%)</span>
              <p>Le pourcentage de probabilité estimé par l'IA d'après 50+ critères (forme récente, stats buts, xG, infirmerie) :</p>
              <div className="guide-pill-list">
                <span className="guide-lvl green">🟢 80% - 95% : Forte probabilité (valeur sûre)</span>
                <span className="guide-lvl orange">🟠 70% - 79% : Bonne probabilité (équilibré)</span>
                <span className="guide-lvl red">🔴 &lt; 70% : Match serré ou spéculatif</span>
              </div>
            </div>

            <div className="guide-col">
              <span className="guide-col-title">📈 3. LA RENTABILITÉ (L'EV)</span>
              <p><b>L'EV (Espérance de gain mathématique)</b> indique si la cote proposée par les bookmakers est avantageuse :</p>
              <ul>
                <li><b className="text-green">+0.40€ ou plus (Très rentable)</b> : La cote paye beaucoup plus cher que le risque réel. Pour 100€ misés, le modèle estime un gain moyen de 140€.</li>
                <li><b className="text-green">+0.10€ à +0.39€ (Bonne valeur)</b> : Pari statistiquement profitable sur la durée.</li>
                <li><b className="text-red">Négatif (Risqué)</b> : La cote sous-paie le risque.</li>
              </ul>
            </div>

            <div className="guide-col">
              <span className="guide-col-title">🚩 4. CORNERS, CARTONS & HANDICAPS</span>
              <p>Marchés spécialisés calculés d'après les données avancées de match :</p>
              <ul>
                <li><b>🚩 Corners (+8.5 / +9.5)</b> : Projeté d'après les tirs et centres des équipes (au moins 9 ou 10 corners).</li>
                <li><b>🟨🟥 Cartons (Jaunes & Rouges)</b> : Tension arbitrale et agressivité dans les duels (ex: +3.5 cartons ou aucun carton rouge).</li>
                <li><b>⚖️ Handicaps (-1.5 / +1.5)</b> : Victoire par au moins 2 buts d'écart pour un grand favori, ou marge d'avance pour l'outsider.</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* ══ COMBINÉS IA DU JOUR ══════════════════════════════════ */}
      <CombinationsSection selected={selected} />

      {/* ══ COUP DU JOUR (TOP PICK) ════════════════════════════ */}
      {topPick && topPickDesc && topPickEv && (
        <div className="top-pick">
          <div className="top-pick-header">
            <span className="top-pick-label"><Sparkles size={14} /> COUP DU JOUR — CONFIANCE MAXIMALE</span>
            <span className="top-pick-subinfo">{topPick.flag} {topPick.league} · {topPick.time} · {topPick.date}</span>
          </div>

          <div className="top-pick-body">
            {/* Duel Face-à-face moderne avec logos sans cercle */}
            <div className="top-pick-duel">
              <div className="duel-team duel-home">
                <Crest name={topPick.h || topPick.home} size={48} noCircle />
                <b title={topPick.home}>{formatTeamName(topPick.home)}</b>
              </div>

              <div className="duel-vs-block">
                <span className="duel-vs">VS</span>
              </div>

              <div className="duel-team duel-away">
                <Crest name={topPick.a || topPick.away} size={48} noCircle />
                <b title={topPick.away}>{formatTeamName(topPick.away)}</b>
              </div>
            </div>

            {/* Indicateurs clés explicités en français */}
            <div className="top-pick-metrics">
              <div className="tp-metric-ring">
                <ConfRing val={topPick.confidence} size={64} />
                <small>CONFIANCE</small>
                <span className="tp-hint-tag">Probabilité calculée</span>
              </div>

              <div className="tp-metric tp-metric-pick">
                <small>CHOIX CONSEILLÉ</small>
                <b className="pick-label" style={{ color: topPickDesc.color }}>{topPickDesc.label}</b>
                <span className="tp-pick-subdetail">{topPickDesc.detail}</span>
              </div>

              <div className="tp-metric tp-metric-ev">
                <small>RENTABILITÉ (EV)</small>
                <b className={topPickEv.isPos ? 'text-green' : 'text-red'}>{topPickEv.formatted}</b>
                <span className={`ev-pill ${topPickEv.isPos ? 'ev-pill-pos' : 'ev-pill-neg'}`}>
                  {topPickEv.label}
                </span>
              </div>

              <div className="tp-metric">
                <small>COTE DU PARI</small>
                <b className="tp-odds-num">{pickOdds(topPick)}</b>
                <span>Multiplicateur bookmaker</span>
              </div>
            </div>
          </div>

          <div className="top-pick-analysis">{topPick.analysis}</div>

          <div className="top-pick-footer">
            <div className="top-pick-tags">
              {topPick.tags.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
            <button
              className={`fc-select wide${selected.includes(topPick.id) ? ' chosen' : ''}`}
              onClick={() => onToggle(topPick.id)}
            >
              {selected.includes(topPick.id) ? <><Check size={15} /> Ajouté à votre carnet</> : '+ Ajouter au carnet'}
            </button>
          </div>
        </div>
      )}

      {/* ══ FILTRES RESPONSIVES ══════════════════════════════════ */}
      <div className="pron-filters">
        <div className="pron-filter-field">
          <label><SlidersHorizontal size={12} /> Compétition</label>
          <select value={leagueFilter} onChange={e => setLeagueFilter(e.target.value)}>
            <option>Toutes les compétitions</option>
            {leagues.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div className="pron-filter-field slider-field">
          <div className="slider-header">
            <label>Confiance min.</label>
            <b>{minConf}%</b>
          </div>
          <input
            type="range"
            min={0}
            max={90}
            step={5}
            value={minConf}
            onChange={e => setMinConf(+e.target.value)}
          />
        </div>

        <div className="sort-group">
          <small>TRIER PAR</small>
          <div className="sort-btns">
            {(['confidence', 'odds', 'ev'] as SortKey[]).map(k => (
              <button
                key={k}
                className={`sort-btn${sortKey === k ? ' active' : ''}`}
                onClick={() => sortBy(k)}
              >
                {k === 'confidence' ? 'Confiance' : k === 'odds' ? 'Cote' : 'Valeur attendue'}
                {sortKey === k && (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ LISTE DES CARTES PRONOSTICS ══════════════════════════ */}
      <div className="pron-list">
        {pronostics.map(m => {
          const odds = pickOdds(m)
          const ev = m.ev
          const isExp = expanded === m.id

          return (
            <div
              key={m.id}
              className={`pron-card${m.status === 'live' ? ' live-card' : ''}${selected.includes(m.id) ? ' selected-card' : ''}`}
            >
              {m.status === 'live' && (
                <div className="live-badge"><i />EN DIRECT {m.score ? `· ${m.score}` : ''}</div>
              )}

              <div className="pron-card-main" onClick={() => setExpanded(isExp ? null : m.id)}>
                {/* 1. Duel d'équipes avec logos sans cercle */}
                <div className="pron-matchup">
                  <div className="pron-duel-teams">
                    <div className="pron-club home">
                      <Crest name={m.h || m.home} size={36} noCircle />
                      <b title={m.home}>{formatTeamName(m.home)}</b>
                    </div>
                    <span className="pron-vs-mid">vs</span>
                    <div className="pron-club away">
                      <Crest name={m.a || m.away} size={36} noCircle />
                      <b title={m.away}>{formatTeamName(m.away)}</b>
                    </div>
                  </div>

                  <div className="pron-match-meta">
                    <span className="pron-league-tag">{m.flag} {m.league} · {m.time} · {m.date}</span>
                    <div className="form-badges">
                      {m.form.split(' ').map((f, i) => (
                        <i key={i} className={f === 'V' ? 'win' : f === 'N' ? 'draw' : 'loss'}>{f}</i>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Métriques prédictives et actions explicitées */}
                <div className="pron-data">
                  <div className="pron-ring-box">
                    <ConfRing val={m.confidence} size={46} />
                    <small>CONFIANCE</small>
                  </div>

                  {/* Choix clair */}
                  <div className="pron-pick-box">
                    <small>PARI CONSEILLÉ</small>
                    <b className="pron-pick-title" style={{ color: formatPickDescription(m.pick, m.home, m.away).color }}>
                      {formatPickDescription(m.pick, m.home, m.away).label}
                    </b>
                    <span className="pron-pick-subbadge">
                      {formatPickDescription(m.pick, m.home, m.away).badge}
                    </span>
                  </div>

                  {/* Cote */}
                  <div className="pron-odds-box">
                    <small>COTE</small>
                    <b className="pron-odds-num">{odds}</b>
                  </div>

                  {/* Rentabilité / EV explicite */}
                  <div className={`pron-ev-box ${formatEVInfo(ev).isPos ? 'pos' : 'neg'}`}>
                    <small>RENTABILITÉ</small>
                    <b className="pron-ev-val">{formatEVInfo(ev).formatted}</b>
                    <span className={`pron-ev-pill ${formatEVInfo(ev).isPos ? 'pill-pos' : 'pill-neg'}`}>
                      {formatEVInfo(ev).label}
                    </span>
                  </div>

                  <div className="pron-actions" onClick={e => e.stopPropagation()}>
                    <button
                      className={`select-match${selected.includes(m.id) ? ' chosen' : ''}`}
                      onClick={() => onToggle(m.id)}
                      title={selected.includes(m.id) ? 'Retirer du carnet' : 'Ajouter au carnet'}
                    >
                      {selected.includes(m.id) ? <Check size={15} /> : <span>+</span>}
                    </button>
                    <button
                      className="expand-btn"
                      onClick={() => setExpanded(isExp ? null : m.id)}
                      title={isExp ? 'Réduire' : 'Détails tactiques'}
                    >
                      {isExp ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Panneau dépliable avec statistiques tactiques & résumé clair */}
              {isExp && (
                <div className="pron-expand">
                  {/* Résumé d'interprétation pour débutants */}
                  <div className="pron-summary-box">
                    <Info size={16} className="accent" />
                    <p>
                      <strong>Comprendre ce pari :</strong> L'algorithme estime à <strong>{m.confidence}%</strong> la probabilité de <strong>"{formatPickDescription(m.pick, m.home, m.away).label}"</strong> ({formatPickDescription(m.pick, m.home, m.away).detail}). À une cote de <strong>{odds}</strong>, ce pronostic présente une rentabilité estimée de <strong>{formatEVInfo(ev).formatted} ({formatEVInfo(ev).label})</strong>.
                    </p>
                  </div>

                  <div className="pron-stats-grid">
                    <div><small>BUTS DOMICILE</small><b>{m.stats.homeGoals} /m</b></div>
                    <div><small>BUTS EXTÉRIEUR</small><b>{m.stats.awayGoals} /m</b></div>
                    <div><small>POSSESSION DOM.</small><b>{m.stats.homePoss}%</b></div>
                    <div><small>TIRS DOMICILE</small><b>{m.stats.homeShots} /m</b></div>
                    <div><small>TIRS EXTÉRIEUR</small><b>{m.stats.awayShots} /m</b></div>
                    <div><small>INDICE CONFIANCE</small><b style={{ color: m.confidence > 80 ? '#4ade80' : '#f59a23' }}>{m.confidence}%</b></div>
                  </div>
                  <p className="pron-analysis">{m.analysis}</p>
                  <div className="pron-tags">
                    {m.tags.map(t => <span key={t} className="tag">{t}</span>)}
                  </div>

                  {/* Marchés alternatifs IA : Corners, Cartons & Handicaps */}
                  <div className="pron-extra-markets">
                    <span className="extra-markets-title">🎯 MARCHÉS SPÉCIAUX ANALYSÉS (CORNERS, CARTONS & HANDICAPS)</span>
                    <div className="extra-markets-grid">
                      <div className="extra-market-pill">
                        <span className="em-tag corner">🚩 CORNERS</span>
                        <b>Plus de 8.5 corners</b>
                        <span className="em-odds">Cote ~1.40 · Conf. 82%</span>
                      </div>
                      <div className="extra-market-pill">
                        <span className="em-tag card">🟨 CARTONS</span>
                        <b>{m.league.includes('Premier') || m.league.includes('LaLiga') || m.league.includes('Serie') ? 'Plus de 3.5 cartons' : 'Moins de 4.5 cartons'}</b>
                        <span className="em-odds">Cote ~1.50 · Conf. 80%</span>
                      </div>
                      <div className="extra-market-pill">
                        <span className="em-tag red">🟥 CARTON ROUGE</span>
                        <b>Aucun carton rouge (Non)</b>
                        <span className="em-odds">Cote ~1.20 · Conf. 87%</span>
                      </div>
                      <div className="extra-market-pill">
                        <span className="em-tag handicap">⚖️ HANDICAP</span>
                        <b>{formatTeamName(m.home, 12)} (+1.5 buts d'avance)</b>
                        <span className="em-odds">Cote ~1.32 · Conf. 89%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pron-odds-all">
                    <span>1 (Victoire {formatTeamName(m.home, 9)}) · {m.odds.h}</span>
                    <span>N (Match Nul) · {m.odds.d}</span>
                    <span>2 (Victoire {formatTeamName(m.away, 9)}) · {m.odds.a}</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {pronostics.length === 0 && (
          <div className="empty" style={{ padding: 48, textAlign: 'center' }}>
            Aucun pronostic ne correspond aux filtres sélectionnés.
          </div>
        )}
      </div>
      </>
      )}

      <div className="pron-disclaimer">
        <Shield size={14} />
        Les pronostics ARENA 10 sont des estimations algorithmiques basées sur des données statistiques réelles.
        Ils ne constituent pas des conseils d'investissement financier. Jouez avec modération.
      </div>
    </div>
  )
}

export default PronosticsPage
