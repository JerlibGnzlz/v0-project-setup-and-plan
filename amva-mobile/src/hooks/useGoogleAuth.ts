/**
 * Hook nativo para Google Sign-In usando @react-native-google-signin/google-signin
 * Reemplaza expo-auth-session para mejor rendimiento y UX nativa
 */

import { useEffect, useState, useCallback } from 'react'
import { Platform, Alert } from 'react-native'
import { GoogleSignin, statusCodes, type User } from '@react-native-google-signin/google-signin'
import Constants from 'expo-constants'

interface UseGoogleAuthReturn {
  signIn: () => Promise<string> // Retorna idToken
  signOut: () => Promise<void>
  getCurrentUser: () => Promise<User | null>
  isSignedIn: () => Promise<boolean>
  loading: boolean
  error: string | null
}

export function useGoogleAuth(): UseGoogleAuthReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConfigured, setIsConfigured] = useState(false)

  // Obtener Google Client ID desde diferentes fuentes
  const getGoogleClientId = (): string => {
    // Para Android, usar el Client ID específico de Android si está disponible
    if (Platform.OS === 'android') {
      const androidClientId =
        Constants?.expoConfig?.extra?.googleAndroidClientId ||
        Constants?.manifest?.extra?.googleAndroidClientId ||
        ''
      if (androidClientId && androidClientId.includes('.apps.googleusercontent.com')) {
        return androidClientId
      }
    }
    
    // Fallback al Client ID general
    const googleClientIdFromEnv = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || ''
    const googleClientIdFromConfig =
      Constants?.expoConfig?.extra?.googleClientId ||
      Constants?.manifest?.extra?.googleClientId ||
      ''

    return googleClientIdFromEnv || googleClientIdFromConfig
  }

  // Configurar Google Sign-In al montar el componente
  useEffect(() => {
    const configureGoogleSignIn = async () => {
      try {
        const googleClientId = getGoogleClientId()

        if (!googleClientId || !googleClientId.includes('.apps.googleusercontent.com')) {
          console.warn('⚠️ Google Client ID no está configurado correctamente')
          setError('Google Client ID no configurado')
          return
        }

        // Configurar Google Sign-In
        // Para Android, usar el webClientId (que debe ser el Client ID de Android con SHA-1 configurado)
        // Para iOS, usar iosClientId si está disponible
        GoogleSignin.configure({
          webClientId: googleClientId, // Para Android: debe ser el Client ID de Android con SHA-1. Para iOS: Client ID de iOS
          offlineAccess: true, // Permite obtener refresh token
          forceCodeForRefreshToken: true, // Fuerza código para refresh token
          iosClientId: Platform.OS === 'ios' ? googleClientId : undefined, // iOS Client ID si es diferente
        })
        
        console.log('🔍 Google Sign-In configurado con:', {
          platform: Platform.OS,
          clientId: googleClientId.substring(0, 30) + '...',
        })

        console.log('✅ Google Sign-In configurado correctamente')
        setError(null) // Limpiar cualquier error previo
        setIsConfigured(true)
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        console.error('❌ Error configurando Google Sign-In:', errorMessage)
        setError(errorMessage)
      }
    }

    void configureGoogleSignIn()
  }, [])

  /**
   * Iniciar sesión con Google
   * @returns idToken de Google para enviar al backend
   */
  const signIn = useCallback(async (): Promise<string> => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔐 Iniciando sesión con Google (nativo)...')

      // Verificar que Google Sign-In esté configurado
      if (!isConfigured) {
        // Intentar reconfigurar si no está configurado
        const googleClientId = getGoogleClientId()
        if (googleClientId && googleClientId.includes('.apps.googleusercontent.com')) {
          GoogleSignin.configure({
            webClientId: googleClientId,
            offlineAccess: true,
            forceCodeForRefreshToken: true,
            iosClientId: Platform.OS === 'ios' ? googleClientId : undefined,
          })
          setIsConfigured(true)
          // Esperar un momento para que la configuración se aplique
          await new Promise(resolve => setTimeout(resolve, 100))
        } else {
          throw new Error('Google Sign-In no está configurado correctamente')
        }
      }

      // Iniciar sesión directamente
      // Google Sign-In manejará internamente la verificación de Play Services si es necesario
      const userInfo = await GoogleSignin.signIn()

      // Verificar si el usuario canceló (userInfo puede ser null o no tener data)
      if (!userInfo || !userInfo.data) {
        console.log('ℹ️ Usuario canceló el inicio de sesión con Google (sin datos)')
        setError(null)
        setLoading(false)
        const cancelError = new Error('SIGN_IN_CANCELLED')
        cancelError.name = 'GoogleSignInCancelled'
        throw cancelError
      }

      // Verificar si hay token
      if (!userInfo.data.idToken) {
        // Si no hay token, probablemente fue cancelación
        console.log('ℹ️ Usuario canceló el inicio de sesión con Google (sin token)')
        setError(null)
        setLoading(false)
        const cancelError = new Error('SIGN_IN_CANCELLED')
        cancelError.name = 'GoogleSignInCancelled'
        throw cancelError
      }

      console.log('✅ Login con Google exitoso')
      console.log('🔍 Usuario:', userInfo.data.user.email)
      console.log('🔍 Token recibido (primeros 50 caracteres):', userInfo.data.idToken.substring(0, 50) + '...')

      return userInfo.data.idToken
    } catch (err: unknown) {
      // PRIMERO: Verificar si el usuario canceló el inicio de sesión
      // Verificar por código de error
      if (err && typeof err === 'object' && 'code' in err) {
        const googleError = err as { code: string; message?: string }

        if (
          googleError.code === statusCodes.SIGN_IN_CANCELLED ||
          googleError.code === '12500' || // Código de cancelación en Android
          String(googleError.code) === String(statusCodes.SIGN_IN_CANCELLED)
        ) {
          console.log('ℹ️ Usuario canceló el inicio de sesión con Google (código:', googleError.code, ')')
          setError(null) // Limpiar error
          setLoading(false) // Asegurar que el loading se detenga
          // Crear un error especial para identificar cancelación
          const cancelError = new Error('SIGN_IN_CANCELLED')
          cancelError.name = 'GoogleSignInCancelled'
          throw cancelError
        }
      }
      
      // Verificar por nombre del error
      if (err instanceof Error) {
        // Verificar por nombre
        if (err.name === 'GoogleSignInCancelled' || err.message === 'SIGN_IN_CANCELLED') {
          console.log('ℹ️ Usuario canceló el inicio de sesión con Google')
          setError(null)
          setLoading(false)
          const cancelError = new Error('SIGN_IN_CANCELLED')
          cancelError.name = 'GoogleSignInCancelled'
          throw cancelError
        }
        
        // Verificar por mensaje de error
        const errorMessage = err.message.toLowerCase()
        if (
          errorMessage.includes('cancel') ||
          errorMessage.includes('cancelled') ||
          errorMessage.includes('cancelado') ||
          errorMessage.includes('user_cancelled') ||
          (errorMessage.includes('no se recibió el token') && errorMessage.includes('cancel'))
        ) {
          console.log('ℹ️ Usuario canceló el inicio de sesión con Google (mensaje:', err.message, ')')
          setError(null)
          setLoading(false)
          const cancelError = new Error('SIGN_IN_CANCELLED')
          cancelError.name = 'GoogleSignInCancelled'
          throw cancelError
        }
      }

      let errorMessage = 'No se pudo iniciar sesión con Google.'

      if (err && typeof err === 'object' && 'code' in err) {
        const googleError = err as { code: string; message?: string }

        switch (googleError.code) {
          case statusCodes.IN_PROGRESS:
            errorMessage = 'Ya hay una operación de inicio de sesión en progreso'
            break
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            errorMessage = 'Google Play Services no está disponible. Por favor, actualiza Google Play Services.'
            break
          case statusCodes.SIGN_IN_REQUIRED:
            errorMessage = 'Se requiere iniciar sesión'
            break
          case '10': // DEVELOPER_ERROR
            errorMessage = 'DEVELOPER_ERROR: Verifica que el SHA-1 esté configurado en Google Cloud Console. Consulta la documentación para más detalles.'
            break
          default:
            // Si el mensaje contiene DEVELOPER_ERROR, proporcionar ayuda específica
            if (googleError.message?.includes('DEVELOPER_ERROR') || googleError.code === '10') {
              errorMessage = 'DEVELOPER_ERROR: El SHA-1 del keystore no está configurado en Google Cloud Console. Consulta docs/FIX_GOOGLE_SIGNIN_EMULADOR.md para resolverlo.'
            } else {
              errorMessage = googleError.message || `Error desconocido: ${googleError.code}`
            }
        }
      } else if (err instanceof Error) {
        // Verificar si el mensaje contiene DEVELOPER_ERROR
        if (err.message.includes('DEVELOPER_ERROR')) {
          errorMessage = 'DEVELOPER_ERROR: El SHA-1 del keystore no está configurado en Google Cloud Console. Consulta docs/FIX_GOOGLE_SIGNIN_EMULADOR.md para resolverlo.'
        } else {
          errorMessage = err.message
        }
      }

      console.error('❌ Error en signIn con Google:', errorMessage)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [isConfigured])

  /**
   * Cerrar sesión de Google
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      await GoogleSignin.signOut()
      console.log('✅ Sesión de Google cerrada')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      console.error('❌ Error al cerrar sesión de Google:', errorMessage)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Obtener usuario actual de Google
   */
  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    try {
      const userInfo = await GoogleSignin.getCurrentUser()
      return userInfo
    } catch (err: unknown) {
      console.error('❌ Error obteniendo usuario actual:', err)
      return null
    }
  }, [])

  /**
   * Verificar si el usuario está autenticado con Google
   */
  const isSignedIn = useCallback(async (): Promise<boolean> => {
    try {
      return await GoogleSignin.isSignedIn()
    } catch (err: unknown) {
      console.error('❌ Error verificando estado de sesión:', err)
      return false
    }
  }, [])

  return {
    signIn,
    signOut,
    getCurrentUser,
    isSignedIn,
    loading,
    error,
  }
}

