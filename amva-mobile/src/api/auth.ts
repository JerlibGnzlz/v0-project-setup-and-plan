import { apiClient } from './client'

export interface Pastor {
  id: string
  nombre: string
  apellido: string
  email: string
  tipo: string
  cargo?: string
  ministerio?: string
  sede?: string
  region?: string
  pais?: string
  fotoUrl?: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  pastor: Pastor
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    console.log('📡 authApi.login: Enviando request a /auth/pastor/login')
    console.log('📡 authApi.login: Base URL:', apiClient.defaults.baseURL)
    try {
      const response = await apiClient.post<AuthResponse>('/auth/pastor/login', {
        email,
        password,
      })
      console.log('✅ authApi.login: Respuesta recibida')
      return response.data
    } catch (error: unknown) {
      // Log detallado del error
      if (error && typeof error === 'object') {
        const axiosError = error as {
          response?: {
            status?: number
            data?: {
              error?: { message?: string }
              message?: string | string[]
            }
            statusText?: string
          }
          message?: string
          code?: string
        }

        console.error('❌ authApi.login: Error detallado:', {
          code: axiosError.code,
          message: axiosError.message,
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
        })

        // Extraer mensaje de error del formato del backend
        let errorMessageText = 'Error al iniciar sesión'
        if (axiosError.response?.data) {
          const responseData = axiosError.response.data
          // El backend devuelve: { error: { message: "..." } }
          if (responseData.error?.message) {
            errorMessageText = responseData.error.message
          } else if (responseData.message) {
            errorMessageText = Array.isArray(responseData.message)
              ? responseData.message.join(', ')
              : responseData.message
          }
        } else if (axiosError.message) {
          errorMessageText = axiosError.message
        }

        // Crear un error con el mensaje extraído
        const errorWithMessage = new Error(errorMessageText)
        // Mantener información del error original para el manejo en LoginScreen
        ;(errorWithMessage as unknown as { response?: unknown }).response = axiosError.response
        ;(errorWithMessage as unknown as { code?: string }).code = axiosError.code
        throw errorWithMessage
      }

      // Si no es un error de axios conocido, lanzar el error original
      throw error
    }
  },

  register: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/pastor/register', {
      email,
      password,
    })
    return response.data
  },

  refresh: async (
    refreshToken: string
  ): Promise<{ access_token: string; refresh_token: string }> => {
    const response = await apiClient.post<{ access_token: string; refresh_token: string }>(
      '/auth/pastor/refresh',
      { refreshToken }
    )
    return response.data
  },

  me: async (): Promise<Pastor> => {
    const response = await apiClient.get<Pastor>('/auth/pastor/me')
    return response.data
  },

  registerComplete: async (data: {
    nombre: string
    apellido: string
    email: string
    password: string
    sede?: string
    telefono?: string
  }): Promise<{ message: string; pastor: Pastor }> => {
    const response = await apiClient.post<{ message: string; pastor: Pastor }>(
      '/auth/pastor/register-complete',
      data
    )
    return response.data
  },
}
