import { apiClient } from "./client"

export interface Pastor {
  id: string
  nombre: string
  apellido: string
  email?: string
  telefono?: string
  sede?: string
  cargo?: string
  fotoUrl?: string
  biografia?: string
  activo: boolean
  createdAt: string
  updatedAt: string
}

export const pastoresApi = {
  getAll: async (): Promise<Pastor[]> => {
    const response = await apiClient.get<Pastor[]>("/pastores")
    return response.data
  },

  getById: async (id: string): Promise<Pastor> => {
    const response = await apiClient.get<Pastor>(`/pastores/${id}`)
    return response.data
  },

  getActive: async (): Promise<Pastor[]> => {
    const response = await apiClient.get<Pastor[]>("/pastores/active")
    return response.data
  },

  create: async (data: Omit<Pastor, "id" | "createdAt" | "updatedAt">): Promise<Pastor> => {
    try {
      console.log("[v0] Creating pastor with data:", data)
      const response = await apiClient.post<Pastor>("/pastores", data)
      console.log("[v0] Pastor created successfully:", response.data)
      return response.data
    } catch (error: any) {
      console.error("[v0] Failed to create pastor:", error.response?.data || error.message)
      throw error
    }
  },

  update: async (id: string, data: Partial<Pastor>): Promise<Pastor> => {
    const response = await apiClient.patch<Pastor>(`/pastores/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/pastores/${id}`)
  },
}
