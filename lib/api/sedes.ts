import { apiClient } from './client'

export interface Sede {
  id: string
  pais: string
  ciudad: string
  descripcion: string
  imagenUrl: string
  bandera: string
  activa: boolean
  orden: number
  createdAt: string
  updatedAt: string
}

export interface CreateSedeDto {
  pais: string
  ciudad: string
  descripcion: string
  imagenUrl: string
  bandera: string
  activa?: boolean
  orden?: number
}

export interface UpdateSedeDto {
  pais?: string
  ciudad?: string
  descripcion?: string
  imagenUrl?: string
  bandera?: string
  activa?: boolean
  orden?: number
}

export interface SedeFilterDto {
  pais?: string
  activa?: boolean
}

export const sedesApi = {
  /**
   * Obtiene sedes activas para la landing page (endpoint público)
   */
  getForLanding: async (): Promise<Sede[]> => {
    const response = await apiClient.get<Sede[]>('/sedes/landing')
    return response.data
  },

  /**
   * Obtiene todas las sedes (admin, requiere auth)
   */
  getAll: (filters?: SedeFilterDto) =>
    apiClient.get<Sede[]>('/sedes', { params: filters }),

  getById: (id: string) => apiClient.get<Sede>(`/sedes/${id}`),

  create: (data: CreateSedeDto) => apiClient.post<Sede>('/sedes', data),

  update: (id: string, data: UpdateSedeDto) =>
    apiClient.patch<Sede>(`/sedes/${id}`, data),

  delete: (id: string) => apiClient.delete<Sede>(`/sedes/${id}`),

  getTotalCount: () => apiClient.get<number>('/sedes/count'),
}

