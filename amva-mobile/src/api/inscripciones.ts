/**
 * API para inscripciones - Mobile
 * Similar a lib/api/inscripciones.ts del frontend web
 */

import { apiClient } from './client'

export interface Pago {
  id: string
  inscripcionId: string
  monto: number | string
  numeroCuota?: number
  estado: 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO' | 'REEMBOLSADO'
  comprobanteUrl?: string
  fechaPago?: string
  referencia?: string
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
  numeroCuotas?: number
  estado: string
  fechaInscripcion: string
  origenRegistro?: string // 'web', 'mobile', 'dashboard'
  notas?: string
  dni?: string // DNI para relacionar con credenciales ministeriales y de capellanía
  codigoReferencia?: string
  convencion?: {
    id: string
    titulo: string
  }
  pagos?: Pago[]
}

export interface CreateInscripcionDto {
  convencionId: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  sede?: string
  pais?: string
  provincia?: string
  tipoInscripcion?: string
  numeroCuotas?: number
  origenRegistro?: string // ✅ IMPORTANTE: Usar 'mobile' desde la app
  documentoUrl?: string // URL del documento/comprobante subido
  notas?: string
  dni?: string // DNI para relacionar con credenciales ministeriales y de capellanía
}

export const inscripcionesApi = {
  create: async (data: CreateInscripcionDto): Promise<Inscripcion> => {
    try {
      console.log('📤 inscripcionesApi.create - Iniciando creación de inscripción')
      console.log('📤 Datos a enviar:', JSON.stringify(data, null, 2))
      
      // ✅ Asegurar que origenRegistro sea 'mobile'
      const payload = {
        ...data,
        origenRegistro: 'mobile', // Siempre 'mobile' desde la app
      }
      
      console.log('📤 Payload final:', JSON.stringify(payload, null, 2))
      console.log('📤 Endpoint: POST /inscripciones')
      
      const response = await apiClient.post<Inscripcion>('/inscripciones', payload)
      
      console.log('✅ inscripcionesApi.create - Respuesta recibida:', response.status)
      console.log('✅ Datos de la inscripción creada:', JSON.stringify(response.data, null, 2))
      
      return response.data
    } catch (error: unknown) {
      console.error('❌ inscripcionesApi.create - Error:', error)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: unknown } }
        console.error('❌ Status code:', axiosError.response?.status)
        console.error('❌ Response data:', JSON.stringify(axiosError.response?.data, null, 2))
      }
      throw error
    }
  },

  getAll: async (): Promise<Inscripcion[]> => {
    const response = await apiClient.get<Inscripcion[]>('/inscripciones')
    return response.data
  },

  getById: async (id: string): Promise<Inscripcion> => {
    const response = await apiClient.get<Inscripcion>(`/inscripciones/${id}`)
    return response.data
  },

  // Obtener inscripciones del usuario actual (si implementas autenticación de usuarios)
  getMyInscripciones: async (): Promise<Inscripcion[]> => {
    const response = await apiClient.get<Inscripcion[]>('/inscripciones/my')
    return response.data
  },

  // Verificar si un email ya está inscrito en una convención
  checkInscripcion: async (convencionId: string, email: string): Promise<Inscripcion | null> => {
    try {
      const response = await apiClient.get<Inscripcion>(
        `/inscripciones/check/${convencionId}/${encodeURIComponent(email)}`
      )
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },
}

export interface UpdatePagoDto {
  comprobanteUrl?: string
  notas?: string
}

export const pagosApi = {
  // Actualizar comprobante de pago (para invitados autenticados)
  updateComprobante: async (id: string, comprobanteUrl: string): Promise<Pago> => {
    const response = await apiClient.patch<Pago>(`/inscripciones/invitado/${id}/comprobante`, {
      comprobanteUrl,
    })
    return response.data
  },
}
