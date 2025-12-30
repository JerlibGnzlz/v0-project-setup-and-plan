import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Platform } from 'react-native'
import Constants from 'expo-constants'
import * as SecureStore from 'expo-secure-store'
import { invitadoAuthApi, type Invitado } from '@api/invitado-auth'

// Importación condicional para evitar errores en Expo Go
const isExpoGo = Constants.executionEnvironment === 'storeClient'
let Notifications: any = null
if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications')
  } catch (error) {
    // Silenciar error si no está disponible
  }
}

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
      const refreshToken = await SecureStore.getItemAsync('invitado_refresh_token')

      if (!token) {
        setInvitado(null)
        return
      }

      const profile = await invitadoAuthApi.me()
      setInvitado(profile)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? (error.message || 'Error desconocido') : 'Error desconocido'

      // El interceptor debería haber intentado refrescar el token automáticamente
      // Si llegamos aquí, significa que el refresh también falló o no había refresh token
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: unknown } }

        if (axiosError.response?.status === 401) {
          // Verificar si hay refresh token antes de limpiar
          const refreshToken = await SecureStore.getItemAsync('invitado_refresh_token')
          if (!refreshToken) {
            await SecureStore.deleteItemAsync('invitado_token')
            await SecureStore.deleteItemAsync('invitado_refresh_token')
            setInvitado(null)
          } else {
            // Si hay refresh token pero aún falla, puede ser que el refresh también falló
            // El interceptor ya debería haber limpiado los tokens si el refresh falló
            // Verificar si los tokens aún existen (el interceptor puede haberlos limpiado)
            const tokenStillExists = await SecureStore.getItemAsync('invitado_token')
            const refreshTokenStillExists = await SecureStore.getItemAsync('invitado_refresh_token')

            if (!tokenStillExists) {
              setInvitado(null)
            } else {
              // Si los tokens aún existen pero recibimos 401, puede ser un problema de validación
              // Intentar limpiar manualmente y forzar re-login
              await SecureStore.deleteItemAsync('invitado_token')
              await SecureStore.deleteItemAsync('invitado_refresh_token')
              setInvitado(null)
            }
          }
        } else {
          // Si no es 401, solo establecer invitado como null sin limpiar tokens
          setInvitado(null)
        }
      } else {
        // Si no es un error de axios, solo establecer invitado como null
        setInvitado(null)
      }
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let hasLoaded = false // Prevenir múltiples cargas

    const bootstrap = async () => {
      try {
        const token = await SecureStore.getItemAsync('invitado_token')
        if (token && isMounted && !hasLoaded) {
          hasLoaded = true
          await loadInvitado()
        } else if (!token && isMounted) {
          // Si no hay token, establecer invitado como null inmediatamente
          setInvitado(null)
        }
      } catch (error: unknown) {
        // No establecer hasLoaded = true si hay error, para permitir reintento
        hasLoaded = false
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
  }, []) // Remover loadInvitado de las dependencias para evitar loops

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {

      // Obtener token de push si está disponible
      let deviceToken: string | undefined
      let platform: 'ios' | 'android' | undefined
      let deviceId: string | undefined

      if (!isExpoGo && Notifications) {
        try {
          const { status } = await Notifications.getPermissionsAsync()
          if (status === 'granted') {
            const tokenData = await Notifications.getExpoPushTokenAsync({
              projectId: Constants?.expoConfig?.extra?.eas?.projectId || '89b63cb9-113c-4901-bfb6-c1622478bc56',
            })
            deviceToken = tokenData.data
            platform = Platform.OS as 'ios' | 'android'
            if (deviceToken) {
              deviceId = deviceToken.substring(0, 20)
            }
          }
        } catch (tokenError: unknown) {
          // Manejar error de Firebase no inicializado silenciosamente
          // Los errores de Firebase no son críticos para el login
        }
      }

      const result = await invitadoAuthApi.login(email, password, deviceToken, platform, deviceId)

      await SecureStore.setItemAsync('invitado_token', result.access_token)
      await SecureStore.setItemAsync('invitado_refresh_token', result.refresh_token)

      setInvitado(result.invitado)
    } catch (error: unknown) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async (idToken: string) => {
    setLoading(true)
    try {
      // Validar que el idToken no esté vacío
      if (!idToken || idToken.trim().length === 0) {
        const error = new Error('Token de Google no recibido')
        throw error
      }

      // Obtener token de push si está disponible
      let deviceToken: string | undefined
      let platform: 'ios' | 'android' | undefined
      let deviceId: string | undefined

      if (!isExpoGo && Notifications) {
        try {
          const { status } = await Notifications.getPermissionsAsync()
          if (status === 'granted') {
            const tokenData = await Notifications.getExpoPushTokenAsync({
              projectId: Constants?.expoConfig?.extra?.eas?.projectId || '89b63cb9-113c-4901-bfb6-c1622478bc56',
            })
            deviceToken = tokenData.data
            platform = Platform.OS as 'ios' | 'android'
            if (deviceToken) {
              deviceId = deviceToken.substring(0, 20)
            }
          }
        } catch (tokenError: unknown) {
          // Manejar error de Firebase no inicializado silenciosamente
          // Los errores de Firebase no son críticos para el login
        }
      }

      const result = await invitadoAuthApi.loginWithGoogle(idToken, deviceToken, platform, deviceId)

      // Guardar tokens de forma segura
      await SecureStore.setItemAsync('invitado_token', result.access_token)
      await SecureStore.setItemAsync('invitado_refresh_token', result.refresh_token)

      // Establecer el invitado ANTES de setLoading(false) para que la navegación se actualice
      setInvitado(result.invitado)

      // Pequeño delay para asegurar que el estado se propague antes de continuar
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

      // Log detallado del error para debugging
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            status?: number
            statusText?: string
            data?: {
              success?: boolean
              error?: {
                message?: string
                statusCode?: number
                error?: string
                details?: unknown
              }
              message?: string | string[] | unknown
            }
          }
        }

        const responseData = axiosError.response?.data

        // Si es un error 400, puede ser un problema de validación
        if (axiosError.response?.status === 400) {
          let backendMessage: string = 'Error de validación'

          if (responseData) {
            // Formato ErrorResponse estándar: response.data.error.message
            if (responseData.error && typeof responseData.error === 'object') {
              const errorObj = responseData.error as { message?: string; details?: unknown }
              if (typeof errorObj.message === 'string') {
                backendMessage = errorObj.message

                // Si hay details con validationErrors, agregarlos al mensaje
                if (errorObj.details && typeof errorObj.details === 'object') {
                  const details = errorObj.details as { validationErrors?: Array<{ field?: string; message?: string }> }
                  if (details.validationErrors && Array.isArray(details.validationErrors) && details.validationErrors.length > 0) {
                    const validationMessages = details.validationErrors
                      .map(err => err.message || `${err.field}: Error de validación`)
                      .join(', ')
                    backendMessage = `${backendMessage}: ${validationMessages}`
                  }
                }
              }
            }
            // Formato alternativo: response.data.message (compatibilidad)
            else if (typeof responseData.message === 'string') {
              backendMessage = responseData.message
            }
            // Formato alternativo: message como array
            else if (Array.isArray(responseData.message)) {
              backendMessage = responseData.message.join(', ')
            }
            // Formato alternativo: error como string directo
            else if (typeof responseData.error === 'string') {
              backendMessage = responseData.error
            }
          }

          const detailedError = new Error(backendMessage)
          throw detailedError
        }
      }

      // Limpiar tokens si hay error
      try {
        await SecureStore.deleteItemAsync('invitado_token')
        await SecureStore.deleteItemAsync('invitado_refresh_token')
      } catch (cleanupError) {
        // Error al limpiar tokens, continuar
      }

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
      // Error en logout, continuar
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
    } catch (error: unknown) {
      // Error refrescando invitado, continuar
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

