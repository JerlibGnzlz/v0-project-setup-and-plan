import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add auth token to requests
apiClient.interceptors.request.use((config: any) => {
  // Solo acceder a localStorage/sessionStorage en el cliente
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
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
      localStorage.removeItem("auth_token")
      sessionStorage.removeItem("auth_token")
      window.location.href = "/admin/login"
    }
    
    return Promise.reject(error)
  },
)

export default apiClient
