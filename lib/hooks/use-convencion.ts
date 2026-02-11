'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { convencionesApi, type Convencion } from '@/lib/api/convenciones'
import { toast } from 'sonner'
import { useSmartSync, useSmartPolling } from './use-smart-sync'

export function useConvenciones() {
  return useQuery({
    queryKey: ['convenciones'],
    queryFn: convencionesApi.getAll,
  })
}

/** Fecha del evento activo (YYYY-MM-DD). Usar para la cuenta regresiva como fuente única. */
export function useEventDate() {
  useSmartSync()
  const pollingInterval = useSmartPolling(['convencion', 'event-date'], 30000)
  return useQuery({
    queryKey: ['convencion', 'event-date'],
    queryFn: convencionesApi.getEventDate,
    staleTime: 0,
    gcTime: 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval:
      typeof pollingInterval === 'number' ? Math.min(pollingInterval, 15000) : pollingInterval,
    retry: (_, error: unknown) => {
      const err = error as { response?: { status?: number } }
      return err?.response?.status !== 404 && err?.response?.status !== 500
    },
  })
}

export function useConvencionActiva() {
  // Usar sincronización inteligente
  useSmartSync()

  // Polling inteligente que se pausa cuando la pestaña no está visible
  const pollingInterval = useSmartPolling(['convencion', 'active'], 30000)

  return useQuery({
    queryKey: ['convencion', 'active'],
    queryFn: convencionesApi.getActive,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always', // Siempre pedir datos frescos al abrir la landing (evita caché con fecha antigua)
    staleTime: 0,
    gcTime: 1 * 60 * 1000,
    refetchInterval:
      typeof pollingInterval === 'number' ? Math.min(pollingInterval, 15000) : pollingInterval,
    // No usar placeholderData: si había caché con fecha equivocada (ej. 12 feb), no mostrarla; preferir refetch
    // No reintentar automáticamente si hay error 500 (problema de base de datos)
    retry: (failureCount, error: unknown) => {
      const err = error as { response?: { status?: number } }
      if (err?.response?.status === 500) return false
      return failureCount < 2
    },
    retryDelay: 2000, // Esperar 2 segundos entre reintentos
  })
}

export function useConvencion(id: string) {
  return useQuery({
    queryKey: ['convencion', id],
    queryFn: () => convencionesApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateConvencion() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: convencionesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenciones'] })
      queryClient.invalidateQueries({ queryKey: ['convencion'] })
      notifyChange('convencion')
      toast.success('Convención creada exitosamente')
    },
    onError: () => {
      toast.error('Error al crear la convención')
    },
  })
}

export function useUpdateConvencion() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Convencion> }) =>
      convencionesApi.update(id, data),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: ['convencion', 'active'] })
      queryClient.removeQueries({ queryKey: ['convencion', 'event-date'] })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['convenciones'] }),
        queryClient.invalidateQueries({ queryKey: ['convencion'] }),
      ])
      notifyChange('convencion')
    },
    onError: () => {
      toast.error('Error al actualizar la convención')
    },
  })
}

export function useArchivarConvencion() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: convencionesApi.archivar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenciones'] })
      queryClient.invalidateQueries({ queryKey: ['convencion'] })
      notifyChange('convencion')
      toast.success('Convención archivada exitosamente')
    },
    onError: () => {
      toast.error('Error al archivar la convención')
    },
  })
}

export function useDesarchivarConvencion() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: convencionesApi.desarchivar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenciones'] })
      queryClient.invalidateQueries({ queryKey: ['convencion'] })
      notifyChange('convencion')
      toast.success('Convención desarchivada exitosamente')
    },
    onError: () => {
      toast.error('Error al desarchivar la convención')
    },
  })
}

export function useDeleteConvencion() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: convencionesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenciones'] })
      queryClient.invalidateQueries({ queryKey: ['convencion'] })
      notifyChange('convencion')
      toast.success('Convención eliminada exitosamente')
    },
    onError: () => {
      toast.error('Error al eliminar la convención')
    },
  })
}
