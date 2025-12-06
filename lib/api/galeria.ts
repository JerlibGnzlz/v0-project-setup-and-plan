import { apiClient } from './client'

export type TipoGaleria = 'IMAGEN' | 'VIDEO'

export interface GaleriaImagen {
  id: string
  titulo: string
  descripcion?: string
  imagenUrl: string
  tipo: TipoGaleria
  categoria?: string
  convencionId?: string
  orden: number
  activa: boolean
  createdAt: string
  updatedAt: string
  // Campos para videos
  videoOriginalUrl?: string // URL sin transformaciones de Cloudinary
  videoStartTime?: number // Segundo de inicio del recorte
  videoEndTime?: number // Segundo de fin del recorte
  thumbnailTime?: number // Segundo para el thumbnail personalizado
}

export const galeriaApi = {
  getAll: async (): Promise<GaleriaImagen[]> => {
    const response = await apiClient.get<GaleriaImagen[]>('/galeria')
    return response.data
  },

  getById: async (id: string): Promise<GaleriaImagen> => {
    const response = await apiClient.get<GaleriaImagen>(`/galeria/${id}`)
    return response.data
  },

  create: async (
    data: Omit<GaleriaImagen, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<GaleriaImagen> => {
    const response = await apiClient.post<GaleriaImagen>('/galeria', data)
    return response.data
  },

  update: async (id: string, data: Partial<GaleriaImagen>): Promise<GaleriaImagen> => {
    const response = await apiClient.patch<GaleriaImagen>(`/galeria/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/galeria/${id}`)
  },
}
