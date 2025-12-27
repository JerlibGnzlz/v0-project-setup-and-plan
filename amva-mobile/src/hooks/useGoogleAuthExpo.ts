/**
 * Hook alternativo para Google Sign-In usando expo-auth-session
 * No requiere SHA-1 configurado en Google Cloud Console
 * Funciona con Web Client ID directamente
 */

import { useState, useCallback } from 'react'
import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import Constants from 'expo-constants'

// Completar la sesión de autenticación en el navegador
WebBrowser.maybeCompleteAuthSession()

interface UseGoogleAuthExpoReturn {
  signIn: () => Promise<string> // Retorna idToken
  signOut: () => Promise<void>
  loading: boolean
  error: string | null
}

export function useGoogleAuthExpo(): UseGoogleAuthExpoReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Obtener Google Client ID desde diferentes fuentes
  const getGoogleClientId = (): string => {
    const googleClientId =
      Constants?.expoConfig?.extra?.googleClientId ||
      Constants?.manifest?.extra?.googleClientId ||
      process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
      ''

    return googleClientId
  }

  /**
   * Iniciar sesión con Google usando expo-auth-session
   * @returns idToken de Google para enviar al backend
   */
  const signIn = useCallback(async (): Promise<string> => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔐 Iniciando sesión con Google (expo-auth-session)...')

      const clientId = getGoogleClientId()

      if (!clientId || !clientId.includes('.apps.googleusercontent.com')) {
        throw new Error('Google Client ID no está configurado correctamente')
      }

      // Generar redirect URI (usar scheme personalizado para producción)
      // En producción, NO usar proxy para evitar problemas con Play Store
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'amva-app', // Debe coincidir con el scheme en app.json
        useProxy: false, // NO usar proxy en producción (más confiable para Play Store)
      })

      console.log('🔍 Redirect URI generado:', redirectUri)
      console.log('🔍 Client ID:', clientId)

      // Configurar la solicitud de autenticación
      const request = new AuthSession.AuthRequest({
        clientId,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.IdToken,
        redirectUri,
      })

      // Configurar discovery para Google
      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
        revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
      }

      // Iniciar el flujo de autenticación
      const result = await request.promptAsync(discovery, {
        useProxy: true,
      })

      if (result.type === 'success') {
        const { id_token } = result.params

        if (id_token && typeof id_token === 'string') {
          console.log('✅ Login con Google exitoso (expo-auth-session)')
          console.log('🔍 Token recibido (primeros 50 caracteres):', id_token.substring(0, 50) + '...')
          return id_token
        }

        throw new Error('No se recibió id_token en la respuesta')
      }

      if (result.type === 'cancel') {
        console.log('ℹ️ Usuario canceló el inicio de sesión con Google')
        const cancelError = new Error('SIGN_IN_CANCELLED')
        cancelError.name = 'GoogleSignInCancelled'
        throw cancelError
      }

      // Manejar errores específicos de OAuth
      if (result.type === 'error') {
        const errorParams = result.params as { error?: string; error_description?: string }
        const errorCode = errorParams.error || 'unknown_error'
        const errorDescription = errorParams.error_description || 'Error desconocido'

        console.error('❌ Error en OAuth:', errorCode, errorDescription)

        // Mensaje más descriptivo para errores comunes
        let userFriendlyMessage = errorDescription

        if (errorCode === 'access_denied') {
          userFriendlyMessage = 'Acceso denegado. Verifica que el OAuth Consent Screen esté publicado en Google Cloud Console.'
        } else if (errorCode === 'redirect_uri_mismatch') {
          const redirectUri = AuthSession.makeRedirectUri({ scheme: 'amva-app', useProxy: true })
          userFriendlyMessage = `Redirect URI no autorizado.\n\nAgrega este URI en Google Cloud Console:\n${redirectUri}\n\nConsulta docs/SOLUCION_ACCESS_BLOCKED_OAUTH.md`
        } else if (errorCode === 'invalid_client') {
          userFriendlyMessage = 'Client ID inválido. Verifica que el Google Client ID esté configurado correctamente.'
        }

        const oauthError = new Error(`OAUTH_ERROR: ${errorCode} - ${userFriendlyMessage}`)
        oauthError.name = 'GoogleOAuthError'
        throw oauthError
      }

      throw new Error(`Error en autenticación: ${result.type}`)
    } catch (err: unknown) {
      // Verificar si es cancelación
      if (err instanceof Error && (err.name === 'GoogleSignInCancelled' || err.message === 'SIGN_IN_CANCELLED')) {
        console.log('ℹ️ Usuario canceló el inicio de sesión')
        setError(null)
        setLoading(false)
        const cancelError = new Error('SIGN_IN_CANCELLED')
        cancelError.name = 'GoogleSignInCancelled'
        throw cancelError
      }

      // Manejar errores de OAuth específicamente
      if (err instanceof Error && err.name === 'GoogleOAuthError') {
        const errorMessage = err.message
        console.error('❌ Error OAuth:', errorMessage)
        setError(errorMessage)
        throw err
      }

      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      console.error('❌ Error en signIn con Google (expo-auth-session):', errorMessage)
      
      // Si el error contiene "Access blocked" o "Authorization Error", proporcionar ayuda
      if (errorMessage.toLowerCase().includes('access blocked') || errorMessage.toLowerCase().includes('authorization error')) {
        const redirectUri = AuthSession.makeRedirectUri({ scheme: 'amva-app', useProxy: true })
        const helpfulMessage = `Error de autorización bloqueado.\n\nPosibles causas:\n1. Redirect URI no autorizado\n2. OAuth Consent Screen no publicado\n3. App no verificada\n\nRedirect URI requerido:\n${redirectUri}\n\nConsulta docs/SOLUCION_ACCESS_BLOCKED_OAUTH.md`
        setError(helpfulMessage)
        throw new Error(helpfulMessage)
      }

      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Cerrar sesión de Google
   * Nota: expo-auth-session no mantiene sesión, así que esto es principalmente para limpiar estado local
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      // expo-auth-session no mantiene sesión persistente, así que solo limpiamos el estado
      console.log('✅ Sesión de Google cerrada (expo-auth-session)')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      console.error('❌ Error al cerrar sesión de Google:', errorMessage)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    signIn,
    signOut,
    loading,
    error,
  }
}

