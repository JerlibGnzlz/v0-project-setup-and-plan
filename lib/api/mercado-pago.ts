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

  /**
   * Procesa el webhook manualmente desde el frontend
   * Útil cuando el webhook no llega automáticamente (localhost)
   */
  processPayment: async (paymentId: string): Promise<{ status: string; message: string; payment?: MercadoPagoPayment }> => {
    const response = await apiClient.post<{ status: string; message: string; payment?: MercadoPagoPayment }>(
      '/mercado-pago/process-payment',
      { paymentId }
    )
    return response.data
  },

  /**
   * Procesa el pago basándose en el preference_id
   * Útil cuando Mercado Pago redirige con preference_id en lugar de payment_id
   */
  processPaymentByPreference: async (preferenceId: string): Promise<{ status: string; message: string; payments: MercadoPagoPayment[] }> => {
    const response = await apiClient.post<{ status: string; message: string; payments: MercadoPagoPayment[] }>(
      '/mercado-pago/process-by-preference',
      { preferenceId }
    )
    return response.data
  },

  /**
   * Procesa el pago basándose en el pagoId (external_reference)
   * Útil cuando se conoce el pagoId de nuestra BD
   */
  processPaymentByPagoId: async (pagoId: string): Promise<{ status: string; message: string; payments: MercadoPagoPayment[] }> => {
    const response = await apiClient.post<{ status: string; message: string; payments: MercadoPagoPayment[] }>(
      '/mercado-pago/process-by-pago-id',
      { pagoId }
    )
    return response.data
  },
}

