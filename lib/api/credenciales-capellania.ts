import { apiClient } from './client'

export interface CredencialCapellania {
  id: string
  apellido: string
  nombre: string
  documento: string
  nacionalidad: string
  fechaNacimiento: string
  tipoCapellan: string
  fechaVencimiento: string
  fotoUrl: string | null
  activa: boolean
  createdAt: string
  updatedAt: string
  estado?: 'vigente' | 'por_vencer' | 'vencida'
  diasRestantes?: number
}

export interface CreateCredencialCapellaniaDto {
  apellido: string
  nombre: string
  documento: string
  nacionalidad: string
  fechaNacimiento: string
  tipoCapellan?: string
  fechaVencimiento: string
  fotoUrl?: string
  activa?: boolean
  invitadoId?: string
  solicitudCredencialId?: string
}

export interface UpdateCredencialCapellaniaDto {
  apellido?: string
  nombre?: string
  documento?: string
  nacionalidad?: string
  fechaNacimiento?: string
  tipoCapellan?: string
  fechaVencimiento?: string
  fotoUrl?: string
  activa?: boolean
}

export interface CredencialCapellaniaFilterDto {
  documento?: string
  estado?: 'vigente' | 'por_vencer' | 'vencida'
  activa?: boolean
}

export interface CredencialesCapellaniaResponse {
  data: CredencialCapellania[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const credencialesCapellaniaApi = {
  getAll: async (
    page: number = 1,
    limit: number = 20,
    filters?: CredencialCapellaniaFilterDto
  ): Promise<CredencialesCapellaniaResponse> => {
    const response = await apiClient.get<CredencialesCapellaniaResponse>(
      '/credenciales-capellania',
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

  getById: async (id: string): Promise<CredencialCapellania> => {
    const response = await apiClient.get<CredencialCapellania>(
      `/credenciales-capellania/${id}`
    )
    return response.data
  },

  create: async (
    dto: CreateCredencialCapellaniaDto
  ): Promise<CredencialCapellania> => {
    const response = await apiClient.post<CredencialCapellania>(
      '/credenciales-capellania',
      dto
    )
    return response.data
  },

  update: async (
    id: string,
    dto: UpdateCredencialCapellaniaDto
  ): Promise<CredencialCapellania> => {
    const response = await apiClient.patch<CredencialCapellania>(
      `/credenciales-capellania/${id}`,
      dto
    )
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/credenciales-capellania/${id}`)
  },
}

