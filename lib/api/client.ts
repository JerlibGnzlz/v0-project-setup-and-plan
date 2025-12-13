import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000, // 5 minutos por defecto (para operaciones largas como recordatorios)
})

// Add auth token to requests
apiClient.interceptors.request.use((config: any) => {
  // Solo acceder a localStorage/sessionStorage en el cliente
  if (typeof window !== 'undefined') {
    // Detectar el contexto según la ruta actual del navegador y la URL de la petición
    const currentPath = window.location.pathname || ''
    const requestUrl = config.url || ''

    // Detectar contexto según la ruta actual del navegador (más confiable)
    const isAdminContext = currentPath.startsWith('/admin')
    const isInvitadoContext = currentPath.startsWith('/convencion')
    const isPastorContext = currentPath.startsWith('/pastor') || currentPath.startsWith('/equipo')

    // También verificar la URL de la petición como respaldo
    const isAdminApiRoute =
      requestUrl.startsWith('/auth/') &&
      !requestUrl.includes('/invitado') &&
      !requestUrl.includes('/pastor')
    const isInvitadoApiRoute =
      requestUrl.includes('/invitado') || requestUrl.includes('/convencion')
    const isPastorApiRoute = requestUrl.includes('/pastor')

    let token: string | null = null

    // Priorizar token según el contexto (ruta del navegador tiene prioridad)
    if (isAdminContext || (isAdminApiRoute && !isInvitadoContext && !isPastorContext)) {
      // Para contexto de admin, usar token de admin primero
      token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    } else if (isInvitadoContext || isInvitadoApiRoute) {
      // Para contexto de invitado, usar token de invitado primero
      token = localStorage.getItem('invitado_token') || sessionStorage.getItem('invitado_token')
    } else if (isPastorContext || isPastorApiRoute) {
      // Para contexto de pastor, usar token de pastor primero
      token =
        localStorage.getItem('pastor_auth_token') || sessionStorage.getItem('pastor_auth_token')
    } else {
      // Fallback: buscar en orden de prioridad general (admin primero)
      token =
        localStorage.getItem('auth_token') ||
        sessionStorage.getItem('auth_token') ||
        localStorage.getItem('pastor_auth_token') ||
        sessionStorage.getItem('pastor_auth_token') ||
        localStorage.getItem('invitado_token') ||
        sessionStorage.getItem('invitado_token')
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Handle auth errors
apiClient.interceptors.response.use(
  (response: any) => {
    return response
  },
  (error: any) => {
    // Manejar errores de red de forma más clara
    if (!error.response) {
      // Error de red (servidor no disponible, CORS, etc.)
      const errorMessage = String(error.message || 'Error de conexión desconocido')
      const errorCode = String(error.code || 'UNKNOWN')
      const requestUrl = String(error.config?.url || 'N/A')
      const requestMethod = String(error.config?.method?.toUpperCase() || 'N/A')
      const fullUrl = error.config
        ? String(`${error.config.baseURL || API_URL}${error.config.url}`)
        : String(API_URL)

      // Log detallado pero serializable - usar múltiples console.error para evitar problemas de serialización
      console.error('[apiClient] Error de red detectado')
      console.error('[apiClient] Mensaje:', errorMessage)
      console.error('[apiClient] Código:', errorCode)
      console.error('[apiClient] API URL:', API_URL)
      console.error('[apiClient] Request URL:', requestUrl)
      console.error('[apiClient] Método:', requestMethod)
      console.error('[apiClient] URL completa:', fullUrl)

      // Solo mostrar el error en consola, no lanzar excepción para evitar interrumpir el flujo
      // El componente puede manejar el error según sea necesario
      const networkError = new Error(
        `Error de conexión: No se pudo conectar con el servidor en ${API_URL}. ` +
          `Verifica que el backend esté corriendo y accesible. ` +
          `(${errorMessage})`
      )
      ;(networkError as any).isNetworkError = true
      ;(networkError as any).code = errorCode
      ;(networkError as any).requestUrl = requestUrl
      ;(networkError as any).requestMethod = requestMethod

      return Promise.reject(networkError)
    }

    // Solo manejar redirección en el cliente
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      const currentPath = window.location.pathname
      const requestUrl = error.config?.url || ''
      
      // Intentar refrescar token solo para admin (no para refresh endpoint ni login)
      if (
        currentPath.startsWith('/admin') &&
        !requestUrl.includes('/auth/refresh') &&
        !requestUrl.includes('/auth/login')
      ) {
        // Intentar refrescar el token antes de redirigir
        const refreshToken =
          localStorage.getItem('auth_refresh_token') ||
          sessionStorage.getItem('auth_refresh_token')

        if (refreshToken && error.config) {
          // Usar función async para manejar la promesa
          const refreshAndRetry = async () => {
            try {
              // Importar dinámicamente para evitar dependencias circulares
              const { authApi } = await import('./auth')
              const response = await authApi.refreshToken(refreshToken)

              // Guardar nuevos tokens
              const storage = localStorage.getItem('auth_token')
                ? localStorage
                : sessionStorage
              storage.setItem('auth_token', response.access_token)
              if (response.refresh_token) {
                storage.setItem('auth_refresh_token', response.refresh_token)
              }

              // Reintentar la petición original con el nuevo token
              if (error.config) {
                error.config.headers.Authorization = `Bearer ${response.access_token}`
                return apiClient.request(error.config)
              }
            } catch (refreshError) {
              console.error('[apiClient] Error al refrescar token:', refreshError)
              // Si falla el refresh, continuar con el logout
              throw refreshError
            }
          }

          // Retornar la promesa para que axios la maneje
          return refreshAndRetry().catch(() => {
            // Si falla, continuar con el flujo normal de logout
          })
        }
      }

      // Si no se pudo refrescar o no hay refresh token, limpiar y redirigir
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_refresh_token')
      sessionStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_refresh_token')
      localStorage.removeItem('pastor_auth_token')
      sessionStorage.removeItem('pastor_auth_token')
      localStorage.removeItem('invitado_token')
      sessionStorage.removeItem('invitado_token')

      // Redirigir según la ruta actual
      if (currentPath.startsWith('/admin')) {
        window.location.href = '/admin/login'
      } else if (currentPath.startsWith('/convencion')) {
        // No redirigir desde convención, dejar que el componente maneje el error
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
