// ============================================================
// ARENA 10 — PredictionHistorySection
// Bilan de Transparence & Historique des Combinés sur 14 Jours
// ============================================================

import { useState } from 'react'
import {
  CheckCircle as CheckCircle2,
  XCircle,
  Clock,
  TrendUp as TrendingUp,
  Target,
  Medal as Award,
  CalendarBlank as Calendar,
  CaretDown as ChevronDown,
  CaretUp as ChevronUp,
  ArrowsClockwise as RefreshCw,
  CircleNotch as Loader2,
  Warning as AlertTriangle
} from '@phosphor-icons/react'
import { usePredictionHistory } from '../hooks/usePredictionHistory'
import { type AiCombination, type CombinationLeg, type BetStatus } from '../services/api'
import { Crest } from './Crest'
import { formatTeamName } from '../utils/formatters'

function StatusBadge({ status }: { status?: BetStatus }) {
  if (status === 'won') {
    return (
      <span className="hist-status-badge won">
        <CheckCircle2 size={13} />
        VALIDÉ
      </span>
    )
  }
  if (status === 'lost') {
    return (
      <span className="hist-status-badge lost">
        <XCircle size={13} />
        PERDU
      </span>
    )
  }
  return (
    <span className="hist-status-badge pending">
      <Clock size={13} />
      EN COURS / À VENIR
    </span>
  )
}

function LegResultBadge({ status }: { status?: BetStatus }) {
  if (status === 'won') {
    return <span className="hist-leg-badge won">✓ Validé</span>
  }
  if (status === 'lost') {
    return <span className="hist-leg-badge lost">✗ Manqué</span>
  }
  return <span className="hist-leg-badge pending">En attente</span>
}

function HistoryCombCard({ combo }: { combo: AiCombination }) {
  const [open, setOpen] = useState(false)

  const isWon = combo.status === 'won'
  const isLost = combo.status === 'lost'

  return (
    <div className={`hist-comb-card ${combo.status || 'pending'}`}>
      <div className="hist-card-top">
        <div className="hist-card-title-box">
          <span className="hist-badge">{combo.badge}</span>
          <h4 className="hist-title">{combo.title}</h4>
        </div>
        <div className="hist-card-status-box">
          <StatusBadge status={combo.status} />
          <div className="hist-card-odds-box">
            <span className="hist-odds-val">{combo.totalOdds.toFixed(2)}</span>
            <span className="hist-odds-lbl">cote totale</span>
          </div>
        </div>
      </div>

      <div className="hist-legs-list">
        {combo.legs.map((leg, idx) => (
          <div key={`${leg.matchId}-${idx}`} className={`hist-leg-row ${leg.status || 'pending'}`}>
            <div className="hist-leg-crests">
              <Crest name={leg.home} size={20} noCircle />
              <span className="hist-vs">vs</span>
              <Crest name={leg.away} size={20} noCircle />
            </div>

            <div className="hist-leg-match">
              <div className="hist-leg-teams">
                <b>{formatTeamName(leg.home, 14)}</b> vs <b>{formatTeamName(leg.away, 14)}</b>
              </div>
              <div className="hist-leg-sub">
                <span>{leg.league}</span>
                {leg.score && <span className="hist-leg-score">Score : <b>{leg.score}</b></span>}
              </div>
            </div>

            <div className="hist-leg-pick-box">
              <span className="hist-leg-option">{leg.option}</span>
              <span className="hist-leg-meta">Cote {leg.odds.toFixed(2)} · Conf. {leg.confidence}%</span>
            </div>

            <div className="hist-leg-result">
              <LegResultBadge status={leg.status} />
            </div>
          </div>
        ))}
      </div>

      {combo.justification && (
        <div className="hist-justif-section">
          <button
            className="hist-justif-toggle"
            onClick={() => setOpen(!open)}
          >
            {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {open ? "Masquer l'analyse IA d'origine" : "Voir l'analyse IA d'origine"}
          </button>
          {open && (
            <div className="hist-justif-content">
              <p>{combo.justification}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function PredictionHistorySection() {
  const { summary, days, loading, error, reload } = usePredictionHistory(14)
  const [selectedDate, setSelectedDate] = useState<string>('all')

  if (loading) {
    return (
      <div className="hist-loading-box">
        <Loader2 size={32} className="spin accent" />
        <p>Chargement du suivi de transparence et de l'historique sur 14 jours…</p>
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div className="hist-error-box">
        <AlertTriangle size={24} className="warn" />
        <p>{error || "Impossible d'accéder à l'historique."}</p>
        <button onClick={reload} className="comb-refresh-btn">Réessayer</button>
      </div>
    )
  }

  const displayedDays = selectedDate === 'all'
    ? days
    : days.filter(d => d.date === selectedDate)

  return (
    <section className="hist-section">
      {/* ── En-tête Bilan ────────────────────────────────────── */}
      <div className="hist-header">
        <div>
          <span className="hist-sub">BILAN DE TRANSPARENCE & RÉSULTATS CERTIFIÉS</span>
          <h2 className="hist-main-title">HISTORIQUE DES PRONOSTICS (14 DERNIERS JOURS)</h2>
          <p className="hist-desc">
            Chaque sélection est scellée avant le coup d'envoi et automatiquement clôturée (<b>Validé</b> ou <b>Perdu</b>) dès le coup de sifflet final.
          </p>
        </div>
        <button className="hist-refresh-action" onClick={reload} title="Actualiser le bilan">
          <RefreshCw size={14} />
          Actualiser
        </button>
      </div>

      {/* ── KPI Bilan Synthétique ─────────────────────────────── */}
      <div className="hist-kpi-grid">
        <div className="hist-kpi-card winrate">
          <div className="kpi-icon"><Target size={20} /></div>
          <div className="kpi-content">
            <span className="kpi-label">TAUX DE RÉUSSITE GLOBAL</span>
            <b className="kpi-value">{summary.winRate.toFixed(1)}%</b>
            <span className="kpi-sub">Sur l'ensemble des combinés clôturés</span>
          </div>
        </div>

        <div className="hist-kpi-card totals">
          <div className="kpi-icon"><Award size={20} /></div>
          <div className="kpi-content">
            <span className="kpi-label">COMBINÉS VALIDÉS</span>
            <b className="kpi-value">
              <span className="won-count">{summary.wonCombinations} Validés</span>
              <span className="sep">/</span>
              <span className="lost-count">{summary.lostCombinations} Perdus</span>
            </b>
            <span className="kpi-sub">{summary.pendingCombinations} combiné(s) en cours aujourd'hui</span>
          </div>
        </div>

        <div className="hist-kpi-card odds">
          <div className="kpi-icon"><TrendingUp size={20} /></div>
          <div className="kpi-content">
            <span className="kpi-label">BILAN BÉNÉFICE / UNITÉS</span>
            <b className={`kpi-value ${summary.unitsBalance >= 0 ? 'pos' : 'neg'}`}>
              {summary.unitsBalance >= 0 ? '+' : ''}{summary.unitsBalance.toFixed(2)} U
            </b>
            <span className="kpi-sub">ROI net estimé : +{summary.roiPercent.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* ── Filtre par date ──────────────────────────────────── */}
      <div className="hist-filter-tabs">
        <button
          className={`hist-date-pill ${selectedDate === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedDate('all')}
        >
          <Calendar size={13} />
          Tout voir ({summary.daysCount} jours)
        </button>

        {days.map(d => (
          <button
            key={d.date}
            className={`hist-date-pill ${selectedDate === d.date ? 'active' : ''}`}
            onClick={() => setSelectedDate(d.date)}
          >
            {d.dateLabel.split('—')[0].trim()}
            <span className="pill-stat">
              {d.stats.won}/{d.stats.total}
            </span>
          </button>
        ))}
      </div>

      {/* ── Liste des journées ─────────────────────────────────── */}
      <div className="hist-days-container">
        {displayedDays.map(day => (
          <div key={day.date} className="hist-day-block">
            <div className="hist-day-header">
              <div className="hist-day-left">
                <Calendar size={16} className="accent" />
                <h3 className="hist-day-title">{day.dateLabel}</h3>
              </div>
              <div className="hist-day-summary">
                <span className="day-stat-pill">
                  <b>{day.stats.won}</b> validé(s) sur <b>{day.stats.total}</b>
                </span>
                {day.stats.total > 0 && day.stats.won + day.stats.lost > 0 && (
                  <span className={`day-winrate ${day.stats.winRate >= 66 ? 'high' : 'med'}`}>
                    {day.stats.winRate}% réussite
                  </span>
                )}
              </div>
            </div>

            {day.combinations.length > 0 ? (
              <div className="hist-comb-grid">
                {day.combinations.map(combo => (
                  <HistoryCombCard key={combo.id} combo={combo} />
                ))}
              </div>
            ) : (
              <div className="hist-day-empty">
                <span>📅 Aucun match officiel disputé pour cette date.</span>
              </div>
            )}
          </div>
        ))}

        {displayedDays.length === 0 && (
          <div className="hist-empty-global">
            <Calendar size={32} className="accent" />
            <h3>Aucun historique pour le moment</h3>
            <p>Le bilan s'enregistre et se clôture automatiquement à partir des résultats réels de chaque rencontre.</p>
          </div>
        )}
      </div>
    </section>
  )
}

