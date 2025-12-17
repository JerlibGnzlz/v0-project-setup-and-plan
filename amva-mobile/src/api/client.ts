/**
 * API Client para React Native
 * Similar estructura al frontend web para mantener consistencia
 */

import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

// Expo define __DEV__ de forma global en tiempo de ejecución
declare const __DEV__: boolean

// En Expo, las variables de entorno se acceden así
// @ts-ignore - process.env está disponible en tiempo de ejecución en Expo
const EXPO_PUBLIC_API_URL =
  typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_API_URL : undefined

// IMPORTANTE: En dispositivos físicos o emuladores, localhost no funciona
//
// OPCIONES:
// 1. Usar variable de entorno: EXPO_PUBLIC_API_URL=http://TU_IP:4000/api
// 2. Para emulador Android: http://10.0.2.2:4000/api
// 3. Para emulador iOS: http://localhost:4000/api
// 4. Para dispositivo físico: http://TU_IP_LOCAL:4000/api (ej: http://192.168.0.33:4000/api)
//
// Para encontrar tu IP:
// - Linux: hostname -I
// - Mac: ipconfig getifaddr en0
// - Windows: ipconfig

// Detectar automáticamente el entorno
const getApiUrl = () => {
  // Si hay variable de entorno, usarla
  if (EXPO_PUBLIC_API_URL) {
    console.log('🌐 Usando API URL desde variable de entorno:', EXPO_PUBLIC_API_URL)
    return EXPO_PUBLIC_API_URL
  }

  // ============================================
  // PRODUCCIÓN: Usar API de producción
  // ============================================
  if (!__DEV__) {
    return 'https://api.vidaabundante.org/api'
  }

  // ============================================
  // DESARROLLO: Configuración de IP Local
  // ============================================
  // IMPORTANTE: Esta IP debe ser la IP local de tu computadora en la red WiFi
  //
  // Para encontrar tu IP:
  // - Linux: hostname -I | awk '{print $1}'
  // - Mac: ipconfig getifaddr en0
  // - Windows: ipconfig (busca "IPv4 Address")
  //
  // Esta IP funciona tanto para:
  // - Emulador Android (10.0.2.2 también funciona, pero esta es más universal)
  // - Simulador iOS (localhost también funciona, pero esta es más universal)
  // - Dispositivo físico Android (NECESITA esta IP)
  // - Dispositivo físico iOS (NECESITA esta IP)
  //
  // ⚠️ Asegúrate de que tu dispositivo móvil y tu computadora estén en la misma red WiFi
  const LOCAL_IP = '192.168.0.33' // ⚠️ CAMBIAR POR TU IP LOCAL si es diferente

  // En desarrollo, detectar el entorno
  const platform = Platform.OS
  console.log('📱 Plataforma detectada:', platform)

  // SOLUCIÓN UNIFICADA: Usar IP local para TODOS los casos
  // Esto funciona tanto en emulador/simulador como en dispositivo físico
  const apiUrl = `http://${LOCAL_IP}:4000/api`

  if (platform === 'android') {
    console.log('🤖 Android detectado')
    console.log('📍 Usando IP local:', apiUrl)
    console.log('💡 Esto funciona tanto en emulador como en dispositivo físico')
    console.log('💡 Si no funciona, verifica que LOCAL_IP sea correcta:', LOCAL_IP)
    return apiUrl
  } else if (platform === 'ios') {
    console.log('🍎 iOS detectado')
    console.log('📍 Usando IP local:', apiUrl)
    console.log('💡 Esto funciona tanto en simulador como en dispositivo físico')
    console.log('💡 Si no funciona, verifica que LOCAL_IP sea correcta:', LOCAL_IP)
    return apiUrl
  } else {
    // Web
    console.log('🌐 Web detectado, usando:', apiUrl)
    return apiUrl
  }
}

const API_URL = getApiUrl()
console.log('🚀 API URL configurada:', API_URL)
console.log('🔍 Verificando conectividad...')

// Función para verificar conectividad (opcional, solo para debug)
const testConnection = async () => {
  try {
    const testUrl = API_URL.replace('/api', '/api/noticias/publicadas')
    console.log('🧪 Probando conexión a:', testUrl)
    // No hacemos la petición real aquí, solo log
  } catch (error) {
    console.error('❌ Error al verificar conexión:', error)
  }
}

// Solo en desarrollo, probar conexión
if (__DEV__) {
  // testConnection() // Comentado para no hacer petición innecesaria
}

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  // Agregar configuración adicional para mobile
  adapter: undefined, // Usar el adapter por defecto
})

// Log de la configuración final
console.log('📡 Axios configurado con baseURL:', apiClient.defaults.baseURL)

// Interceptor para agregar token de acceso
apiClient.interceptors.request.use(
  async config => {
    try {
      const token = await SecureStore.getItemAsync('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        console.log('🔑 Token agregado a request:', config.url?.substring(0, 50))
      } else {
        console.log('⚠️ No hay token disponible para:', config.url?.substring(0, 50))
      }
    } catch (error) {
      console.error('❌ Error al obtener token:', error)
    }
    return config
  },
  error => Promise.reject(error)
)

// Interceptor para manejar errores y refresh token
apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean
      _retryCount?: number
    }

    // Si el error es 401 y no hemos intentado refrescar
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Prevenir loops infinitos: máximo 1 intento de refresh
      const retryCount = (originalRequest._retryCount || 0) + 1
      if (retryCount > 1) {
        console.error('❌ Máximo de reintentos alcanzado, rechazando request')
        return Promise.reject(error)
      }

      originalRequest._retry = true
      originalRequest._retryCount = retryCount

      // No intentar refresh para endpoints de autenticación
      const isAuthEndpoint =
        originalRequest.url?.includes('/auth/pastor/login') ||
        originalRequest.url?.includes('/auth/pastor/register') ||
        originalRequest.url?.includes('/auth/pastor/refresh') ||
        originalRequest.url?.includes('/auth/pastor/register-complete')

      if (isAuthEndpoint) {
        console.log('⚠️ Error 401 en endpoint de autenticación, no se intenta refresh')
        return Promise.reject(error)
      }

      try {
        // Intentar refrescar el token (endpoints de pastores)
        const refreshToken = await SecureStore.getItemAsync('refresh_token')
        if (!refreshToken) {
          console.log('⚠️ No hay refresh token disponible, limpiando tokens')
          await SecureStore.deleteItemAsync('access_token')
          return Promise.reject(new Error('No refresh token available'))
        }

        console.log('🔄 Intentando refrescar token...')
        // Crear una instancia separada de axios para evitar interceptor infinito
        const refreshAxios = axios.create({
          baseURL: API_URL,
          timeout: 8000, // Timeout más corto
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        })

        const response = await refreshAxios.post('/auth/pastor/refresh', {
          refreshToken: refreshToken,
        })

        const { access_token, refresh_token: newRefreshToken } = response.data

        if (!access_token) {
          throw new Error('No access token recibido en respuesta de refresh')
        }

        // Guardar nuevos tokens
        await SecureStore.setItemAsync('access_token', access_token)
        if (newRefreshToken) {
          await SecureStore.setItemAsync('refresh_token', newRefreshToken)
        }

        console.log('✅ Token refrescado exitosamente')

        // Asegurar que el header se actualice correctamente
        if (!originalRequest.headers) {
          originalRequest.headers = {}
        }
        originalRequest.headers.Authorization = `Bearer ${access_token}`

        // NO resetear _retry aquí para evitar loops
        // Usar request() - el interceptor de request agregará el token automáticamente
        return apiClient.request(originalRequest)
      } catch (refreshError: any) {
        console.error('❌ Error al refrescar token:', {
          message: refreshError?.message,
          status: refreshError?.response?.status,
          data: refreshError?.response?.data,
        })

        // Si falla el refresh, limpiar tokens
        try {
          await SecureStore.deleteItemAsync('access_token')
          await SecureStore.deleteItemAsync('refresh_token')
        } catch (cleanupError) {
          console.error('❌ Error limpiando tokens:', cleanupError)
        }

        // Rechazar el error para que la app maneje el logout
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
