import { apiClient } from "./client"

export interface Inscripcion {
  id: string
  convencionId: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  sede?: string
  tipoInscripcion?: string
  numeroCuotas?: number // 1, 2 o 3 cuotas
  estado: string
  fechaInscripcion: string
  origenRegistro?: string // "web", "mobile", "dashboard"
  notas?: string
  convencion?: {
    id: string
    titulo: string
  }
}

export interface CreateInscripcionDto {
  convencionId: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  sede?: string
  tipoInscripcion?: string
  numeroCuotas?: number // 1, 2 o 3 cuotas
  origenRegistro?: string // "web", "mobile", "dashboard"
  documentoUrl?: string // URL del documento/comprobante subido
  notas?: string
}

export const inscripcionesApi = {
  create: async (data: CreateInscripcionDto): Promise<Inscripcion> => {
    const response = await apiClient.post<Inscripcion>("/inscripciones", data)
    return response.data
  },

  getAll: async (): Promise<Inscripcion[]> => {
    const response = await apiClient.get<Inscripcion[]>("/inscripciones")
    return response.data
  },

  getById: async (id: string): Promise<Inscripcion> => {
    const response = await apiClient.get<Inscripcion>(`/inscripciones/${id}`)
    return response.data
  },

  checkInscripcion: async (convencionId: string, email: string): Promise<Inscripcion | null> => {
    try {
      const response = await apiClient.get<Inscripcion>(`/inscripciones/check/${convencionId}/${encodeURIComponent(email)}`)
      return response.data
    } catch (error: any) {
      // Si no encuentra inscripción, retornar null (no es un error)
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },
}

