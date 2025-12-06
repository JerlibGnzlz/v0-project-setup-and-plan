import { apiClient } from './client'

export interface Convencion {
  id: string
  titulo: string
  descripcion?: string
  fechaInicio: string
  fechaFin: string
  ubicacion: string
  costo?: number
  cupoMaximo?: number
  imagenUrl?: string
  activa: boolean
  archivada?: boolean
  fechaArchivado?: string
  createdAt: string
  updatedAt: string
}

export const convencionesApi = {
  getAll: async (): Promise<Convencion[]> => {
    const response = await apiClient.get<Convencion[]>('/convenciones')
    return response.data
  },

  getById: async (id: string): Promise<Convencion> => {
    const response = await apiClient.get<Convencion>(`/convenciones/${id}`)
    return response.data
  },

  getActive: async (): Promise<Convencion | null> => {
    try {
      const response = await apiClient.get<Convencion>('/convenciones/active')
      // Verificar que realmente tenemos datos válidos
      if (!response.data || !response.data.id) {
        return null
      }
      return response.data
    } catch (error: any) {
      // 404 significa que no hay convención activa
      if (error.response?.status === 404) {
        console.log('📭 No hay convención activa')
        return null
      }
      // 500 generalmente significa problema de base de datos
      if (error.response?.status === 500) {
        console.error(
          '❌ Error de servidor (posible problema de base de datos):',
          error.response?.data?.message || error.message
        )
        // Retornar null en lugar de lanzar error para que el frontend pueda manejar esto
        return null
      }
      console.error('❌ Error obteniendo convención activa:', error)
      // Para otros errores, retornar null en lugar de lanzar
      return null
    }
  },

  create: async (data: Omit<Convencion, 'id' | 'createdAt' | 'updatedAt'>): Promise<Convencion> => {
    const response = await apiClient.post<Convencion>('/convenciones', data)
    return response.data
  },

  update: async (id: string, data: Partial<Convencion>): Promise<Convencion> => {
    const response = await apiClient.patch<Convencion>(`/convenciones/${id}`, data)
    return response.data
  },

  archivar: async (id: string): Promise<Convencion> => {
    const response = await apiClient.patch<Convencion>(`/convenciones/${id}/archivar`)
    return response.data
  },

  desarchivar: async (id: string): Promise<Convencion> => {
    const response = await apiClient.patch<Convencion>(`/convenciones/${id}/desarchivar`)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/convenciones/${id}`)
  },
}
