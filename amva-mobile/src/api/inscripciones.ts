/**
 * API para inscripciones - Mobile
 * Similar a lib/api/inscripciones.ts del frontend web
 */

import { apiClient } from './client'

export interface Inscripcion {
  id: string
  convencionId: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  sede?: string
  tipoInscripcion?: string
  numeroCuotas?: number
  estado: string
  fechaInscripcion: string
  origenRegistro?: string // 'web', 'mobile', 'dashboard'
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
  numeroCuotas?: number
  origenRegistro?: string // ✅ IMPORTANTE: Usar 'mobile' desde la app
  documentoUrl?: string // URL del documento/comprobante subido
  notas?: string
}

export const inscripcionesApi = {
  create: async (data: CreateInscripcionDto): Promise<Inscripcion> => {
    // ✅ Asegurar que origenRegistro sea 'mobile'
    const response = await apiClient.post<Inscripcion>('/inscripciones', {
      ...data,
      origenRegistro: 'mobile', // Siempre 'mobile' desde la app
    })
    return response.data
  },

  getAll: async (): Promise<Inscripcion[]> => {
    const response = await apiClient.get<Inscripcion[]>('/inscripciones')
    return response.data
  },

  getById: async (id: string): Promise<Inscripcion> => {
    const response = await apiClient.get<Inscripcion>(`/inscripciones/${id}`)
    return response.data
  },

  // Obtener inscripciones del usuario actual (si implementas autenticación de usuarios)
  getMyInscripciones: async (): Promise<Inscripcion[]> => {
    const response = await apiClient.get<Inscripcion[]>('/inscripciones/my')
    return response.data
  },

  // Verificar si un email ya está inscrito en una convención
  checkInscripcion: async (convencionId: string, email: string): Promise<Inscripcion | null> => {
    try {
      const response = await apiClient.get<Inscripcion>(
        `/inscripciones/check/${convencionId}/${encodeURIComponent(email)}`
      )
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },
}

