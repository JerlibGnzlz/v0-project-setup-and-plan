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
  credencialMinisterial?: {
    id: string
    documento: string
    nombre: string
    apellido: string
    fechaVencimiento: string
    activa: boolean
  } | null
  credencialCapellania?: {
    id: string
    documento: string
    nombre: string
    apellido: string
    fechaVencimiento: string
    activa: boolean
  } | null
}

export interface CreateSolicitudCredencialDto {
  tipo: TipoCredencial
  dni: string
  nombre: string
  apellido: string
  nacionalidad?: string
  fechaNacimiento?: string
  motivo?: string
}

export const solicitudesCredencialesApi = {
  /**
   * Crear una nueva solicitud de credencial
   */
  create: async (dto: CreateSolicitudCredencialDto): Promise<SolicitudCredencial> => {
    try {
      const response = await apiClient.post<SolicitudCredencial>(
        '/solicitudes-credenciales',
        dto
      )
      console.log('✅ Solicitud de credencial creada:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error creando solicitud de credencial:', error)
      throw error
    }
  },

  /**
   * Obtener mis solicitudes de credenciales
   */
  getMisSolicitudes: async (): Promise<SolicitudCredencial[]> => {
    try {
      const response = await apiClient.get<SolicitudCredencial[]>(
        '/solicitudes-credenciales/mis-solicitudes'
      )
      console.log('✅ Mis solicitudes obtenidas:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error obteniendo mis solicitudes:', error)
      throw error
    }
  },
}

