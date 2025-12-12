import { apiClient } from './client'

export interface CredencialMinisterial {
  id: string
  apellido: string
  nombre: string
  documento: string
  nacionalidad: string
  fechaNacimiento: string
  tipoPastor: string
  fechaVencimiento: string
  fotoUrl: string | null
  activa: boolean
  createdAt: string
  updatedAt: string
  estado?: 'vigente' | 'por_vencer' | 'vencida'
  diasRestantes?: number
}

export interface CreateCredencialMinisterialDto {
  apellido: string
  nombre: string
  documento: string
  nacionalidad: string
  fechaNacimiento: string
  tipoPastor?: string
  fechaVencimiento: string
  fotoUrl?: string
  activa?: boolean
}

export interface UpdateCredencialMinisterialDto {
  apellido?: string
  nombre?: string
  documento?: string
  nacionalidad?: string
  fechaNacimiento?: string
  tipoPastor?: string
  fechaVencimiento?: string
  fotoUrl?: string
  activa?: boolean
}

export interface CredencialMinisterialFilterDto {
  documento?: string
  estado?: 'vigente' | 'por_vencer' | 'vencida'
}

export interface CredencialesMinisterialesResponse {
  data: CredencialMinisterial[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const credencialesMinisterialesApi = {
  getAll: async (
    page: number = 1,
    limit: number = 20,
    filters?: CredencialMinisterialFilterDto
  ): Promise<CredencialesMinisterialesResponse> => {
    const response = await apiClient.get<CredencialesMinisterialesResponse>(
      '/credenciales-ministeriales',
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

  getById: async (id: string): Promise<CredencialMinisterial> => {
    const response = await apiClient.get<CredencialMinisterial>(
      `/credenciales-ministeriales/${id}`
    )
    return response.data
  },

  create: async (
    dto: CreateCredencialMinisterialDto
  ): Promise<CredencialMinisterial> => {
    const response = await apiClient.post<CredencialMinisterial>(
      '/credenciales-ministeriales',
      dto
    )
    return response.data
  },

  update: async (
    id: string,
    dto: UpdateCredencialMinisterialDto
  ): Promise<CredencialMinisterial> => {
    const response = await apiClient.patch<CredencialMinisterial>(
      `/credenciales-ministeriales/${id}`,
      dto
    )
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/credenciales-ministeriales/${id}`)
  },
}

