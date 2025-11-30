import { apiClient } from "./client"

export interface PastorLoginRequest {
  email: string
  password: string
}

export interface PastorRegisterCompleteRequest {
  nombre: string
  apellido: string
  email: string
  password: string
  sede?: string
  telefono?: string
}

export interface PastorLoginResponse {
  access_token: string
  refresh_token: string
  pastor: {
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
}

export interface PastorRegisterCompleteResponse {
  message: string
  pastor: {
    id: string
    nombre: string
    apellido: string
    email: string
  }
}

export const pastorAuthApi = {
  login: async (data: PastorLoginRequest): Promise<PastorLoginResponse> => {
    const response = await apiClient.post<PastorLoginResponse>("/auth/pastor/login", data)
    return response.data
  },

  registerComplete: async (data: PastorRegisterCompleteRequest): Promise<PastorRegisterCompleteResponse> => {
    try {
      const response = await apiClient.post<PastorRegisterCompleteResponse>("/auth/pastor/register-complete", data)
      return response.data
    } catch (error: any) {
      // Si hay un error, lanzarlo con más información
      if (error.response) {
        throw new Error(error.response.data?.message || error.response.data?.error || 'Error al registrar pastor')
      }
      throw error
    }
  },

  getProfile: async () => {
    const response = await apiClient.get("/auth/pastor/me")
    return response.data
  },
}




