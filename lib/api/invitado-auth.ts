import { apiClient } from "./client"

export interface InvitadoRegisterRequest {
  nombre: string
  apellido: string
  email: string
  password: string
  telefono?: string
  sede?: string
}

export interface InvitadoLoginRequest {
  email: string
  password: string
}

export interface InvitadoRegisterCompleteRequest {
  nombre: string
  apellido: string
  email: string
  password: string
  telefono?: string
  sede?: string
}

export interface Invitado {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  sede?: string
  fotoUrl?: string
}

export interface InvitadoRegisterResponse {
  access_token: string
  refresh_token: string
  invitado: Invitado
}

export interface InvitadoLoginResponse {
  access_token: string
  refresh_token: string
  invitado: Invitado
}

export interface InvitadoRegisterCompleteResponse {
  access_token: string
  refresh_token: string
  invitado: Invitado
}

export const invitadoAuthApi = {
  register: async (data: InvitadoRegisterRequest): Promise<InvitadoRegisterResponse> => {
    try {
      const response = await apiClient.post<InvitadoRegisterResponse>("/auth/invitado/register", data)
      return response.data
    } catch (error: any) {
      console.error('[invitadoAuthApi] Error en register:', error)
      throw error
    }
  },

  registerComplete: async (data: InvitadoRegisterCompleteRequest): Promise<InvitadoRegisterCompleteResponse> => {
    try {
      const response = await apiClient.post<InvitadoRegisterCompleteResponse>("/auth/invitado/register-complete", data)
      return response.data
    } catch (error: any) {
      console.error('[invitadoAuthApi] Error en registerComplete:', error)
      throw error
    }
  },

  login: async (data: InvitadoLoginRequest): Promise<InvitadoLoginResponse> => {
    try {
      const response = await apiClient.post<InvitadoLoginResponse>("/auth/invitado/login", data)
      return response.data
    } catch (error: any) {
      console.error('[invitadoAuthApi] Error en login:', error)
      throw error
    }
  },

  getProfile: async (): Promise<Invitado> => {
    try {
      const response = await apiClient.get<Invitado>("/auth/invitado/me")
      return response.data
    } catch (error: any) {
      console.error('[invitadoAuthApi] Error obteniendo perfil:', error)
      throw error
    }
  },

  logout: async (refreshToken?: string): Promise<void> => {
    try {
      await apiClient.post("/auth/invitado/logout", { refreshToken })
    } catch (error: any) {
      console.error('[invitadoAuthApi] Error en logout:', error)
      // No lanzar error, siempre limpiar localStorage
    }
  },
}



