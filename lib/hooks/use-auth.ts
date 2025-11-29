"use client"

import { create } from "zustand"
import { authApi, type LoginRequest, type LoginResponse } from "@/lib/api/auth"

interface AuthState {
  user: LoginResponse["user"] | null
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
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
}

// Función para obtener el usuario guardado
const getStoredUser = () => {
  if (typeof window === "undefined") return null
  const userData = localStorage.getItem("auth_user") || sessionStorage.getItem("auth_user")
  if (userData) {
    try {
      return JSON.parse(userData)
    } catch {
      return null
    }
  }
  return null
}

export const useAuth = create<AuthState>()((set) => ({
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
      hasUser: !!response.user 
    })

    // Limpiar ambos storages primero
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
    sessionStorage.removeItem("auth_token")
    sessionStorage.removeItem("auth_user")

    // Si rememberMe es true, usar localStorage (persistente)
    // Si es false, usar sessionStorage (se borra al cerrar navegador)
    const storage = data.rememberMe ? localStorage : sessionStorage

    storage.setItem("auth_token", response.access_token)
    storage.setItem("auth_user", JSON.stringify(response.user))
    console.log('[useAuth] Token y usuario guardados en', data.rememberMe ? 'localStorage' : 'sessionStorage')

    const newState = {
      user: response.user,
      token: response.access_token,
      isAuthenticated: true,
      isHydrated: true, // Asegurar que está hidratado
    }
    set(newState)
    console.log('[useAuth] Estado actualizado:', newState)
    
    // Verificar que el estado se guardó correctamente
    setTimeout(() => {
      const currentState = useAuth.getState()
      console.log('[useAuth] Estado después de actualizar:', {
        isAuthenticated: currentState.isAuthenticated,
        hasToken: !!currentState.token,
        hasUser: !!currentState.user
      })
    }, 50)
  },

  logout: () => {
    // Limpiar ambos storages
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
    sessionStorage.removeItem("auth_token")
    sessionStorage.removeItem("auth_user")

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

    // Validar el token con el backend
    try {
      console.log('[useAuth] Validando token con backend...')
      const response = await authApi.getProfile()
      console.log('[useAuth] Token válido, usuario verificado:', response)
      
      // Actualizar con los datos del backend (pueden estar más actualizados)
      set({
        user: response,
        token,
        isAuthenticated: true,
        isHydrated: true,
      })
    } catch (error: any) {
      console.error('[useAuth] Token inválido o expirado:', error)
      
      // Si el token es inválido, limpiar todo
      localStorage.removeItem("auth_token")
      localStorage.removeItem("auth_user")
      sessionStorage.removeItem("auth_token")
      sessionStorage.removeItem("auth_user")
      
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
if (typeof window !== "undefined") {
  // Pequeño delay para asegurar que el DOM está listo
  setTimeout(async () => {
    await useAuth.getState().checkAuth()
  }, 0)
}
