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
      const response = await apiClient.post<LoginResponse>('/auth/login', data)
      console.log('[authApi] Respuesta recibida:', {
        hasToken: !!response.data.access_token,
        hasUser: !!response.data.user,
      })
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
      if (errorStatus) {
        console.error('[authApi] Status:', errorStatus)
      }
      if (errorDetail !== errorMessage) {
        console.error('[authApi] Detalle:', errorDetail)
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
