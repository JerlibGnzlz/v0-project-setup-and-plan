'use client'

import { useQuery } from '@tanstack/react-query'
import { convencionesApi, type Convencion } from '@/lib/api/convenciones'
import { useSmartSync, useSmartPolling } from './use-smart-sync'

export function useConvenciones() {
  // Usar sincronización inteligente
  useSmartSync()

  // Polling inteligente (cada 60 segundos, se pausa cuando no está visible)
  const pollingInterval = useSmartPolling(['convenciones'], 60000)

  return useQuery({
    queryKey: ['convenciones'],
    queryFn: convencionesApi.getAll,
    refetchOnWindowFocus: true,
    refetchInterval: pollingInterval,
    placeholderData: previousData => previousData,
  })
}

export function useConvencion(id: string) {
  return useQuery({
    queryKey: ['convenciones', id],
    queryFn: () => convencionesApi.getById(id),
    enabled: !!id,
  })
}

export function useConvencionActiva() {
  return useQuery({
    queryKey: ['convenciones', 'active'],
    queryFn: convencionesApi.getActive,
    refetchOnWindowFocus: true,
    placeholderData: previousData => previousData,
  })
}

