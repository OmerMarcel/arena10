// ============================================================
// ARENA 10 — Page Programme (Calendrier dynamique, semaines réelles & scores)
// ============================================================

import { useState, useMemo } from 'react'
import {
  MagnifyingGlass as Search, SlidersHorizontal, CaretLeft as ChevronLeft, CaretRight as ChevronRight, ArrowRight,
  Check, Shield, X, CalendarDots as CalendarDays, ArrowsClockwise as RefreshCw, Broadcast as Radio, CheckCircle as CheckCircle2, Clock
} from '@phosphor-icons/react'
import { GoalIcon as Goal } from './icons/SportIcons'
import { Match } from '../data'
import { useMatches, FullMatch } from '../hooks/useMatches'
import { Crest } from './Crest'
import { formatTeamName } from '../utils/formatters'

const DAYS_NAMES = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM']
const MONTHS_NAMES = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOÛT', 'SEP', 'OCT', 'NOV', 'DÉC']

// Calcul dynamique du lundi de la semaine avec décalage
function getMondayOfWeek(offsetWeeks = 0): Date {
  const d = new Date()
  const day = d.getDay() // 0 = Dimanche, 1 = Lundi, ...
  const diffToMonday = (day === 0 ? -6 : 1) - day
  d.setDate(d.getDate() + diffToMonday + offsetWeeks * 7)
  d.setHours(0, 0, 0, 0)
  return d
}

// Extraction de la clé de date 'YYYY-MM-DD' d'un match
function getMatchDateKey(m: FullMatch | Match): string {
  if (m.dateIso) {
    return m.dateIso.split('T')[0]
  }
  const parts = (m.date || '').split(' ')
  if (parts.length >= 2) {
    const dayNum = parts[1].padStart(2, '0')
    const monthStr = parts[2] || ''
    const mIdx = MONTHS_NAMES.findIndex(mn => mn.toLowerCase() === monthStr.toLowerCase())
    if (mIdx !== -1) {
      const year = new Date().getFullYear()
      return `${year}-${String(mIdx + 1).padStart(2, '0')}-${dayNum}`
    }
  }
  return ''
}

function ConfBar({ val }: { val: number }) {
  const col = val > 80 ? '#4ade80' : val > 70 ? '#f59a23' : '#f06b7a'
  return (
    <div className="conf-bar-sm">
      <div style={{ width: `${val}%`, background: col, height: '100%', borderRadius: 2, transition: 'width .4s' }} />
    </div>
  )
}

type StatusFilter = 'all' | 'live' | 'finished' | 'upcoming'

export function SchedulePage({ selected, onToggle, onNav }: {
  selected: number[]
  onToggle: (id: number) => void
  onNav: (p: string) => void
}) {
  const { matches, source, reload } = useMatches()
  const [filter, setFilter] = useState('Toutes')
  const [search, setSearch] = useState('')
  const [week, setWeek] = useState(0)
  const [showDetail, setShowDetail] = useState<FullMatch | Match | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const todayIso = useMemo(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  }, [])

  // Par défaut, le jour sélectionné est le jour où on est aujourd'hui
  const [dayFilter, setDayFilter] = useState<string | null>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  })

  const leagues = useMemo(() => Array.from(new Set(matches.map(m => m.league))), [matches])

  // Bornes de la semaine sélectionnée
  const monday = useMemo(() => getMondayOfWeek(week), [week])
  const sunday = useMemo(() => {
    const s = new Date(monday)
    s.setDate(monday.getDate() + 6)
    s.setHours(23, 59, 59, 999)
    return s
  }, [monday])

  const handleWeekChange = (delta: number) => {
    const nextWeek = week + delta
    setWeek(nextWeek)
    if (nextWeek === 0) {
      setDayFilter(todayIso)
    } else {
      setDayFilter(null)
    }
  }

  // Tableau des 7 jours réels de la semaine courante
  const weekDays = useMemo(() => {
    return [0, 1, 2, 3, 4, 5, 6].map(i => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const dayCode = DAYS_NAMES[i]
      const dayNum = String(d.getDate()).padStart(2, '0')
      const monthStr = MONTHS_NAMES[d.getMonth()]
      const isoDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${dayNum}`
      const isToday = isoDate === todayIso
      return {
        dayCode,
        dayNum,
        monthStr,
        isoDate,
        dateFormatted: `${dayCode} ${dayNum} ${monthStr}`,
        isToday,
      }
    })
  }, [monday, todayIso])

  // Filtrage intelligent des matchs
  const visible = useMemo(() => {
    return matches.filter(m => {
      // 1. Compétition
      if (filter !== 'Toutes' && m.league !== filter) return false

      // 2. Statut (all / live / finished / upcoming)
      if (statusFilter !== 'all' && m.status !== statusFilter) return false

      // 3. Recherche
      if (search && !(`${m.home} ${m.away} ${m.league}`).toLowerCase().includes(search.toLowerCase())) {
        return false
      }

      const matchDateKey = getMatchDateKey(m)

      // 4. Jour spécifique cliqué dans les onglets
      if (dayFilter) {
        if (matchDateKey) {
          return matchDateKey === dayFilter
        }
        return m.day === dayFilter
      }

      // 5. Semaine sélectionnée (week = 0, -1, +1, etc.)
      if (matchDateKey) {
        const [y, mon, d] = matchDateKey.split('-').map(Number)
        const mDate = new Date(y, mon - 1, d, 12, 0, 0)
        return mDate >= monday && mDate <= sunday
      }

      // Par défaut pour les matchs sans date ISO, affichage en semaine en cours
      return week === 0
    })
  }, [matches, filter, statusFilter, search, dayFilter, week, monday, sunday])

  // Compteurs pour les badges de statut
  const counts = useMemo(() => {
    const inWeek = matches.filter(m => {
      const matchDateKey = getMatchDateKey(m)
      if (matchDateKey) {
        const [y, mon, d] = matchDateKey.split('-').map(Number)
        const mDate = new Date(y, mon - 1, d, 12, 0, 0)
        return mDate >= monday && mDate <= sunday
      }
      return week === 0
    })
    return {
      total: inWeek.length,
      live: inWeek.filter(m => m.status === 'live').length,
      finished: inWeek.filter(m => m.status === 'finished').length,
      upcoming: inWeek.filter(m => m.status === 'upcoming').length,
    }
  }, [matches, monday, sunday, week])

  const sourceLabels = {
    live:     { icon: '🟢', label: 'LIVE VRAIS MATCHS', color: '#4ade80' },
    cache:    { icon: '🟠', label: 'CACHE API',        color: '#f59a23' },
    fallback: { icon: '⚫', label: 'DÉMO DÉTAILLÉE',   color: '#94a3b8' },
  }
  const badge = (source && sourceLabels[source]) || { icon: '⚪', label: 'CHARGEMENT', color: '#94a3b8' }

  return (
    <div className="schedule-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="eyebrow-line" />
            <span>CENTRE DE MATCHS EN DIRECT</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 10, fontWeight: 700, color: badge.color,
              border: `1px solid ${badge.color}`, borderRadius: 5,
              padding: '1px 7px', letterSpacing: 0.8
            }}>
              {badge.icon} {badge.label}
            </span>
          </div>
          <h2>LE PROGRAMME <span>DE LA SEMAINE</span></h2>
          <p>Calendrier réel, résultats des matchs terminés, scores en direct et affiches à venir.</p>
        </div>
        <button
          className="icon-btn"
          onClick={reload}
          title="Actualiser les matchs en direct"
          style={{ marginTop: 8 }}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <section className="schedule-layout">
        {/* ── LISTE PRINCIPALE ─────────────────────────── */}
        <div className="schedule-main">
          <div className="schedule-toolbar">
            {/* Semaine nav */}
            <div className="week-nav">
              <button
                className="icon-btn"
                onClick={() => handleWeekChange(-1)}
                title="Semaine antérieure"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="week-label">
                <b>
                  {week === 0
                    ? 'SEMAINE EN COURS'
                    : week < 0
                    ? `SEMAINE ${week} (PASSÉE)`
                    : `SEMAINE +${week}`}
                </b>
                <small>
                  {weekDays[0].dayNum} {weekDays[0].monthStr} — {weekDays[6].dayNum} {weekDays[6].monthStr}
                </small>
              </div>
              <button
                className="icon-btn"
                onClick={() => handleWeekChange(1)}
                title="Semaine suivante"
              >
                <ChevronRight size={18} />
              </button>

              {/* Bouton retour direct à aujourd'hui si décalé ou si un autre jour est sélectionné */}
              {(week !== 0 || dayFilter !== todayIso) && (
                <button
                  className="today-shortcut-btn"
                  onClick={() => { setWeek(0); setDayFilter(todayIso); }}
                  title="Revenir aux matchs d'aujourd'hui"
                >
                  Matchs d'aujourd'hui
                </button>
              )}
            </div>

            {/* Jours de la semaine avec dates réelles */}
            <div className="day-tabs">
              <button
                className={`day${!dayFilter ? ' active' : ''}`}
                onClick={() => setDayFilter(null)}
              >
                <small>TOUS</small><b>✦</b>
              </button>
              {weekDays.map(wd => (
                <button
                  key={wd.isoDate}
                  className={`day${dayFilter === wd.isoDate ? ' active' : ''}${wd.isToday ? ' is-today' : ''}`}
                  onClick={() => setDayFilter(dayFilter === wd.isoDate ? null : wd.isoDate)}
                  title={`${wd.dayCode} ${wd.dayNum} ${wd.monthStr}`}
                >
                  <small>{wd.dayCode}</small>
                  <b>{wd.dayNum}</b>
                  {wd.isToday && <span className="today-dot" title="Aujourd'hui" />}
                </button>
              ))}
            </div>

            {/* Filtres par statut (Tous, En direct, Terminés, À venir) */}
            <div className="status-filters">
              <button
                className={`status-pill${statusFilter === 'all' ? ' active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                Tous les matchs <span className="count-pill">{counts.total}</span>
              </button>
              {counts.live > 0 && (
                <button
                  className={`status-pill live-pill${statusFilter === 'live' ? ' active' : ''}`}
                  onClick={() => setStatusFilter('live')}
                >
                  <Radio size={11} className="pulse-icon" /> En direct <span className="count-pill live-count">{counts.live}</span>
                </button>
              )}
              <button
                className={`status-pill${statusFilter === 'finished' ? ' active' : ''}`}
                onClick={() => setStatusFilter('finished')}
              >
                <CheckCircle2 size={11} /> Terminés <span className="count-pill">{counts.finished}</span>
              </button>
              <button
                className={`status-pill${statusFilter === 'upcoming' ? ' active' : ''}`}
                onClick={() => setStatusFilter('upcoming')}
              >
                <Clock size={11} /> À venir <span className="count-pill">{counts.upcoming}</span>
              </button>
            </div>

            {/* Filtres compétition et recherche */}
            <div className="filters">
              <div className="search-box">
                <Search size={15} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un club, une ligue..."
                />
              </div>
              <select value={filter} onChange={e => setFilter(e.target.value)}>
                <option>Toutes les compétitions</option>
                {leagues.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* ── LISTE DES MATCHS ─────────────────────────── */}
          <div className="match-list">
            {visible.map(m => {
              const isLive = m.status === 'live'
              const isFinished = m.status === 'finished'

              return (
                <article
                  className={`match-row${isLive ? ' live-row' : ''}${isFinished ? ' finished-row' : ''}`}
                  key={m.id}
                  onClick={() => setShowDetail(m)}
                >
                  {/* Badge statut absolu */}
                  {isLive && (
                    <div className="live-badge">
                      <i />EN DIRECT {m.score ? `· ${m.score}` : ''}
                    </div>
                  )}
                  {isFinished && (
                    <div className="finished-badge">
                      TERMINÉ {m.score ? `· ${m.score}` : ''}
                    </div>
                  )}

                  {/* Heure / Temps de jeu / Date */}
                  <div className="match-time">
                    {isLive ? (
                      <span className="live-clock"><span className="pulse-dot" />{m.detail || 'LIVE'}</span>
                    ) : isFinished ? (
                      <b className="finished-time">FIN</b>
                    ) : (
                      <b>{m.time}</b>
                    )}
                    <small>{m.day} · {m.date.split(' ').slice(-2).join(' ')}</small>
                  </div>

                  {/* Compétition */}
                  <div className="league-cell">
                    <span className="league-mark">{m.flag}</span>
                    <div>
                      <b>{m.league}</b>
                      <small>{m.country}</small>
                    </div>
                  </div>

                  {/* Équipes & Score réel central */}
                  <div className="teams">
                    <div className="team">
                      <Crest name={m.h || m.home} size={28} />
                      <b title={m.home}>{formatTeamName(m.home)}</b>
                    </div>

                    {/* Score central ou VS */}
                    {m.score ? (
                      <div
                        className={`match-score-badge ${isLive ? 'score-live' : 'score-finished'}`}
                        title={isLive ? 'Score en direct' : 'Score final officiel'}
                      >
                        <span className="score-num">{m.score.split('-')[0].trim()}</span>
                        <span className="score-sep">-</span>
                        <span className="score-num">{m.score.split('-')[1].trim()}</span>
                      </div>
                    ) : (
                      <span className="versus">VS</span>
                    )}

                    <div className="team">
                      <Crest name={m.a || m.away} size={28} />
                      <b title={m.away}>{formatTeamName(m.away)}</b>
                    </div>
                  </div>

                  {/* Forme */}
                  <div className="form-cell">
                    <small>FORME</small>
                    <div>
                      {m.form.split(' ').map((f, i) => (
                        <i key={i} className={f === 'V' ? 'win' : f === 'N' ? 'draw' : 'loss'}>{f}</i>
                      ))}
                    </div>
                  </div>

                  {/* Pronostic IA */}
                  <div className="pick-cell">
                    <small>ANALYSE</small>
                    <b>{m.pick}</b>
                    <ConfBar val={m.confidence} />
                    <span>{m.confidence}%</span>
                  </div>

                  {/* Cotes */}
                  <div className="odds-cell">
                    <small>COTES</small>
                    <div className="odds-row">
                      <span>1·{m.odds.h}</span>
                      <span>N·{m.odds.d}</span>
                      <span>2·{m.odds.a}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="row-actions" onClick={e => e.stopPropagation()}>
                    <button
                      className={`select-match${selected.includes(m.id) ? ' chosen' : ''}`}
                      onClick={() => onToggle(m.id)}
                      title={selected.includes(m.id) ? 'Retirer du carnet' : 'Ajouter au carnet'}
                    >
                      {selected.includes(m.id) ? <Check size={15} /> : <span>+</span>}
                    </button>
                    <button
                      className="more-btn"
                      onClick={() => setShowDetail(m)}
                      title="Voir la fiche complète"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </article>
              )
            })}

            {visible.length === 0 && (
              <div className="empty" style={{ padding: '40px 20px', textAlign: 'center' }}>
                <CalendarDays size={30} style={{ margin: '0 auto 12px', opacity: 0.5, display: 'block' }} />
                <b style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>Aucun match ne correspond à cette sélection</b>
                <p style={{ fontSize: 10, color: 'var(--text2)', maxWidth: 360, margin: '0 auto 14px' }}>
                  Aucune rencontre enregistrée pour ce jour précis ou cette compétition. Vous pouvez réinitialiser les filtres pour voir tout le programme.
                </p>
                <button
                  className="today-shortcut-btn"
                  onClick={() => { setDayFilter(null); setStatusFilter('all'); setFilter('Toutes'); setSearch(''); }}
                >
                  Afficher tous les matchs de la semaine
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── CARNET DE SÉLECTION ───────────────────────── */}
        <aside className="selection-card">
          <div className="selection-top">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> VOTRE ESPACE</div>
              <h3>MA SÉLECTION <span>({selected.length})</span></h3>
            </div>
            <div className="selection-icon"><Goal size={19} /></div>
          </div>
          {selected.length ? (
            <div className="selected-list">
              {matches.filter(m => selected.includes(m.id)).map(m => (
                <div className="selected-item" key={m.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Crest name={m.h || m.home} size={24} />
                    <div>
                      <b title={`${m.home} vs ${m.away}`}>
                        {formatTeamName(m.home, 11)} <span>vs</span> {formatTeamName(m.away, 11)}
                      </b>
                      <small>{m.league} · {m.time}</small>
                      <small>Analyse : <span style={{ color: '#f59a23' }}>{m.pick}</span></small>
                    </div>
                  </div>
                  <button onClick={() => onToggle(m.id)} title="Supprimer du carnet"><X size={14} /></button>
                </div>
              ))}
            </div>
          ) : (
            <div className="selection-empty">
              <CalendarDays size={25} />
              <p>Ajoutez des matchs à votre sélection pour les retrouver ici.</p>
            </div>
          )}
          <div className="selection-foot">
            <div>
              <span>Matchs sélectionnés</span>
              <b>{selected.length.toString().padStart(2, '0')}</b>
            </div>
            <button disabled={!selected.length} onClick={() => onNav('Pronostics')}>
              Analyser ma sélection <ArrowRight size={15} />
            </button>
            <small><Shield size={12} /> Analyses indicatives, sans garantie de résultat.</small>
          </div>
        </aside>
      </section>

      {/* ── MODAL DÉTAIL RENCONTRE ────────────────────────────── */}
      {showDetail && (
        <div className="modal-backdrop" onClick={() => setShowDetail(null)}>
          <div className="match-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDetail(null)}><X /></button>
            <div className="eyebrow"><span className="eyebrow-line" /> FICHE RENCONTRE</div>
            <h2>{showDetail.home} <span>VS</span> {showDetail.away}</h2>
            <p>{showDetail.league} · {showDetail.country} · {showDetail.time} · {showDetail.date}</p>

            <div className="modal-teams-visual">
              <div className="modal-team">
                <Crest name={showDetail.h || showDetail.home} size={52} />
                <b>{showDetail.home}</b>
              </div>
              <div className="modal-score-box">
                {showDetail.status === 'live' && (
                  <div className="modal-score-live">
                    <span className="live-tag"><i className="live-dot" />EN DIRECT {showDetail.detail ? `(${showDetail.detail})` : ''}</span>
                    <b className="modal-score-val">{showDetail.score || '0 - 0'}</b>
                  </div>
                )}
                {showDetail.status === 'finished' && (
                  <div className="modal-score-finished">
                    <span className="finished-tag">SCORE FINAL</span>
                    <b className="modal-score-val">{showDetail.score || '0 - 0'}</b>
                  </div>
                )}
                {showDetail.status === 'upcoming' && (
                  <div className="modal-score-upcoming">
                    <span className="modal-vs">VS</span>
                    <small className="modal-upcoming-time">{showDetail.time}</small>
                  </div>
                )}
              </div>
              <div className="modal-team">
                <Crest name={showDetail.a || showDetail.away} size={52} />
                <b>{showDetail.away}</b>
              </div>
            </div>

            {/* Stats */}
            <div className="modal-stats">
              <div className="stat-row">
                <span>{showDetail.stats.homePoss}%</span>
                <small>POSSESSION</small>
                <span>{showDetail.stats.awayPoss}%</span>
              </div>
              <div className="stat-row">
                <span>{showDetail.stats.homeGoals}</span>
                <small>BUTS/MATCH MOY.</small>
                <span>{showDetail.stats.awayGoals}</span>
              </div>
              <div className="stat-row">
                <span>{showDetail.stats.homeShots}</span>
                <small>TIRS/MATCH MOY.</small>
                <span>{showDetail.stats.awayShots}</span>
              </div>
            </div>

            <div className="modal-analysis">
              <small>ANALYSE ARENA 10</small>
              <p>{showDetail.analysis}</p>
            </div>

            <div className="modal-tags">
              {showDetail.tags.map(t => <span key={t} className="tag">{t}</span>)}
            </div>

            <div className="modal-prob">
              <div>
                <small>ANALYSE IA</small>
                <b>{showDetail.pick}</b>
              </div>
              <div>
                <small>CONFIANCE</small>
                <b style={{ color: showDetail.confidence > 80 ? '#4ade80' : showDetail.confidence > 70 ? '#f59a23' : '#f06b7a' }}>
                  {showDetail.confidence}%
                </b>
              </div>
              <div>
                <small>COTE CONSEILLÉE</small>
                <b>{showDetail.pick === '1' ? showDetail.odds.h : showDetail.pick === '2' ? showDetail.odds.a : showDetail.odds.d}</b>
              </div>
            </div>

            <div className="disclaimer">
              <Shield size={16} /> Données de démonstration. Ces estimations ne constituent pas des conseils de pari.
            </div>
            <button className="primary-btn" onClick={() => { onToggle(showDetail.id); setShowDetail(null) }}>
              {selected.includes(showDetail.id) ? 'Retirer de ma sélection' : 'Ajouter à ma sélection'} <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
