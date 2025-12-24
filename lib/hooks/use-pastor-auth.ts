'use client'

import { create } from 'zustand'
import {
  pastorAuthApi,
  type PastorLoginRequest,
  type PastorLoginResponse,
} from '@/lib/api/pastor-auth'

interface PastorAuthState {
  pastor: PastorLoginResponse['pastor'] | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isHydrated: boolean
  login: (data: PastorLoginRequest) => Promise<void>
  logout: () => void
  checkAuth: () => void
  setHydrated: () => void
}

// Función para obtener el token del storage
const getStoredToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('pastor_auth_token') || sessionStorage.getItem('pastor_auth_token')
}

// Función para obtener el refresh token
const getStoredRefreshToken = () => {
  if (typeof window === 'undefined') return null
  return (
    localStorage.getItem('pastor_refresh_token') || sessionStorage.getItem('pastor_refresh_token')
  )
}

// Función para obtener el pastor guardado
const getStoredPastor = () => {
  if (typeof window === 'undefined') return null
  const pastorData =
    localStorage.getItem('pastor_auth_user') || sessionStorage.getItem('pastor_auth_user')
  if (pastorData) {
    try {
      return JSON.parse(pastorData)
    } catch {
      return null
    }
  }
  return null
}

export const usePastorAuth = create<PastorAuthState>()(set => ({
  pastor: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isHydrated: false,

  login: async (data: PastorLoginRequest) => {
    const response = await pastorAuthApi.login(data)

    // Limpiar ambos storages primero
    localStorage.removeItem('pastor_auth_token')
    localStorage.removeItem('pastor_refresh_token')
    localStorage.removeItem('pastor_auth_user')
    sessionStorage.removeItem('pastor_auth_token')
    sessionStorage.removeItem('pastor_refresh_token')
    sessionStorage.removeItem('pastor_auth_user')

    // Usar localStorage para persistencia
    localStorage.setItem('pastor_auth_token', response.access_token)
    localStorage.setItem('pastor_refresh_token', response.refresh_token)
    localStorage.setItem('pastor_auth_user', JSON.stringify(response.pastor))

    set({
      pastor: response.pastor,
      token: response.access_token,
      refreshToken: response.refresh_token,
      isAuthenticated: true,
    })
  },

  logout: () => {
    // Limpiar ambos storages
    localStorage.removeItem('pastor_auth_token')
    localStorage.removeItem('pastor_refresh_token')
    localStorage.removeItem('pastor_auth_user')
    sessionStorage.removeItem('pastor_auth_token')
    sessionStorage.removeItem('pastor_refresh_token')
    sessionStorage.removeItem('pastor_auth_user')

    set({
      pastor: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
    })
  },

  // Verificar si hay sesión guardada al cargar la app
  checkAuth: () => {
    const token = getStoredToken()
    const refreshToken = getStoredRefreshToken()
    const pastor = getStoredPastor()

    if (token && pastor) {
      set({
        pastor,
        token,
        refreshToken: refreshToken || null,
        isAuthenticated: true,
        isHydrated: true,
      })
    } else {
      set({
        pastor: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isHydrated: true,
      })
    }
  },

  setHydrated: () => {
    set({ isHydrated: true })
  },
}))

// Inicializar al cargar (solo en cliente)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    usePastorAuth.getState().checkAuth()
  }, 0)
}




















