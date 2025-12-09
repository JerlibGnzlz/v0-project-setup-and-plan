'use client'

import { create } from 'zustand'
import { authApi, type LoginRequest, type LoginResponse } from '@/lib/api/auth'

interface AuthState {
  user: LoginResponse['user'] | null
  token: string | null
  isAuthenticated: boolean
  isHydrated: boolean
  login: (data: LoginRequest & { rememberMe?: boolean }) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  setHydrated: () => void
}

// Función para obtener el token del storage correcto
const getStoredToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
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
  isAuthenticated: false,
  isHydrated: false,

  login: async (data: LoginRequest & { rememberMe?: boolean }) => {
    console.log('[useAuth] Iniciando proceso de login...')
    // Solo enviar email y password al backend, rememberMe es solo para el frontend
    const { rememberMe, ...loginData } = data
    const response = await authApi.login(loginData)
    console.log('[useAuth] Respuesta del servidor recibida:', {
      hasToken: !!response.access_token,
      hasUser: !!response.user,
    })

    // Limpiar ambos storages primero
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      sessionStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_user')

      // Si rememberMe es true, usar localStorage (persistente)
      // Si es false, usar sessionStorage (se borra al cerrar navegador)
      const storage = data.rememberMe ? localStorage : sessionStorage

      // Guardar token y usuario en storage
      storage.setItem('auth_token', response.access_token)
      storage.setItem('auth_user', JSON.stringify(response.user))
      console.log(
        '[useAuth] Token y usuario guardados en',
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
      isAuthenticated: true,
      isHydrated: true, // Asegurar que está hidratado
    }
    set(newState)
    console.log('[useAuth] Estado actualizado:', newState)

    // Retornar para que el login page pueda esperar
    return Promise.resolve()
  },

  logout: () => {
    // Limpiar ambos storages
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_user')

    set({
      user: null,
      token: null,
      isAuthenticated: false,
    })
  },

  // Verificar si hay sesión guardada al cargar la app
  checkAuth: async () => {
    const token = getStoredToken()
    const user = getStoredUser()

    // Si no hay token o usuario, marcar como no autenticado
    if (!token || !user) {
      set({
        user: null,
        token: null,
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
          isAuthenticated: true,
          isHydrated: true,
        })
        return
      }

      // Si el token es inválido, limpiar todo
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      sessionStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_user')

      set({
        user: null,
        token: null,
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
  const initialUser = getStoredUser()
  
  if (initialToken && initialUser) {
    // Establecer estado inicial inmediatamente para evitar pantalla en blanco
    useAuth.setState({
      user: initialUser,
      token: initialToken,
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
