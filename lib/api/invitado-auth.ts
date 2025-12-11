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
      console.log('[invitadoAuthApi] Enviando datos a /auth/invitado/register:', {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        telefono: data.telefono,
        sede: data.sede,
      })
      const response = await apiClient.post<InvitadoRegisterResponse>("/auth/invitado/register", data)
      console.log('[invitadoAuthApi] Respuesta exitosa:', response.data)
      return response.data
    } catch (error: any) {
      console.error('[invitadoAuthApi] Error en register:', error)
      throw error
    }
  },

  registerComplete: async (data: InvitadoRegisterCompleteRequest): Promise<InvitadoRegisterCompleteResponse> => {
    try {
      console.log('[invitadoAuthApi] Enviando datos a /auth/invitado/register-complete:', {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        telefono: data.telefono,
        sede: data.sede,
      })
      const response = await apiClient.post<InvitadoRegisterCompleteResponse>("/auth/invitado/register-complete", data)
      console.log('[invitadoAuthApi] Respuesta exitosa:', response.data)
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
      console.log('[invitadoAuthApi] Obteniendo perfil del invitado...')
      const response = await apiClient.get<Invitado>("/auth/invitado/me")
      console.log('[invitadoAuthApi] Perfil obtenido exitosamente:', response.data)
      return response.data
    } catch (error: any) {
      console.error('[invitadoAuthApi] Error obteniendo perfil:', error)
      throw error
    }
  },

  logout: async (refreshToken?: string): Promise<void> => {
    try {
      console.log('[invitadoAuthApi] Cerrando sesión del invitado...')
      await apiClient.post("/auth/invitado/logout", { refreshToken })
      console.log('[invitadoAuthApi] Logout exitoso')
    } catch (error: any) {
      console.error('[invitadoAuthApi] Error en logout:', error)
      // No lanzar error, siempre limpiar localStorage
    }
  },
}



