// ============================================================
// ARENA 10 — Page Mes Favoris (Personnalisation)
// ============================================================

import { useState, useEffect } from 'react'
import {
  Star, Heart, Bell, Plus, Trash as Trash2, ArrowRight,
  Shield, Check, Fire as Flame, Trophy, ArrowSquareOut as ExternalLink
} from '@phosphor-icons/react'
import { clubs, Match, Club } from '../data'
import { useMatches } from '../hooks/useMatches'
import { Crest } from './Crest'
import { formatTeamName } from '../utils/formatters'

export function FavoritesPage({
  onNav,
  selected,
  onToggle
}: {
  onNav: (p: string) => void
  selected: number[]
  onToggle: (id: number) => void
}) {
  const { matches } = useMatches()
  // Clubs favoris stockés en localStorage (vide par défaut)
  const [favoriteClubs, setFavoriteClubs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('arena10_fav_clubs')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Compétitions favorites (vide par défaut)
  const [favoriteLeagues, setFavoriteLeagues] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('arena10_fav_leagues')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [activeTab, setActiveTab] = useState<'clubs' | 'matches' | 'leagues'>('clubs')
  const [searchClub, setSearchClub] = useState('')

  // Sauvegarde dans localStorage
  useEffect(() => {
    try {
      localStorage.setItem('arena10_fav_clubs', JSON.stringify(favoriteClubs))
    } catch {}
  }, [favoriteClubs])

  useEffect(() => {
    try {
      localStorage.setItem('arena10_fav_leagues', JSON.stringify(favoriteLeagues))
    } catch {}
  }, [favoriteLeagues])

  const toggleFavClub = (id: string) => {
    setFavoriteClubs(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const toggleFavLeague = (league: string) => {
    setFavoriteLeagues(prev =>
      prev.includes(league) ? prev.filter(l => l !== league) : [...prev, league]
    )
  }

  const favClubObjects = clubs.filter(c => favoriteClubs.includes(c.id))
  const otherClubs = clubs.filter(
    c => !favoriteClubs.includes(c.id) &&
    c.name.toLowerCase().includes(searchClub.toLowerCase())
  )

  // Matchs impliquant un club favori ou une ligue favorite
  const favMatches = matches.filter(m =>
    favoriteClubs.includes(m.h) ||
    favoriteClubs.includes(m.a) ||
    favoriteLeagues.includes(m.league)
  )

  const allLeagues = Array.from(new Set(matches.map(m => m.league)))

  return (
    <div className="favorites-page">
      <div className="page-header">
        <div className="eyebrow">
          <span className="eyebrow-line" /> PERSONNALISATION
        </div>
        <h2>MES <span>FAVORIS</span></h2>
        <p>Suivez vos clubs fétiches, vos compétitions prioritaires et leurs prochains rendez-vous.</p>
      </div>

      {/* ══ ONGLETS FAVORIS ════════════════════════════════════ */}
      <div className="favorites-tabs">
        <button
          className={`fav-tab ${activeTab === 'clubs' ? 'active' : ''}`}
          onClick={() => setActiveTab('clubs')}
        >
          <Star size={14} />
          <span>Clubs favoris ({favoriteClubs.length})</span>
        </button>
        <button
          className={`fav-tab ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          <Bell size={14} />
          <span>Matchs à suivre ({favMatches.length})</span>
        </button>
        <button
          className={`fav-tab ${activeTab === 'leagues' ? 'active' : ''}`}
          onClick={() => setActiveTab('leagues')}
        >
          <Trophy size={14} />
          <span>Compétitions ({favoriteLeagues.length})</span>
        </button>
      </div>

      {/* ══ 1. CLUBS FAVORIS ═══════════════════════════════════ */}
      {activeTab === 'clubs' && (
        <div className="fav-clubs-section">
          <div className="fav-section-title">
            <div>
              <h3>ÉQUIPES ÉPINGLÉES</h3>
              <p>Recevez les alertes prédictives en priorité pour ces équipes.</p>
            </div>
            <div className="fav-counter">{favoriteClubs.length} sélectionné(s)</div>
          </div>

          <div className="fav-club-grid">
            {favClubObjects.map(club => (
              <div
                key={club.id}
                className="fav-club-card"
                style={{ '--fav-color': club.color } as React.CSSProperties}
              >
                <div className="fav-card-header">
                  <div className="fav-card-crest">
                    <Crest name={club.id || club.name} size={42} />
                  </div>
                  <div>
                    <h4 title={club.name}>{formatTeamName(club.name, 16)}</h4>
                    <small>{club.league} · {club.country}</small>
                  </div>
                  <button
                    className="fav-star-btn active"
                    onClick={() => toggleFavClub(club.id)}
                    title="Retirer des favoris"
                  >
                    <Star size={16} fill="#f59a23" />
                  </button>
                </div>

                <div className="fav-stats-mini">
                  <div>
                    <span>Points</span>
                    <b>{club.stats.pts}</b>
                  </div>
                  <div>
                    <span>xG / m</span>
                    <b>{club.stats.xG}</b>
                  </div>
                  <div>
                    <span>Possession</span>
                    <b>{club.stats.possession}%</b>
                  </div>
                </div>

                <div className="fav-form-row">
                  <small>Forme récente :</small>
                  <div className="form-badges">
                    {club.stats.form.map((f, i) => (
                      <i key={i} className={f === 'V' ? 'win' : f === 'N' ? 'draw' : 'loss'}>{f}</i>
                    ))}
                  </div>
                </div>

                <button
                  className="fav-quick-nav"
                  onClick={() => onNav('Comparateur')}
                >
                  <span>Comparer avec un rival</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>

          {favClubObjects.length === 0 && (
            <div className="fav-empty-block" style={{ marginBottom: 24 }}>
              <Star size={32} />
              <b>Aucun club favori sélectionné</b>
              <p>Recherchez et ajoutez vos équipes ci-dessous pour suivre leurs statistiques et alertes.</p>
            </div>
          )}

          {/* Ajouter d'autres clubs */}
          <div className="fav-add-section">
            <div className="fav-add-header">
              <h4>AJOUTER UN CLUB À VOS FAVORIS</h4>
              <input
                type="text"
                placeholder="Rechercher une équipe..."
                value={searchClub}
                onChange={e => setSearchClub(e.target.value)}
                className="fav-search-input"
              />
            </div>
            <div className="fav-available-clubs">
              {otherClubs.map(c => (
                <button
                  key={c.id}
                  className="fav-available-pill"
                  onClick={() => toggleFavClub(c.id)}
                >
                  <Crest name={c.id} />
                  <span>{c.name}</span>
                  <Plus size={13} />
                </button>
              ))}
              {otherClubs.length === 0 && (
                <div className="fav-empty-hint">Tous les clubs sont déjà dans vos favoris !</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ 2. MATCHS DES FAVORIS ══════════════════════════════ */}
      {activeTab === 'matches' && (
        <div className="fav-matches-section">
          <div className="fav-section-title">
            <div>
              <h3>PROCHAINES RENCONTRES DE VOS FAVORIS</h3>
              <p>Analyses ciblées pour les clubs et compétitions que vous suivez.</p>
            </div>
            <span className="fav-badge-count">{favMatches.length} match(s)</span>
          </div>

          <div className="match-list">
            {favMatches.map(m => (
              <article key={m.id} className="match-row">
                <div className="match-time">
                  <b>{m.time}</b>
                  <small>{m.day} · {m.date.split(' ').slice(-2).join(' ')}</small>
                </div>
                <div className="league-cell">
                  <span className="league-mark">{m.flag}</span>
                  <div>
                    <b>{m.league}</b>
                    <small>{m.country}</small>
                  </div>
                </div>
                <div className="teams">
                  <div className={`team ${favoriteClubs.includes(m.h) ? 'is-fav' : ''}`}>
                    <Crest name={m.h || m.home} />
                    <b title={m.home}>{formatTeamName(m.home)}</b>
                    {favoriteClubs.includes(m.h) && <Star size={11} fill="#f59a23" color="#f59a23" />}
                  </div>
                  <span className="versus">VS</span>
                  <div className={`team ${favoriteClubs.includes(m.a) ? 'is-fav' : ''}`}>
                    <Crest name={m.a || m.away} />
                    <b title={m.away}>{formatTeamName(m.away)}</b>
                    {favoriteClubs.includes(m.a) && <Star size={11} fill="#f59a23" color="#f59a23" />}
                  </div>
                </div>
                <div className="pick-cell">
                  <small>ANALYSE IA</small>
                  <b>{m.pick}</b>
                  <span>{m.confidence}% conf.</span>
                </div>
                <div className="odds-cell">
                  <small>COTE</small>
                  <div className="odds-row">
                    <span>1·{m.odds.h}</span>
                    <span>2·{m.odds.a}</span>
                  </div>
                </div>
                <div className="row-actions">
                  <button
                    className={`select-match ${selected.includes(m.id) ? 'chosen' : ''}`}
                    onClick={() => onToggle(m.id)}
                    title={selected.includes(m.id) ? 'Retirer du carnet' : 'Ajouter au carnet'}
                  >
                    {selected.includes(m.id) ? <Check size={15} /> : <span>+</span>}
                  </button>
                </div>
              </article>
            ))}

            {favMatches.length === 0 && (
              <div className="fav-empty-block">
                <Heart size={32} />
                <b>Aucun match prévu pour vos favoris actuels</b>
                <p>Épinglez davantage d'équipes ou de championnats pour voir leurs affiches ici.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ 3. COMPÉTITIONS FAVORITES ═══════════════════════════ */}
      {activeTab === 'leagues' && (
        <div className="fav-leagues-section">
          <div className="fav-section-title">
            <div>
              <h3>COMPÉTITIONS SUIVIES</h3>
              <p>Activez les ligues prioritaires pour vos notifications et vos widgets.</p>
            </div>
          </div>

          <div className="fav-leagues-grid">
            {allLeagues.map(league => {
              const isFav = favoriteLeagues.includes(league)
              const count = matches.filter(m => m.league === league).length
              return (
                <div
                  key={league}
                  className={`fav-league-card ${isFav ? 'active' : ''}`}
                  onClick={() => toggleFavLeague(league)}
                >
                  <div className="fav-league-top">
                    <span className="fav-league-icon">🏆</span>
                    <button className={`fav-star-btn ${isFav ? 'active' : ''}`}>
                      <Star size={16} fill={isFav ? '#f59a23' : 'none'} />
                    </button>
                  </div>
                  <b>{league}</b>
                  <small>{count} match(s) cette semaine</small>
                  <div className="fav-league-status">
                    {isFav ? <span className="text-green">✓ Suivie en priorité</span> : <span>Cliquer pour suivre</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

