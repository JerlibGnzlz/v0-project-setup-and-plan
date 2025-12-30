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
      // TODO: remove - console.log('🔐 Iniciando login con Google (Backend Proxy)...')
      // TODO: remove - console.log('🔍 Backend URL:', backendUrl)

      // Paso 1: Solicitar URL de autorización al backend
      // TODO: remove - console.log('📡 Solicitando URL de autorización al backend...')
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

      // TODO: remove - console.log('✅ URL de autorización obtenida')
      // TODO: remove - console.log('🔗 Abriendo navegador para autorización...')

      // Paso 2: Abrir URL de autorización en navegador
      // Usar esquema personalizado para capturar el callback del backend
      const redirectScheme = 'amva-app'
      const redirectUri = `${redirectScheme}://google-oauth-callback`

      // TODO: remove - console.log('🔗 Abriendo navegador con URL de autorización...')
      const result = await WebBrowser.openAuthSessionAsync(
        authorizeData.authorizationUrl,
        redirectUri
      )

      // TODO: remove - console.log('🔍 Resultado del navegador:', result.type)

      if (result.type === 'cancel' || result.type === 'dismiss') {
        // TODO: remove - console.log('ℹ️ Usuario canceló la autorización')
        const cancelError = new Error('SIGN_IN_CANCELLED')
        cancelError.name = 'GoogleSignInCancelled'
        throw cancelError
      }

      if (result.type === 'success' && result.url) {
        // TODO: remove - console.log('✅ URL de callback recibida:', result.url.substring(0, 100) + '...')
        
        // El backend redirige a: amva-app://google-oauth-callback?id_token=...&success=true
        try {
          // Parsear URL del esquema personalizado
          const urlString = result.url.replace(`${redirectScheme}://`, 'https://')
          const url = new URL(urlString)
          const idToken = url.searchParams.get('id_token')
          const success = url.searchParams.get('success')

          if (success === 'true' && idToken) {
            // TODO: remove - console.log('✅ id_token obtenido del backend proxy')
            return idToken
          }

          // Si hay error en la URL
          const error = url.searchParams.get('error')
          if (error) {
            throw new Error(`Error de Google OAuth: ${error}`)
          }

          throw new Error('No se recibió id_token en la respuesta del callback')
        } catch (urlError: unknown) {
          if (urlError instanceof Error && urlError.message.includes('Invalid URL')) {
            // Intentar parsear como URL relativa
            const idTokenMatch = result.url.match(/id_token=([^&]+)/)
            if (idTokenMatch && idTokenMatch[1]) {
              const decodedToken = decodeURIComponent(idTokenMatch[1])
              // TODO: remove - console.log('✅ id_token obtenido del backend proxy (parsing alternativo)')
              return decodedToken
            }
          }
          throw urlError
        }
      }

      throw new Error(`Respuesta inesperada del navegador: ${result.type}`)
    } catch (err: unknown) {
      // Manejar cancelación
      if (err instanceof Error && (err.name === 'GoogleSignInCancelled' || err.message === 'SIGN_IN_CANCELLED')) {
        // TODO: remove - console.log('ℹ️ Usuario canceló el inicio de sesión')
        setError(null)
        setLoading(false)
        throw err
      }

      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      // TODO: remove - console.error('❌ Error en signIn con Google (Backend Proxy):', errorMessage)
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

