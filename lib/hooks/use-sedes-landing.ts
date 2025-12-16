import { useQuery } from '@tanstack/react-query'
import { sedesApi, type Sede } from '@/lib/api/sedes'
import { useSmartSync, useSmartPolling } from './use-smart-sync'

/**
 * Hook para obtener sedes activas para la landing page
 * Usa sincronización inteligente entre pestañas
 */
export function useSedesLanding() {
  // Sincronización inteligente para la landing
  useSmartSync()

  const pollingInterval = useSmartPolling(['sedes', 'landing'], 60000) // 60 segundos

  return useQuery({
    queryKey: ['sedes', 'landing'],
    queryFn: sedesApi.getForLanding,
    refetchOnWindowFocus: true,
    refetchInterval: pollingInterval,
    staleTime: 1000 * 60 * 5, // 5 minutos
    placeholderData: previousData => previousData,
  })
}

