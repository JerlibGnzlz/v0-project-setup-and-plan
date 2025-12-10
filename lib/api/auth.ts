import { apiClient } from './client'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: {
    id: string
    email: string
    nombre: string
    rol: string
    avatar?: string | null
  }
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    console.log('[authApi] Enviando petición de login:', { email: data.email })
    try {
      console.log('[authApi] Esperando respuesta del servidor...')
      
      // Agregar timeout explícito para evitar que se quede colgado
      const timeout = 10000 // 10 segundos
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: El servidor no respondió en 10 segundos')), timeout)
      })
      
      const responsePromise = apiClient.post<LoginResponse>('/auth/login', data)
      const response = await Promise.race([responsePromise, timeoutPromise])
      
      console.log('[authApi] Respuesta recibida (raw):', response)
      console.log('[authApi] Respuesta data:', response.data)
      console.log('[authApi] Respuesta recibida:', {
        hasToken: !!response.data?.access_token,
        hasUser: !!response.data?.user,
        tokenLength: response.data?.access_token?.length || 0,
        userEmail: response.data?.user?.email || 'N/A',
      })
      
      // Validar que la respuesta tenga el formato correcto
      if (!response.data?.access_token || !response.data?.user) {
        console.error('[authApi] Respuesta inválida:', response.data)
        throw new Error('Respuesta del servidor inválida: faltan access_token o user')
      }
      
      return response.data
    } catch (error: any) {
      // Manejo seguro de errores sin serializar objetos complejos
      const errorMessage = error?.message || 'Error desconocido'
      const errorStatus = error?.response?.status
      const errorData = error?.response?.data

      // Extraer mensaje de error de forma segura
      let errorDetail = errorMessage
      if (errorData) {
        if (typeof errorData === 'string') {
          errorDetail = errorData
        } else if (errorData?.message) {
          errorDetail = errorData.message
        } else if (errorData?.error?.message) {
          errorDetail = errorData.error.message
        }
      }

      console.error('[authApi] Error en login:', errorMessage)
      console.error('[authApi] Error completo:', {
        message: errorMessage,
        status: errorStatus,
        code: error?.code,
        response: error?.response?.data,
        config: error?.config?.url,
      })
      
      if (errorStatus) {
        console.error('[authApi] Status:', errorStatus)
      }
      if (errorDetail !== errorMessage) {
        console.error('[authApi] Detalle:', errorDetail)
      }

      // Si es timeout, proporcionar mensaje específico
      if (errorMessage.includes('Timeout') || errorMessage.includes('timeout')) {
        const timeoutError = new Error(
          'El servidor tardó demasiado en responder. Por favor, verifica tu conexión e intenta nuevamente.'
        )
        ;(timeoutError as any).isNetworkError = true
        ;(timeoutError as any).code = 'TIMEOUT'
        throw timeoutError
      }

      // Si es un error de red, proporcionar mensaje más útil
      if (errorMessage === 'Network Error' || !error.response || error.isNetworkError) {
        const networkError = new Error(
          'No se pudo conectar con el servidor. Por favor, verifica que el backend esté corriendo.'
        )
        ;(networkError as any).isNetworkError = true
        ;(networkError as any).code = error.code || 'NETWORK_ERROR'
        throw networkError
      }

      throw error
    }
  },

  register: async (data: {
    email: string
    password: string
    nombre: string
  }): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/register', data)
      return response.data
    } catch (error: any) {
      // Manejo seguro de errores
      const errorMessage = error?.message || 'Error desconocido'
      const errorStatus = error?.response?.status
      const errorData = error?.response?.data

      let errorDetail = errorMessage
      if (errorData) {
        if (typeof errorData === 'string') {
          errorDetail = errorData
        } else if (errorData?.message) {
          errorDetail = errorData.message
        } else if (errorData?.error?.message) {
          errorDetail = errorData.error.message
        }
      }

      console.error('[authApi] Error en register:', errorMessage)
      if (errorStatus) {
        console.error('[authApi] Status:', errorStatus)
      }
      if (errorDetail !== errorMessage) {
        console.error('[authApi] Detalle:', errorDetail)
      }

      throw error
    }
  },

  getProfile: async (): Promise<LoginResponse['user']> => {
    const response = await apiClient.get<LoginResponse['user']>('/auth/me')
    return response.data
  },
}
