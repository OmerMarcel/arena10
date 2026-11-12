// ============================================================
// ARENA 10 — Mon Carnet (paris & sélections)
// ============================================================

import { useState, useEffect } from 'react'
import { Bet } from '../data'
import { useMatches } from '../hooks/useMatches'
import { Crest } from './Crest'
import { formatTeamName } from '../utils/formatters'
import { ArrowRight, Shield, TrendUp as TrendingUp, Trash as Trash2, Plus, X, Check, Database, CircleNotch as Loader2 } from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import { fetchUserNotebook, addUserBetApi, deleteUserBetApi, UserBetDto } from '../services/api'

export function NotebookPage({ selected, onToggle, onNav }: {
  selected: number[]
  onToggle: (id: number) => void
  onNav: (p: string) => void
}) {
  const { matches } = useMatches()
  const { user, token, isAuthenticated, openModal } = useAuth()
  const [tab, setTab] = useState<'selection' | 'history' | 'simulator'>('selection')
  const [stake, setStake] = useState<Record<number, number>>({})
  const [simOdds, setSimOdds] = useState('')
  const [simStake, setSimStake] = useState('')
  const [simProb, setSimProb] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  // Historique des paris (connecté à PostgreSQL / Redis si connecté, sinon localStorage)
  const [bets, setBets] = useState<Bet[]>(() => {
    try {
      const saved = localStorage.getItem('arena10_bets_history')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Synchronisation avec PostgreSQL & Redis quand l'utilisateur est connecté
  useEffect(() => {
    if (token && isAuthenticated) {
      fetchUserNotebook(token).then(backendBets => {
        if (backendBets && backendBets.length > 0) {
          const formatted: Bet[] = backendBets.map(b => ({
            id: b.id || Date.now(),
            matchId: b.matchId || 0,
            match: b.matchName,
            league: b.league || 'Football',
            pick: b.pick,
            odds: b.odds,
            stake: b.stake,
            result: b.result || 'pending',
            profit: b.profit || 0,
            date: b.date
          }))
          setBets(formatted)
        }
      })
    }
  }, [token, isAuthenticated])

  // Validation et enregistrement dans PostgreSQL
  const handleValidateSelection = async () => {
    if (selectedMatches.length === 0) return
    setSaving(true)

    const newBetsToAdd: Bet[] = []

    for (const m of selectedMatches) {
      const odds = m.pick === '1' ? m.odds.h : m.pick === '2' ? m.odds.a : m.odds.d
      const s = stake[m.id] || 10
      const betDto: UserBetDto = {
        matchId: m.id,
        matchName: `${m.home} vs ${m.away}`,
        league: m.league,
        pick: m.pick,
        odds,
        stake: s,
        result: 'pending',
        profit: 0,
        date: m.date
      }

      if (token && isAuthenticated) {
        const saved = await addUserBetApi(token, betDto)
        if (saved) {
          newBetsToAdd.push({
            id: saved.id || Date.now() + Math.random(),
            matchId: m.id,
            match: saved.matchName,
            league: saved.league || m.league,
            pick: saved.pick,
            odds: saved.odds,
            stake: saved.stake,
            result: saved.result || 'pending',
            profit: saved.profit || 0,
            date: saved.date
          })
        }
      } else {
        newBetsToAdd.push({
          id: Date.now() + Math.random(),
          matchId: m.id,
          match: `${m.home} vs ${m.away}`,
          league: m.league,
          pick: m.pick,
          odds,
          stake: s,
          result: 'pending',
          profit: 0,
          date: m.date
        })
      }
    }

    setBets(prev => {
      const updated = [...newBetsToAdd, ...prev]
      try {
        localStorage.setItem('arena10_bets_history', JSON.stringify(updated))
      } catch {}
      return updated
    })

    setSaving(false)
    setSaveSuccess(`${newBetsToAdd.length} pari(s) enregistré(s) dans votre carnet permanent !`)
    setTimeout(() => {
      setSaveSuccess(null)
      setTab('history')
    }, 1500)
  }

  const handleDeleteBet = async (betId: number) => {
    if (token && isAuthenticated) {
      await deleteUserBetApi(token, betId)
    }
    setBets(prev => {
      const updated = prev.filter(b => b.id !== betId)
      try {
        localStorage.setItem('arena10_bets_history', JSON.stringify(updated))
      } catch {}
      return updated
    })
  }

  const selectedMatches = matches.filter(m => selected.includes(m.id))

  const totalStake = Object.values(stake).reduce((a, b) => a + b, 0)
  const totalReturn = selectedMatches.reduce((acc, m) => {
    const s = stake[m.id] || 0
    const odds = m.pick === '1' ? m.odds.h : m.pick === '2' ? m.odds.a : m.odds.d
    return acc + s * odds
  }, 0)

  // Historique
  const wonBets = bets.filter(b => b.result === 'win')
  const totalStakeHistory = bets.reduce((a, b) => a + b.stake, 0)
  const totalProfit = bets.reduce((a, b) => a + (b.profit || 0), 0)
  const roi = totalStakeHistory > 0 ? ((totalProfit / totalStakeHistory) * 100).toFixed(1) : '0.0'

  // Simulateur EV
  const simEV = simOdds && simStake && simProb
    ? ((parseFloat(simProb) / 100) * parseFloat(simOdds) * parseFloat(simStake) - parseFloat(simStake)).toFixed(2)
    : null

  return (
    <div className="notebook-page">
      <div className="page-header">
        <div className="eyebrow"><span className="eyebrow-line" /> VOTRE ESPACE</div>
        <h2>MON <span>CARNET</span></h2>
        <p>Gérez vos sélections, suivez votre historique et simulez vos paris</p>
      </div>

      {/* ══ ONGLETS ══════════════════════════════════════════════ */}
      <div className="notebook-tabs">
        <button className={`nb-tab${tab === 'selection' ? ' active' : ''}`} onClick={() => setTab('selection')}>
          Ma sélection ({selected.length})
        </button>
        <button className={`nb-tab${tab === 'history' ? ' active' : ''}`} onClick={() => setTab('history')}>
          Historique ({bets.length})
        </button>
        <button className={`nb-tab${tab === 'simulator' ? ' active' : ''}`} onClick={() => setTab('simulator')}>
          Simulateur EV
        </button>
      </div>

      {/* ══ MA SÉLECTION ═════════════════════════════════════════ */}
      {tab === 'selection' && (
        <div className="nb-selection">
          {selectedMatches.length === 0
            ? (
              <div className="nb-empty">
                <div className="nb-empty-icon">📋</div>
                <h3>Votre carnet est vide</h3>
                <p>Ajoutez des matchs depuis le programme pour les analyser et les suivre.</p>
                <button className="primary-btn" onClick={() => onNav('Programme')}>
                  Explorer les matchs <ArrowRight size={16} />
                </button>
              </div>
            )
            : (
              <>
                <div className="nb-summary">
                  <div>
                    <small>MATCHS SÉLECTIONNÉS</small>
                    <b>{selected.length.toString().padStart(2, '0')}</b>
                  </div>
                  <div>
                    <small>MISE TOTALE</small>
                    <b>{totalStake > 0 ? `${totalStake}€` : '—'}</b>
                  </div>
                  <div>
                    <small>RETOUR POTENTIEL</small>
                    <b style={{ color: '#4ade80' }}>{totalStake > 0 ? `${totalReturn.toFixed(2)}€` : '—'}</b>
                  </div>
                  <div>
                    <small>PROFIT POTENTIEL</small>
                    <b style={{ color: totalReturn - totalStake > 0 ? '#4ade80' : '#f06b7a' }}>
                      {totalStake > 0 ? `+${(totalReturn - totalStake).toFixed(2)}€` : '—'}
                    </b>
                  </div>
                </div>

                <div className="nb-match-list">
                  {selectedMatches.map(m => {
                    const odds = m.pick === '1' ? m.odds.h : m.pick === '2' ? m.odds.a : m.odds.d
                    const s = stake[m.id] || 0
                    const ret = s * odds
                    return (
                      <div key={m.id} className="nb-match-card">
                        <div className="nb-match-info">
                          <div className="nb-match-teams" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Crest name={m.h || m.home} size={24} />
                              <span style={{ fontSize: 9, opacity: 0.6 }}>vs</span>
                              <Crest name={m.a || m.away} size={24} />
                            </div>
                            <div>
                              <b title={`${m.home} vs ${m.away}`}>{formatTeamName(m.home)} <span>vs</span> {formatTeamName(m.away)}</b>
                              <small>{m.flag} {m.league} · {m.time} · {m.date}</small>
                            </div>
                          </div>
                          <div className="nb-match-pick">
                            <span className="pick-label">{m.pick}</span>
                            <span className="pick-odds">@ {odds}</span>
                            <span className="pick-conf" style={{ color: m.confidence > 80 ? '#4ade80' : '#f59a23' }}>
                              {m.confidence}% confiance
                            </span>
                          </div>
                        </div>
                        <div className="nb-match-stake">
                          <div className="stake-input-wrap">
                            <label>Mise (€)</label>
                            <input
                              type="number"
                              min={0}
                              value={stake[m.id] || ''}
                              placeholder="0"
                              onChange={e => setStake(prev => ({ ...prev, [m.id]: parseFloat(e.target.value) || 0 }))}
                            />
                          </div>
                          {s > 0 && (
                            <div className="stake-return">
                              Retour : <b style={{ color: '#4ade80' }}>{ret.toFixed(2)}€</b>
                            </div>
                          )}
                          <button className="remove-btn" onClick={() => onToggle(m.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {saveSuccess && (
                  <div className="auth-alert success" style={{ marginBottom: 12 }}>
                    <Check size={16} />
                    <span>{saveSuccess}</span>
                  </div>
                )}

                <div className="nb-actions">
                  <button className="text-btn" onClick={() => onNav('Programme')}>
                    <Plus size={15} /> Ajouter des matchs
                  </button>
                  <button
                    className="primary-btn"
                    onClick={handleValidateSelection}
                    disabled={saving || selectedMatches.length === 0}
                  >
                    {saving ? <Loader2 size={15} className="spin" /> : <Check size={15} />}
                    <span>{saving ? 'Enregistrement SQL...' : 'Valider et archiver ma sélection'}</span>
                  </button>
                </div>
                <div className="nb-disclaimer">
                  <Shield size={12} /> Ces simulations sont indicatives et ne constituent pas des conseils de pari.
                </div>
              </>
            )
          }
        </div>
      )}

      {/* ══ HISTORIQUE ══════════════════════════════════════════ */}
      {tab === 'history' && (
        <div className="nb-history">
          {bets.length === 0 ? (
            <div className="nb-empty">
              <div className="nb-empty-icon">📁</div>
              <h3>Aucun pari dans l'historique</h3>
              <p>Votre historique est vide. Enregistrez et validez des sélections pour les archiver ici.</p>
              <button className="primary-btn" onClick={() => setTab('selection')}>
                Voir ma sélection ({selected.length})
              </button>
            </div>
          ) : (
            <>
              <div className="history-summary">
                <div className={`hist-stat${totalProfit > 0 ? ' green' : ' red'}`}>
                  <TrendingUp size={18} />
                  <b>{totalProfit > 0 ? '+' : ''}{totalProfit.toFixed(2)}€</b>
                  <small>PROFIT TOTAL</small>
                </div>
                <div className="hist-stat">
                  <span className="hist-pct">{Math.round((wonBets.length / bets.length) * 100)}%</span>
                  <small>TAUX DE RÉUSSITE</small>
                </div>
                <div className="hist-stat green">
                  <b>+{roi}%</b>
                  <small>ROI</small>
                </div>
                <div className="hist-stat">
                  <b>{wonBets.length}/{bets.length}</b>
                  <small>PARIS GAGNÉS</small>
                </div>
              </div>

              <div className="history-list">
                {bets.map(b => (
                  <div key={b.id} className={`history-item ${b.result}`}>
                    <div className="hist-result-icon">
                      {b.result === 'win' ? <Check size={14} /> : <X size={14} />}
                    </div>
                    <div className="hist-info">
                      <b>{b.match}</b>
                      <small>{b.league} · {b.date}</small>
                    </div>
                    <div className="hist-pick">
                      <span className="pick-label">{b.pick}</span>
                      <span>@ {b.odds}</span>
                    </div>
                    <div className="hist-stake">
                      <small>MISE</small>
                      <b>{b.stake}€</b>
                    </div>
                    <div className={`hist-profit ${(b.profit || 0) > 0 ? 'pos' : 'neg'}`}>
                      <small>P&L</small>
                      <b>{(b.profit || 0) > 0 ? '+' : ''}{(b.profit || 0).toFixed(2)}€</b>
                    </div>
                    <button
                      className="hist-delete-btn"
                      onClick={() => handleDeleteBet(b.id)}
                      title="Supprimer ce pari de mon carnet"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ══ SIMULATEUR EV ═══════════════════════════════════════ */}
      {tab === 'simulator' && (
        <div className="nb-simulator">
          <div className="sim-card">
            <h3>Simulateur de Valeur Attendue (EV)</h3>
            <p>Calculez si un pari est rentable à long terme selon votre estimation de probabilité.</p>

            <div className="sim-formula">
              <b>EV = (Prob. × Cote × Mise) − Mise</b>
            </div>

            <div className="sim-inputs">
              <div className="sim-input-group">
                <label>Cote proposée</label>
                <input
                  type="number"
                  step={0.01}
                  min={1}
                  value={simOdds}
                  onChange={e => setSimOdds(e.target.value)}
                  placeholder="ex: 2.10"
                />
              </div>
              <div className="sim-input-group">
                <label>Mise (€)</label>
                <input
                  type="number"
                  min={0}
                  value={simStake}
                  onChange={e => setSimStake(e.target.value)}
                  placeholder="ex: 50"
                />
              </div>
              <div className="sim-input-group">
                <label>Votre probabilité estimée (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={simProb}
                  onChange={e => setSimProb(e.target.value)}
                  placeholder="ex: 65"
                />
              </div>
            </div>

            {simEV !== null && (
              <div className={`sim-result ${parseFloat(simEV) > 0 ? 'positive' : 'negative'}`}>
                <div>
                  <small>VALEUR ATTENDUE (EV)</small>
                  <b>{parseFloat(simEV) > 0 ? '+' : ''}{simEV}€</b>
                </div>
                <div>
                  {parseFloat(simEV) > 0
                    ? <><Check size={18} /> <span>Pari à valeur positive — rentable sur le long terme</span></>
                    : <><X size={18} /> <span>Pari à valeur négative — déconseillé statistiquement</span></>
                  }
                </div>
                {simOdds && simProb && (
                  <div className="sim-extra">
                    <div>
                      <small>COTE DE CASSURE</small>
                      <b>{(100 / parseFloat(simProb)).toFixed(2)}</b>
                    </div>
                    <div>
                      <small>RETOUR POTENTIEL</small>
                      <b style={{ color: '#4ade80' }}>
                        {simStake ? (parseFloat(simOdds) * parseFloat(simStake)).toFixed(2) + '€' : '—'}
                      </b>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="sim-disclaimer">
              <Shield size={14} />
              Outil éducatif uniquement. Les résultats passés ne présagent pas des résultats futurs.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

