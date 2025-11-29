import { apiClient } from "./client"

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
  estado: "PENDIENTE" | "COMPLETADO" | "CANCELADO" | "REEMBOLSADO"
  referencia?: string
  comprobanteUrl?: string // URL de la imagen del comprobante
  fechaPago?: string
  notas?: string
  inscripcion?: Inscripcion
  createdAt: string
  updatedAt: string
}

export const pagosApi = {
  getAllPagos: async (): Promise<Pago[]> => {
    const response = await apiClient.get<Pago[]>("/pagos")
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
    estado?: "PENDIENTE" | "COMPLETADO" | "CANCELADO" | "REEMBOLSADO"
    referencia?: string
    comprobanteUrl?: string
    notas?: string
  }): Promise<Pago> => {
    const response = await apiClient.post<Pago>("/pagos", data)
    return response.data
  },

  updatePago: async (id: string, data: Partial<Pago>): Promise<Pago> => {
    const response = await apiClient.patch<Pago>(`/pagos/${id}`, data)
    return response.data
  },

  deletePago: async (id: string): Promise<void> => {
    await apiClient.delete(`/pagos/${id}`)
  },
}

