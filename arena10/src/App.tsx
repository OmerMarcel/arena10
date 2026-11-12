// ============================================================
// ARENA 10 — Application principale v2
// Auteur : ARENA 10 / Antigravity
// ============================================================

import { useState, useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import {
  House, CalendarDots, Lightning, ChartBar,
  BookBookmark, Pulse, Fire, List, X,
  Star, Gear, ArrowRight, CaretDown as ChevronDown,
  Sun, Moon, UserCircle as UserIcon, SignOut, SignIn
} from '@phosphor-icons/react'
import { OverviewPage }     from './components/OverviewPage'
import { SchedulePage }     from './components/SchedulePage'
import { PronosticsPage }   from './components/PronosticsPage'
import { ComparatorPage }   from './components/ComparatorPage'
import { NotebookPage }     from './components/NotebookPage'
import { PerformancePage }  from './components/PerformancePage'
import { NewsPage }         from './components/NewsPage'
import { FavoritesPage }    from './components/FavoritesPage'
import { SettingsPage }     from './components/SettingsPage'
import { Background3DPlayer } from './components/Background3DPlayer'
import { GlobalVideoBg }     from './components/GlobalVideoBg'
import { AuthModal }         from './components/AuthModal'
import { RightSidebarAds }   from './components/ads/RightSidebarAds'
import { MobileTopAd }       from './components/ads/MobileTopAd'
import { AuthProvider, useAuth } from './context/AuthContext'
import './styles.css'

const nav = [
  { label: 'Vue d\'ensemble', icon: House },
  { label: 'Programme',       icon: CalendarDots },
  { label: 'Pronostics',      icon: Lightning,           badge: 'NEW' },
  { label: 'Comparateur',     icon: ChartBar },
  { label: 'Mon carnet',      icon: BookBookmark },
  { label: 'Performances',    icon: Pulse },
  { label: 'Actualités',      icon: Fire,                badge: '8' },
]

function Logo() {
  return (
    <div className="brand">
      <div className="brand-mark"><span>A</span><i>10</i></div>
      <div>
        <b>ARENA<span>10</span></b>
        <small>FOOTBALL INTELLIGENCE</small>
      </div>
    </div>
  )
}

function AppContent() {
  const { user, isAuthenticated, isLoading, logout, openModal } = useAuth()
  const [active, setActive]       = useState('Vue d\'ensemble')
  const [selected, setSelected]   = useState<number[]>([])
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [theme, setTheme]         = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('arena10_theme')
      if (saved === 'light' || saved === 'dark') return saved
    } catch {}
    return 'dark'
  })

  // Synchronisation du thème sombre / clair sur le DOM et dans localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('arena10_theme', theme)
    } catch {}
  }, [theme])

  function toggle(id: number) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  function navigate(page: string) {
    setActive(page)
    setMobileOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const displayName = user?.name || ''
  const displayTitle = user?.title || ''
  const displayInitial = (displayName || 'A').charAt(0).toUpperCase()
  const avatarUrl = (user as any)?.avatarUrl as string | undefined

  function renderPage() {
    switch (active) {
      case 'Vue d\'ensemble': return <OverviewPage onNav={navigate} selected={selected} onToggle={toggle} />
      case 'Programme':       return <SchedulePage selected={selected} onToggle={toggle} onNav={navigate} />
      case 'Pronostics':      return <PronosticsPage selected={selected} onToggle={toggle} />
      case 'Comparateur':     return <ComparatorPage />
      case 'Mon carnet':      return <NotebookPage selected={selected} onToggle={toggle} onNav={navigate} />
      case 'Performances':    return <PerformancePage />
      case 'Actualités':      return <NewsPage />
      case 'Mes favoris':     return <FavoritesPage onNav={navigate} selected={selected} onToggle={toggle} />
      case 'Paramètres':      return <SettingsPage theme={theme} onThemeChange={setTheme} />
      default:                return null
    }
  }

  return (
    <div className="app-shell">
      {/* ══ FENÊTRE MODALE D'AUTHENTIFICATION (CONNEXION / INSCRIPTION) ══ */}
      <AuthModal />

      {/* ══ VIDÉO D'ARRIÈRE-PLAN GLOBALE (SUR TOUTES LES PAGES) ══ */}
      <GlobalVideoBg />

      {/* ══ ARRIÈRE-PLAN 3D DU JOUEUR (SUR TOUTES LES PAGES) ══ */}
      <Background3DPlayer />

      {/* ══ SIDEBAR ════════════════════════════════════════════ */}
      <aside className={`sidebar${mobileOpen ? ' open' : ''}`}>
        <div className="side-top">
          <Logo />
          <button className="icon-btn close-menu" onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="side-label">ESPACE FOOTBALL</div>
        <nav>
          {nav.map(({ label, icon: Icon, badge }) => (
            <button
              key={label}
              onClick={() => navigate(label)}
              className={`nav-link${active === label ? ' active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {badge && <em>{badge}</em>}
              {label === 'Mon carnet' && selected.length > 0 && (
                <em style={{ background: '#d9112b22', color: '#f06b7a' }}>{selected.length}</em>
              )}
            </button>
          ))}
        </nav>

        <div className="side-divider" />
        <div className="side-label">PERSONNALISATION</div>
        <button
          onClick={() => navigate('Mes favoris')}
          className={`nav-link${active === 'Mes favoris' ? ' active' : ''}`}
        >
          <Star size={18} />
          <span>Mes favoris</span>
        </button>
        <button
          onClick={() => navigate('Paramètres')}
          className={`nav-link${active === 'Paramètres' ? ' active' : ''}`}
        >
          <Gear size={18} />
          <span>Paramètres</span>
        </button>

        <div className="sidebar-bottom">
          {/* Zone utilisateur sidebar */}
          {isAuthenticated && user ? (
            <div className="user-mini logged-in" onClick={() => navigate('Paramètres')} style={{ cursor: 'pointer' }} title="Voir mon profil">
              <div className="avatar" style={{ background: user.avatarColor || 'var(--accent)' }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : displayInitial
                }
              </div>
              <div className="user-mini-info">
                <b>{displayName}</b>
                <small style={{ color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
                  Connecté
                </small>
              </div>
              <button
                type="button"
                className="user-mini-logout-btn"
                onClick={(e) => { e.stopPropagation(); logout() }}
                title="Se déconnecter"
              >
                <SignOut size={14} />
              </button>
            </div>
          ) : (
            <div className="user-mini guest" onClick={() => openModal('login')} style={{ cursor: 'pointer' }} title="Se connecter">
              <div className="avatar" style={{ background: '#1d2b43' }}>
                <UserIcon size={16} style={{ color: 'var(--text3)' }} />
              </div>
              <div className="user-mini-info">
                <b>Non connecté</b>
                <small>Cliquez pour vous connecter</small>
              </div>
              <SignIn size={15} className="accent" />
            </div>
          )}
        </div>
      </aside>

      {/* ══ MAIN ═══════════════════════════════════════════════ */}
      <main className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setMobileOpen(true)}><List size={20} /></button>
          <div className="crumb">ARENA 10 <span>/</span> {active.toUpperCase()}</div>
          <div className="top-actions">
            <button
              className="icon-btn theme-toggle-btn"
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Basculer en mode clair' : 'Basculer en mode sombre'}
              aria-label="Basculer le thème"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Zone utilisateur dans le header */}
            {isAuthenticated && user ? (
              <div className="top-user-pill" title="Mon profil et paramètres">
                <div
                  className="top-avatar"
                  style={{ background: user.avatarColor || 'var(--accent)', overflow: 'hidden' }}
                >
                  {avatarUrl
                    ? <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : displayInitial
                  }
                </div>
                <div className="top-user-details" onClick={() => navigate('Paramètres')} style={{ cursor: 'pointer' }}>
                  <b>{displayName}</b>
                  <small style={{ color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
                    Connecté
                  </small>
                </div>
                <button
                  type="button"
                  className="top-logout-btn"
                  onClick={logout}
                  title="Se déconnecter"
                >
                  <SignOut size={13} />
                </button>
              </div>
            ) : (
              <button
                className="top-login-btn"
                onClick={() => openModal('login')}
                title="Se connecter ou créer un compte"
              >
                <UserIcon size={14} />
                <span>Connexion</span>
              </button>
            )}
          </div>
        </header>

        <div className="content">
          {active !== 'Paramètres' && <MobileTopAd />}
          <div className="content-layout-with-ads">
            <div className="content-page-body">
              {renderPage()}
            </div>
            {active !== 'Paramètres' && (
              <RightSidebarAds />
            )}
          </div>
        </div>
      </main>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}
    </div>
  )
}

export default function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}
