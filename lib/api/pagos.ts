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
  estado: "PENDIENTE" | "COMPLETADO" | "CANCELADO" | "REEMBOLSADO"
  referencia?: string
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

  updatePago: async (id: string, data: Partial<Pago>): Promise<Pago> => {
    const response = await apiClient.patch<Pago>(`/pagos/${id}`, data)
    return response.data
  },

  deletePago: async (id: string): Promise<void> => {
    await apiClient.delete(`/pagos/${id}`)
  },
}


