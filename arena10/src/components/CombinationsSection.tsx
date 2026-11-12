// ============================================================
// ARENA 10 — CombinationsSection
// Combinés du jour générés par l'IA + optimiseur de sélection
// ============================================================

import { useState } from 'react'
import {
  Sparkle as Sparkles,
  ArrowsClockwise as RefreshCw,
  CaretDown as ChevronDown,
  CaretUp as ChevronUp,
  Lightning as Zap,
  Target,
  TrendUp as TrendingUp,
  CircleNotch as Loader2
} from '@phosphor-icons/react'
import { useAiCombinations } from '../hooks/useAiCombinations'
import { fetchOptimizedSelection, type AiCombination, type CombinationLeg } from '../services/api'
import { Crest } from './Crest'
import { formatTeamName } from '../utils/formatters'

// ── Badge source ──────────────────────────────────────────────
function SourceBadge({ source }: { source: AiCombination['source'] | null }) {
  if (!source) return null
  const map = {
    gemini:      { label: '🤖 GEMINI IA',      cls: 'src-gemini' },
    groq:        { label: '🚀 GROQ LLAMA',      cls: 'src-groq'   },
    'arena-algo':{ label: '⚡ ALGORITHME LOCAL', cls: 'src-algo'   },
  }
  const { label, cls } = map[source]
  return <span className={`comb-source-badge ${cls}`}>{label}</span>
}

// ── Pied de combinaison ───────────────────────────────────────
function LegRow({ leg, expanded }: { leg: CombinationLeg; expanded: boolean }) {
  return (
    <div className="comb-leg">
      <div className="comb-leg-crests">
        <Crest name={leg.home} size={22} noCircle />
        <span className="comb-vs">vs</span>
        <Crest name={leg.away} size={22} noCircle />
      </div>
      <div className="comb-leg-info">
        <span className="comb-leg-teams">
          {formatTeamName(leg.home)} <span className="dim">vs</span> {formatTeamName(leg.away)}
        </span>
        <span className="comb-leg-meta">{leg.league} · {leg.date}</span>
        {expanded && leg.reasoning && (
          <span className="comb-leg-reasoning">{leg.reasoning}</span>
        )}
      </div>
      <div className="comb-leg-right">
        <span className="comb-leg-option">{leg.option}</span>
        <span className="comb-leg-odds">{leg.odds.toFixed(2)}</span>
        <span className="comb-leg-conf">{leg.confidence}%</span>
      </div>
    </div>
  )
}

// ── Carte de combinaison ──────────────────────────────────────
function CombCard({ combo, index }: { combo: AiCombination; index: number }) {
  const [open, setOpen] = useState(false)

  const ev = parseFloat(combo.expectedValue)
  const evPositive = ev >= 0

  return (
    <div className={`comb-card comb-card-${index}`}>
      {/* En-tête */}
      <div className="comb-card-header">
        <div className="comb-card-left">
          <span className="comb-badge">{combo.badge}</span>
          <span className="comb-title">{combo.title}</span>
        </div>
        <div className="comb-card-right">
          <span className="comb-odds-total">{combo.totalOdds.toFixed(2)}</span>
          <span className="comb-odds-label">cote totale</span>
        </div>
      </div>

      {/* Métriques */}
      <div className="comb-metrics">
        <div className="comb-metric" title="Probabilité conjointe estimée">
          <Target size={12} />
          <span>Confiance : {combo.totalConfidence}%</span>
        </div>
        <div className={`comb-metric ${evPositive ? 'ev-pos' : 'ev-neg'}`} title="Rentabilité théorique calculée par euro misé">
          <TrendingUp size={12} />
          <span>Rentabilité : {evPositive ? '+' : ''}{combo.expectedValue}€ / 1€ ({evPositive ? 'Avantageux' : 'Risqué'})</span>
        </div>
        <div className="comb-metric">
          <Zap size={12} />
          <span>{combo.legs.length} matchs combinés</span>
        </div>
      </div>

      {/* Legs */}
      <div className="comb-legs">
        {combo.legs.map(leg => (
          <LegRow key={leg.matchId} leg={leg} expanded={open} />
        ))}
      </div>

      {/* Toggle justification */}
      <button className="comb-toggle-btn" onClick={() => setOpen(o => !o)}>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {open ? 'Masquer l\'analyse' : 'Voir l\'analyse IA'}
      </button>

      {/* Justification dépliée */}
      {open && (
        <div className="comb-justification">
          <p>{combo.justification}</p>
        </div>
      )}
    </div>
  )
}

// ── Optimiseur de sélection utilisateur ──────────────────────
function UserOptimizer({ selected }: { selected: number[] }) {
  const [result, setResult]   = useState<AiCombination | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [open, setOpen]       = useState(false)

  async function handleOptimize() {
    if (selected.length === 0) return
    setLoading(true)
    setError(null)
    setResult(null)
    const resp = await fetchOptimizedSelection(selected, 3.0)
    setLoading(false)
    if (!resp || !resp.success) {
      setError('Impossible d\'optimiser — backend indisponible')
      return
    }
    setResult(resp.data)
  }

  return (
    <div className="user-optimizer">
      <div className="optimizer-header">
        <div>
          <span className="optimizer-title">🔮 Optimiser ma sélection</span>
          <span className="optimizer-count">({selected.length} match{selected.length > 1 ? 's' : ''} choisi{selected.length > 1 ? 's' : ''})</span>
        </div>
        <button
          className="optimizer-btn"
          onClick={handleOptimize}
          disabled={loading || selected.length === 0}
        >
          {loading ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
          {loading ? 'Analyse en cours…' : 'Lancer l\'analyse IA'}
        </button>
      </div>

      {error && <p className="optimizer-error">{error}</p>}

      {result && (
        <div className="optimizer-result">
          <div className="optimizer-result-header">
            <span className="comb-badge">{result.badge}</span>
            <span className="comb-odds-total">{result.totalOdds.toFixed(2)}</span>
          </div>
          <div className="comb-legs">
            {result.legs.map(leg => (
              <LegRow key={leg.matchId} leg={leg} expanded={false} />
            ))}
          </div>
          <button className="comb-toggle-btn" onClick={() => setOpen(o => !o)}>
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {open ? 'Masquer' : 'Voir la justification'}
          </button>
          {open && (
            <div className="comb-justification">
              <p>{result.justification}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Composant principal ───────────────────────────────────────
export function CombinationsSection({ selected }: { selected: number[] }) {
  const { combinations, loading, error, source, reload } = useAiCombinations()

  return (
    <section className="comb-section">
      {/* En-tête section */}
      <div className="comb-header">
        <div className="comb-header-left">
          <Sparkles size={18} className="accent" />
          <h2 className="comb-section-title">COMBINÉS DU JOUR</h2>
          <span className="comb-version-badge">IA ARENA v2.1</span>
          <SourceBadge source={source} />
        </div>
        <button className="comb-refresh-btn" onClick={reload} disabled={loading} title="Régénérer">
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* État chargement */}
      {loading && (
        <div className="comb-loading">
          <Loader2 size={28} className="spin accent" />
          <p>Génération des combinaisons en cours…</p>
        </div>
      )}

      {/* Erreur backend */}
      {!loading && error && (
        <div className="comb-error">
          <p>⚠️ {error}</p>
          <button className="comb-refresh-btn" onClick={reload}>Réessayer</button>
        </div>
      )}

      {/* Grille des combinaisons */}
      {!loading && !error && combinations.length > 0 && (
        <div className="comb-cards-grid">
          {combinations.map((combo, i) => (
            <CombCard key={combo.id} combo={combo} index={i} />
          ))}
        </div>
      )}

      {/* Optimiseur (si l'utilisateur a sélectionné des matchs) */}
      {selected.length > 0 && (
        <UserOptimizer selected={selected} />
      )}
    </section>
  )
}
