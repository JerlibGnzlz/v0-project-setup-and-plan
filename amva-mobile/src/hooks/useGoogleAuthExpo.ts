/**
 * Hook alternativo para Google Sign-In usando expo-auth-session
 * No requiere SHA-1 configurado en Google Cloud Console
 * Funciona con Web Client ID directamente
 */

import { useState, useCallback } from 'react'
import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import Constants from 'expo-constants'
import * as Crypto from 'expo-crypto'

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

      // Generar nonce aleatorio (requerido por Google para ResponseType.IdToken)
      // El nonce es un valor aleatorio que se usa para prevenir ataques de replay
      const nonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${Date.now()}-${Math.random()}`,
        { encoding: Crypto.CryptoEncoding.BASE64URL }
      )

      console.log('🔍 Nonce generado para IdToken')

      // Configurar la solicitud de autenticación
      // Usar ResponseType.IdToken con nonce manual (Google lo requiere)
      const request = new AuthSession.AuthRequest({
        clientId,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.IdToken,
        redirectUri,
        usePKCE: false,
        // Agregar nonce manualmente (Google lo requiere para IdToken)
        extraParams: {
          nonce: nonce,
        },
      })

      // Configurar discovery para Google
      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
        revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
      }

      console.log('🔍 Iniciando flujo OAuth con IdToken + nonce manual...')

      // Iniciar el flujo de autenticación
      // Usar proxy de Expo - maneja el nonce automáticamente para IdToken
      const result = await request.promptAsync(discovery, {
        useProxy: true,
      })

      if (result.type === 'success') {
        console.log('✅ Respuesta exitosa del proxy de Expo')
        console.log('🔍 Parámetros recibidos:', Object.keys(result.params))

        // Con ResponseType.IdToken y proxy de Expo, deberíamos recibir id_token directamente
        const { id_token } = result.params

        if (id_token && typeof id_token === 'string') {
          console.log('✅ id_token recibido directamente del proxy')
          console.log('🔍 Token recibido (primeros 50 caracteres):', id_token.substring(0, 50) + '...')
          return id_token
        }

        // Si no hay id_token, verificar otros parámetros
        const { code, access_token, error } = result.params

        if (error) {
          throw new Error(`Error en respuesta OAuth: ${error}`)
        }

        if (code) {
          throw new Error('Se recibió código pero se esperaba id_token. Verifica la configuración de ResponseType.')
        }

        if (access_token) {
          throw new Error('Se recibió access_token pero el backend requiere id_token. Verifica la configuración de OAuth.')
        }

        throw new Error('No se recibió id_token en la respuesta del proxy de Expo')
      }

      if (result.type === 'cancel' || result.type === 'dismiss') {
        // Verificar si hay un error en los parámetros que indique un problema real
        const errorParams = result.params as { error?: string; error_description?: string }
        if (errorParams.error) {
          console.error('❌ Error en respuesta OAuth:', errorParams.error, errorParams.error_description)
          throw new Error(`Error OAuth: ${errorParams.error} - ${errorParams.error_description || ''}`)
        }
        
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
        console.error('❌ Parámetros completos:', result.params)

        // Mensaje más descriptivo para errores comunes
        let userFriendlyMessage = errorDescription

        if (errorCode === 'access_denied') {
          userFriendlyMessage = 'Acceso denegado. Verifica que el OAuth Consent Screen esté publicado en Google Cloud Console.'
        } else if (errorCode === 'redirect_uri_mismatch') {
          userFriendlyMessage = `Redirect URI no autorizado.\n\nAgrega este URI en Google Cloud Console:\n${redirectUri}\n\nConsulta docs/SOLUCION_ACCESS_BLOCKED_OAUTH.md`
        } else if (errorCode === 'invalid_client') {
          userFriendlyMessage = 'Client ID inválido. Verifica que el Google Client ID esté configurado correctamente.'
        } else if (errorCode === 'invalid_request') {
          userFriendlyMessage = `Solicitud inválida: ${errorDescription}\n\nVerifica que:\n1. El redirect URI esté agregado en Google Cloud Console\n2. El OAuth Consent Screen esté publicado\n3. Los scopes sean correctos`
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

