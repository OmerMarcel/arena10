// ============================================================
// ARENA 10 — Fenêtre Modale de Connexion & Inscription
// ============================================================

import React, { useState, useEffect } from 'react'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import {
  X, Lock, Envelope, User, ShieldCheck,
  Eye, EyeSlash, Lightning, ArrowRight, CircleNotch,
  WarningCircle, CheckCircle
} from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'

export function AuthModal() {
  const { isModalOpen, modalMode, closeModal, login, loginWithGoogle, register } = useAuth()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setMode(modalMode)
    setError(null)
    setSuccess(null)
    setEmail('')
    setPassword('')
    setName('')
    setTitle('')
  }, [modalMode, isModalOpen])

  if (!isModalOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      if (mode === 'login') {
        const res = await login(email, password)
        if (!res.success) setError(res.error || 'Adresse email ou mot de passe incorrect.')
        // succès → AuthContext ferme la modale automatiquement
      } else {
        if (!name || name.trim().length < 2) {
          setError('Veuillez entrer votre nom (au moins 2 caractères).')
          setSubmitting(false)
          return
        }
        const res = await register(name, email, password, title)
        if (!res.success) setError(res.error || 'Erreur lors de la création de compte.')
      }
    } catch (err: any) {
      setError(err?.message || 'Une erreur inattendue est survenue.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Connexion Google annulée ou échouée.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await loginWithGoogle(credentialResponse.credential)
      if (!res.success) setError(res.error || 'Connexion Google échouée.')
      // succès → AuthContext ferme la modale automatiquement
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la connexion Google.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-overlay" onClick={closeModal}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>

        {/* Fermeture */}
        <button className="auth-close-btn" onClick={closeModal} aria-label="Fermer">
          <X size={18} />
        </button>

        {/* En-tête */}
        <div className="auth-header">
          <div className="auth-brand-badge">
            <ShieldCheck size={16} className="accent" />
            <span>ESPACE SÉCURISÉ ARENA 10</span>
          </div>
          <h3 className="auth-title">
            {mode === 'login' ? 'ACCÉDEZ À VOTRE ESPACE' : 'CRÉEZ VOTRE COMPTE'}
          </h3>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Connectez-vous pour retrouver vos favoris, votre carnet et vos réglages.'
              : 'Rejoignez ARENA 10 et profitez de pronostics IA personnalisés.'}
          </p>
        </div>

        {/* Google OAuth — affiché en premier */}
        <div className="auth-google-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Connexion Google échouée. Veuillez réessayer.')}
            theme="filled_black"
            shape="rectangular"
            size="large"
            text="continue_with"
            width="100%"
          />
        </div>

        <div className="auth-separator">
          <span>OU AVEC EMAIL</span>
        </div>

        {/* Onglets */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(null) }}
          >
            Connexion
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(null) }}
          >
            Créer un compte
          </button>
        </div>

        {/* Alertes */}
        {error && (
          <div className="auth-alert error">
            <WarningCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="auth-alert success">
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <>
              <div className="auth-field">
                <label>Nom complet ou Pseudo</label>
                <div className="auth-input-wrapper">
                  <User size={16} className="auth-input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="Votre nom ou pseudo"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    disabled={submitting}
                    autoFocus
                  />
                </div>
              </div>

              <div className="auth-field">
                <label>Titre ou Statut (optionnel)</label>
                <div className="auth-input-wrapper">
                  <Lightning size={16} className="auth-input-icon" />
                  <input
                    type="text"
                    placeholder="Ex: Analyste VIP, Parieur pro..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>
            </>
          )}

          <div className="auth-field">
            <label>Adresse Email</label>
            <div className="auth-input-wrapper">
              <Envelope size={16} className="auth-input-icon" />
              <input
                type="email"
                required
                placeholder="votre.email@exemple.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={submitting}
                autoFocus={mode === 'login'}
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Mot de passe</label>
            <div className="auth-input-wrapper">
              <Lock size={16} className="auth-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Au moins 6 caractères"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={submitting}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={submitting}
          >
            {submitting ? (
              <CircleNotch size={16} className="spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Se connecter' : 'Créer mon compte'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  )
}
