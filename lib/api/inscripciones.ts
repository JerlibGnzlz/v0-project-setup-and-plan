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
  origenRegistro?: string // "web", "mobile", "dashboard"
  documentoUrl?: string // URL del documento/comprobante subido
  notas?: string
}

export const inscripcionesApi = {
  create: async (data: CreateInscripcionDto): Promise<Inscripcion> => {
    try {
      console.log('[inscripcionesApi] Enviando datos a /inscripciones:', data)
      console.log('[inscripcionesApi] API_URL:', process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api")
      const response = await apiClient.post<Inscripcion>("/inscripciones", data)
      console.log('[inscripcionesApi] Respuesta exitosa:', response.data)
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
        console.error('[inscripcionesApi] Response data completo:', JSON.stringify(responseData, null, 2))
        
        // El GlobalExceptionFilter devuelve errores en formato ErrorResponse
        // { success: false, error: { message, statusCode, error, details: { validationErrors: [...] } } }
        if (responseData?.error?.details?.validationErrors && Array.isArray(responseData.error.details.validationErrors)) {
          const validationErrors = responseData.error.details.validationErrors.map((err: any) => 
            typeof err === 'string' ? err : `${err.field}: ${err.message}`
          ).join(', ')
          console.error('[inscripcionesApi] Errores de validación:', validationErrors)
          const validationError = new Error(validationErrors)
          ;(validationError as any).response = error.response
          throw validationError
        } else if (responseData?.error?.message) {
          console.error('[inscripcionesApi] Error del servidor:', responseData.error.message)
          const serverError = new Error(responseData.error.message)
          ;(serverError as any).response = error.response
          throw serverError
        } else if (responseData?.message) {
          console.error('[inscripcionesApi] Mensaje de error:', responseData.message)
          const messageError = new Error(responseData.message)
          ;(messageError as any).response = error.response
          throw messageError
        } else if (typeof responseData === 'object' && Object.keys(responseData).length === 0) {
          // Si responseData está vacío, puede ser un problema de validación silencioso
          console.error('[inscripcionesApi] Error 400 sin detalles - posible problema de validación')
          const validationError = new Error('Error de validación. Por favor, verifica que todos los campos estén completos y sean válidos.')
          ;(validationError as any).response = error.response
          throw validationError
        }
      }
      
      throw error
    }
  },

  getAll: async (): Promise<Inscripcion[]> => {
    const response = await apiClient.get<Inscripcion[]>("/inscripciones")
    return response.data
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
}

