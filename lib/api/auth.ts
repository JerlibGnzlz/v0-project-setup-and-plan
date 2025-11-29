import { apiClient } from "./client"

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
      const response = await apiClient.post<LoginResponse>("/auth/login", data)
      console.log('[authApi] Respuesta recibida:', { hasToken: !!response.data.access_token, hasUser: !!response.data.user })
      return response.data
    } catch (error: any) {
      console.error('[authApi] Error en login:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      throw error
    }
  },

  register: async (data: {
    email: string
    password: string
    nombre: string
  }): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/auth/register", data)
    return response.data
  },

  getProfile: async (): Promise<LoginResponse["user"]> => {
    const response = await apiClient.get<LoginResponse["user"]>("/auth/me")
    return response.data
  },
}
