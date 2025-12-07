import { apiClient } from './client'

export interface Inscripcion {
  id: string
  convencionId: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  sede?: string
  tipoInscripcion: string
  estado: string
  fechaInscripcion: string
  notas?: string
  convencion?: {
    id: string
    titulo: string
  }
  pagos?: Pago[]
}

export interface Pago {
  id: string
  inscripcionId: string
  monto: number | string
  metodoPago: string
  numeroCuota?: number // 1, 2, o 3 para identificar la cuota
  estado: 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO' | 'REEMBOLSADO'
  referencia?: string
  comprobanteUrl?: string // URL de la imagen del comprobante
  fechaPago?: string
  notas?: string
  inscripcion?: Inscripcion
  createdAt: string
  updatedAt: string
  advertenciaMonto?: string // Advertencia cuando el monto difiere del esperado
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

export const pagosApi = {
  getAllPagos: async (
    page: number = 1,
    limit: number = 20,
    filters?: {
      search?: string
      estado?: 'todos' | 'PENDIENTE' | 'COMPLETADO' | 'RECHAZADO' | 'CANCELADO'
      metodoPago?: 'todos' | 'transferencia' | 'mercadopago' | 'efectivo' | 'otro'
      origen?: 'todos' | 'web' | 'dashboard' | 'mobile'
      inscripcionId?: string
      convencionId?: string
    }
  ): Promise<PaginatedResponse<Pago>> => {
    const params: any = { page, limit }
    if (filters?.search) params.search = filters.search
    if (filters?.estado && filters.estado !== 'todos') params.estado = filters.estado
    if (filters?.metodoPago && filters.metodoPago !== 'todos')
      params.metodoPago = filters.metodoPago
    if (filters?.origen && filters.origen !== 'todos') params.origen = filters.origen
    if (filters?.inscripcionId) params.inscripcionId = filters.inscripcionId
    if (filters?.convencionId) params.convencionId = filters.convencionId

    const response = await apiClient.get<PaginatedResponse<Pago>>('/pagos', {
      params,
    })
    return response.data
  },

  getPagoById: async (id: string): Promise<Pago> => {
    const response = await apiClient.get<Pago>(`/pagos/${id}`)
    return response.data
  },

  createPago: async (data: {
    inscripcionId: string
    monto: string
    metodoPago: string
    numeroCuota?: number
    estado?: 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO' | 'REEMBOLSADO'
    referencia?: string
    comprobanteUrl?: string
    notas?: string
  }): Promise<Pago> => {
    const response = await apiClient.post<Pago>('/pagos', data)
    return response.data
  },

  updatePago: async (id: string, data: Partial<Pago>): Promise<Pago> => {
    const response = await apiClient.patch<Pago>(`/pagos/${id}`, data)
    return response.data
  },

  deletePago: async (id: string): Promise<void> => {
    await apiClient.delete(`/pagos/${id}`)
  },

  rechazarPago: async (id: string, motivo?: string): Promise<Pago> => {
    const response = await apiClient.post<Pago>(`/pagos/${id}/rechazar`, { motivo })
    return response.data
  },

  rehabilitarPago: async (id: string): Promise<Pago> => {
    const response = await apiClient.post<Pago>(`/pagos/${id}/rehabilitar`)
    return response.data
  },

  validarPagosMasivos: async (
    ids: string[]
  ): Promise<{
    exitosos: number
    fallidos: number
    advertencias: number
    detalles: Array<{ id: string; exito: boolean; advertencia?: string; error?: string }>
  }> => {
    try {
      const response = await apiClient.post('/pagos/acciones/validar-masivo', { ids })
      return response.data
    } catch (error: any) {
      console.error('[pagosApi] Error en validarPagosMasivos:', error)
      if (error.response?.status === 404) {
        throw new Error(
          'El endpoint de validación masiva no está disponible. Por favor, reinicia el servidor backend.'
        )
      }
      throw error
    }
  },

  getHistorialAuditoria: async (id: string): Promise<any[]> => {
    const response = await apiClient.get(`/pagos/${id}/auditoria`)
    return response.data
  },

  getStats: async (): Promise<{
    totalInscripciones: number
    totalPagos: number
    pagosPendientes: number
    pagosCompletados: number
    pagosCancelados: number
    totalRecaudado: number
    totalPendiente: number
    promedioPorPago: number
    pagosConComprobante: number
    pagosSinComprobante: number
    ultimosPagos: Array<{
      id: string
      monto: number
      estado: string
      fechaPago: string | null
      inscripcion: { nombre: string; apellido: string; email: string }
    }>
  }> => {
    const response = await apiClient.get('/pagos/stats')
    return response.data
  },
}
