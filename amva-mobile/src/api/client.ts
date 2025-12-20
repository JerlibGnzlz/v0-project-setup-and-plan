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
      // Lista de endpoints públicos que no requieren token
      const publicEndpoints = [
        '/convenciones',
        '/convenciones/active',
        '/noticias/publicadas',
        '/noticias/slug/',
        '/noticias/destacadas',
        '/noticias/categoria/',
        '/auth/invitado/login',
        '/auth/invitado/register',
        '/auth/invitado/google/mobile',
        '/auth/pastor/login',
        '/auth/pastor/register',
        '/upload/inscripcion-documento', // Endpoint público para subir documentos de inscripción
      ]

      const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint))

      // Si es un endpoint público, no agregar token ni mostrar warnings
      if (isPublicEndpoint) {
        return config
      }

      // Detectar endpoints exclusivos de invitados (NO aceptan token de pastor)
      const isExclusiveInvitadoEndpoint =
        config.url?.includes('/credenciales-ministeriales/mis-credenciales') ||
        config.url?.includes('/credenciales-capellania/mis-credenciales') ||
        config.url?.includes('/inscripciones/my') ||
        config.url?.includes('/inscripciones/invitado/') ||
        config.url?.includes('/auth/invitado/me') ||
        config.url?.includes('/solicitudes-credenciales/mis-solicitudes') ||
        // POST /solicitudes-credenciales también requiere token de invitado
        (config.url?.includes('/solicitudes-credenciales') && config.method === 'post')

      // Detectar si es un endpoint de invitados o inscripciones (que también usa invitados)
      // NOTA: POST /inscripciones es público (no requiere autenticación)
      const isPublicInscripcionPost = config.url === '/inscripciones' && config.method === 'post'
      
      const isInvitadoEndpoint =
        config.url?.includes('/auth/invitado') ||
        config.url?.includes('/credenciales-ministeriales/mis-credenciales') ||
        config.url?.includes('/credenciales-capellania/mis-credenciales') ||
        (config.url?.includes('/inscripciones') && !isPublicInscripcionPost) ||
        config.url?.includes('/inscripciones/invitado/') ||
        config.url?.includes('/solicitudes-credenciales')

      // Detectar si es un endpoint de consulta de credenciales (acepta pastor o invitado)
      const isConsultaCredenciales =
        config.url?.includes('/credenciales-ministeriales/consultar/') ||
        config.url?.includes('/credenciales-capellania/consultar/')

      // Para endpoints exclusivos de invitados, SOLO usar token de invitado
      if (isExclusiveInvitadoEndpoint) {
        console.log('🔍 Endpoint exclusivo de invitado detectado:', config.url)
        const invitadoToken = await SecureStore.getItemAsync('invitado_token')
        const invitadoRefreshToken = await SecureStore.getItemAsync('invitado_refresh_token')

        if (invitadoToken) {
          config.headers.Authorization = `Bearer ${invitadoToken}`
          console.log('✅ Token de invitado agregado a request:', config.url?.substring(0, 50))
          console.log('🔍 Token length:', invitadoToken.length, 'chars')
          console.log('🔍 Refresh token disponible:', !!invitadoRefreshToken, invitadoRefreshToken ? `(${invitadoRefreshToken.length} chars)` : '(no disponible)')
          console.log('🔍 Headers Authorization:', config.headers.Authorization?.substring(0, 30) + '...')
          return config
        } else {
          console.error('❌ Endpoint exclusivo de invitado requiere token de invitado, pero no se encontró')
          console.error('❌ URL:', config.url)
          console.error('❌ Método:', config.method?.toUpperCase())
          console.error('❌ NO se usará token de pastor como fallback para este endpoint')
          // No agregar token de pastor, dejar que el backend responda con 401
          return config
        }
      }

      // POST /inscripciones es público, no requiere token
      if (isPublicInscripcionPost) {
        if (__DEV__) {
          console.log('🌐 POST /inscripciones es público, no se requiere token')
        }
        return config
      }

      // Para otros endpoints de invitados o consulta de credenciales, intentar token de invitado primero
      if (isInvitadoEndpoint || isConsultaCredenciales) {
        const invitadoToken = await SecureStore.getItemAsync('invitado_token')
        if (invitadoToken) {
          config.headers.Authorization = `Bearer ${invitadoToken}`
          console.log('🔑 Token de invitado agregado a request:', config.url?.substring(0, 50))
          return config
        }
        // Si no hay token de invitado pero es consulta de credenciales, permitir fallback a token de pastor
      }

      // Intentar obtener token de pastor (fallback o para endpoints de pastores)
      const token = await SecureStore.getItemAsync('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        console.log('🔑 Token de pastor agregado a request:', config.url?.substring(0, 50))
      }
      // No mostrar warning si no hay token - algunos endpoints pueden ser públicos
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

    // Manejar errores de red antes de intentar refresh
    const errorCode = (error as { code?: string })?.code
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    // Si es un error de red, proporcionar mensaje más útil y no intentar refresh
    if (
      errorCode === 'ERR_NETWORK' ||
      errorCode === 'ECONNREFUSED' ||
      errorCode === 'ETIMEDOUT' ||
      errorCode === 'ENOTFOUND' ||
      errorMessage.includes('Network Error') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('getaddrinfo')
    ) {
      const fullUrl = originalRequest?.url
        ? `${apiClient.defaults.baseURL}${originalRequest.url}`
        : 'URL desconocida'
      
      console.error('❌ Error de red detectado:', {
        code: errorCode,
        message: errorMessage,
        url: originalRequest?.url,
        fullUrl: fullUrl,
        baseURL: apiClient.defaults.baseURL,
        method: originalRequest?.method?.toUpperCase(),
      })
      
      console.error('🔍 Diagnóstico de conexión:')
      console.error('   - Base URL:', apiClient.defaults.baseURL)
      console.error('   - Endpoint:', originalRequest?.url)
      console.error('   - URL completa:', fullUrl)
      console.error('   - Código de error:', errorCode)
      console.error('   - Mensaje:', errorMessage)
      console.error('💡 Verifica:')
      console.error('   1. Tu conexión a internet está activa')
      console.error('   2. El backend está disponible:', apiClient.defaults.baseURL)
      console.error('   3. No hay firewall bloqueando la conexión')
      console.error('   4. El servidor no está en mantenimiento')

      const networkError = new Error(
        `Error de conexión: No se pudo conectar al servidor (${errorCode || 'ERR_NETWORK'}). Verifica tu conexión a internet y que el servidor esté disponible.`
      ) as Error & { code?: string; isNetworkError?: boolean; originalError?: unknown; fullUrl?: string }
      networkError.code = errorCode
      networkError.isNetworkError = true
      networkError.originalError = error
      networkError.fullUrl = fullUrl
      return Promise.reject(networkError)
    }

    // Si el error es 401 y no hemos intentado refrescar
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Prevenir loops infinitos: máximo 1 intento de refresh
      const retryCount = (originalRequest._retryCount || 0) + 1
      if (retryCount > 1) {
        console.error('❌ Máximo de reintentos alcanzado, rechazando request:', originalRequest.url)
        
        // Detectar si es un endpoint de invitados para limpiar los tokens correctos
        const isInvitadoEndpoint =
          originalRequest.url?.includes('/auth/invitado/me') ||
          originalRequest.url?.includes('/auth/invitado/logout') ||
          originalRequest.url?.includes('/credenciales-ministeriales/mis-credenciales') ||
          originalRequest.url?.includes('/credenciales-capellania/mis-credenciales') ||
          originalRequest.url?.includes('/credenciales-ministeriales/consultar/') ||
          originalRequest.url?.includes('/credenciales-capellania/consultar/') ||
          originalRequest.url?.includes('/inscripciones/my') ||
          originalRequest.url?.includes('/solicitudes-credenciales')
        
        // Limpiar tokens cuando se alcanza el máximo de reintentos
        if (isInvitadoEndpoint) {
          console.log('🧹 Limpiando tokens de invitado después de máximo de reintentos')
          try {
            await SecureStore.deleteItemAsync('invitado_token')
            await SecureStore.deleteItemAsync('invitado_refresh_token')
            console.log('✅ Tokens de invitado limpiados')
          } catch (cleanError) {
            console.error('❌ Error limpiando tokens:', cleanError)
          }
        } else {
          console.log('🧹 Limpiando tokens de pastor después de máximo de reintentos')
          try {
            await SecureStore.deleteItemAsync('access_token')
            await SecureStore.deleteItemAsync('refresh_token')
            console.log('✅ Tokens de pastor limpiados')
          } catch (cleanError) {
            console.error('❌ Error limpiando tokens:', cleanError)
          }
        }
        
        return Promise.reject(error)
      }

      console.log(`🔄 Error 401 detectado, intentando refrescar token (intento ${retryCount}/1)`)
      console.log('🔍 URL del request:', originalRequest.url)
      console.log('🔍 Método del request:', originalRequest.method)
      console.log('🔍 Headers del request:', originalRequest.headers)

      originalRequest._retry = true
      originalRequest._retryCount = retryCount

      // No intentar refresh para endpoints de autenticación
      const isAuthEndpoint =
        originalRequest.url?.includes('/auth/pastor/login') ||
        originalRequest.url?.includes('/auth/pastor/register') ||
        originalRequest.url?.includes('/auth/pastor/refresh') ||
        originalRequest.url?.includes('/auth/pastor/register-complete') ||
        originalRequest.url?.includes('/auth/invitado/login') ||
        originalRequest.url?.includes('/auth/invitado/register') ||
        originalRequest.url?.includes('/auth/invitado/refresh') ||
        originalRequest.url?.includes('/auth/invitado/register-complete') ||
        originalRequest.url?.includes('/auth/invitado/google/mobile')

      if (isAuthEndpoint) {
        console.log('⚠️ Error 401 en endpoint de autenticación, no se intenta refresh')
        return Promise.reject(error)
      }

      try {
        // Detectar si es un endpoint de invitados o de pastores
        const isInvitadoEndpoint =
          originalRequest.url?.includes('/auth/invitado/me') ||
          originalRequest.url?.includes('/auth/invitado/logout') ||
          originalRequest.url?.includes('/credenciales-ministeriales/mis-credenciales') ||
          originalRequest.url?.includes('/credenciales-capellania/mis-credenciales') ||
          originalRequest.url?.includes('/credenciales-ministeriales/consultar/') ||
          originalRequest.url?.includes('/credenciales-capellania/consultar/') ||
          originalRequest.url?.includes('/inscripciones/my') ||
          originalRequest.url?.includes('/inscripciones') && originalRequest.method === 'post' ||
          originalRequest.url?.includes('/solicitudes-credenciales')

        // Intentar refrescar el token según el tipo de usuario
        let refreshToken: string | null = null
        let refreshEndpoint = ''
        let tokenKey = ''
        let refreshTokenKey = ''

        if (isInvitadoEndpoint) {
          // Para invitados
          refreshToken = await SecureStore.getItemAsync('invitado_refresh_token')
          refreshEndpoint = '/auth/invitado/refresh'
          tokenKey = 'invitado_token'
          refreshTokenKey = 'invitado_refresh_token'
          console.log('🔍 Endpoint detectado como INVITADO')
          console.log('🔍 Refresh token disponible:', !!refreshToken, refreshToken ? `(${refreshToken.length} chars)` : '(no disponible)')
        } else {
          // Para pastores
          refreshToken = await SecureStore.getItemAsync('refresh_token')
          refreshEndpoint = '/auth/pastor/refresh'
          tokenKey = 'access_token'
          refreshTokenKey = 'refresh_token'
          console.log('🔍 Endpoint detectado como PASTOR')
          console.log('🔍 Refresh token disponible:', !!refreshToken, refreshToken ? `(${refreshToken.length} chars)` : '(no disponible)')
        }

        // Si no hay refresh token, limpiar tokens y forzar re-login
        if (!refreshToken) {
          console.warn(`⚠️ No hay ${refreshTokenKey} disponible para refrescar`)
          console.warn('⚠️ Limpiando tokens y forzando re-login...')

          // Limpiar tokens de invitado si es endpoint de invitado
          if (isInvitadoEndpoint) {
            try {
              await SecureStore.deleteItemAsync('invitado_token')
              await SecureStore.deleteItemAsync('invitado_refresh_token')
              console.log('✅ Tokens de invitado limpiados')
            } catch (cleanError) {
              console.error('❌ Error limpiando tokens:', cleanError)
            }
          }

          return Promise.reject(error)
        }

        console.log(`🔄 Intentando refrescar token de ${isInvitadoEndpoint ? 'invitado' : 'pastor'}...`)
        // Crear una instancia separada de axios para evitar interceptor infinito
        const refreshAxios = axios.create({
          baseURL: API_URL,
          timeout: 8000, // Timeout más corto
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        })

        const response = await refreshAxios.post(refreshEndpoint, {
          refreshToken: refreshToken,
        })

        const { access_token, refresh_token: newRefreshToken } = response.data

        if (!access_token) {
          throw new Error('No access token recibido en respuesta de refresh')
        }

        // Guardar nuevos tokens según el tipo de usuario
        await SecureStore.setItemAsync(tokenKey, access_token)
        if (newRefreshToken) {
          await SecureStore.setItemAsync(refreshTokenKey, newRefreshToken)
        }

        console.log(`✅ Token de ${isInvitadoEndpoint ? 'invitado' : 'pastor'} refrescado exitosamente`)

        // Asegurar que el header se actualice correctamente
        if (!originalRequest.headers) {
          originalRequest.headers = {}
        }
        originalRequest.headers.Authorization = `Bearer ${access_token}`
        
        // Limpiar el flag _retry para permitir reintentos si es necesario
        // Pero mantener _retryCount para evitar loops infinitos
        delete originalRequest._retry

        // Usar request() - el interceptor de request agregará el token automáticamente
        console.log('🔄 Reintentando request original con nuevo token...')
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

        // Detectar si es un endpoint de invitados para limpiar los tokens correctos
        const isInvitadoEndpoint =
          originalRequest.url?.includes('/auth/invitado/me') ||
          originalRequest.url?.includes('/auth/invitado/logout') ||
          originalRequest.url?.includes('/credenciales-ministeriales/mis-credenciales') ||
          originalRequest.url?.includes('/credenciales-capellania/mis-credenciales') ||
          originalRequest.url?.includes('/credenciales-ministeriales/consultar/') ||
          originalRequest.url?.includes('/credenciales-capellania/consultar/') ||
          originalRequest.url?.includes('/inscripciones/my') ||
          (originalRequest.url?.includes('/inscripciones') && originalRequest.method === 'post') ||
          originalRequest.url?.includes('/solicitudes-credenciales')

        // Si es un error de red (DNS, conexión, etc.), no limpiar tokens
        if (
          errorCode === 'ERR_NETWORK' ||
          errorCode === 'ECONNREFUSED' ||
          errorCode === 'ETIMEDOUT' ||
          errorCode === 'ENOTFOUND' ||
          errorMessage.includes('Network Error') ||
          errorMessage.includes('timeout') ||
          errorMessage.includes('getaddrinfo')
        ) {
          console.log('⚠️ Error de red al refrescar token, manteniendo tokens para reintentar')
          return Promise.reject(error)
        }

        // Solo limpiar si es 401 (token inválido) o 403 (no autorizado)
        const shouldCleanTokens =
          axiosError?.response?.status === 401 || axiosError?.response?.status === 403

        if (shouldCleanTokens) {
          try {
            if (isInvitadoEndpoint) {
              await SecureStore.deleteItemAsync('invitado_token')
              await SecureStore.deleteItemAsync('invitado_refresh_token')
              console.log('🧹 Tokens de invitado limpiados debido a error de autorización')
            } else {
              await SecureStore.deleteItemAsync('access_token')
              await SecureStore.deleteItemAsync('refresh_token')
              console.log('🧹 Tokens de pastor limpiados debido a error de autorización')
            }
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
