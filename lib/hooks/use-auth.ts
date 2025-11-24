"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { authApi, type LoginRequest, type LoginResponse } from "@/lib/api/auth"

interface AuthState {
  user: LoginResponse["user"] | null
  token: string | null
  isAuthenticated: boolean
  login: (data: LoginRequest & { rememberMe?: boolean }) => Promise<void>
  logout: () => void
  setUser: (user: LoginResponse["user"], token: string) => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (data: LoginRequest & { rememberMe?: boolean }) => {
        const response = await authApi.login(data)
        
        // Si rememberMe es true, usar localStorage (persistente)
        // Si es false, usar sessionStorage (se borra al cerrar navegador)
        const storage = data.rememberMe ? localStorage : sessionStorage
        
        // Limpiar el otro storage
        if (data.rememberMe) {
          sessionStorage.removeItem("auth_token")
        } else {
          localStorage.removeItem("auth_token")
        }
        
        storage.setItem("auth_token", response.access_token)
        set({
          user: response.user,
          token: response.access_token,
          isAuthenticated: true,
        })
      },

      logout: () => {
        localStorage.removeItem("auth_token")
        sessionStorage.removeItem("auth_token")
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      setUser: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
        })
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)
