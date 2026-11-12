// ============================================================
// ARENA 10 — Contexte d'Authentification Utilisateur
// Gère l'état connecté, la session persistante et les profils
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  UserProfile,
  registerApi,
  loginApi,
  loginWithGoogleApi,
  getMeApi,
  logoutApi,
  updateProfileApi
} from '../services/api'

const TOKEN_STORAGE_KEY = 'arena10_auth_token'
const USER_STORAGE_KEY = 'arena10_auth_user'

interface AuthContextType {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isModalOpen: boolean
  modalMode: 'login' | 'register'
  openModal: (mode?: 'login' | 'register') => void
  closeModal: () => void
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginWithGoogle: (idToken: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string, title?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY)
    } catch {
      return null
    }
  })
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'login' | 'register'>('login')

  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      localStorage.removeItem(USER_STORAGE_KEY)
    } catch {}
    setToken(null)
    setUser(null)
  }, [])

  const saveSession = useCallback((newToken: string, newUser: UserProfile) => {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, newToken)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser))
    } catch {}
    setToken(newToken)
    setUser(newUser)
    setIsModalOpen(false)
  }, [])

  // Validation automatique du token stocké au démarrage de l'app (une seule fois)
  useEffect(() => {
    let cancelled = false
    const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY)

    if (!savedToken) {
      setIsLoading(false)
      return
    }

    getMeApi(savedToken)
      .then(res => {
        if (cancelled) return
        if (res.success && res.user) {
          setUser(res.user)
          try {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user))
          } catch {}
        } else {
          // Token expiré ou invalide côté serveur
          clearSession()
        }
        setIsLoading(false)
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [clearSession])

  const openModal = useCallback((mode: 'login' | 'register' = 'login') => {
    setModalMode(mode)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginApi({ email, password })
    if (res.success && res.token && res.user) {
      saveSession(res.token, res.user)
      return { success: true }
    }
    return { success: false, error: res.error || 'Identifiants incorrects.' }
  }, [saveSession])

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const res = await loginWithGoogleApi(idToken)
    if (res.success && res.token && res.user) {
      saveSession(res.token, res.user)
      return { success: true }
    }
    return { success: false, error: res.error || 'Connexion Google échouée.' }
  }, [saveSession])

  const register = useCallback(async (name: string, email: string, password: string, title?: string) => {
    const res = await registerApi({ name, email, password, title })
    if (res.success && res.token && res.user) {
      saveSession(res.token, res.user)
      return { success: true }
    }
    return { success: false, error: res.error || 'Erreur lors de la création du compte.' }
  }, [saveSession])

  const logout = useCallback(() => {
    if (token) {
      logoutApi(token)
    }
    clearSession()
  }, [token, clearSession])

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!token) return { success: false, error: 'Non connecté.' }
    const res = await updateProfileApi(token, updates)
    if (res.success && res.user) {
      setUser(res.user)
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user))
      } catch {}
      return { success: true }
    }
    return { success: false, error: res.error || 'Impossible de mettre à jour le profil.' }
  }, [token])

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    isModalOpen,
    modalMode,
    openModal,
    closeModal,
    login,
    loginWithGoogle,
    register,
    logout,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider.')
  }
  return context
}

