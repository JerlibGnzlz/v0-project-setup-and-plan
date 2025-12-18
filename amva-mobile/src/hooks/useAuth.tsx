import React, { createContext, useContext, useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { authApi, type Pastor } from '@api/auth'

interface AuthContextValue {
  pastor: Pastor | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [pastor, setPastor] = useState<Pastor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let bootstrapCompleted = false

    const completeBootstrap = () => {
      if (isMounted && !bootstrapCompleted) {
        bootstrapCompleted = true
        console.log('✅ Bootstrap completado')
        setLoading(false)
      }
    }

    const bootstrap = async () => {
      try {
        console.log('🚀 Iniciando bootstrap de autenticación...')

        // Timeout de seguridad: si tarda más de 5 segundos, continuar sin token
        timeoutId = setTimeout(() => {
          console.log('⏱️ Timeout en bootstrap (5s), continuando sin autenticación')
          completeBootstrap()
        }, 5000)

        const token = await SecureStore.getItemAsync('access_token')
        if (token) {
          console.log('🔍 Token encontrado, verificando validez...')
          try {
            // Timeout más corto para la petición me() (3 segundos)
            const mePromise = authApi.me()
            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Request timeout')), 3000)
            )

            const me = await Promise.race<Pastor>([mePromise, timeoutPromise])

            if (isMounted && !bootstrapCompleted) {
              setPastor(me)
              console.log('✅ Token válido, pastor cargado:', me.email)
            }
          } catch (error: unknown) {
            const errorObj = error as {
              response?: { status?: number }
              message?: string
              code?: string
              config?: { url?: string; _retry?: boolean }
            }
            
            console.error('❌ Error al verificar token:', {
              status: errorObj.response?.status,
              message: errorObj.message,
              url: errorObj.config?.url,
            })

            // Si es un error de red o timeout, no limpiar tokens (puede ser temporal)
            if (
              errorObj.message?.includes('timeout') ||
              errorObj.code === 'ECONNABORTED'
            ) {
              console.log('⚠️ Timeout o error de red, manteniendo tokens')
            } else if (errorObj.response?.status === 401) {
              // Solo limpiar si es 401 y no hay refresh token o ya se intentó refrescar
              const refreshToken = await SecureStore.getItemAsync('refresh_token')
              if (!refreshToken || errorObj.config?._retry) {
                if (isMounted) {
                  console.log('🧹 Limpiando tokens (401 sin refresh posible)')
                  await SecureStore.deleteItemAsync('access_token')
                  await SecureStore.deleteItemAsync('refresh_token')
                }
              } else {
                console.log('ℹ️ 401 recibido, el interceptor intentará refrescar')
              }
            }
          }
        } else {
          console.log('ℹ️ No hay token guardado, usuario no autenticado')
        }
      } catch (error: unknown) {
        const errorObj = error instanceof Error ? error : { message: 'Error desconocido', stack: undefined }
        console.error('❌ Error crítico en bootstrap:', {
          message: errorObj.message,
          stack: errorObj.stack,
        })
        // En caso de error crítico, continuar sin autenticación
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        completeBootstrap()
      }
    }

    void bootstrap()

    // Timeout de seguridad adicional: si después de 6 segundos aún está loading, forzar
    const safetyTimeout = setTimeout(() => {
      if (isMounted) {
        console.log('⚠️ Timeout de seguridad (6s), forzando carga completa')
        completeBootstrap()
      }
    }, 6000)

    return () => {
      isMounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (safetyTimeout) {
        clearTimeout(safetyTimeout)
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      console.log('🔐 useAuth: Iniciando login...')
      const { access_token, refresh_token, pastor } = await authApi.login(email, password)
      console.log('✅ useAuth: Login exitoso, guardando tokens...')
      await SecureStore.setItemAsync('access_token', access_token)
      await SecureStore.setItemAsync('refresh_token', refresh_token)
      setPastor(pastor)
      console.log('✅ useAuth: Tokens guardados, pastor establecido')
    } catch (error: unknown) {
      console.error('❌ useAuth: Error en login:', error)
      throw error // Re-lanzar para que LoginScreen lo maneje
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await SecureStore.deleteItemAsync('access_token')
    await SecureStore.deleteItemAsync('refresh_token')
    setPastor(null)
  }

  return (
    <AuthContext.Provider value={{ pastor, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
