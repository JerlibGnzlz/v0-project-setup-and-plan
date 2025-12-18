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
      console.log('📤 Enviando solicitud de credencial:', {
        tipo: dto.tipo,
        dni: dto.dni,
        nombre: dto.nombre,
        apellido: dto.apellido,
      })
      console.log('🌐 URL base del cliente:', apiClient.defaults.baseURL)
      console.log('🔗 Endpoint completo:', `${apiClient.defaults.baseURL}/solicitudes-credenciales`)
      
      const response = await apiClient.post<SolicitudCredencial>(
        '/solicitudes-credenciales',
        dto
      )
      console.log('✅ Solicitud de credencial creada:', response.data)
      return response.data
    } catch (error: unknown) {
      console.error('❌ Error creando solicitud de credencial:', error)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: unknown; statusText?: string } }
        console.error('📊 Detalles del error:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
        })
      }
      if (error && typeof error === 'object' && 'request' in error) {
        const axiosError = error as { request?: { responseURL?: string } }
        console.error('🔗 URL intentada:', axiosError.request?.responseURL)
      }
      throw error
    }
  },

  /**
   * Obtener mis solicitudes de credenciales
   */
  getMisSolicitudes: async (): Promise<SolicitudCredencial[]> => {
    try {
      console.log('📤 Obteniendo mis solicitudes...')
      console.log('🌐 URL base del cliente:', apiClient.defaults.baseURL)
      console.log('🔗 Endpoint completo:', `${apiClient.defaults.baseURL}/solicitudes-credenciales/mis-solicitudes`)
      
      const response = await apiClient.get<SolicitudCredencial[]>(
        '/solicitudes-credenciales/mis-solicitudes'
      )
      console.log('✅ Mis solicitudes obtenidas:', response.data)
      return response.data
    } catch (error: unknown) {
      console.error('❌ Error obteniendo mis solicitudes:', error)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: unknown; statusText?: string } }
        console.error('📊 Detalles del error:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
        })
      }
      throw error
    }
  },
}

