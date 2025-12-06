/**
 * API para convenciones - Mobile
 */

import { apiClient } from './client'

export interface Convencion {
  id: string
  titulo: string
  descripcion?: string
  fechaInicio: string
  fechaFin: string
  ubicacion: string
  costo: number | string // Puede venir como Decimal de Prisma (string) o number
  cupoMaximo?: number
  imagenUrl?: string
  activa: boolean | string // Puede venir como string desde el backend
  archivada?: boolean | string // Puede venir como string desde el backend
  createdAt: string
  updatedAt: string
}

// Función helper para normalizar valores booleanos que pueden venir como string
export function normalizeBoolean(value: boolean | string | number | undefined | null): boolean {
  if (value === true || value === 1 || value === 'true' || value === '1') {
    return true
  }
  if (value === false || value === 0 || value === 'false' || value === '0') {
    return false
  }
  return false // Default a false si no se puede determinar
}

export const convencionesApi = {
  // Obtener todas las convenciones
  getAll: async (): Promise<Convencion[]> => {
    const response = await apiClient.get<Convencion[]>('/convenciones')
    return response.data
  },

  // Obtener convención activa
  getActive: async (): Promise<Convencion | null> => {
    try {
      const response = await apiClient.get<Convencion>('/convenciones/active')
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null // No hay convención activa
      }
      throw error
    }
  },

  // Obtener una convención por ID
  getById: async (id: string): Promise<Convencion> => {
    const response = await apiClient.get<Convencion>(`/convenciones/${id}`)
    return response.data
  },
}
