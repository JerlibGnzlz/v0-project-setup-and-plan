/**
 * Hook para Google Sign-In usando Backend Proxy
 * El backend maneja todo el flujo OAuth, el móvil solo recibe el id_token final
 * NO requiere SHA-1 configurado en Google Cloud Console
 */

import { useState, useCallback } from 'react'
import { Linking, Platform } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import Constants from 'expo-constants'
import { invitadoAuthApi } from '@api/invitado-auth'

// Completar la sesión de autenticación en el navegador
WebBrowser.maybeCompleteAuthSession()

interface UseGoogleAuthProxyReturn {
  signIn: () => Promise<string> // Retorna idToken
  loading: boolean
  error: string | null
}

interface GoogleOAuthAuthorizeResponse {
  authorizationUrl: string
  state: string
}

interface GoogleOAuthTokenResponse {
  success: boolean
  id_token: string
  access_token?: string
  expires_in?: number
}

export function useGoogleAuthProxy(): UseGoogleAuthProxyReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Obtener URL base del backend
  const getBackendUrl = (): string => {
    return (
      Constants?.expoConfig?.extra?.apiUrl ||
      Constants?.manifest?.extra?.apiUrl ||
      process.env.EXPO_PUBLIC_API_URL ||
      'https://ministerio-backend-wdbj.onrender.com/api'
    )
  }

  const signIn = useCallback(async (): Promise<string> => {
    setLoading(true)
    setError(null)

    try {
      const backendUrl = getBackendUrl()
      console.log('🔐 Iniciando login con Google (Backend Proxy)...')
      console.log('🔍 Backend URL:', backendUrl)

      // Paso 1: Solicitar URL de autorización al backend
      console.log('📡 Solicitando URL de autorización al backend...')
      const authorizeResponse = await fetch(`${backendUrl}/auth/invitado/google/authorize`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!authorizeResponse.ok) {
        const errorText = await authorizeResponse.text()
        throw new Error(`Error al obtener URL de autorización: ${authorizeResponse.status} - ${errorText}`)
      }

      const authorizeData = (await authorizeResponse.json()) as GoogleOAuthAuthorizeResponse

      if (!authorizeData.authorizationUrl) {
        throw new Error('No se recibió URL de autorización del backend')
      }

      console.log('✅ URL de autorización obtenida')
      console.log('🔗 Abriendo navegador para autorización...')

      // Paso 2: Abrir URL de autorización en navegador
      // El backend manejará el callback y retornará el id_token
      const result = await WebBrowser.openAuthSessionAsync(
        authorizeData.authorizationUrl,
        `${backendUrl}/auth/invitado/google/callback-proxy`
      )

      console.log('🔍 Resultado del navegador:', result.type)

      if (result.type === 'cancel' || result.type === 'dismiss') {
        console.log('ℹ️ Usuario canceló la autorización')
        const cancelError = new Error('SIGN_IN_CANCELLED')
        cancelError.name = 'GoogleSignInCancelled'
        throw cancelError
      }

      if (result.type === 'success' && result.url) {
        // El backend debería haber retornado el id_token en la URL o en el response
        // Pero como usamos WebBrowser, necesitamos extraerlo de la URL de callback
        const url = new URL(result.url)
        const code = url.searchParams.get('code')

        if (code) {
          console.log('✅ Código recibido, el backend debería haber intercambiado por id_token')
          // El backend ya intercambió el código, pero necesitamos obtener el id_token
          // Hacemos una segunda llamada para obtener el token del callback
          const callbackResponse = await fetch(result.url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (!callbackResponse.ok) {
            const errorText = await callbackResponse.text()
            throw new Error(`Error en callback: ${callbackResponse.status} - ${errorText}`)
          }

          const tokenData = (await callbackResponse.json()) as GoogleOAuthTokenResponse

          if (!tokenData.success || !tokenData.id_token) {
            throw new Error('No se recibió id_token del backend')
          }

          console.log('✅ id_token obtenido del backend proxy')
          return tokenData.id_token
        }

        // Si no hay código, verificar si hay id_token directamente en la URL
        const idToken = url.searchParams.get('id_token')
        if (idToken) {
          console.log('✅ id_token obtenido directamente de la URL')
          return idToken
        }

        throw new Error('No se recibió código ni id_token en la respuesta')
      }

      throw new Error(`Respuesta inesperada del navegador: ${result.type}`)
    } catch (err: unknown) {
      // Manejar cancelación
      if (err instanceof Error && (err.name === 'GoogleSignInCancelled' || err.message === 'SIGN_IN_CANCELLED')) {
        console.log('ℹ️ Usuario canceló el inicio de sesión')
        setError(null)
        setLoading(false)
        throw err
      }

      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      console.error('❌ Error en signIn con Google (Backend Proxy):', errorMessage)
      setError(errorMessage)
      setLoading(false)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    signIn,
    loading,
    error,
  }
}

