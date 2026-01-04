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
  updateUser: (userData: Partial<LoginResponse['user']>) => void
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
    try {
      console.log('[useAuth] Iniciando login para:', data.email)
      
      // Solo enviar email y password al backend, rememberMe es solo para el frontend
      const { rememberMe, ...loginData } = data
      
      console.log('[useAuth] Llamando a authApi.login...')
      const response = await authApi.login(loginData)
      console.log('[useAuth] Respuesta recibida:', {
        hasAccessToken: !!response.access_token,
        hasRefreshToken: !!response.refresh_token,
        hasUser: !!response.user,
        userEmail: response.user?.email,
      })

      // Limpiar ambos storages primero
      if (typeof window !== 'undefined') {
        console.log('[useAuth] Limpiando storages...')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_refresh_token')
        localStorage.removeItem('auth_user')
        sessionStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_refresh_token')
        sessionStorage.removeItem('auth_user')

        // Si rememberMe es true, usar localStorage (persistente)
        // Si es false, usar sessionStorage (se borra al cerrar navegador)
        const storage = data.rememberMe ? localStorage : sessionStorage
        console.log('[useAuth] Usando storage:', data.rememberMe ? 'localStorage' : 'sessionStorage')

        // Guardar tokens y usuario en storage
        storage.setItem('auth_token', response.access_token)
        if (response.refresh_token) {
          storage.setItem('auth_refresh_token', response.refresh_token)
        }
        storage.setItem('auth_user', JSON.stringify(response.user))

        // Verificar que se guardó correctamente
        const verifyToken = storage.getItem('auth_token')
        const verifyUser = storage.getItem('auth_user')
        console.log('[useAuth] Verificación de storage:', {
          tokenGuardado: !!verifyToken,
          userGuardado: !!verifyUser,
        })
        
        if (!verifyToken || !verifyUser) {
          console.error('[useAuth] Error: No se pudo guardar en storage')
          throw new Error('Error al guardar la sesión en storage')
        }
      }

      // Actualizar estado de Zustand
      console.log('[useAuth] Actualizando estado de Zustand...')
      const newState = {
        user: response.user,
        token: response.access_token,
        refreshToken: response.refresh_token || null,
        isAuthenticated: true,
        isHydrated: true, // Asegurar que está hidratado
      }
      
      // Actualizar estado de forma síncrona
      set(newState)
      
      console.log('[useAuth] Estado actualizado:', {
        isAuthenticated: newState.isAuthenticated,
        userEmail: newState.user?.email,
      })

      // Pequeño delay para asegurar que el estado se propague
      await new Promise(resolve => setTimeout(resolve, 100))

      // Retornar el usuario para que el login page pueda usarlo directamente
      return Promise.resolve()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      const errorStack = error instanceof Error ? error.stack : undefined
      const errorResponse = (error as { response?: { status?: number; data?: unknown } })?.response
      
      console.error('[useAuth] ❌ Error en login:', {
        message: errorMessage,
        status: errorResponse?.status,
        data: errorResponse?.data,
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
      console.log('[useAuth] No hay token o usuario en storage, marcando como no autenticado')
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
      console.log('[useAuth] Validando token con backend...')
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 5000) // 5 segundos máximo
      })

      const profilePromise = authApi.getProfile()

      const response = await Promise.race([profilePromise, timeoutPromise])

      console.log('[useAuth] Token válido, actualizando estado')
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
      
      console.log('[useAuth] Error al validar token:', errorMessage)
      
      // Si es timeout o error de red, mantener el estado actual si hay token
      if (errorMessage === 'Timeout' || errorMessage.includes('Network') || errorMessage.includes('fetch')) {
        console.log('[useAuth] Error de red/timeout, manteniendo estado autenticado')
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

      console.log('[useAuth] Token inválido, limpiando storage y estado')
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

  // Actualizar datos del usuario actual (útil cuando se edita el propio perfil)
  updateUser: (userData: Partial<LoginResponse['user']>) => {
    const currentState = useAuth.getState()
    if (!currentState.user) return

    const updatedUser = {
      ...currentState.user,
      ...userData,
    }

    // Actualizar estado de Zustand
    set({ user: updatedUser })

    // Actualizar storage
    if (typeof window !== 'undefined') {
      const storage = localStorage.getItem('auth_token') ? localStorage : sessionStorage
      storage.setItem('auth_user', JSON.stringify(updatedUser))
    }
  },
}))

// Inicializar al cargar (solo en cliente)
if (typeof window !== 'undefined') {
  try {
    // Inicializar estado inmediatamente desde storage (sin esperar validación del backend)
    const initialToken = getStoredToken()
    const initialRefreshToken = getStoredRefreshToken()
    const initialUser = getStoredUser()
    
    if (initialToken && initialUser) {
      // Validar que el usuario tenga la estructura correcta
      if (initialUser && typeof initialUser === 'object' && 'email' in initialUser && 'id' in initialUser) {
        // Establecer estado inicial inmediatamente para evitar pantalla en blanco
        useAuth.setState({
          user: initialUser,
          token: initialToken,
          refreshToken: initialRefreshToken || null,
          isAuthenticated: true,
          isHydrated: true, // Marcar como hidratado inmediatamente
        })
        
        // Validar token en background (no bloquea el render)
        useAuth.getState().checkAuth().catch((error: unknown) => {
          // Si falla la validación, se actualizará el estado en checkAuth
          console.error('[useAuth] Error al validar token en background:', error)
        })
      } else {
        // Usuario inválido, limpiar storage
        console.warn('[useAuth] Usuario en storage tiene estructura inválida, limpiando...')
        localStorage.removeItem('auth_user')
        sessionStorage.removeItem('auth_user')
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')
        useAuth.setState({
          isHydrated: true,
          isAuthenticated: false,
        })
      }
    } else {
      // Si no hay token, marcar como hidratado inmediatamente
      useAuth.setState({
        isHydrated: true,
        isAuthenticated: false,
      })
    }
  } catch (error: unknown) {
    console.error('[useAuth] Error al inicializar desde storage:', error)
    // En caso de error, limpiar storage y marcar como no autenticado
    try {
      localStorage.removeItem('auth_user')
      sessionStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_token')
    } catch (e) {
      // Ignorar errores al limpiar
    }
    useAuth.setState({
      isHydrated: true,
      isAuthenticated: false,
    })
  }
}
