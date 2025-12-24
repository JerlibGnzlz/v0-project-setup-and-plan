/**
 * Hook para obtener convenciones - Mobile
 * Incluye sincronización en tiempo real via WebSockets
 */

import { useQuery } from '@tanstack/react-query'
import { convencionesApi, Convencion } from '../api/convenciones'
import { useWebSocketSync } from './use-websocket-sync'

/**
 * Hook para obtener todas las convenciones
 */
export function useConvenciones() {
  // Conectar a WebSocket para sincronización en tiempo real
  useWebSocketSync()

  return useQuery<Convencion[]>({
    queryKey: ['convenciones'],
    queryFn: () => convencionesApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    retryDelay: 1000,
  })
}

/**
 * Hook para obtener la convención activa
 */
export function useConvencionActiva() {
  // Conectar a WebSocket para sincronización en tiempo real
  useWebSocketSync()

  return useQuery<Convencion | null>({
    queryKey: ['convencion', 'active'],
    queryFn: () => convencionesApi.getActive(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    retryDelay: 1000,
  })
}

/**
 * Hook para obtener una convención por ID
 */
export function useConvencion(id: string) {
  // Conectar a WebSocket para sincronización en tiempo real
  useWebSocketSync()

  return useQuery<Convencion>({
    queryKey: ['convencion', id],
    queryFn: () => convencionesApi.getById(id),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    retryDelay: 1000,
    enabled: !!id,
  })
}

