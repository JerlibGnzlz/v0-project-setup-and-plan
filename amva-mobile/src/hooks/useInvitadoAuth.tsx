import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import * as SecureStore from 'expo-secure-store'
import { invitadoAuthApi, type Invitado } from '@api/invitado-auth'

interface InvitadoAuthContextValue {
  invitado: Invitado | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: (idToken: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  isAuthenticated: boolean
}

const InvitadoAuthContext = createContext<InvitadoAuthContextValue | undefined>(undefined)

export function InvitadoAuthProvider({ children }: { children: React.ReactNode }) {
  const [invitado, setInvitado] = useState<Invitado | null>(null)
  const [loading, setLoading] = useState(true)

  const loadInvitado = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('invitado_token')
      if (!token) {
        setInvitado(null)
        return
      }

      console.log('🔍 Intentando cargar perfil de invitado...')
      const profile = await invitadoAuthApi.me()
      console.log('✅ Perfil de invitado cargado:', profile.email)
      setInvitado(profile)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ Error cargando invitado:', errorMessage)
      
      // Si es un error 401, el interceptor debería haber intentado refrescar el token
      // Si aún así falla, limpiar tokens
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } }
        if (axiosError.response?.status === 401) {
          console.log('⚠️ Token inválido o expirado, limpiando tokens...')
          await SecureStore.deleteItemAsync('invitado_token')
          await SecureStore.deleteItemAsync('invitado_refresh_token')
        }
      }
      
      setInvitado(null)
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
      console.log('🔐 Iniciando login de invitado...')
      const result = await invitadoAuthApi.login(email, password)
      console.log('✅ Login exitoso, guardando tokens...')
      
      await SecureStore.setItemAsync('invitado_token', result.access_token)
      await SecureStore.setItemAsync('invitado_refresh_token', result.refresh_token)
      
      console.log('✅ Tokens guardados, estableciendo invitado...')
      setInvitado(result.invitado)
      console.log('✅ Invitado establecido:', result.invitado.email)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ Error en login de invitado:', errorMessage)
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

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      await loadInvitado()
      console.log('✅ Estado de invitado refrescado')
    } catch (error: unknown) {
      console.error('Error refrescando invitado:', error)
    } finally {
      setLoading(false)
    }
  }, [loadInvitado])

  return (
    <InvitadoAuthContext.Provider
      value={{
        invitado,
        loading,
        login,
        loginWithGoogle,
        logout,
        refresh,
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

