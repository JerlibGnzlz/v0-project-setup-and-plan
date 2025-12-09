import { apiClient } from './client'

export interface MercadoPagoPreference {
  id: string
  init_point?: string
  sandbox_init_point?: string
  client_id?: string
  items: Array<{
    id?: string
    title: string
    description?: string
    quantity: number
    unit_price: number
  }>
  payer?: {
    name?: string
    surname?: string
    email?: string
  }
  back_urls?: {
    success?: string
    failure?: string
    pending?: string
  }
  auto_return?: string
  external_reference?: string
  notification_url?: string
}

export interface MercadoPagoPayment {
  id: number
  status: 'pending' | 'approved' | 'authorized' | 'in_process' | 'in_mediation' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back'
  status_detail?: string
  transaction_amount: number
  currency_id: string
  date_created: string
  date_approved?: string
  external_reference?: string
}

export interface CreatePaymentPreferenceRequest {
  inscripcionId: string
  pagoId: string
  monto: number
  descripcion: string
  emailPayer: string
  nombrePayer?: string
  apellidoPayer?: string
  telefonoPayer?: string
  successUrl?: string
  failureUrl?: string
  pendingUrl?: string
  numeroCuota?: number
}

export const mercadoPagoApi = {
  /**
   * Crea una preferencia de pago en Mercado Pago
   */
  createPreference: async (data: CreatePaymentPreferenceRequest): Promise<MercadoPagoPreference> => {
    const response = await apiClient.post<MercadoPagoPreference>('/mercado-pago/create-preference', data)
    return response.data
  },

  /**
   * Obtiene el estado de un pago
   */
  getPaymentStatus: async (paymentId: string): Promise<MercadoPagoPayment> => {
    const response = await apiClient.get<MercadoPagoPayment>(`/mercado-pago/payment/${paymentId}`)
    return response.data
  },

  /**
   * Verifica si Mercado Pago está configurado
   */
  getStatus: async (): Promise<{ configured: boolean; testMode: boolean }> => {
    const response = await apiClient.get<{ configured: boolean; testMode: boolean }>('/mercado-pago/status')
    return response.data
  },
}

