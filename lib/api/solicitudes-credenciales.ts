import { apiClient } from './client'

export enum TipoCredencial {
  MINISTERIAL = 'ministerial',
  CAPELLANIA = 'capellania',
}

export enum EstadoSolicitud {
  PENDIENTE = 'pendiente',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
  COMPLETADA = 'completada',
}

export interface SolicitudCredencial {
  id: string
  invitadoId: string
  tipo: TipoCredencial
  dni: string
  nombre: string
  apellido: string
  nacionalidad?: string
  fechaNacimiento?: string
  motivo?: string
  estado: EstadoSolicitud
  observaciones?: string
  credencialMinisterialId?: string
  credencialCapellaniaId?: string
  createdAt: string
  updatedAt: string
  aprobadaAt?: string
  completadaAt?: string
  invitado: {
    id: string
    nombre: string
    apellido: string
    email: string
  }
  credencialMinisterial?: {
    id: string
    documento: string
    nombre: string
    apellido: string
  } | null
  credencialCapellania?: {
    id: string
    documento: string
    nombre: string
    apellido: string
  } | null
}

export interface UpdateSolicitudCredencialDto {
  estado?: EstadoSolicitud
  observaciones?: string
  credencialMinisterialId?: string
  credencialCapellaniaId?: string
}

export interface SolicitudesResponse {
  data: SolicitudCredencial[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const solicitudesCredencialesApi = {
  /**
   * Obtener todas las solicitudes (para admins)
   */
  getAll: async (
    page: number = 1,
    limit: number = 20,
    estado?: EstadoSolicitud,
    tipo?: TipoCredencial
  ): Promise<SolicitudesResponse> => {
    const params: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    }
    if (estado) params.estado = estado
    if (tipo) params.tipo = tipo

    const response = await apiClient.get<SolicitudesResponse>('/solicitudes-credenciales', { params })
    return response.data
  },

  /**
   * Obtener una solicitud por ID
   */
  getById: async (id: string): Promise<SolicitudCredencial> => {
    const response = await apiClient.get<SolicitudCredencial>(`/solicitudes-credenciales/${id}`)
    return response.data
  },

  /**
   * Actualizar una solicitud
   */
  update: async (id: string, dto: UpdateSolicitudCredencialDto): Promise<SolicitudCredencial> => {
    const response = await apiClient.patch<SolicitudCredencial>(`/solicitudes-credenciales/${id}`, dto)
    return response.data
  },
}

