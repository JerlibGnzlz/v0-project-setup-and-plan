/**
 * Tipos para integración con Mercado Pago
 */

export interface MercadoPagoConfig {
  accessToken: string
  publicKey?: string
  isTestMode: boolean
}

export interface CreatePreferenceRequest {
  items: Array<{
    title: string
    description?: string
    quantity: number
    unit_price: number
  }>
  payer?: {
    name?: string
    surname?: string
    email: string
    phone?: {
      area_code?: string
      number?: string
    }
  }
  back_urls?: {
    success?: string
    failure?: string
    pending?: string
  }
  auto_return?: 'approved' | 'all'
  external_reference?: string
  notification_url?: string
  statement_descriptor?: string
  metadata?: Record<string, unknown>
}

export interface MercadoPagoPreference {
  id: string
  init_point?: string
  sandbox_init_point?: string
  client_id?: string
  collector_id?: number
  operation_type?: string
  items: Array<{
    id?: string
    title: string
    description?: string
    picture_url?: string
    category_id?: string
    quantity: number
    unit_price: number
  }>
  payer?: {
    name?: string
    surname?: string
    email?: string
    phone?: {
      area_code?: string
      number?: string
    }
    identification?: {
      type?: string
      number?: string
    }
    address?: {
      zip_code?: string
      street_name?: string
      street_number?: number
    }
  }
  back_urls?: {
    success?: string
    failure?: string
    pending?: string
  }
  auto_return?: string
  payment_methods?: {
    excluded_payment_methods?: Array<{ id: string }>
    excluded_payment_types?: Array<{ id: string }>
    installments?: number
  }
  notification_url?: string
  statement_descriptor?: string
  external_reference?: string
  expires?: boolean
  expiration_date_from?: string
  expiration_date_to?: string
  metadata?: Record<string, unknown>
  additional_info?: string
  marketplace?: string
  marketplace_fee?: number
  differential_pricing_id?: string
  binary_mode?: boolean
  taxes?: Array<{
    type: string
    value: number
  }>
}

export interface MercadoPagoPayment {
  id: number
  status: 'pending' | 'approved' | 'authorized' | 'in_process' | 'in_mediation' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back'
  status_detail?: string
  transaction_amount: number
  transaction_amount_refunded?: number
  currency_id: string
  date_created: string
  date_approved?: string
  date_last_updated: string
  money_release_date?: string
  operation_type?: string
  description?: string
  payment_method_id?: string
  payment_type_id?: string
  issuer_id?: string
  installments?: number
  external_reference?: string
  metadata?: Record<string, unknown>
  payer?: {
    id?: string
    email?: string
    identification?: {
      type?: string
      number?: string
    }
    type?: string
  }
  collector_id?: number
  collector_email?: string
  merchant_account_id?: number
  merchant_number?: number
  reason?: string
  card?: {
    id?: string
    first_six_digits?: string
    last_four_digits?: string
    expiration_month?: number
    expiration_year?: number
    cardholder?: {
      name?: string
      identification?: {
        type?: string
        number?: string
      }
    }
  }
  statement_descriptor?: string
  processing_mode?: string
  merchant_order_id?: number
  point_of_interaction?: {
    type?: string
    transaction_data?: {
      qr_code?: string
      qr_code_base64?: string
      ticket_url?: string
    }
  }
}

export interface WebhookNotification {
  id: number
  live_mode: boolean
  type: 'payment' | 'plan' | 'subscription' | 'invoice' | 'point_integration_wh'
  date_created: string
  application_id: number
  user_id: string
  version: number
  api_version: string
  action: string
  data: {
    id: string
  }
}

export interface PaymentWebhookData {
  id: number
  type: string
  action: string
  data: {
    id: string
  }
}



























