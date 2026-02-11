'use client'

/**
 * Hooks de convenciones (lista con polling).
 * Para convención activa y mutaciones usar use-convencion.ts para evitar
 * cachés duplicados y que el contador use siempre la misma fuente.
 */
import { useQuery } from '@tanstack/react-query'
import { convencionesApi } from '@/lib/api/convenciones'
import { useSmartSync, useSmartPolling } from './use-smart-sync'

export function useConvenciones() {
  useSmartSync()
  const pollingInterval = useSmartPolling(['convenciones'], 60000)

  return useQuery({
    queryKey: ['convenciones'],
    queryFn: convencionesApi.getAll,
    refetchOnWindowFocus: true,
    refetchInterval: pollingInterval,
    placeholderData: previousData => previousData,
  })
}

export { useConvencionActiva, useConvencion } from './use-convencion'

