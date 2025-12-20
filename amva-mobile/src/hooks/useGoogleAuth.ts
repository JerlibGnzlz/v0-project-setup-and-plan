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
        GoogleSignin.configure({
          webClientId: googleClientId, // Mismo que en backend (GOOGLE_CLIENT_ID)
          offlineAccess: true, // Permite obtener refresh token
          forceCodeForRefreshToken: true, // Fuerza código para refresh token
          iosClientId: Platform.OS === 'ios' ? googleClientId : undefined, // iOS Client ID si es diferente
        })

        console.log('✅ Google Sign-In configurado correctamente')
        setError(null)
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

      // Verificar que Google Play Services esté disponible (solo Android)
      if (Platform.OS === 'android') {
        try {
          const hasPlayServices = await GoogleSignin.hasPlayServices({
            showPlayServicesUpdateDialog: true,
          })
          if (!hasPlayServices) {
            throw new Error('Google Play Services no está disponible')
          }
        } catch (playServicesError: unknown) {
          const errorMessage =
            playServicesError instanceof Error
              ? playServicesError.message
              : 'Error verificando Google Play Services'
          console.error('❌ Error con Google Play Services:', errorMessage)
          throw new Error(`Google Play Services: ${errorMessage}`)
        }
      }

      // Pequeño delay para asegurar que la actividad esté lista (solo Android)
      // Esto ayuda a evitar el error "activity is null"
      if (Platform.OS === 'android') {
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      // Verificar que no haya una sesión en progreso
      try {
        const isSignedIn = await GoogleSignin.isSignedIn()
        if (isSignedIn) {
          // Si ya hay una sesión, obtener el usuario actual
          const currentUser = await GoogleSignin.getCurrentUser()
          if (currentUser?.data?.idToken) {
            console.log('✅ Usuario ya autenticado con Google')
            return currentUser.data.idToken
          }
        }
      } catch (checkError) {
        // Continuar con el flujo normal si hay error al verificar
        console.log('ℹ️ Verificando sesión existente...')
      }

      // Iniciar sesión
      const userInfo = await GoogleSignin.signIn()

      if (!userInfo.data?.idToken) {
        throw new Error('No se recibió el token de Google')
      }

      console.log('✅ Login con Google exitoso')
      console.log('🔍 Usuario:', userInfo.data.user.email)
      console.log('🔍 Token recibido (primeros 50 caracteres):', userInfo.data.idToken.substring(0, 50) + '...')

      return userInfo.data.idToken
    } catch (err: unknown) {
      // Verificar si el usuario canceló el inicio de sesión
      if (err && typeof err === 'object' && 'code' in err) {
        const googleError = err as { code: string; message?: string }

        if (googleError.code === statusCodes.SIGN_IN_CANCELLED) {
          console.log('ℹ️ Usuario canceló el inicio de sesión con Google')
          setError(null) // Limpiar error
          // Crear un error especial para identificar cancelación
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
          default:
            errorMessage = googleError.message || `Error desconocido: ${googleError.code}`
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
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

