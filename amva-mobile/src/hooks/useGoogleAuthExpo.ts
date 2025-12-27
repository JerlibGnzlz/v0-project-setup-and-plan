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

      // Generar redirect URI (usar proxy de Expo para compatibilidad con Google Cloud Console)
      // Google Cloud Console solo acepta URIs con dominio (https://), no schemes personalizados
      // Forzar el uso del proxy de Expo explícitamente
      const owner = Constants?.expoConfig?.owner || 'jerlibgnzlz'
      const slug = Constants?.expoConfig?.slug || 'amva-movil'
      const redirectUri = `https://auth.expo.io/@${owner}/${slug}`
      
      console.log('🔍 Redirect URI forzado (proxy de Expo):', redirectUri)

      console.log('🔍 Redirect URI generado:', redirectUri)
      console.log('🔍 Client ID:', clientId)

      // Configurar la solicitud de autenticación
      // Cuando usamos proxy de Expo, podemos usar ResponseType.IdToken directamente
      // El proxy maneja el intercambio automáticamente
      const request = new AuthSession.AuthRequest({
        clientId,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.IdToken,
        redirectUri,
        // Con proxy de Expo, no necesitamos PKCE para IdToken
        usePKCE: false,
      })

      // Configurar discovery para Google
      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
        revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
      }

      console.log('🔍 Iniciando flujo OAuth con proxy de Expo...')

      // Iniciar el flujo de autenticación
      // Usar proxy de Expo - maneja el intercambio automáticamente
      const result = await request.promptAsync(discovery, {
        useProxy: true,
      })

      if (result.type === 'success') {
        // Con proxy de Expo y ResponseType.IdToken, obtenemos el id_token directamente
        const { id_token } = result.params

        if (id_token && typeof id_token === 'string') {
          console.log('✅ Login con Google exitoso (expo-auth-session)')
          console.log('🔍 Token recibido (primeros 50 caracteres):', id_token.substring(0, 50) + '...')
          return id_token
        }

        // Si no hay id_token, intentar obtener access_token y luego id_token
        const { access_token } = result.params
        if (access_token && typeof access_token === 'string') {
          console.log('✅ Access token recibido, obteniendo información del usuario...')
          // Con access_token podemos obtener información del usuario
          // Pero necesitamos id_token para el backend, así que intentamos obtenerlo
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          })
          
          if (userInfoResponse.ok) {
            const userInfo = await userInfoResponse.json()
            console.log('✅ Información del usuario obtenida:', userInfo.email)
            // Nota: El backend necesita id_token, no access_token
            // En este caso, podríamos necesitar usar el método alternativo
            throw new Error('Se recibió access_token pero no id_token. El backend requiere id_token.')
          }
        }

        throw new Error('No se recibió id_token en la respuesta del proxy de Expo')
      }

      if (result.type === 'cancel' || result.type === 'dismiss') {
        console.log('ℹ️ Usuario canceló o cerró el inicio de sesión con Google')
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

      // Manejar tipo "dismiss" (usuario cerró el navegador)
      if (result.type === 'dismiss') {
        console.log('ℹ️ Usuario cerró el navegador durante la autenticación')
        const cancelError = new Error('SIGN_IN_CANCELLED')
        cancelError.name = 'GoogleSignInCancelled'
        throw cancelError
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

