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

      // TODO: remove - console.log('🔍 Intentando cargar perfil de invitado...', {
      // TODO: remove -   hasToken: !!token,
        hasRefreshToken: !!refreshToken,
        tokenLength: token?.length || 0,
        refreshTokenLength: refreshToken?.length || 0,
      })

      if (!token) {
        // TODO: remove - console.log('⚠️ No hay token de invitado, estableciendo invitado como null')
        setInvitado(null)
        return
      }

      const profile = await invitadoAuthApi.me()
      // TODO: remove - console.log('✅ Perfil de invitado cargado:', profile.email)
      setInvitado(profile)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? (error.message || 'Error desconocido') : 'Error desconocido'
      // TODO: remove - console.error('❌ Error cargando invitado:', errorMessage)

      // El interceptor debería haber intentado refrescar el token automáticamente
      // Si llegamos aquí, significa que el refresh también falló o no había refresh token
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: unknown } }
        // TODO: remove - console.error('🔍 Detalles del error:', {
        // TODO: remove -   status: axiosError.response?.status,
          data: axiosError.response?.data,
        })

        if (axiosError.response?.status === 401) {
          // Verificar si hay refresh token antes de limpiar
          const refreshToken = await SecureStore.getItemAsync('invitado_refresh_token')
          if (!refreshToken) {
            console.log('⚠️ No hay refresh token disponible, limpiando tokens...')
            await SecureStore.deleteItemAsync('invitado_token')
            await SecureStore.deleteItemAsync('invitado_refresh_token')
            setInvitado(null)
          } else {
            // Si hay refresh token pero aún falla, puede ser que el refresh también falló
            // El interceptor ya debería haber limpiado los tokens si el refresh falló
            // TODO: remove - console.log('⚠️ Error 401 después de intentar refresh, verificando estado de tokens...')
            // Verificar si los tokens aún existen (el interceptor puede haberlos limpiado)
            const tokenStillExists = await SecureStore.getItemAsync('invitado_token')
            const refreshTokenStillExists = await SecureStore.getItemAsync('invitado_refresh_token')

            // TODO: remove - console.log('🔍 Estado de tokens después del error:', {
            // TODO: remove -   tokenExists: !!tokenStillExists,
              refreshTokenExists: !!refreshTokenStillExists,
            })

            if (!tokenStillExists) {
              // TODO: remove - console.log('✅ Tokens ya fueron limpiados por el interceptor')
              setInvitado(null)
            } else {
              // Si los tokens aún existen pero recibimos 401, puede ser un problema de validación
              // Intentar limpiar manualmente y forzar re-login
              // TODO: remove - console.log('⚠️ Tokens aún existen pero recibimos 401, limpiando manualmente...')
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
        // TODO: remove - console.error('Error en bootstrap de invitado:', error)
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
      // TODO: remove - console.log('🔐 Iniciando login de invitado...')

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
            // TODO: remove - console.log('📱 Token de dispositivo obtenido para login')
          }
        } catch (tokenError: unknown) {
          const errorMessage = tokenError instanceof Error ? tokenError.message : String(tokenError)

          // Manejar error de Firebase no inicializado
          if (errorMessage.includes('FirebaseApp') || errorMessage.includes('Firebase') || errorMessage.includes('FCM')) {
            console.warn('⚠️ Firebase no está configurado. Las notificaciones push no estarán disponibles.')
            console.warn('💡 Para habilitar notificaciones push, sigue la guía: https://docs.expo.dev/push-notifications/fcm-credentials/')
          } else {
            console.warn('⚠️ No se pudo obtener token de dispositivo:', errorMessage)
          }
        }
      }

      const result = await invitadoAuthApi.login(email, password, deviceToken, platform, deviceId)
      // TODO: remove - console.log('✅ Login exitoso, guardando tokens...')
      // TODO: remove - console.log('🔍 Verificando tokens recibidos:', {
      // TODO: remove -   hasAccessToken: !!result.access_token,
        hasRefreshToken: !!result.refresh_token,
        accessTokenLength: result.access_token?.length || 0,
        refreshTokenLength: result.refresh_token?.length || 0,
      })

      await SecureStore.setItemAsync('invitado_token', result.access_token)
      await SecureStore.setItemAsync('invitado_refresh_token', result.refresh_token)

      // Verificar que se guardaron correctamente
      const savedToken = await SecureStore.getItemAsync('invitado_token')
      const savedRefreshToken = await SecureStore.getItemAsync('invitado_refresh_token')
      console.log('🔍 Tokens guardados verificados:', {
        tokenGuardado: !!savedToken,
        refreshTokenGuardado: !!savedRefreshToken,
        tokenLength: savedToken?.length || 0,
        refreshTokenLength: savedRefreshToken?.length || 0,
      })

      // TODO: remove - console.log('✅ Tokens guardados, estableciendo invitado...')
      setInvitado(result.invitado)
      // TODO: remove - console.log('✅ Invitado establecido:', result.invitado.email)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      // TODO: remove - console.error('❌ Error en login de invitado:', errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async (idToken: string) => {
    setLoading(true)
    try {
      // TODO: remove - console.log('🔐 Iniciando login con Google...')

      // Validar que el idToken no esté vacío
      if (!idToken || idToken.trim().length === 0) {
        const error = new Error('Token de Google no recibido')
        // TODO: remove - console.error('❌ Error en login con Google:', error.message)
        throw error
      }

      // TODO: remove - console.log('🔍 Token recibido (primeros 50 caracteres):', idToken.substring(0, 50) + '...')
      // TODO: remove - console.log('🔍 Longitud del token:', idToken.length)

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
            // TODO: remove - console.log('📱 Token de dispositivo obtenido para login con Google')
          }
        } catch (tokenError: unknown) {
          const errorMessage = tokenError instanceof Error ? tokenError.message : String(tokenError)

          // Manejar error de Firebase no inicializado
          if (errorMessage.includes('FirebaseApp') || errorMessage.includes('Firebase') || errorMessage.includes('FCM')) {
            console.warn('⚠️ Firebase no está configurado. Las notificaciones push no estarán disponibles.')
            console.warn('💡 Para habilitar notificaciones push, sigue la guía: https://docs.expo.dev/push-notifications/fcm-credentials/')
          } else {
            console.warn('⚠️ No se pudo obtener token de dispositivo:', errorMessage)
          }
        }
      }

      // TODO: remove - console.log('📤 Enviando datos al backend:', {
      // TODO: remove -   hasIdToken: !!idToken,
        idTokenLength: idToken.length,
        hasDeviceToken: !!deviceToken,
        platform,
        deviceId,
      })

      const result = await invitadoAuthApi.loginWithGoogle(idToken, deviceToken, platform, deviceId)
      // TODO: remove - console.log('✅ Login con Google exitoso, guardando tokens...')
      // TODO: remove - console.log('🔍 Verificando tokens recibidos:', {
      // TODO: remove -   hasAccessToken: !!result.access_token,
        hasRefreshToken: !!result.refresh_token,
        accessTokenLength: result.access_token?.length || 0,
        refreshTokenLength: result.refresh_token?.length || 0,
        invitadoEmail: result.invitado?.email,
      })

      // Guardar tokens de forma segura
      await SecureStore.setItemAsync('invitado_token', result.access_token)
      await SecureStore.setItemAsync('invitado_refresh_token', result.refresh_token)

      // Verificar que se guardaron correctamente
      const savedToken = await SecureStore.getItemAsync('invitado_token')
      const savedRefreshToken = await SecureStore.getItemAsync('invitado_refresh_token')
      console.log('🔍 Tokens guardados verificados:', {
        tokenGuardado: !!savedToken,
        refreshTokenGuardado: !!savedRefreshToken,
        tokenLength: savedToken?.length || 0,
        refreshTokenLength: savedRefreshToken?.length || 0,
      })

      // Establecer el invitado ANTES de setLoading(false) para que la navegación se actualice
      setInvitado(result.invitado)
      // TODO: remove - console.log('✅ Invitado establecido:', result.invitado.email)
      // TODO: remove - console.log('✅ Estado de autenticación actualizado, navegación debería actualizarse automáticamente')

      // Pequeño delay para asegurar que el estado se propague antes de continuar
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      // TODO: remove - console.error('❌ Error en login con Google:', errorMessage)

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

        // Log completo de la respuesta para debugging
        const responseData = axiosError.response?.data
        console.error('📡 Detalles del error HTTP:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: responseData,
          dataStringified: JSON.stringify(responseData, null, 2),
        })

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
          // TODO: remove - console.error('❌ Error 400 - Validación fallida:', backendMessage)
          throw detailedError
        }
      }

      // Limpiar tokens si hay error
      try {
        await SecureStore.deleteItemAsync('invitado_token')
        await SecureStore.deleteItemAsync('invitado_refresh_token')
      } catch (cleanupError) {
        // TODO: remove - console.error('⚠️ Error al limpiar tokens después de error:', cleanupError)
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
      // TODO: remove - console.error('Error en logout:', error)
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
      // TODO: remove - console.log('✅ Estado de invitado refrescado')
    } catch (error: unknown) {
      // TODO: remove - console.error('Error refrescando invitado:', error)
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

