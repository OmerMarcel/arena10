// ============================================================
// ARENA 10 — Page Performances (statistiques de l'algorithme)
// ============================================================

import { TrendUp as TrendingUp, Shield, Lightning as Zap, Pulse as Activity, Star, Trophy } from '@phosphor-icons/react'

type MonthStat = { month: string; win: number; total: number; roi: number; profit: number }

const monthlyStats: MonthStat[] = [
  { month: 'JUN', win: 7, total: 10, roi: 12, profit: 48 },
  { month: 'JUL', win: 8, total: 11, roi: 18, profit: 72 },
  { month: 'AOU', win: 6, total: 10, roi: 8, profit: 32 },
  { month: 'SEP', win: 9, total: 11, roi: 24, profit: 96 },
  { month: 'OCT', win: 8, total: 10, roi: 20, profit: 80 },
  { month: 'NOV', win: 5, total: 6, roi: 22, profit: 44 },
]

const byLeague = [
  { league: 'Premier League', win: 12, total: 15, roi: 18 },
  { league: 'LaLiga', win: 14, total: 16, roi: 22 },
  { league: 'Bundesliga', win: 10, total: 13, roi: 15 },
  { league: 'Serie A', win: 9, total: 12, roi: 12 },
  { league: 'Ligue 1', win: 11, total: 13, roi: 20 },
  { league: 'Champions League', win: 8, total: 11, roi: 25 },
]

const byType = [
  { type: 'Résultat (1/N/2)', win: 42, total: 52, roi: 16 },
  { type: 'Over / Under', win: 18, total: 24, roi: 14 },
  { type: 'BTTS', win: 14, total: 20, roi: 11 },
  { type: 'Handicap', win: 6, total: 10, roi: 8 },
]

function MiniChart({ data }: { data: MonthStat[] }) {
  const max = Math.max(...data.map(d => d.profit))
  const w = 400, h = 100
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (w - 40) + 20
    const y = h - 15 - (d.profit / max) * (h - 30)
    return { x, y, d }
  })
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const fill = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') +
    ` L${pts[pts.length - 1].x},${h} L${pts[0].x},${h} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 100 }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#f59a23" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#f59a23" stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(t => (
        <line key={t} x1={20} y1={h - 15 - t * (h - 30)} x2={w - 20} y2={h - 15 - t * (h - 30)}
          stroke="#1d2e47" strokeWidth={1} />
      ))}
      <path d={fill} fill="url(#chartGrad)" />
      <path d={path} fill="none" stroke="#f59a23" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="#f59a23" />
          <text x={p.x} y={h - 2} textAnchor="middle" fill="#8fa0b8" fontSize={8} fontFamily="DM Sans">{p.d.month}</text>
        </g>
      ))}
    </svg>
  )
}

function WinBar({ win, total, label, color = '#f59a23' }: { win: number; total: number; label: string; color?: string }) {
  const pct = Math.round((win / total) * 100)
  return (
    <div className="perf-bar-row">
      <span className="perf-bar-label">{label}</span>
      <div className="perf-bar-track">
        <div className="perf-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="perf-bar-pct">{pct}%</span>
      <span className="perf-bar-fraction">{win}/{total}</span>
    </div>
  )
}

export function PerformancePage() {
  const totalBets = monthlyStats.reduce((a, b) => a + b.total, 0)
  const wonBets = monthlyStats.reduce((a, b) => a + b.win, 0)
  const totalProfit = monthlyStats.reduce((a, b) => a + b.profit, 0)
  const roi = (monthlyStats.reduce((a, b) => a + b.roi, 0) / monthlyStats.length).toFixed(1)
  const winRate = Math.round((wonBets / totalBets) * 100)

  return (
    <div className="performance-page">
      <div className="page-header">
        <div className="eyebrow"><span className="eyebrow-line" /> ANALYTICS</div>
        <h2>PERFORMANCES <span>DE L'ALGORITHME</span></h2>
        <p>Suivi des résultats et statistiques de notre modèle prédictif</p>
      </div>

      {/* ══ KPI ═════════════════════════════════════════════════ */}
      <div className="perf-kpis">
        <div className="perf-kpi ">
          <div className="perf-kpi-icon"><Activity size={22} /></div>
          <b>{winRate}%</b>
          <span>Taux de réussite</span>
          <small>Sur {totalBets} pronostics</small>
        </div>
        <div className="perf-kpi">
          <div className="perf-kpi-icon"><TrendingUp size={22} /></div>
          <b>+{roi}%</b>
          <span>ROI global</span>
          <small>Rentabilité investissement</small>
        </div>
        <div className="perf-kpi">
          <div className="perf-kpi-icon"><Star size={22} /></div>
          <b>{wonBets}/{totalBets}</b>
          <span>Pronostics gagnants</span>
          <small>Sur la période</small>
        </div>
        <div className="perf-kpi">
          <div className="perf-kpi-icon"><Trophy size={22} /></div>
          <b>+{totalProfit.toFixed(0)}€</b>
          <span>Profit simulé</span>
          <small>Mise de base 30€</small>
        </div>
        <div className="perf-kpi">
          <div className="perf-kpi-icon"><Zap size={22} /></div>
          <b>A+</b>
          <span>Score modèle</span>
          <small>Évaluation qualité</small>
        </div>
        <div className="perf-kpi">
          <div className="perf-kpi-icon"><Shield size={22} /></div>
          <b>83%</b>
          <span>Confiance moyenne</span>
          <small>Sur les sélections</small>
        </div>
      </div>

      {/* ══ GRAPHIQUE ÉVOLUTION ═════════════════════════════════ */}
      <div className="perf-chart-section">
        <div className="eyebrow"><span className="eyebrow-line" /> ÉVOLUTION MENSUELLE</div>
        <h3>PROFIT <span>PAR MOIS</span></h3>
        <MiniChart data={monthlyStats} />
        <div className="month-stats">
          {monthlyStats.map(m => (
            <div key={m.month} className="month-stat">
              <b>{m.month}</b>
              <span className="ms-win">{m.win}/{m.total}</span>
              <span className={`ms-roi ${m.roi > 0 ? 'pos' : 'neg'}`}>+{m.roi}%</span>
              <span className="ms-profit">+{m.profit}€</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══ PAR COMPÉTITION ══════════════════════════════════════ */}
      <div className="perf-section">
        <div className="eyebrow"><span className="eyebrow-line" /> PAR COMPÉTITION</div>
        <h3>RÉUSSITE <span>PAR CHAMPIONNAT</span></h3>
        <div className="perf-bars">
          {byLeague.map(({ league, win, total, roi }) => (
            <WinBar
              key={league}
              label={league}
              win={win}
              total={total}
              color={roi > 20 ? '#4ade80' : roi > 15 ? '#f59a23' : '#6bb8d8'}
            />
          ))}
        </div>
      </div>

      {/* ══ PAR TYPE DE PARI ════════════════════════════════════ */}
      <div className="perf-section">
        <div className="eyebrow"><span className="eyebrow-line" /> PAR TYPE</div>
        <h3>RÉUSSITE <span>PAR TYPE DE PARI</span></h3>
        <div className="perf-bars">
          {byType.map(({ type, win, total }) => (
            <WinBar key={type} label={type} win={win} total={total} color="#d9112b" />
          ))}
        </div>
      </div>

      {/* ══ RECOMMANDATIONS IA ══════════════════════════════════ */}
      <div className="perf-reco">
        <div className="eyebrow"><span className="eyebrow-line" /> RECOMMANDATIONS IA</div>
        <h3>STRATÉGIE <span>OPTIMALE</span></h3>
        <div className="reco-cards">
          <div className="reco-card">
            <TrendingUp size={20} style={{ color: '#4ade80' }} />
            <b>Favorisez LaLiga et Champions League</b>
            <p>ROI moyen de +22-25% sur ces compétitions, grâce à des données plus fiables.</p>
          </div>
          <div className="reco-card">
            <Star size={20} style={{ color: '#f59a23' }} />
            <b>Confiance &gt; 75% uniquement</b>
            <p>Filtrer sous ce seuil améliore le taux de réussite de 12 points statistiquement.</p>
          </div>
          <div className="reco-card">
            <Zap size={20} style={{ color: '#6bb8d8' }} />
            <b>Résultat direct plutôt que spécial</b>
            <p>Les paris 1/N/2 restent les plus fiables avec un ROI de +16%, contre +11% pour BTTS.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

