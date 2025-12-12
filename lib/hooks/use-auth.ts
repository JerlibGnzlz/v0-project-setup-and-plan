'use client'

import { create } from 'zustand'
import { authApi, type LoginRequest, type LoginResponse } from '@/lib/api/auth'

interface AuthState {
  user: LoginResponse['user'] | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isHydrated: boolean
  login: (data: LoginRequest & { rememberMe?: boolean }) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  setHydrated: () => void
  refreshAccessToken: () => Promise<boolean>
}

// Función para obtener el token del storage correcto
const getStoredToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
}

// Función para obtener el refresh token del storage correcto
const getStoredRefreshToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_refresh_token') || sessionStorage.getItem('auth_refresh_token')
}

// Función para obtener el usuario guardado
const getStoredUser = () => {
  if (typeof window === 'undefined') return null
  const userData = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user')
  if (userData) {
    try {
      return JSON.parse(userData)
    } catch {
      return null
    }
  }
  return null
}

export const useAuth = create<AuthState>()(set => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isHydrated: false,

  login: async (data: LoginRequest & { rememberMe?: boolean }) => {
    console.log('[useAuth] Iniciando proceso de login...')
    try {
      // Solo enviar email y password al backend, rememberMe es solo para el frontend
      const { rememberMe, ...loginData } = data
      console.log('[useAuth] Llamando a authApi.login...')
      const response = await authApi.login(loginData)
      console.log('[useAuth] Respuesta del servidor recibida:', {
        hasToken: !!response.access_token,
        hasUser: !!response.user,
        token: response.access_token?.substring(0, 20) + '...',
        userEmail: response.user?.email,
      })

    // Limpiar ambos storages primero
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_refresh_token')
      localStorage.removeItem('auth_user')
      sessionStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_refresh_token')
      sessionStorage.removeItem('auth_user')

      // Si rememberMe es true, usar localStorage (persistente)
      // Si es false, usar sessionStorage (se borra al cerrar navegador)
      const storage = data.rememberMe ? localStorage : sessionStorage

      // Guardar tokens y usuario en storage
      storage.setItem('auth_token', response.access_token)
      if (response.refresh_token) {
        storage.setItem('auth_refresh_token', response.refresh_token)
      }
      storage.setItem('auth_user', JSON.stringify(response.user))
      console.log(
        '[useAuth] Tokens y usuario guardados en',
        data.rememberMe ? 'localStorage' : 'sessionStorage'
      )

      // Verificar que se guardó correctamente
      const verifyToken = storage.getItem('auth_token')
      const verifyUser = storage.getItem('auth_user')
      if (!verifyToken || !verifyUser) {
        throw new Error('Error al guardar la sesión en storage')
      }
    }

    // Actualizar estado de Zustand
    const newState = {
      user: response.user,
      token: response.access_token,
      refreshToken: response.refresh_token || null,
      isAuthenticated: true,
      isHydrated: true, // Asegurar que está hidratado
    }
    set(newState)
    console.log('[useAuth] Estado actualizado:', newState)

      // Retornar para que el login page pueda esperar
      return Promise.resolve()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      const errorStack = error instanceof Error ? error.stack : undefined
      console.error('[useAuth] Error en login:', {
        message: errorMessage,
        stack: errorStack,
      })
      throw error
    }
  },

  refreshAccessToken: async (): Promise<boolean> => {
    try {
      const refreshToken = getStoredRefreshToken()
      if (!refreshToken) {
        console.warn('[useAuth] No hay refresh token disponible')
        return false
      }

      const response = await authApi.refreshToken(refreshToken)
      
      // Guardar nuevos tokens
      if (typeof window !== 'undefined') {
        const storage = localStorage.getItem('auth_token') ? localStorage : sessionStorage
        storage.setItem('auth_token', response.access_token)
        if (response.refresh_token) {
          storage.setItem('auth_refresh_token', response.refresh_token)
        }
      }

      set({
        token: response.access_token,
        refreshToken: response.refresh_token || null,
      })

      console.log('[useAuth] Token refrescado exitosamente')
      return true
    } catch (error) {
      console.error('[useAuth] Error al refrescar token:', error)
      // Si falla el refresh, hacer logout
      const { logout } = useAuth.getState()
      logout()
      return false
    }
  },

  logout: () => {
    // Limpiar ambos storages
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_refresh_token')
    localStorage.removeItem('auth_user')
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_refresh_token')
    sessionStorage.removeItem('auth_user')

    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
    })
  },

  // Verificar si hay sesión guardada al cargar la app
  checkAuth: async () => {
    const token = getStoredToken()
    const refreshToken = getStoredRefreshToken()
    const user = getStoredUser()

    // Si no hay token o usuario, marcar como no autenticado
    if (!token || !user) {
      set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isHydrated: true,
      })
      return
    }

    // Validar el token con el backend (con timeout para evitar que se quede colgado)
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 5000) // 5 segundos máximo
      })

      const profilePromise = authApi.getProfile()

      const response = await Promise.race([profilePromise, timeoutPromise])

      // Actualizar con los datos del backend (pueden estar más actualizados)
      set({
        user: response,
        token,
        refreshToken: refreshToken || null,
        isAuthenticated: true,
        isHydrated: true,
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      
      // Si es timeout o error de red, mantener el estado actual si hay token
      if (errorMessage === 'Timeout' || errorMessage.includes('Network') || errorMessage.includes('fetch')) {
        // Si hay token en storage, mantener autenticado (puede ser problema temporal de red)
        set({
          user,
          token,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
          isHydrated: true,
        })
        return
      }

      // Si el token es inválido, limpiar todo
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_refresh_token')
      localStorage.removeItem('auth_user')
      sessionStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_refresh_token')
      sessionStorage.removeItem('auth_user')

      set({
        user: null,
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
  // Inicializar estado inmediatamente desde storage (sin esperar validación del backend)
  const initialToken = getStoredToken()
  const initialRefreshToken = getStoredRefreshToken()
  const initialUser = getStoredUser()
  
  if (initialToken && initialUser) {
    // Establecer estado inicial inmediatamente para evitar pantalla en blanco
    useAuth.setState({
      user: initialUser,
      token: initialToken,
      refreshToken: initialRefreshToken || null,
      isAuthenticated: true,
      isHydrated: true, // Marcar como hidratado inmediatamente
    })
    
    // Validar token en background (no bloquea el render)
    useAuth.getState().checkAuth().catch(() => {
      // Si falla la validación, se actualizará el estado en checkAuth
    })
  } else {
    // Si no hay token, marcar como hidratado inmediatamente
    useAuth.setState({
      isHydrated: true,
      isAuthenticated: false,
    })
  }
}
