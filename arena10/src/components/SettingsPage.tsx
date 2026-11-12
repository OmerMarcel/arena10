// ============================================================
// ARENA 10 — Page Paramètres & Profil Utilisateur
// Essentiel, clair, moderne et axé sur l'expérience du parieur
// ============================================================

import { useState, useEffect } from 'react'
import {
  UserCircle as User, Moon, Sun, SlidersHorizontal as Sliders, ShieldCheck,
  SignOut as LogOut, SignIn as LogIn, Check, Trash as Trash2, Sparkle as Sparkles,
  TrendUp as TrendingUp, Shield, Lightning as Zap
} from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'

export interface UserSettings {
  userName: string
  userTitle: string
  oddsFormat: 'decimal' | 'fractional' | 'american'
  currency: 'EUR' | 'USD' | 'GBP' | 'XOF'
  predictionStyle: 'secure' | 'balanced' | 'aggressive'
  enableAnimations: boolean
}

const DEFAULT_SETTINGS: UserSettings = {
  userName: '',
  userTitle: '',
  oddsFormat: 'decimal',
  currency: 'EUR',
  predictionStyle: 'balanced',
  enableAnimations: true,
}

export function SettingsPage({
  theme = 'dark',
  onThemeChange,
}: {
  theme?: 'dark' | 'light'
  onThemeChange?: (theme: 'dark' | 'light') => void
}) {
  const { user, isAuthenticated, logout, openModal, updateProfile } = useAuth()

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('arena10_settings')
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })

  // Synchronisation avec les données du compte utilisateur
  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        userName: user.name || prev.userName,
        userTitle: user.title || prev.userTitle
      }))
    }
  }, [user])

  const [savedSuccess, setSavedSuccess] = useState(false)

  const updateSetting = <K extends keyof UserSettings>(key: K, val: UserSettings[K]) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: val }
      try {
        localStorage.setItem('arena10_settings', JSON.stringify(updated))
      } catch {}
      return updated
    })
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2000)
  }

  const clearSelection = () => {
    if (confirm('Voulez-vous réinitialiser votre sélection de matchs dans votre carnet ?')) {
      try {
        localStorage.removeItem('arena10_selected_matches')
      } catch {}
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 2000)
    }
  }

  return (
    <div className="settings-page">
      {/* ══ EN-TÊTE DE LA PAGE ═════════════════════════════════ */}
      <div className="page-header">
        <div className="eyebrow">
          <span className="eyebrow-line" /> ESPACE PERSONNEL
        </div>
        <h2>MES <span>PRÉFÉRENCES</span></h2>
        <p>Gérez votre profil parieur, l'apparence visuelle et vos préférences d'analyse de cotes.</p>
      </div>

      {savedSuccess && (
        <div className="settings-alert-success">
          <Check size={16} />
          <span>Préférences enregistrées avec succès !</span>
        </div>
      )}

      <div className="settings-grid">
        {/* ══ 1. MON PROFIL & COMPTE ═══════════════════════════ */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">
              {isAuthenticated ? <ShieldCheck size={18} /> : <User size={18} />}
            </div>
            <div>
              <h3>MON PROFIL & IDENTITÉ</h3>
              <p>Vos informations de parieur et statut de session.</p>
            </div>
          </div>

          {isAuthenticated && user ? (
            <div className="settings-user-connected">
              <div className="settings-user-badge-row">
                <div
                  className="settings-avatar"
                  style={{ background: user.avatarColor || 'var(--accent)', overflow: 'hidden' }}
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    (user.name || 'A').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="settings-user-meta">
                  <b>{user.name}</b>
                  <span>{user.email}</span>
                  <div className="settings-tags-row">
                    <span className="user-role-badge">
                      {user.role === 'admin' ? '🛡️ Administrateur' : user.role === 'pro' ? '⭐ Compte VIP Pro' : '👤 Membre ARENA 10'}
                    </span>
                    <span className="user-date-badge" style={{ color: 'var(--green)', borderColor: 'rgba(74, 222, 128, 0.3)', background: 'rgba(74, 222, 128, 0.08)' }}>
                      🟢 Connecté
                    </span>
                  </div>
                </div>
              </div>

              <div className="settings-fields" style={{ marginTop: 14 }}>
                <div className="settings-field">
                  <label>Nom ou Pseudonyme</label>
                  <input
                    type="text"
                    value={settings.userName}
                    onChange={e => {
                      updateSetting('userName', e.target.value)
                      updateProfile({ name: e.target.value })
                    }}
                    placeholder="Votre nom ou pseudo"
                  />
                </div>
                <div className="settings-field">
                  <label>Titre / Statut parieur</label>
                  <input
                    type="text"
                    value={settings.userTitle}
                    onChange={e => {
                      updateSetting('userTitle', e.target.value)
                      updateProfile({ title: e.target.value })
                    }}
                    placeholder="Ex: Analyste VIP, Parieur avisé..."
                  />
                </div>
              </div>

              <div className="settings-auth-actions">
                <button
                  type="button"
                  className="settings-logout-btn"
                  onClick={logout}
                >
                  <LogOut size={14} />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="settings-guest-box">
              <div className="guest-info">
                <b>Vous n'êtes pas connecté</b>
                <p>Connectez-vous ou créez un compte gratuit pour synchroniser vos sélections et sauvegarder vos préférences.</p>
              </div>
              <div className="guest-actions">
                <button
                  type="button"
                  className="settings-login-btn primary"
                  onClick={() => openModal('login')}
                >
                  <LogIn size={14} />
                  <span>Se connecter</span>
                </button>
                <button
                  type="button"
                  className="settings-login-btn outline"
                  onClick={() => openModal('register')}
                >
                  <span>Créer un compte</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ══ 2. APPARENCE DU SITE ═════════════════════════════ */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">
              {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
            </div>
            <div>
              <h3>APPARENCE DU SITE</h3>
              <p>Personnalisez l'ambiance lumineuse et les effets visuels.</p>
            </div>
          </div>

          <div className="settings-fields">
            <div className="settings-field">
              <label>Thème visuel actif</label>
              <div className="settings-toggle-group">
                <button
                  type="button"
                  className={`toggle-option ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => onThemeChange && onThemeChange('dark')}
                >
                  <Moon size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />
                  Mode Sombre
                </button>
                <button
                  type="button"
                  className={`toggle-option ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => onThemeChange && onThemeChange('light')}
                >
                  <Sun size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />
                  Mode Clair
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ══ 3. FORMAT DES COTES & DEVISE ═════════════════════ */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">
              <Sliders size={18} />
            </div>
            <div>
              <h3>FORMATS & DEVISES</h3>
              <p>Choisissez l'affichage des cotes et votre monnaie favorite.</p>
            </div>
          </div>

          <div className="settings-fields">
            <div className="settings-field">
              <label>Affichage des cotes</label>
              <div className="settings-toggle-group">
                <button
                  type="button"
                  className={`toggle-option ${settings.oddsFormat === 'decimal' ? 'active' : ''}`}
                  onClick={() => updateSetting('oddsFormat', 'decimal')}
                >
                  Décimal (1.85)
                </button>
                <button
                  type="button"
                  className={`toggle-option ${settings.oddsFormat === 'fractional' ? 'active' : ''}`}
                  onClick={() => updateSetting('oddsFormat', 'fractional')}
                >
                  Fraction (17/20)
                </button>
                <button
                  type="button"
                  className={`toggle-option ${settings.oddsFormat === 'american' ? 'active' : ''}`}
                  onClick={() => updateSetting('oddsFormat', 'american')}
                >
                  Américain (+110)
                </button>
              </div>
            </div>

            <div className="settings-field">
              <label>Devise de simulation</label>
              <div className="settings-toggle-group">
                <button
                  type="button"
                  className={`toggle-option ${settings.currency === 'EUR' ? 'active' : ''}`}
                  onClick={() => updateSetting('currency', 'EUR')}
                >
                  Euro (€)
                </button>
                <button
                  type="button"
                  className={`toggle-option ${settings.currency === 'USD' ? 'active' : ''}`}
                  onClick={() => updateSetting('currency', 'USD')}
                >
                  Dollar ($)
                </button>
                <button
                  type="button"
                  className={`toggle-option ${settings.currency === 'GBP' ? 'active' : ''}`}
                  onClick={() => updateSetting('currency', 'GBP')}
                >
                  Livre (£)
                </button>
                <button
                  type="button"
                  className={`toggle-option ${settings.currency === 'XOF' ? 'active' : ''}`}
                  onClick={() => updateSetting('currency', 'XOF')}
                >
                  FCFA
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ══ 4. STYLE D'ANALYSE PRÉFÉRÉ ═══════════════════════ */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon">
              <Sparkles size={18} />
            </div>
            <div>
              <h3>STYLE DE PRONOSTICS PRÉFÉRÉ</h3>
              <p>Adaptez la stratégie de l'IA à votre profil de jeu.</p>
            </div>
          </div>

          <div className="settings-fields">
            <div className="settings-field">
              <label>Profil de jeu privilégié</label>
              <div className="settings-toggle-group" style={{ gridTemplateColumns: '1fr' }}>
                <button
                  type="button"
                  className={`toggle-option ${settings.predictionStyle === 'secure' ? 'active' : ''}`}
                  onClick={() => updateSetting('predictionStyle', 'secure')}
                  style={{ textAlign: 'left', padding: '10px 14px' }}
                >
                  <Shield size={14} style={{ display: 'inline', marginRight: 8, verticalAlign: -2, color: 'var(--green)' }} />
                  <strong>Prudent & Sécurisé</strong> — Privilégie les fortes probabilités et les cotes sûres (1.20 à 1.60)
                </button>
                <button
                  type="button"
                  className={`toggle-option ${settings.predictionStyle === 'balanced' ? 'active' : ''}`}
                  onClick={() => updateSetting('predictionStyle', 'balanced')}
                  style={{ textAlign: 'left', padding: '10px 14px' }}
                >
                  <Zap size={14} style={{ display: 'inline', marginRight: 8, verticalAlign: -2, color: 'var(--accent)' }} />
                  <strong>Équilibré (Recommandé)</strong> — Meilleur compromis entre sécurité et rentabilité (1.60 à 2.40)
                </button>
                <button
                  type="button"
                  className={`toggle-option ${settings.predictionStyle === 'aggressive' ? 'active' : ''}`}
                  onClick={() => updateSetting('predictionStyle', 'aggressive')}
                  style={{ textAlign: 'left', padding: '10px 14px' }}
                >
                  <TrendingUp size={14} style={{ display: 'inline', marginRight: 8, verticalAlign: -2, color: '#f87171' }} />
                  <strong>Audacieux & Grosses Cotes</strong> — Recherche de Value Bets et combinaisons spéculatives (2.50+)
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ══ 5. GESTION DU CARNET ═══════════════════════════════ */}
        <section className="settings-card" style={{ gridColumn: '1 / -1' }}>
          <div className="settings-card-header">
            <div className="settings-icon">
              <Trash2 size={18} />
            </div>
            <div>
              <h3>GESTION DU CARNET</h3>
              <p>Gérez vos données de sélections locales.</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
            <p style={{ fontSize: 12, color: 'var(--text2)', margin: 0 }}>
              Vous souhaitez repartir de zéro pour vos prochains combinés ? Vous pouvez vider vos sélections actuelles en un clic.
            </p>
            <button
              type="button"
              className="settings-btn-secondary"
              onClick={clearSelection}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 8, cursor: 'pointer' }}
            >
              <Trash2 size={14} />
              <span>Vider ma sélection de matchs</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
