import { useEffect, useRef, useState, useCallback } from 'react'
import { Platform, Alert } from 'react-native'
import Constants from 'expo-constants'
import * as SecureStore from 'expo-secure-store'
import { useAuth } from './useAuth'
import { useInvitadoAuth } from './useInvitadoAuth'
import { apiClient } from '@api/client'
import { useNavigation } from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'

// Detectar si estamos en Expo Go
const isExpoGo = Constants.executionEnvironment === 'storeClient'

// Importación condicional para evitar errores en Expo Go
let Notifications: any = null
if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications')
    // Configurar cómo se manejan las notificaciones cuando la app está en primer plano
    if (Notifications && Notifications.setNotificationHandler) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      })
    }
  } catch (error) {
    // Silenciar error si no está disponible
  }
}

export function useNotifications() {
  const { pastor } = useAuth()
  const { invitado } = useInvitadoAuth()
  const navigation = useNavigation<BottomTabNavigationProp<any>>()
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
  const notificationListener = useRef<any>(null)
  const responseListener = useRef<any>(null)

  // Función para manejar la navegación según el tipo de notificación
  const handleNotificationNavigation = useCallback((data: Record<string, unknown>) => {
    try {
      const type = data.type as string
      
      if (type === 'pago_validado') {
        navigation.navigate('Convenciones')
      } else if (type === 'pago_rechazado') {
        navigation.navigate('Convenciones')
      } else if (type === 'pago_rehabilitado') {
        navigation.navigate('Convenciones')
      } else if (type === 'inscripcion_confirmada') {
        navigation.navigate('Convenciones')
      }
    } catch (error) {
      console.error('Error navegando desde notificación:', error)
    }
  }, [navigation])

  useEffect(() => {
    // No intentar usar notificaciones en Expo Go
    if (isExpoGo) {
      return
    }

    if (!Notifications) {
      return
    }

    // Registrar para obtener el token de push
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token)
        // Registrar token en el backend si hay un usuario autenticado
        // Esperar un momento para asegurar que la autenticación esté lista
        setTimeout(() => {
          if (pastor?.email) {
            registerTokenInBackend(token, pastor.email, 'pastor')
          } else if (invitado?.email) {
            registerTokenInBackend(token, invitado.email, 'invitado')
          }
        }, 1000) // Esperar 1 segundo para que la autenticación esté lista
      }
    })

    // Listener para notificaciones recibidas mientras la app está en primer plano
    if (Notifications.addNotificationReceivedListener) {
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('📬 Notificación recibida:', notification)
        
        // Mostrar alerta cuando se recibe una notificación
        const title = notification.request.content.title || 'Nueva notificación'
        const body = notification.request.content.body || ''
        const data = notification.request.content.data || {}
        
        // Mostrar alerta solo si la app está en primer plano
        Alert.alert(title, body, [
          {
            text: 'Ver',
            onPress: () => {
              // Navegar según el tipo de notificación
              handleNotificationNavigation(data)
            },
          },
          { text: 'Cerrar', style: 'cancel' },
        ])
      })
    }

    // Listener para cuando el usuario toca una notificación
    if (Notifications.addNotificationResponseReceivedListener) {
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('👆 Usuario tocó la notificación:', response)
        
        const data = response.notification.request.content.data || {}
        handleNotificationNavigation(data)
      })
    }

    return () => {
      if (notificationListener.current && Notifications) {
        try {
          if (typeof Notifications.removeNotificationSubscription === 'function') {
            Notifications.removeNotificationSubscription(notificationListener.current)
          }
        } catch (error) {
          console.warn('Error removiendo listener de notificaciones:', error)
        }
      }
      if (responseListener.current && Notifications) {
        try {
          if (typeof Notifications.removeNotificationSubscription === 'function') {
            Notifications.removeNotificationSubscription(responseListener.current)
          }
        } catch (error) {
          console.warn('Error removiendo listener de respuesta:', error)
        }
      }
    }
  }, [pastor?.email, invitado?.email, handleNotificationNavigation])

  // Registrar token cuando el usuario cambia (con delay para asegurar autenticación)
  useEffect(() => {
    if (expoPushToken) {
      const timeoutId = setTimeout(() => {
        if (pastor?.email) {
          registerTokenInBackend(expoPushToken, pastor.email, 'pastor')
        } else if (invitado?.email) {
          registerTokenInBackend(expoPushToken, invitado.email, 'invitado')
        }
      }, 500) // Pequeño delay para asegurar que el token de autenticación esté disponible
      
      return () => clearTimeout(timeoutId)
    }
  }, [expoPushToken, pastor?.email, invitado?.email])

  return { expoPushToken }
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  // No intentar registrar en Expo Go
  if (isExpoGo) {
    return null
  }

  if (!Notifications) {
    return null
  }

  let token: string | null = null

  try {
    if (Platform.OS === 'android' && Notifications.setNotificationChannelAsync) {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#22c55e',
      })
    }

    if (!Notifications.getPermissionsAsync || !Notifications.requestPermissionsAsync) {
      console.warn('⚠️ Métodos de permisos no disponibles')
      return null
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      console.log('⚠️ Permisos de notificación no otorgados')
      return null
    }

    if (!Notifications.getExpoPushTokenAsync) {
      console.warn('⚠️ getExpoPushTokenAsync no disponible')
      return null
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Constants?.expoConfig?.extra?.eas?.projectId || '89b63cb9-113c-4901-bfb6-c1622478bc56',
    })
    token = tokenData.data
    console.log('✅ Token de notificación obtenido:', token)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    // Silenciar errores relacionados con Expo Go
    if (errorMessage.includes('Expo Go') || errorMessage.includes('development build')) {
      return null
    }
    
    // Manejar error de Firebase no inicializado
    if (errorMessage.includes('FirebaseApp') || errorMessage.includes('Firebase') || errorMessage.includes('FCM')) {
      console.warn('⚠️ Firebase no está configurado. Las notificaciones push no estarán disponibles.')
      console.warn('💡 Para habilitar notificaciones push, sigue la guía: https://docs.expo.dev/push-notifications/fcm-credentials/')
      return null
    }
    
    // Otros errores
    console.error('❌ Error obteniendo token de notificación:', errorMessage)
  }

  return token
}

async function registerTokenInBackend(token: string, email: string, userType: 'pastor' | 'invitado') {
  try {
    // Verificar que hay un token de autenticación disponible
    const authToken = await SecureStore.getItemAsync(
      userType === 'invitado' ? 'invitado_token' : 'access_token'
    )
    
    if (!authToken) {
      console.warn(`⚠️ No hay token de autenticación disponible para ${userType}. El registro de token de push se omitirá.`)
      return
    }
    
    // Obtener deviceId único (usar el token como fallback)
    const deviceId = token.substring(0, 20)
    
    if (userType === 'invitado') {
      // Para invitados, usar el endpoint específico de invitados
      await apiClient.post('/notifications/register/invitado', {
        token,
        platform: Platform.OS,
        deviceId,
      })
      console.log('✅ Token registrado en el backend para invitado:', email)
    } else {
      // Para pastores, usar el endpoint de notificaciones
      await apiClient.post('/notifications/register', {
        token,
        platform: Platform.OS,
        deviceId,
      })
      console.log('✅ Token registrado en el backend para pastor:', email)
    }
  } catch (error: unknown) {
    // Manejar errores específicos
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } }
      if (axiosError.response?.status === 401) {
        console.warn('⚠️ Token de autenticación expirado o inválido. El registro de token de push se omitirá.')
        console.warn('💡 El token se registrará automáticamente después del próximo login.')
      } else {
        console.error('❌ Error registrando token en el backend:', error)
      }
    } else {
      console.error('❌ Error registrando token en el backend:', error)
    }
    // No lanzar error, solo loggear - el registro de token de push no es crítico
  }
}
