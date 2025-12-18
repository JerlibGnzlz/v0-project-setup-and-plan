import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import * as SecureStore from 'expo-secure-store'
import { invitadoAuthApi, type Invitado } from '@api/invitado-auth'

interface InvitadoAuthContextValue {
  invitado: Invitado | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: (idToken: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const InvitadoAuthContext = createContext<InvitadoAuthContextValue | undefined>(undefined)

export function InvitadoAuthProvider({ children }: { children: React.ReactNode }) {
  const [invitado, setInvitado] = useState<Invitado | null>(null)
  const [loading, setLoading] = useState(true)

  const loadInvitado = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('invitado_token')
      if (token) {
        const profile = await invitadoAuthApi.me()
        setInvitado(profile)
      } else {
        setInvitado(null)
      }
    } catch (error: unknown) {
      console.error('Error cargando invitado:', error)
      setInvitado(null)
      // Limpiar token si es inválido
      await SecureStore.deleteItemAsync('invitado_token')
      await SecureStore.deleteItemAsync('invitado_refresh_token')
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const bootstrap = async () => {
      try {
        const token = await SecureStore.getItemAsync('invitado_token')
        if (token && isMounted) {
          await loadInvitado()
        }
      } catch (error: unknown) {
        console.error('Error en bootstrap de invitado:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    timeoutId = setTimeout(() => {
      if (isMounted) {
        setLoading(false)
      }
    }, 5000)

    void bootstrap()

    return () => {
      isMounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [loadInvitado])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await invitadoAuthApi.login(email, password)
      await SecureStore.setItemAsync('invitado_token', result.access_token)
      await SecureStore.setItemAsync('invitado_refresh_token', result.refresh_token)
      setInvitado(result.invitado)
    } catch (error: unknown) {
      console.error('Error en login de invitado:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async (idToken: string) => {
    setLoading(true)
    try {
      const result = await invitadoAuthApi.loginWithGoogle(idToken)
      await SecureStore.setItemAsync('invitado_token', result.access_token)
      await SecureStore.setItemAsync('invitado_refresh_token', result.refresh_token)
      setInvitado(result.invitado)
    } catch (error: unknown) {
      console.error('Error en login con Google:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('invitado_refresh_token')
      if (refreshToken) {
        await invitadoAuthApi.logout(refreshToken)
      }
    } catch (error: unknown) {
      console.error('Error en logout:', error)
    } finally {
      await SecureStore.deleteItemAsync('invitado_token')
      await SecureStore.deleteItemAsync('invitado_refresh_token')
      setInvitado(null)
    }
  }

  return (
    <InvitadoAuthContext.Provider
      value={{
        invitado,
        loading,
        login,
        loginWithGoogle,
        logout,
        isAuthenticated: !!invitado,
      }}
    >
      {children}
    </InvitadoAuthContext.Provider>
  )
}

export function useInvitadoAuth() {
  const ctx = useContext(InvitadoAuthContext)
  if (!ctx) {
    throw new Error('useInvitadoAuth must be used within InvitadoAuthProvider')
  }
  return ctx
}

