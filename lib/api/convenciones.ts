import { apiClient } from "./client"

export interface Convencion {
  id: string
  nombre: string
  fecha: string
  ubicacion: string
  descripcion: string
  imagen?: string
  activo: boolean
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
    const response = await apiClient.get<Convencion>("/convenciones/active")
    return response.data
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
