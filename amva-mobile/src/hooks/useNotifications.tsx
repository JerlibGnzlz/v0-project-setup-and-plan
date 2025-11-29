import { useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'
import Constants from 'expo-constants'
import { useAuth } from './useAuth'
import { apiClient } from '@api/client'

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
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
  const notificationListener = useRef<any>(null)
  const responseListener = useRef<any>(null)

  useEffect(() => {
    // No intentar usar notificaciones en Expo Go
    if (isExpoGo) {
      return
    }

    if (!Notifications) {
      return
    }

    // Registrar para obtener el token de push
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token)
        // Registrar token en el backend si hay un pastor autenticado
        if (pastor?.email) {
          registerTokenInBackend(token, pastor.email)
        }
      }
    })

    // Listener para notificaciones recibidas mientras la app está en primer plano
    if (Notifications.addNotificationReceivedListener) {
      notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
        console.log('📬 Notificación recibida:', notification)
      })
    }

    // Listener para cuando el usuario toca una notificación
    if (Notifications.addNotificationResponseReceivedListener) {
      responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('👆 Usuario tocó la notificación:', response)
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
  }, [pastor?.email])

  // Registrar token cuando el pastor cambia
  useEffect(() => {
    if (expoPushToken && pastor?.email) {
      registerTokenInBackend(expoPushToken, pastor.email)
    }
  }, [expoPushToken, pastor?.email])

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
      projectId: 'amva-mobile-example', // Debe coincidir con app.json
    })
    token = tokenData.data
    console.log('✅ Token de notificación obtenido:', token)
  } catch (error: any) {
    // Silenciar errores relacionados con Expo Go
    if (!error?.message?.includes('Expo Go') && !error?.message?.includes('development build')) {
      console.error('❌ Error obteniendo token de notificación:', error)
    }
  }

  return token
}

async function registerTokenInBackend(token: string, email: string) {
  try {
    await apiClient.post('/notifications/register', {
      token,
      platform: Platform.OS,
    })
    console.log('✅ Token registrado en el backend para', email)
  } catch (error) {
    console.error('❌ Error registrando token en el backend:', error)
  }
}

