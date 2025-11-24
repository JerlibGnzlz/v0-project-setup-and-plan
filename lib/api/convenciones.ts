import { apiClient } from "./client"

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
  createdAt: string
  updatedAt: string
}

export const convencionesApi = {
  getAll: async (): Promise<Convencion[]> => {
    const response = await apiClient.get<Convencion[]>("/convenciones")
    return response.data
  },

  getById: async (id: string): Promise<Convencion> => {
    const response = await apiClient.get<Convencion>(`/convenciones/${id}`)
    return response.data
  },

  getActive: async (): Promise<Convencion | null> => {
    try {
      const response = await apiClient.get<Convencion>("/convenciones/active")
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  create: async (data: Omit<Convencion, "id" | "createdAt" | "updatedAt">): Promise<Convencion> => {
    const response = await apiClient.post<Convencion>("/convenciones", data)
    return response.data
  },

  update: async (id: string, data: Partial<Convencion>): Promise<Convencion> => {
    const response = await apiClient.patch<Convencion>(`/convenciones/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/convenciones/${id}`)
  },
}
