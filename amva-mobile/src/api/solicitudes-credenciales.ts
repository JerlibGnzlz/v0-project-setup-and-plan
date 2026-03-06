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
  tipoPastor?: string
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
  tipoPastor?: string
  nacionalidad?: string
  fechaNacimiento?: string
  motivo?: string
}

/** Valores permitidos para tipoPastor (backend MaxLength 50) */
const TIPO_PASTOR_VALIDOS = new Set([
  'PASTOR',
  'PASTORA',
  'REVERENDO',
  'REVERENDA',
  'OBISPO',
  'OBISPA',
])

/**
 * Construye el body de creación con formato exacto esperado por el backend.
 * - tipo: solo "ministerial" | "capellania"
 * - dni: 5-30 caracteres
 * - nombre/apellido: trim, máx 100 caracteres
 * - tipoPastor: opcional, trim, máx 50 caracteres, valor permitido
 */
function buildCreatePayload(dto: CreateSolicitudCredencialDto): Record<string, string> {
  const tipoRaw = String(dto.tipo ?? '').trim().toLowerCase()
  const tipo: 'ministerial' | 'capellania' =
    tipoRaw === 'capellania' ? 'capellania' : 'ministerial'

  const dniRaw = String(dto.dni ?? '').trim()
  if (dniRaw.length < 5) {
    throw new Error('El DNI debe tener entre 5 y 30 caracteres.')
  }
  const dni = dniRaw.slice(0, 30)

  const nombre = String(dto.nombre ?? '').trim().slice(0, 100)
  const apellido = String(dto.apellido ?? '').trim().slice(0, 100)
  if (!nombre || !apellido) {
    throw new Error('Nombre y apellido son obligatorios.')
  }

  const body: Record<string, string> = {
    tipo,
    dni,
    nombre,
    apellido,
  }

  if (dto.tipoPastor != null && String(dto.tipoPastor).trim()) {
    const tipoPastor = String(dto.tipoPastor).trim().slice(0, 50)
    const valor = TIPO_PASTOR_VALIDOS.has(tipoPastor) ? tipoPastor : 'PASTOR'
    body.tipoPastor = valor
  }

  const nacionalidad = String(dto.nacionalidad ?? '').trim().slice(0, 50)
  if (nacionalidad) body.nacionalidad = nacionalidad

  const fechaNacimiento = String(dto.fechaNacimiento ?? '').trim()
  if (fechaNacimiento) body.fechaNacimiento = fechaNacimiento

  const motivo = String(dto.motivo ?? '').trim().slice(0, 500)
  if (motivo) body.motivo = motivo

  return body
}

export const solicitudesCredencialesApi = {
  /**
   * Crear una nueva solicitud de credencial.
   * El payload se normaliza con buildCreatePayload para cumplir exactamente con el backend.
   */
  create: async (dto: CreateSolicitudCredencialDto): Promise<SolicitudCredencial> => {
    try {
      const body = buildCreatePayload(dto)

      console.log('📤 Enviando solicitud de credencial (body completo):', JSON.stringify(body))
      // Usar config.data explícito para que proxies/interceptores no pierdan el body
      const response = await apiClient.request<SolicitudCredencial>({
        method: 'POST',
        url: '/solicitudes-credenciales',
        data: body,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 15000,
      })
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

