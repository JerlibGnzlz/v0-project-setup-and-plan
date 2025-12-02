import { apiClient } from "./client"

export interface UnifiedLoginRequest {
  email: string
  password: string
}

export interface UnifiedLoginResponse {
  access_token: string
  refresh_token: string
  user: {
    id: string
    nombre: string
    apellido: string
    email: string
    telefono?: string
    sede?: string
    tipo: 'ADMIN' | 'PASTOR' | 'INVITADO'
    role: string
  }
}

export const unifiedAuthApi = {
  login: async (data: UnifiedLoginRequest): Promise<UnifiedLoginResponse> => {
    try {
      const response = await apiClient.post<UnifiedLoginResponse>("/auth/login/unified", data)
      return response.data
    } catch (error: any) {
      console.error('[unifiedAuthApi] Error en login:', error)
      throw error
    }
  },
}

