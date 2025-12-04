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
      // Asegurarse de que el token esté disponible antes de hacer la petición
      const token = typeof window !== 'undefined' 
        ? (localStorage.getItem('invitado_token') || sessionStorage.getItem('invitado_token'))
        : null
      
      if (!token) {
        console.error('[invitadoAuthApi] No hay token de invitado disponible')
        throw new Error('No hay token de invitado disponible')
      }
      
      // Decodificar el token para verificar su contenido (solo para debugging)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        console.log('[invitadoAuthApi] Token payload:', {
          sub: payload.sub,
          email: payload.email,
          role: payload.role,
          type: payload.type,
          exp: payload.exp,
          expDate: new Date(payload.exp * 1000).toISOString(),
        })
      } catch (e) {
        console.warn('[invitadoAuthApi] No se pudo decodificar el token:', e)
      }
      
      console.log('[invitadoAuthApi] Obteniendo perfil con token:', token.substring(0, 20) + '...')
      
      // Hacer la petición con el token explícitamente en los headers
      // El interceptor también debería agregarlo, pero lo hacemos explícito por seguridad
      const response = await apiClient.get<Invitado>("/auth/invitado/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      console.log('[invitadoAuthApi] Perfil obtenido exitosamente:', response.data)
      return response.data
    } catch (error: any) {
      console.error('[invitadoAuthApi] Error en getProfile:', error)
      if (error.response?.status === 401) {
        console.error('[invitadoAuthApi] Token inválido o expirado')
        console.error('[invitadoAuthApi] Response:', error.response?.data)
        console.error('[invitadoAuthApi] Headers enviados:', error.config?.headers)
      }
      throw error
    }
  },
}



