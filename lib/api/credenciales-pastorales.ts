import { apiClient } from './client'

export interface CredencialPastoral {
  id: string
  pastorId: string
  numeroCredencial: string
  fechaEmision: string
  fechaVencimiento: string
  estado: 'SIN_CREDENCIAL' | 'VIGENTE' | 'POR_VENCER' | 'VENCIDA'
  notificacionVencimientoEnviada: boolean
  fechaUltimaNotificacion: string | null
  activa: boolean
  notas: string | null
  createdAt: string
  updatedAt: string
  pastor: {
    id: string
    nombre: string
    apellido: string
    email: string | null
    telefono: string | null
  }
}

export interface CreateCredencialPastoralDto {
  pastorId: string
  numeroCredencial: string
  fechaEmision: string
  fechaVencimiento: string
  estado?: 'SIN_CREDENCIAL' | 'VIGENTE' | 'POR_VENCER' | 'VENCIDA'
  activa?: boolean
  notas?: string
}

export interface UpdateCredencialPastoralDto {
  numeroCredencial?: string
  fechaEmision?: string
  fechaVencimiento?: string
  estado?: 'SIN_CREDENCIAL' | 'VIGENTE' | 'POR_VENCER' | 'VENCIDA'
  activa?: boolean
  notas?: string
}

export interface CredencialFilterDto {
  estado?: 'SIN_CREDENCIAL' | 'VIGENTE' | 'POR_VENCER' | 'VENCIDA'
  activa?: boolean
  pastorId?: string
  numeroCredencial?: string
}

export interface CredencialesResponse {
  data: CredencialPastoral[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const credencialesPastoralesApi = {
  getAll: async (
    page: number = 1,
    limit: number = 20,
    filters?: CredencialFilterDto
  ): Promise<CredencialesResponse> => {
    const response = await apiClient.get<CredencialesResponse>(
      '/credenciales-pastorales',
      {
        params: {
          page,
          limit,
          ...filters,
        },
      }
    )
    return response.data
  },

  getById: async (id: string): Promise<CredencialPastoral> => {
    const response = await apiClient.get<CredencialPastoral>(
      `/credenciales-pastorales/${id}`
    )
    return response.data
  },

  getPorVencer: async (): Promise<CredencialPastoral[]> => {
    const response = await apiClient.get<CredencialPastoral[]>(
      '/credenciales-pastorales/por-vencer'
    )
    return response.data
  },

  getVencidas: async (): Promise<CredencialPastoral[]> => {
    const response = await apiClient.get<CredencialPastoral[]>(
      '/credenciales-pastorales/vencidas'
    )
    return response.data
  },

  create: async (
    dto: CreateCredencialPastoralDto
  ): Promise<CredencialPastoral> => {
    const response = await apiClient.post<CredencialPastoral>(
      '/credenciales-pastorales',
      dto
    )
    return response.data
  },

  update: async (
    id: string,
    dto: UpdateCredencialPastoralDto
  ): Promise<CredencialPastoral> => {
    const response = await apiClient.patch<CredencialPastoral>(
      `/credenciales-pastorales/${id}`,
      dto
    )
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/credenciales-pastorales/${id}`)
  },

  actualizarEstados: async (): Promise<{ actualizadas: number }> => {
    const response = await apiClient.post<{ actualizadas: number }>(
      '/credenciales-pastorales/actualizar-estados'
    )
    return response.data
  },
}

