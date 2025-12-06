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
    } catch (error: any) {
      console.error('❌ authApi.login: Error:', error?.response?.data || error?.message || error)
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
