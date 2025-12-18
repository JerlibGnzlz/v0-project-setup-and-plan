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
  // ============================================
  // PRIORIDAD 1: Variable de entorno (tiene máxima prioridad)
  // ============================================
  if (EXPO_PUBLIC_API_URL) {
    console.log('🌐 Usando API URL desde variable de entorno:', EXPO_PUBLIC_API_URL)
    return EXPO_PUBLIC_API_URL
  }

  // ============================================
  // PRIORIDAD 2: API de Producción (Render) - POR DEFECTO
  // ============================================
  // El backend está desplegado en Render.com
  // Usar producción por defecto tanto en desarrollo como en producción
  const PRODUCTION_API_URL = 'https://ministerio-backend-wdbj.onrender.com/api'
  console.log('🌐 Usando API de producción (Render):', PRODUCTION_API_URL)
  return PRODUCTION_API_URL

  // ============================================
  // DESARROLLO LOCAL (Solo si necesitas usar backend local)
  // ============================================
  // Para usar backend local, configura EXPO_PUBLIC_API_URL en tu .env:
  // EXPO_PUBLIC_API_URL=http://TU_IP:4000/api
  //
  // IMPORTANTE: Esta IP debe ser la IP local de tu computadora en la red WiFi
  // Para encontrar tu IP:
  // - Linux: hostname -I | awk '{print $1}'
  // - Mac: ipconfig getifaddr en0
  // - Windows: ipconfig (busca "IPv4 Address")
  //
  // ⚠️ Solo usa esto si necesitas probar con un backend local
  // Por defecto, la app se conecta a producción en Vercel
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

// Función helper para diagnosticar problemas de conexión
export const diagnoseConnection = () => {
  console.log('🔍 DIAGNÓSTICO DE CONEXIÓN')
  console.log('📍 API URL:', API_URL)
  console.log('📱 Plataforma:', Platform.OS)
  console.log('🌐 Modo:', __DEV__ ? 'DESARROLLO' : 'PRODUCCIÓN')
  console.log('💡 Variable de entorno EXPO_PUBLIC_API_URL:', EXPO_PUBLIC_API_URL || 'No configurada')
  console.log('💡 Para verificar:')
  console.log('   1. La API está en producción: https://ministerio-backend-wdbj.onrender.com/api')
  console.log('   2. Si necesitas usar backend local, configura EXPO_PUBLIC_API_URL en .env')
  console.log('   3. Verifica conectividad: curl https://ministerio-backend-wdbj.onrender.com/api/noticias/publicadas')
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
      // Detectar si es un endpoint de invitados
      const isInvitadoEndpoint =
        config.url?.includes('/auth/invitado') ||
        config.url?.includes('/credenciales-ministeriales/mis-credenciales') ||
        config.url?.includes('/credenciales-capellania/mis-credenciales')

      // Detectar si es un endpoint de consulta de credenciales (acepta pastor o invitado)
      const isConsultaCredenciales =
        config.url?.includes('/credenciales-ministeriales/consultar/') ||
        config.url?.includes('/credenciales-capellania/consultar/')

      // Intentar obtener token de invitado primero si es endpoint de invitados o consulta de credenciales
      if (isInvitadoEndpoint || isConsultaCredenciales) {
        const invitadoToken = await SecureStore.getItemAsync('invitado_token')
        if (invitadoToken) {
          config.headers.Authorization = `Bearer ${invitadoToken}`
          console.log('🔑 Token de invitado agregado a request:', config.url?.substring(0, 50))
          return config
        }
      }

      // Intentar obtener token de pastor (fallback o para endpoints de pastores)
      const token = await SecureStore.getItemAsync('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        console.log('🔑 Token de pastor agregado a request:', config.url?.substring(0, 50))
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
      } catch (refreshError: unknown) {
        const errorMessage =
          refreshError instanceof Error
            ? refreshError.message
            : 'Error desconocido al refrescar token'
        const axiosError = refreshError as { response?: { status?: number; data?: unknown } }
        const errorCode = (refreshError as { code?: string })?.code

        console.error('❌ Error al refrescar token:', {
          message: errorMessage,
          status: axiosError?.response?.status,
          data: axiosError?.response?.data,
          code: errorCode,
        })

        // Si es un error de red (DNS, conexión, etc.), no limpiar tokens
        // Solo limpiar si es 401 (token inválido) o 403 (no autorizado)
        const shouldCleanTokens =
          axiosError?.response?.status === 401 || axiosError?.response?.status === 403

        if (shouldCleanTokens) {
          try {
            await SecureStore.deleteItemAsync('access_token')
            await SecureStore.deleteItemAsync('refresh_token')
            console.log('🧹 Tokens limpiados debido a error de autorización')
          } catch (cleanupError) {
            console.error('❌ Error limpiando tokens:', cleanupError)
          }
        } else {
          console.log('⚠️ Error de red o conexión, manteniendo tokens para reintentar')
        }

        // Rechazar el error para que la app maneje el logout
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
