// ============================================================
// ARENA 10 — Page Comparateur de clubs
// ============================================================

import { useState } from 'react'
import { clubs, Club } from '../data'
import { TrendUp as TrendingUp, Shield, Lightning as Zap } from '@phosphor-icons/react'
import { Crest } from './Crest'
import { formatTeamName } from '../utils/formatters'

function StatBar({ home, away, label }: { home: number; away: number; label: string }) {
  const total = home + away || 1
  const pct = Math.round((home / total) * 100)
  return (
    <div className="cmp-stat-row">
      <span className="cmp-val-left">{home}</span>
      <div className="cmp-bar-wrap">
        <div className="cmp-bar">
          <div className="cmp-bar-left" style={{ width: `${pct}%` }} />
          <div className="cmp-bar-right" style={{ width: `${100 - pct}%` }} />
        </div>
        <span className="cmp-label">{label}</span>
      </div>
      <span className="cmp-val-right">{away}</span>
    </div>
  )
}

function FormBadge({ f }: { f: string }) {
  return <i className={f === 'V' ? 'win' : f === 'N' ? 'draw' : 'loss'}>{f}</i>
}

function RadarChart({ club, size = 140 }: { club: Club; size?: number }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 20
  const stats = [
    club.stats.xG / 3.5,
    1 - club.stats.xGA / 3,
    club.stats.possession / 100,
    club.stats.shots / 25,
    club.stats.passAcc / 100,
    club.stats.cleanSheets / 10,
  ]
  const labels = ['xG', 'Défense', 'Poss.', 'Tirs', 'Passes', 'CS']
  const n = stats.length
  const pts = stats.map((v, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    return [cx + Math.cos(a) * r * Math.min(v, 1), cy + Math.sin(a) * r * Math.min(v, 1)]
  })
  const polyline = pts.map(p => p.join(',')).join(' ')
  // Grid
  const grid = [0.25, 0.5, 0.75, 1].map(scale => {
    const gpts = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2
      return [cx + Math.cos(a) * r * scale, cy + Math.sin(a) * r * scale]
    })
    return gpts.map(p => p.join(',')).join(' ')
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {grid.map((g, gi) => (
        <polygon key={gi} points={g} fill="none" stroke="#1d2e47" strokeWidth={1} />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2
        return (
          <line key={i}
            x1={cx} y1={cy}
            x2={cx + Math.cos(a) * r}
            y2={cy + Math.sin(a) * r}
            stroke="#1d2e47" strokeWidth={1}
          />
        )
      })}
      <polygon points={polyline} fill={`${club.color}40`} stroke={club.color} strokeWidth={2} />
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2
        const lx = cx + Math.cos(a) * (r + 13)
        const ly = cy + Math.sin(a) * (r + 13)
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
            fill="#8fa0b8" fontSize={8} fontFamily="DM Sans">
            {labels[i]}
          </text>
        )
      })}
    </svg>
  )
}

export function ComparatorPage() {
  const [clubA, setClubA] = useState<Club | null>(null)
  const [clubB, setClubB] = useState<Club | null>(null)

  function selectA(id: string) { setClubA(clubs.find(c => c.id === id) || null) }
  function selectB(id: string) { setClubB(clubs.find(c => c.id === id) || null) }

  const winner = (a: number, b: number, low = false) => {
    if (a === b) return 'tie'
    return (!low ? a > b : a < b) ? 'A' : 'B'
  }

  const overall = (c: Club) =>
    Math.round(
      c.stats.xG * 10 +
      (3.5 - c.stats.xGA) * 10 +
      c.stats.possession * 0.5 +
      c.stats.shots * 1.5 +
      c.stats.passAcc * 0.3 +
      c.stats.cleanSheets * 3 +
      c.stats.pts * 0.8
    )
  const scoreA = clubA ? overall(clubA) : 0
  const scoreB = clubB ? overall(clubB) : 0

  return (
    <div className="comparator-page">
      <div className="page-header">
        <div className="eyebrow"><span className="eyebrow-line" /> ANALYSE COMPARATIVE</div>
        <h2>COMPARATEUR <span>DE CLUBS</span></h2>
        <p>Analysez et comparez les statistiques de vos équipes favorites</p>
      </div>

      {/* ══ SÉLECTEURS ══════════════════════════════════════════ */}
      <div className="cmp-selectors">
        <div className="cmp-selector">
          <small>CLUB A</small>
          <select value={clubA?.id || ''} onChange={e => selectA(e.target.value)}>
            <option value="">-- Choisir le Club A --</option>
            {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="cmp-vs-badge">VS</div>
        <div className="cmp-selector right">
          <small>CLUB B</small>
          <select value={clubB?.id || ''} onChange={e => selectB(e.target.value)}>
            <option value="">-- Choisir le Club B --</option>
            {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Si les deux clubs ne sont pas encore sélectionnés */}
      {(!clubA || !clubB) && (
        <div style={{
          background: '#0d1b30', border: '1px solid #1d2e47', borderRadius: 'var(--radius)',
          padding: '48px 24px', textAlign: 'center', margin: '24px 0'
        }}>
          <h3 style={{ fontFamily: 'Barlow Condensed', fontSize: 22, color: 'var(--text1)', marginBottom: 8, letterSpacing: '.04em' }}>
            SÉLECTIONNEZ DEUX CLUBS À COMPARER
          </h3>
          <p style={{ color: 'var(--text3)', fontSize: 13, margin: 0 }}>
            Choisissez une équipe A et une équipe B ci-dessus pour lancer la confrontation statistique (xG, possession, tirs, radar et forme récente).
          </p>
        </div>
      )}

      {/* ══ CARTES CLUBS (si sélectionnés) ════════════════════ */}
      {clubA && clubB && (
        <>
          <div className="cmp-club-cards">
            {/* Club A */}
            <div className="cmp-club-card" style={{ '--club-color': clubA.color } as React.CSSProperties}>
              <div className="cmp-club-header">
                <Crest name={clubA.id || clubA.name} size={50} />
                <div>
                  <h3 title={clubA.name}>{formatTeamName(clubA.name, 16)}</h3>
                  <small>{clubA.league} · {clubA.country}</small>
                </div>
              </div>
              <div className="cmp-score-badge" style={{ color: clubA.color }}>
                <Zap size={14} /> Score : <b>{scoreA}</b>
              </div>
              <div className="cmp-form">
                {clubA.stats.form.map((f, i) => <FormBadge key={i} f={f} />)}
              </div>
              <RadarChart club={clubA} size={160} />
              <div className="cmp-quick-stats">
                <div><b>{clubA.stats.pts}</b><span>PTS</span></div>
                <div><b>{clubA.stats.won}</b><span>V</span></div>
                <div><b>{clubA.stats.drawn}</b><span>N</span></div>
                <div><b>{clubA.stats.lost}</b><span>D</span></div>
              </div>
            </div>

            {/* Centre résultat */}
            <div className="cmp-center">
              <div className="cmp-verdict">
                {scoreA > scoreB
                  ? <><TrendingUp size={22} style={{ color: '#4ade80' }} /><b style={{ color: '#4ade80' }}>{clubA.name} favori</b></>
                  : scoreB > scoreA
                  ? <><TrendingUp size={22} style={{ color: '#f59a23' }} /><b style={{ color: '#f59a23' }}>{clubB.name} favori</b></>
                  : <><Shield size={22} style={{ color: '#8fa0b8' }} /><b style={{ color: '#8fa0b8' }}>Équilibré</b></>
                }
              </div>
              <div className="cmp-score-compare">
                <span style={{ color: clubA.color }}>{scoreA}</span>
                <small>SCORE ARENA</small>
                <span style={{ color: clubB.color }}>{scoreB}</span>
              </div>
            </div>

            {/* Club B */}
            <div className="cmp-club-card right" style={{ '--club-color': clubB.color } as React.CSSProperties}>
              <div className="cmp-club-header right">
                <div>
                  <h3 title={clubB.name}>{formatTeamName(clubB.name, 16)}</h3>
                  <small>{clubB.league} · {clubB.country}</small>
                </div>
                <Crest name={clubB.id || clubB.name} size={50} />
              </div>
              <div className="cmp-score-badge right" style={{ color: clubB.color }}>
                <Zap size={14} /> Score : <b>{scoreB}</b>
              </div>
              <div className="cmp-form right">
                {clubB.stats.form.map((f, i) => <FormBadge key={i} f={f} />)}
              </div>
              <RadarChart club={clubB} size={160} />
              <div className="cmp-quick-stats right">
                <div><b>{clubB.stats.pts}</b><span>PTS</span></div>
                <div><b>{clubB.stats.won}</b><span>V</span></div>
                <div><b>{clubB.stats.drawn}</b><span>N</span></div>
                <div><b>{clubB.stats.lost}</b><span>D</span></div>
              </div>
            </div>
          </div>

          {/* ══ STAT BARS ════════════════════════════════════════ */}
          <div className="cmp-stats-section">
            <div className="cmp-stats-header">
              <div className="cmp-stats-club-label" style={{ color: clubA.color }}>{clubA.name}</div>
              <div className="cmp-stats-title">STATISTIQUES COMPARÉES</div>
              <div className="cmp-stats-club-label right" style={{ color: clubB.color }}>{clubB.name}</div>
            </div>
            <div className="cmp-stats-list">
              {[
                { label: 'Points', a: clubA.stats.pts, b: clubB.stats.pts },
                { label: 'Buts marqués', a: clubA.stats.goalsFor, b: clubB.stats.goalsFor },
                { label: 'Buts encaissés', a: clubA.stats.goalsAgainst, b: clubB.stats.goalsAgainst, low: true },
                { label: 'xG / match', a: clubA.stats.xG, b: clubB.stats.xG },
                { label: 'xGA / match', a: clubA.stats.xGA, b: clubB.stats.xGA, low: true },
                { label: 'Possession %', a: clubA.stats.possession, b: clubB.stats.possession },
                { label: 'Tirs / match', a: clubA.stats.shots, b: clubB.stats.shots },
                { label: 'Précision passe %', a: clubA.stats.passAcc, b: clubB.stats.passAcc },
                { label: 'Clean sheets', a: clubA.stats.cleanSheets, b: clubB.stats.cleanSheets },
                { label: 'BTTS', a: clubA.stats.btts, b: clubB.stats.btts },
              ].map(({ label, a, b, low }) => {
                const w = winner(a, b, low)
                return (
                  <div key={label} className="cmp-stat-item">
                    <StatBar home={a} away={b} label={label} />
                    {w !== 'tie' && (
                      <div className={`cmp-winner-dot ${w === 'A' ? 'left' : 'right'}`}
                        style={{ background: w === 'A' ? clubA.color : clubB.color }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ══ PALMARÈS & CLASSEMENT ═══════════════════════════ */}
          <div className="cmp-extra">
            <div className="cmp-extra-card">
              <h4>Classement actuel</h4>
              <div className="cmp-ranking">
                <div>
                  <small>{clubA.league}</small>
                  <b style={{ color: clubA.color }}>#{Math.round(Math.random() * 3 + 1)}</b>
                </div>
                <div className="cmp-rank-sep">|</div>
                <div>
                  <small>{clubB.league}</small>
                  <b style={{ color: clubB.color }}>#{Math.round(Math.random() * 3 + 1)}</b>
                </div>
              </div>
            </div>
            <div className="cmp-extra-card">
              <h4>Confrontations directes (5 dernières)</h4>
              <div className="cmp-h2h">
                <div>
                  <b style={{ color: clubA.color }}>2</b>
                  <small>Victoires {clubA.name}</small>
                </div>
                <div>
                  <b style={{ color: '#8fa0b8' }}>1</b>
                  <small>Nuls</small>
                </div>
                <div>
                  <b style={{ color: clubB.color }}>2</b>
                  <small>Victoires {clubB.name}</small>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

