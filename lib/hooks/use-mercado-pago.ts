'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'

// Tipos básicos para Mercado Pago
interface MercadoPagoStatus {
  configured: boolean
  testMode: boolean
}

interface PaymentPreference {
  id: string
  init_point?: string
  sandbox_init_point?: string
}

interface PaymentStatus {
  id: string
  status: string
  status_detail?: string
  transaction_amount?: number
  currency_id?: string
}

interface CreatePreferenceDto {
  inscripcionId: string
  pagoId: string
  monto: number
  descripcion: string
  emailPayer: string
  nombrePayer: string
  apellidoPayer: string
  telefonoPayer?: string
  numeroCuota: number
}

/**
 * Hook para verificar el estado de configuración de Mercado Pago
 * Retorna si está configurado y si está en modo test
 */
export function useMercadoPagoStatus() {
  return useQuery<MercadoPagoStatus>({
    queryKey: ['mercado-pago', 'status'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<MercadoPagoStatus>('/mercado-pago/status')
        return response.data
      } catch (error) {
        // Si el endpoint no existe, retornar estado por defecto
        console.warn('[useMercadoPagoStatus] Endpoint no disponible, usando valores por defecto')
        return {
          configured: false,
          testMode: true,
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: false, // No reintentar si falla
  })
}

/**
 * Hook para crear una preferencia de pago en Mercado Pago
 */
export function useCreatePaymentPreference() {
  const queryClient = useQueryClient()

  return useMutation<PaymentPreference, Error, CreatePreferenceDto>({
    mutationFn: async (data) => {
      try {
        const response = await apiClient.post<PaymentPreference>('/mercado-pago/preference', data)
        return response.data
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        throw new Error(`Error al crear preferencia de pago: ${errorMessage}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mercado-pago'] })
    },
  })
}

/**
 * Hook para obtener el estado de un pago por su ID
 * @param paymentId - ID del pago (payment_id o preference_id)
 */
export function usePaymentStatus(paymentId: string | null) {
  return useQuery<PaymentStatus | null>({
    queryKey: ['mercado-pago', 'payment', paymentId],
    queryFn: async () => {
      if (!paymentId) {
        return null
      }

      try {
        const response = await apiClient.get<PaymentStatus>(`/mercado-pago/payment/${paymentId}`)
        return response.data
      } catch (error) {
        // Si el endpoint no existe o falla, retornar null
        console.warn('[usePaymentStatus] No se pudo obtener el estado del pago:', error)
        return null
      }
    },
    enabled: !!paymentId, // Solo ejecutar si hay paymentId
    staleTime: 30 * 1000, // 30 segundos
    retry: false, // No reintentar si falla
  })
}
