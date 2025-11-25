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
  checkAuth: () => void
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
    const response = await authApi.login(data)

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

    set({
      user: response.user,
      token: response.access_token,
      isAuthenticated: true,
    })
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
  checkAuth: () => {
    const token = getStoredToken()
    const user = getStoredUser()

    if (token && user) {
      set({
        user,
        token,
        isAuthenticated: true,
        isHydrated: true,
      })
    } else {
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
  setTimeout(() => {
    useAuth.getState().checkAuth()
  }, 0)
}
