import { useMutation, useQuery } from '@tanstack/react-query'
import { mercadoPagoApi, type CreatePaymentPreferenceRequest } from '@/lib/api/mercado-pago'
import { toast } from 'sonner'

/**
 * Hook para crear una preferencia de pago en Mercado Pago
 */
export function useCreatePaymentPreference() {
  return useMutation({
    mutationFn: (data: CreatePaymentPreferenceRequest) => mercadoPagoApi.createPreference(data),
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast.error('Error al crear preferencia de pago', {
        description: errorMessage,
      })
    },
  })
}

/**
 * Hook para obtener el estado de un pago
 */
export function usePaymentStatus(paymentId: string | null) {
  return useQuery({
    queryKey: ['mercado-pago', 'payment', paymentId],
    queryFn: async () => {
      if (!paymentId) {
        return null
      }
      try {
        return await mercadoPagoApi.getPaymentStatus(paymentId)
      } catch (error) {
        // Si hay error, retornar null en lugar de lanzar excepción
        console.error('[usePaymentStatus] Error obteniendo estado del pago:', error)
        return null
      }
    },
    enabled: !!paymentId,
    retry: false, // No reintentar si falla
    refetchInterval: (query) => {
      const data = query.state.data
      // Si el pago está pendiente, refetch cada 5 segundos
      if (data && typeof data === 'object' && 'status' in data) {
        if (data.status === 'pending' || data.status === 'in_process') {
          return 5000
        }
      }
      return false
    },
  })
}

/**
 * Hook para verificar si Mercado Pago está configurado
 */
export function useMercadoPagoStatus() {
  return useQuery({
    queryKey: ['mercado-pago', 'status'],
    queryFn: () => mercadoPagoApi.getStatus(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

