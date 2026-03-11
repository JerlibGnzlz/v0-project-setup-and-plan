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
  // PRIORIDAD 2: API de Producción - POR DEFECTO
  // ============================================
  // Usar www.amva.org.es para consistencia con EAS Build production
  const PRODUCTION_API_URL = 'https://www.amva.org.es/api'
  console.log('🌐 Usando API de producción:', PRODUCTION_API_URL)
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
  console.log('   1. La API está en producción: https://amva.org.es/api')
  console.log('   2. Si necesitas usar backend local, configura EXPO_PUBLIC_API_URL en .env')
  console.log('   3. Verifica conectividad: curl https://amva.org.es/api/noticias/publicadas')
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

// Helper para logging condicional (solo en desarrollo o errores críticos)
const logDebug = (...args: unknown[]) => {
  if (__DEV__) {
    console.log(...args)
  }
}

const logError = (...args: unknown[]) => {
  // Errores siempre se muestran, pero con menos detalle en producción
  if (__DEV__) {
    console.error(...args)
  } else {
    // En producción, solo mostrar mensajes esenciales sin detalles técnicos
    const firstArg = args[0]
    if (typeof firstArg === 'string' && (firstArg.includes('❌') || firstArg.includes('ERROR'))) {
      console.error(firstArg)
    }
  }
}

const logWarn = (...args: unknown[]) => {
  if (__DEV__) {
    console.warn(...args)
  }
}

// Mutex para que solo un refresh de invitado se ejecute a la vez (evita race y doble uso del refresh token)
let invitadoRefreshPromise: Promise<string | null> | null = null

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
        config.url?.includes('/pagos/invitado/') ||
        config.url?.includes('/auth/invitado/me') ||
        config.url?.includes('/solicitudes-credenciales/mis-solicitudes') ||
        config.url?.includes('/notifications/register/invitado') ||
        // POST /solicitudes-credenciales también requiere token de invitado
        (config.url?.includes('/solicitudes-credenciales') && config.method === 'post')

      // Detectar endpoint unificado de credenciales (acepta pastor o invitado)
      const isCredencialesUnificadoEndpoint = config.url?.includes('/credenciales/mis-credenciales')

      // Detectar si es un endpoint de invitados o inscripciones (que también usa invitados)
      // NOTA: POST /inscripciones es público (no requiere autenticación)
      const isPublicInscripcionPost = config.url === '/inscripciones' && config.method === 'post'

      const isInvitadoEndpoint =
        config.url?.includes('/auth/invitado') ||
        config.url?.includes('/credenciales-ministeriales/mis-credenciales') ||
        config.url?.includes('/credenciales-capellania/mis-credenciales') ||
        (config.url?.includes('/inscripciones') && !isPublicInscripcionPost) ||
        config.url?.includes('/inscripciones/invitado/') ||
        config.url?.includes('/pagos/invitado/') ||
        config.url?.includes('/solicitudes-credenciales') ||
        config.url?.includes('/notifications/register/invitado')

      // Detectar si es un endpoint de consulta de credenciales (acepta pastor o invitado)
      const isConsultaCredenciales =
        config.url?.includes('/credenciales-ministeriales/consultar/') ||
        config.url?.includes('/credenciales-capellania/consultar/')

      // Para endpoints exclusivos de invitados, SOLO usar token de invitado
      if (isExclusiveInvitadoEndpoint) {
        console.log('🔍 Endpoint exclusivo de invitado detectado:', config.url)
        const invitadoToken = await SecureStore.getItemAsync('invitado_token')
        const invitadoRefreshToken = await SecureStore.getItemAsync('invitado_refresh_token')

        // En una aplicación real, el flujo debería ser:
        // 1. Intentar el request con el token disponible (o sin token si no hay)
        // 2. Si el request falla con 401, el interceptor de respuesta intenta refrescar automáticamente
        // 3. Si el refresh es exitoso, reintenta el request original
        // 4. Si el refresh falla o no hay refresh token, entonces sí rechazar con error de sesión expirada
        
        // Solo rechazar inmediatamente si NO hay token NI refresh token (sesión completamente expirada)
        if (!invitadoToken && !invitadoRefreshToken) {
          console.warn('⚠️ No hay tokens de invitado disponibles, rechazando request')
          const noTokenError = new Error('Sesión expirada. Por favor, cierra sesión en Perfil y vuelve a entrar con Google.') as Error & { isSessionExpired?: boolean; requiresReauth?: boolean }
          noTokenError.isSessionExpired = true
          noTokenError.requiresReauth = true
          return Promise.reject(noTokenError)
        }

        // Si hay token, usarlo directamente (el interceptor de respuesta manejará el refresh si es necesario)
        // Si no hay token pero hay refresh token, permitir que el request se haga sin token
        // El interceptor de respuesta detectará el 401 y refrescará automáticamente
        if (invitadoToken) {
          // Si hay token, usarlo directamente
          config.headers.Authorization = `Bearer ${invitadoToken}`
          logDebug('🔑 Token de invitado agregado a request exclusivo:', config.url?.substring(0, 50))
          return config
        } else if (invitadoRefreshToken) {
          // Si no hay token pero hay refresh token, permitir que el request se haga sin token
          // El interceptor de respuesta detectará el 401 y refrescará automáticamente
          console.log('⚠️ No hay token de invitado, pero hay refresh token. El interceptor manejará el refresh automáticamente.')
          // No agregar token, dejar que el backend responda con 401 y el interceptor refresque
          return config
        } else {
          // Solo rechazar si no hay token NI refresh token (sesión completamente expirada)
          console.warn('⚠️ No hay tokens de invitado disponibles, rechazando request')
          const noTokenError = new Error('Sesión expirada. Por favor, cierra sesión en Perfil y vuelve a entrar con Google.') as Error & { isSessionExpired?: boolean; requiresReauth?: boolean }
          noTokenError.isSessionExpired = true
          noTokenError.requiresReauth = true
          return Promise.reject(noTokenError)
        }
      }

      // POST /inscripciones es público, no requiere token
      if (isPublicInscripcionPost) {
        if (__DEV__) {
          console.log('🌐 POST /inscripciones es público, no se requiere token')
        }
        return config
      }

      // Para endpoint unificado de credenciales, intentar ambos tokens (pastor o invitado)
      if (isCredencialesUnificadoEndpoint) {
        // Intentar primero con token de invitado
        const invitadoToken = await SecureStore.getItemAsync('invitado_token')
        if (invitadoToken) {
          config.headers.Authorization = `Bearer ${invitadoToken}`
          logDebug('🔑 Token de invitado agregado a request unificado:', config.url?.substring(0, 50))
          return config
        }
        // Si no hay token de invitado, intentar con token de pastor
        const pastorToken = await SecureStore.getItemAsync('access_token')
        if (pastorToken) {
          config.headers.Authorization = `Bearer ${pastorToken}`
          logDebug('🔑 Token de pastor agregado a request unificado:', config.url?.substring(0, 50))
          return config
        }
        // Si no hay ningún token, dejar que el backend responda con 401
        console.warn('⚠️ Endpoint unificado de credenciales requiere token, pero no se encontró ninguno')
        return config
      }

      // Para otros endpoints de invitados o consulta de credenciales, intentar token de invitado primero
      if (isInvitadoEndpoint || isConsultaCredenciales) {
        const invitadoToken = await SecureStore.getItemAsync('invitado_token')
        if (invitadoToken) {
          config.headers.Authorization = `Bearer ${invitadoToken}`
          logDebug('🔑 Token de invitado agregado a request:', config.url?.substring(0, 50))
          return config
        }
        // Si no hay token de invitado pero es consulta de credenciales, permitir fallback a token de pastor
      }

      // Intentar obtener token de pastor (fallback o para endpoints de pastores)
      const token = await SecureStore.getItemAsync('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        logDebug('🔑 Token de pastor agregado a request:', config.url?.substring(0, 50))
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
    const originalRequest = error.config as (AxiosRequestConfig & {
      _retry?: boolean
      _retryCount?: number
      _retryAfterRefresh?: boolean
    }) | undefined

    if (!originalRequest) {
      return Promise.reject(error)
    }

    // Si este request ya fue reintentado después de un refresh, no intentar refrescar nuevamente
    // Esto evita loops infinitos cuando el token refrescado también es inválido
    if (originalRequest._retryAfterRefresh) {
      logDebug('⚠️ Request ya fue reintentado después de refresh, no intentar refrescar nuevamente')
      return Promise.reject(error)
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
      const fullUrl = originalRequest.url
        ? `${apiClient.defaults.baseURL}${originalRequest.url}`
        : 'URL desconocida'

      console.error('❌ Error de red detectado:', {
        code: errorCode,
        message: errorMessage,
        url: originalRequest.url,
        fullUrl: fullUrl,
        baseURL: apiClient.defaults.baseURL,
        method: originalRequest.method?.toUpperCase(),
      })

      console.error('🔍 Diagnóstico de conexión:')
      console.error('   - Base URL:', apiClient.defaults.baseURL)
      console.error('   - Endpoint:', originalRequest.url)
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

    // Si el error es 401
    if (error.response?.status === 401) {
      // Si ya se intentó refrescar y el request con el nuevo token también falla, rechazar
      if (originalRequest._retryAfterRefresh) {
        logError('❌ Sesión expirada: El token refrescado también es inválido.')
        const isInvitadoEndpoint =
          originalRequest.url?.includes('/auth/invitado/me') ||
          originalRequest.url?.includes('/auth/invitado/logout') ||
          originalRequest.url?.includes('/credenciales/mis-credenciales') ||
          originalRequest.url?.includes('/credenciales-ministeriales/mis-credenciales') ||
          originalRequest.url?.includes('/credenciales-capellania/mis-credenciales') ||
          originalRequest.url?.includes('/credenciales-ministeriales/consultar/') ||
          originalRequest.url?.includes('/credenciales-capellania/consultar/') ||
          originalRequest.url?.includes('/inscripciones/my') ||
          originalRequest.url?.includes('/solicitudes-credenciales')
        
        if (isInvitadoEndpoint) {
          try {
            await SecureStore.deleteItemAsync('invitado_token')
            await SecureStore.deleteItemAsync('invitado_refresh_token')
            logDebug('🧹 Tokens de invitado limpiados (token refrescado también inválido)')
          } catch {}
        } else {
          // Limpiar tokens de pastor
          try {
            await SecureStore.deleteItemAsync('access_token')
            await SecureStore.deleteItemAsync('refresh_token')
                logDebug('🧹 Tokens de pastor limpiados (token refrescado también inválido)')
          } catch {}
        }
        
        const sessionExpiredError = new Error(
          isInvitadoEndpoint
            ? 'Sesión expirada. Por favor, cierra sesión en Perfil y vuelve a entrar con Google.'
            : 'Sesión expirada. Por favor, vuelve a iniciar sesión.'
        ) as Error & { isSessionExpired?: boolean; requiresReauth?: boolean }
        sessionExpiredError.isSessionExpired = true
        sessionExpiredError.requiresReauth = true
        return Promise.reject(sessionExpiredError)
      }
      
      // Si ya se intentó refrescar una vez, rechazar
      if (originalRequest._retry) {
        console.error('❌ Ya se intentó refrescar este request, rechazando:', originalRequest.url)
        return Promise.reject(error)
      }
      
      // Marcar como intentado ANTES de refrescar para evitar loops
      originalRequest._retry = true
      
      // Prevenir loops infinitos: máximo 1 intento de refresh por request
      const retryCount = (originalRequest._retryCount || 0) + 1
      if (retryCount > 1) {
        console.error('❌ Máximo de reintentos alcanzado, rechazando request:', originalRequest.url)
        
        // Si es un endpoint de invitados y no hay refresh token, limpiar tokens inmediatamente
        const isInvitadoEndpoint =
          originalRequest.url?.includes('/auth/invitado/me') ||
          originalRequest.url?.includes('/auth/invitado/logout') ||
          originalRequest.url?.includes('/credenciales/mis-credenciales') ||
          originalRequest.url?.includes('/credenciales-ministeriales/mis-credenciales') ||
          originalRequest.url?.includes('/credenciales-capellania/mis-credenciales') ||
          originalRequest.url?.includes('/credenciales-ministeriales/consultar/') ||
          originalRequest.url?.includes('/credenciales-capellania/consultar/') ||
          originalRequest.url?.includes('/inscripciones/my') ||
          originalRequest.url?.includes('/solicitudes-credenciales')
        
        if (isInvitadoEndpoint) {
          try {
            const refreshToken = await SecureStore.getItemAsync('invitado_refresh_token')
            if (!refreshToken) {
              await SecureStore.deleteItemAsync('invitado_token')
              await SecureStore.deleteItemAsync('invitado_refresh_token')
              logDebug('🧹 Tokens de invitado limpiados (máximo de reintentos sin refresh token)')
            }
          } catch (cleanupError) {
            console.error('❌ Error al limpiar tokens:', cleanupError)
          }
        }

        // Limpiar tokens de pastor cuando se alcanza el máximo de reintentos
        if (!isInvitadoEndpoint) {
          logDebug('🧹 Limpiando tokens de pastor después de máximo de reintentos')
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

      logDebug(`🔄 Error 401 detectado, intentando refrescar token (intento ${retryCount}/1)`)
      logDebug('🔍 URL del request:', originalRequest.url)
      logDebug('🔍 Método del request:', originalRequest.method)
      logDebug('🔍 Headers del request:', originalRequest.headers)

      // Marcar como intentado ANTES de refrescar (ya está marcado arriba, pero asegurarse)
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
        // Detectar si es un endpoint de invitados o de pastores (incluye unificado /credenciales/mis-credenciales)
        const isInvitadoEndpoint =
          originalRequest.url?.includes('/auth/invitado/me') ||
          originalRequest.url?.includes('/auth/invitado/logout') ||
          originalRequest.url?.includes('/credenciales/mis-credenciales') ||
          originalRequest.url?.includes('/credenciales-ministeriales/mis-credenciales') ||
          originalRequest.url?.includes('/credenciales-capellania/mis-credenciales') ||
          originalRequest.url?.includes('/credenciales-ministeriales/consultar/') ||
          originalRequest.url?.includes('/credenciales-capellania/consultar/') ||
          originalRequest.url?.includes('/inscripciones/my') ||
          originalRequest.url?.includes('/inscripciones') && originalRequest.method === 'post' ||
          originalRequest.url?.includes('/solicitudes-credenciales') ||
          originalRequest.url?.includes('/notifications/register/invitado')

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
          logDebug('🔍 Endpoint detectado como INVITADO')
          logDebug('🔍 Refresh token disponible:', !!refreshToken, refreshToken ? `(${refreshToken.length} chars)` : '(no disponible)')
        } else {
          // Para pastores
          refreshToken = await SecureStore.getItemAsync('refresh_token')
          refreshEndpoint = '/auth/pastor/refresh'
          tokenKey = 'access_token'
          refreshTokenKey = 'refresh_token'
          logDebug('🔍 Endpoint detectado como PASTOR')
          logDebug('🔍 Refresh token disponible:', !!refreshToken, refreshToken ? `(${refreshToken.length} chars)` : '(no disponible)')
        }

        // Si no hay refresh token: limpiar tokens y rechazar inmediatamente
        if (!refreshToken) {
          console.warn(`⚠️ No hay ${refreshTokenKey} disponible para refrescar`)
          if (isInvitadoEndpoint) {
            console.warn('⚠️ Cierra sesión en Perfil y vuelve a entrar con Google.')
            // Limpiar tokens de invitado cuando no hay refresh token disponible
            try {
              await SecureStore.deleteItemAsync('invitado_token')
              await SecureStore.deleteItemAsync('invitado_refresh_token')
              logDebug('🧹 Tokens de invitado limpiados (no hay refresh token disponible)')
            } catch (cleanupError) {
              console.error('❌ Error al limpiar tokens:', cleanupError)
            }
          }
          // Crear error más descriptivo
          const noRefreshTokenError = new Error(
            isInvitadoEndpoint
              ? 'Sesión expirada. Por favor, cierra sesión en Perfil y vuelve a entrar con Google.'
              : 'Sesión expirada. Por favor, vuelve a iniciar sesión.'
          ) as Error & { isSessionExpired?: boolean; requiresReauth?: boolean }
          noRefreshTokenError.isSessionExpired = true
          noRefreshTokenError.requiresReauth = true
          return Promise.reject(noRefreshTokenError)
        }

        // Invitado: mutex para que solo un refresh se ejecute a la vez; el resto espera y reutiliza el nuevo token
        if (isInvitadoEndpoint) {
          if (invitadoRefreshPromise) {
            logDebug('🔄 Esperando refresh de invitado en curso...')
            try {
              const newToken = await invitadoRefreshPromise
              if (newToken) {
                if (!originalRequest.headers) originalRequest.headers = {}
                originalRequest.headers.Authorization = `Bearer ${newToken}`
                originalRequest._retryAfterRefresh = true
                logDebug('🔄 Reintentando request con token del refresh en curso')
                try {
                  const retryResponse = await apiClient.request(originalRequest)
                  delete originalRequest._retryAfterRefresh
                  return retryResponse
                } catch (retryError) {
                  // Si el request con el nuevo token también falla, limpiar tokens y rechazar
                  const retryAxiosError = retryError as { response?: { status?: number } }
                  if (retryAxiosError?.response?.status === 401) {
                    logError('❌ Sesión expirada: El token refrescado también es inválido.')
                    try {
                      await SecureStore.deleteItemAsync('invitado_token')
                      await SecureStore.deleteItemAsync('invitado_refresh_token')
                      logDebug('🧹 Tokens de invitado limpiados (token refrescado también inválido)')
                    } catch {}
                    
                    const sessionExpiredError = new Error(
                      'Sesión expirada. Por favor, cierra sesión en Perfil y vuelve a entrar con Google.'
                    ) as Error & { isSessionExpired?: boolean; requiresReauth?: boolean; response?: { status?: number } }
                    sessionExpiredError.isSessionExpired = true
                    sessionExpiredError.requiresReauth = true
                    sessionExpiredError.response = { status: 401 }
                    return Promise.reject(sessionExpiredError)
                  }
                  // Si no es 401, propagar el error original
                  return Promise.reject(retryError)
                }
              }
              // Si el refresh retornó null (falló), crear error de sesión expirada
              logError('❌ Sesión expirada: Refresh token inválido o expirado')
              const sessionExpiredError = new Error(
                'Sesión expirada. Por favor, cierra sesión en Perfil y vuelve a entrar con Google.'
              ) as Error & { isSessionExpired?: boolean; requiresReauth?: boolean; response?: { status?: number } }
              sessionExpiredError.isSessionExpired = true
              sessionExpiredError.requiresReauth = true
              sessionExpiredError.response = { status: 401 }
              return Promise.reject(sessionExpiredError)
            } catch (refreshError) {
              // Si el refresh falló con error, verificar si es error de red o de sesión
              const errorObj = refreshError as Error & { isNetworkError?: boolean; isSessionExpired?: boolean }
              if (errorObj.isNetworkError) {
                // Si es error de red, propagarlo como error de red (no limpiar tokens)
                console.error('❌ Refresh falló con error de red:', refreshError)
                return Promise.reject(refreshError)
              }
              // Si no es error de red, tratar como error de sesión expirada
              console.error('❌ Refresh falló con error, sesión expirada')
              try {
                await SecureStore.deleteItemAsync('invitado_token')
                await SecureStore.deleteItemAsync('invitado_refresh_token')
                logDebug('🧹 Tokens de invitado limpiados (refresh falló)')
              } catch {}
              
              const sessionExpiredError = new Error(
                'Sesión expirada. Por favor, cierra sesión en Perfil y vuelve a entrar con Google.'
              ) as Error & { isSessionExpired?: boolean; requiresReauth?: boolean; response?: { status?: number } }
              sessionExpiredError.isSessionExpired = true
              sessionExpiredError.requiresReauth = true
              sessionExpiredError.response = { status: 401 }
              return Promise.reject(sessionExpiredError)
            }
          }

          const doRefresh = async (): Promise<string | null> => {
            try {
              logDebug('🔄 Intentando refrescar token...')
              const refreshAxios = axios.create({
                baseURL: API_URL,
                timeout: 8000,
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              })
              logDebug('🔄 Enviando request de refresh...')
              const response = await refreshAxios.post(refreshEndpoint, { refreshToken })
              logDebug('✅ Respuesta de refresh recibida, status:', response.status)
              
              const data = response.data as { access_token?: string; accessToken?: string; refresh_token?: string; refreshToken?: string }
              const access_token = data.access_token ?? data.accessToken ?? null
              const newRefreshToken = data.refresh_token ?? data.refreshToken ?? null
              
              if (!access_token) {
                logError('❌ Error: Refresh exitoso pero no se recibió access_token')
                logDebug('📊 Datos recibidos:', JSON.stringify(data))
                // Limpiar tokens si el refresh no retornó token
                try {
                  await SecureStore.deleteItemAsync('invitado_token')
                  await SecureStore.deleteItemAsync('invitado_refresh_token')
                  logDebug('🧹 Tokens limpiados (refresh no retornó token)')
                } catch {}
                return null
              }
              
              logDebug('💾 Guardando nuevo access token...')
              await SecureStore.setItemAsync(tokenKey, access_token)
              if (newRefreshToken) {
                logDebug('💾 Guardando nuevo refresh token...')
                await SecureStore.setItemAsync(refreshTokenKey, newRefreshToken)
              } else {
                logWarn('⚠️ No se recibió nuevo refresh token, manteniendo el anterior')
              }
              logDebug('✅ Token refrescado exitosamente, nuevo token guardado (length:', access_token.length, 'chars)')
              return access_token
            } catch (e) {
              const ax = e as { response?: { status?: number; data?: unknown } }
              const status = ax?.response?.status
              
              // Si el refresh falla con 401/403, el refresh token está expirado o inválido
              if (status === 401 || status === 403) {
                logError(`❌ Sesión expirada: Refresh token expirado o inválido (${status})`)
                try {
                  await SecureStore.deleteItemAsync('invitado_token')
                  await SecureStore.deleteItemAsync('invitado_refresh_token')
                  logDebug('🧹 Tokens limpiados (refresh token expirado/inválido)')
                } catch {}
                // Retornar null indica que el refresh falló por sesión expirada
                return null
              }
              
              // Si es error de red, lanzar el error para que se propague correctamente (no limpiar tokens)
              const errorCode = (e as { code?: string })?.code
              const errorMsg = e instanceof Error ? e.message : ''
              if (
                errorCode === 'ERR_NETWORK' ||
                errorCode === 'ECONNREFUSED' ||
                errorCode === 'ETIMEDOUT' ||
                errorCode === 'ENOTFOUND' ||
                errorMsg.includes('Network Error') ||
                errorMsg.includes('timeout') ||
                errorMsg.includes('getaddrinfo')
              ) {
                console.warn('⚠️ Error de red al refrescar token, no limpiar tokens')
                // Para errores de red, lanzar el error para que se propague correctamente
                const networkError = e instanceof Error ? e : new Error(String(e))
                const networkErrorWithFlag = networkError as Error & { isNetworkError?: boolean }
                networkErrorWithFlag.isNetworkError = true
                throw networkErrorWithFlag
              }
              
              // Para otros errores (no 401/403, no red), retornar null (se manejará como error de sesión)
              console.warn('⚠️ Error desconocido al refrescar token:', errorMsg)
              return null
            } finally {
              invitadoRefreshPromise = null
            }
          }
          invitadoRefreshPromise = doRefresh()
          try {
            const newToken = await invitadoRefreshPromise
            if (newToken) {
              if (!originalRequest.headers) originalRequest.headers = {}
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              // NO eliminar _retry para evitar loops infinitos si el nuevo token también falla
              // En su lugar, usar un flag diferente para el reintento post-refresh
              originalRequest._retryAfterRefresh = true
              logDebug('🔄 Reintentando request original con nuevo token...')
              try {
                logDebug('🔄 Reintentando request con nuevo token...')
                const retryResponse = await apiClient.request(originalRequest)
                logDebug('✅ Request con token refrescado exitoso')
                // Si el reintento es exitoso, limpiar el flag
                delete originalRequest._retryAfterRefresh
                return retryResponse
              } catch (retryError) {
                // Si el request con el nuevo token también falla, puede ser que:
                // 1. El refresh token estaba expirado pero el backend lo aceptó y devolvió un token inválido
                // 2. El nuevo access token tiene un problema (formato, firma, etc.)
                // 3. Hay un problema de sincronización de tiempo entre dispositivo y servidor
                // 4. El backend está rechazando tokens válidos por alguna razón
                
                // Verificar si es un AxiosError o un Error personalizado
                const isAxiosError = retryError && typeof retryError === 'object' && 'response' in retryError
                const retryAxiosError = retryError as { response?: { status?: number; data?: unknown } }
                const retryStatus = retryAxiosError?.response?.status
                
                // También verificar si es un error personalizado con flags de sesión expirada
                const isSessionExpiredError = retryError instanceof Error && 
                  (retryError as Error & { isSessionExpired?: boolean }).isSessionExpired === true
                
                logError('❌ El request con el token refrescado también falló.')
                logDebug('📊 Status:', retryStatus || (isSessionExpiredError ? 'Session Expired (custom error)' : 'Unknown'))
                logDebug('📊 Error data:', retryAxiosError?.response?.data || (retryError instanceof Error ? retryError.message : 'Unknown error'))
                
                // Si es 401 o un error de sesión expirada, limpiar tokens y rechazar
                if (retryStatus === 401 || isSessionExpiredError) {
                  logError('❌ Sesión expirada: El refresh token está expirado o inválido.')
                  logDebug('🔍 El backend aceptó el refresh pero el nuevo token no es válido.')
                  
                  // Limpiar tokens ya que el refresh token claramente está expirado o inválido
                  try {
                    await SecureStore.deleteItemAsync('invitado_token')
                    await SecureStore.deleteItemAsync('invitado_refresh_token')
                    logDebug('🧹 Tokens limpiados (refresh token expirado/inválido)')
                  } catch {}
                  
                  // Si ya es un error de sesión expirada, propagarlo tal cual
                  // Pero asegurarse de que el flag _retryAfterRefresh esté en el error para evitar loops
                  if (isSessionExpiredError && retryError instanceof Error) {
                    // Asegurarse de que el error tenga el flag para evitar loops
                    const errorWithFlag = retryError as Error & { _retryAfterRefresh?: boolean }
                    errorWithFlag._retryAfterRefresh = true
                    return Promise.reject(errorWithFlag)
                  }
                  
                  // Si no, crear nuevo error de sesión expirada con el flag
                  const sessionExpiredError = new Error(
                    'Sesión expirada. Por favor, cierra sesión en Perfil y vuelve a entrar con Google.'
                  ) as Error & { isSessionExpired?: boolean; requiresReauth?: boolean; response?: { status?: number }; _retryAfterRefresh?: boolean }
                  sessionExpiredError.isSessionExpired = true
                  sessionExpiredError.requiresReauth = true
                  sessionExpiredError.response = { status: 401 }
                  sessionExpiredError._retryAfterRefresh = true // Marcar para evitar loops
                  return Promise.reject(sessionExpiredError)
                }
                // Si no es 401 ni error de sesión expirada, propagar el error original
                logError('❌ Error diferente a 401:', retryError)
                return Promise.reject(retryError)
              }
            }
            // Si el refresh retornó null (falló por 401/403 u otro error), limpiar tokens y rechazar con error apropiado
            console.error('❌ Refresh falló (retornó null), sesión expirada')
            try {
              await SecureStore.deleteItemAsync('invitado_token')
              await SecureStore.deleteItemAsync('invitado_refresh_token')
              logDebug('🧹 Tokens de invitado limpiados (refresh falló)')
            } catch {}
            
            // Crear error de sesión expirada (no error de red)
            const sessionExpiredError = new Error(
              'Sesión expirada. Por favor, cierra sesión en Perfil y vuelve a entrar con Google.'
            ) as Error & { isSessionExpired?: boolean; requiresReauth?: boolean; response?: { status?: number } }
            sessionExpiredError.isSessionExpired = true
            sessionExpiredError.requiresReauth = true
            sessionExpiredError.response = { status: 401 }
            return Promise.reject(sessionExpiredError)
          } catch (refreshError) {
            // Si el refresh lanzó un error (ej. error de red), verificar si es error de red o de sesión
            const errorObj = refreshError as Error & { isNetworkError?: boolean; isSessionExpired?: boolean }
            if (errorObj.isNetworkError) {
              // Si es error de red, propagarlo como error de red (no limpiar tokens)
              console.error('❌ Refresh falló con error de red:', refreshError)
              return Promise.reject(refreshError)
            }
            // Si no es error de red, tratar como error de sesión expirada
            console.error('❌ Refresh falló con error, sesión expirada')
            try {
              await SecureStore.deleteItemAsync('invitado_token')
              await SecureStore.deleteItemAsync('invitado_refresh_token')
              logDebug('🧹 Tokens de invitado limpiados (refresh falló con error)')
            } catch {}
            
            // Crear error de sesión expirada
            const sessionExpiredError = new Error(
              'Sesión expirada. Por favor, cierra sesión en Perfil y vuelve a entrar con Google.'
            ) as Error & { isSessionExpired?: boolean; requiresReauth?: boolean; response?: { status?: number } }
            sessionExpiredError.isSessionExpired = true
            sessionExpiredError.requiresReauth = true
            sessionExpiredError.response = { status: 401 }
            return Promise.reject(sessionExpiredError)
          }
        }

        // Pastor: flujo sin mutex
        console.log('🔄 Intentando refrescar token de pastor...')
        const refreshAxios = axios.create({
          baseURL: API_URL,
          timeout: 8000,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        })

        const response = await refreshAxios.post(refreshEndpoint, {
          refreshToken: refreshToken,
        })

        const data = response.data as { access_token?: string; accessToken?: string; refresh_token?: string; refreshToken?: string }
        const access_token = data.access_token ?? data.accessToken ?? null
        const newRefreshToken = data.refresh_token ?? data.refreshToken ?? null

        if (!access_token) {
          throw new Error('No access token recibido en respuesta de refresh')
        }

        await SecureStore.setItemAsync(tokenKey, access_token)
        if (newRefreshToken) {
          await SecureStore.setItemAsync(refreshTokenKey, newRefreshToken)
        }

        console.log('✅ Token de pastor refrescado exitosamente')

        if (!originalRequest.headers) {
          originalRequest.headers = {}
        }
        originalRequest.headers.Authorization = `Bearer ${access_token}`

        // Usar _retryAfterRefresh para detectar si el nuevo token también falla
        originalRequest._retryAfterRefresh = true
        console.log('🔄 Reintentando request original con nuevo token...')
        const retryResponse = await apiClient.request(originalRequest)
        // Si el reintento es exitoso, limpiar el flag
        delete originalRequest._retryAfterRefresh
        return retryResponse
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
          originalRequest.url?.includes('/credenciales/mis-credenciales') ||
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
              logDebug('🧹 Tokens de invitado limpiados debido a error de autorización')
            } else {
              await SecureStore.deleteItemAsync('access_token')
              await SecureStore.deleteItemAsync('refresh_token')
              logDebug('🧹 Tokens de pastor limpiados debido a error de autorización')
            }
          } catch (cleanupError) {
            console.error('❌ Error limpiando tokens:', cleanupError)
          }
          
          // Crear error de sesión expirada (no error de red)
          const sessionExpiredError = new Error(
            isInvitadoEndpoint
              ? 'Sesión expirada. Por favor, cierra sesión en Perfil y vuelve a entrar con Google.'
              : 'Sesión expirada. Por favor, vuelve a iniciar sesión.'
          ) as Error & { isSessionExpired?: boolean; requiresReauth?: boolean; response?: { status?: number } }
          sessionExpiredError.isSessionExpired = true
          sessionExpiredError.requiresReauth = true
          sessionExpiredError.response = { status: 401 }
          return Promise.reject(sessionExpiredError)
        } else {
          console.log('⚠️ Error de red o conexión, manteniendo tokens para reintentar')
        }

        // Rechazar el error original si no es de autorización
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
