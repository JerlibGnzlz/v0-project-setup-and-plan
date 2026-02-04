import { apiClient } from "./client"

export interface Pago {
  id: string
  inscripcionId: string
  monto: number | string
  metodoPago: string
  numeroCuota?: number
  estado: "PENDIENTE" | "COMPLETADO" | "CANCELADO" | "REEMBOLSADO"
  referencia?: string
  comprobanteUrl?: string
  fechaPago?: string
  notas?: string
  createdAt: string
  updatedAt: string
}

export interface Inscripcion {
  id: string
  convencionId: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  sede?: string
  tipoInscripcion?: string
  numeroCuotas?: number // 1, 2 o 3 cuotas
  estado: string
  fechaInscripcion: string
  origenRegistro?: string // "web", "mobile", "dashboard"
  notas?: string
  codigoReferencia?: string // Código único para transferencias
  convencion?: {
    id: string
    titulo: string
  }
  pagos?: Pago[] // Pagos asociados a la inscripción
}

export interface CreateInscripcionDto {
  convencionId: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  sede?: string
  tipoInscripcion?: string
  numeroCuotas?: number // 1, 2 o 3 cuotas
  dni?: string // DNI para relacionar con credenciales ministeriales y de capellanía
  origenRegistro?: string // "web", "mobile", "dashboard"
  documentoUrl?: string // URL del documento/comprobante subido
  notas?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export const inscripcionesApi = {
  getAll: async (
    page: number = 1,
    limit: number = 20,
    filters?: {
      search?: string
      estado?: 'todos' | 'pendiente' | 'confirmado' | 'cancelado'
      origen?: 'todos' | 'web' | 'dashboard' | 'mobile'
      convencionId?: string
    }
  ): Promise<PaginatedResponse<Inscripcion>> => {
    const params: any = { page, limit }
    if (filters?.search) params.search = filters.search
    if (filters?.estado && filters.estado !== 'todos') params.estado = filters.estado
    if (filters?.origen && filters.origen !== 'todos') params.origen = filters.origen
    if (filters?.convencionId) params.convencionId = filters.convencionId

    const response = await apiClient.get<PaginatedResponse<Inscripcion>>("/inscripciones", {
      params,
    })
    return response.data
  },

  create: async (data: CreateInscripcionDto): Promise<Inscripcion> => {
    try {
      const response = await apiClient.post<Inscripcion>("/inscripciones", data)
      return response.data
    } catch (error: any) {
      console.error('[inscripcionesApi] Error en create:', error)
      console.error('[inscripcionesApi] Error response:', error.response)
      console.error('[inscripcionesApi] Error response data:', error.response?.data)
      console.error('[inscripcionesApi] Error response status:', error.response?.status)
      console.error('[inscripcionesApi] Error response statusText:', error.response?.statusText)
      console.error('[inscripcionesApi] Error message:', error.message)
      console.error('[inscripcionesApi] Error code:', error.code)

      // Si es un error de red (sin respuesta del servidor)
      if (!error.response) {
        console.error('[inscripcionesApi] Error de red - El servidor no está respondiendo')
        throw new Error('No se pudo conectar con el servidor. Por favor, verifica que el backend esté corriendo.')
      }

      // Si es un error 400, intentar extraer el mensaje de validación
      if (error.response.status === 400) {
        const responseData = error.response.data

        // Extraer mensaje de error de forma segura sin serializar objetos complejos
        let errorMessage = 'Error de validación'
        if (responseData?.error?.message) {
          errorMessage = responseData.error.message
        } else if (responseData?.message) {
          errorMessage = responseData.message
        }
        console.error('[inscripcionesApi] Error 400:', errorMessage)

        // El GlobalExceptionFilter devuelve errores en formato ErrorResponse
        // { success: false, error: { message, statusCode, error, details: { validationErrors: [...] } } }
        if (responseData?.error?.details?.validationErrors && Array.isArray(responseData.error.details.validationErrors)) {
          const validationErrors = responseData.error.details.validationErrors.map((err: any) =>
            typeof err === 'string' ? err : `${err.field || 'campo'}: ${err.message || err}`
          ).join(', ')
          console.error('[inscripcionesApi] Errores de validación:', validationErrors)
          const validationError = new Error(validationErrors)
            ; (validationError as any).response = error.response
          throw validationError
        } else if (typeof responseData === 'object' && Object.keys(responseData).length === 0) {
          // Si responseData está vacío, puede ser un problema de validación silencioso
          console.error('[inscripcionesApi] Error 400 sin detalles - posible problema de validación')
          const validationError = new Error('Error de validación. Por favor, verifica que todos los campos estén completos y sean válidos.')
            ; (validationError as any).response = error.response
          throw validationError
        } else {
          const serverError = new Error(errorMessage)
            ; (serverError as any).response = error.response
          throw serverError
        }
      }

      // Manejar error 409 (ConflictException - email duplicado)
      if (error.response.status === 409) {
        const responseData = error.response.data
        let errorMessage = 'Este correo electrónico ya está registrado para esta convención.'

        if (responseData?.error?.message) {
          errorMessage = responseData.error.message
        } else if (responseData?.message) {
          errorMessage = responseData.message
        }

        const conflictError = new Error(errorMessage)
          ; (conflictError as any).response = error.response
        throw conflictError
      }

      throw error
    }
  },

  getById: async (id: string): Promise<Inscripcion> => {
    const response = await apiClient.get<Inscripcion>(`/inscripciones/${id}`)
    return response.data
  },

  checkInscripcion: async (convencionId: string, email: string): Promise<Inscripcion | null> => {
    try {
      const response = await apiClient.get<Inscripcion>(`/inscripciones/check/${convencionId}/${encodeURIComponent(email)}`)
      return response.data
    } catch (error: any) {
      // Si no encuentra inscripción, retornar null (no es un error)
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  update: async (id: string, data: Partial<CreateInscripcionDto>): Promise<Inscripcion> => {
    const response = await apiClient.patch<Inscripcion>(`/inscripciones/${id}`, data)
    return response.data
  },

  cancelarInscripcion: async (id: string, motivo?: string): Promise<Inscripcion> => {
    const response = await apiClient.post<Inscripcion>(`/inscripciones/${id}/cancelar`, { motivo })
    return response.data
  },

  rehabilitarInscripcion: async (id: string): Promise<Inscripcion> => {
    const response = await apiClient.post<Inscripcion>(`/inscripciones/${id}/rehabilitar`)
    return response.data
  },

  getInscripcionesStats: async (filters?: {
    search?: string
    estado?: 'todos' | 'pendiente' | 'confirmado' | 'cancelado'
    convencionId?: string
  }): Promise<{
    total: number
    nuevas: number
    hoy: number
    pendientes: number
    confirmadas: number
  }> => {
    const params: Record<string, string> = {}
    if (filters?.search) params.search = filters.search
    if (filters?.estado && filters.estado !== 'todos') params.estado = filters.estado
    if (filters?.convencionId) params.convencionId = filters.convencionId
    const response = await apiClient.get('/inscripciones/stats/inscripciones', { params })
    return response.data
  },

  getReporteIngresos: async (): Promise<{
    totalRecaudado: number
    totalPendiente: number
    totalInscripciones: number
    inscripcionesConfirmadas: number
    inscripcionesPendientes: number
    detallesPorCuota: { cuota: number; recaudado: number; pendiente: number }[]
  }> => {
    const response = await apiClient.get('/inscripciones/stats/reporte-ingresos')
    return response.data
  },

  enviarRecordatorios: async (convencionId?: string): Promise<{
    enviados: number
    fallidos: number
    detalles: { email: string; nombre: string; cuotasPendientes: number; exito: boolean }[]
  }> => {
    const response = await apiClient.post('/inscripciones/acciones/enviar-recordatorios', { convencionId })
    return response.data
  },
}

