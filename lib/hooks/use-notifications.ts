'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi, type NotificationHistory } from '@/lib/api/notifications'
import { toast } from 'sonner'

export function useNotificationHistory(limit = 50, offset = 0) {
  // Verificar si hay un token de autenticación disponible
  const hasToken =
    typeof window !== 'undefined' &&
    (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token'))

  return useQuery({
    queryKey: ['notifications', 'history', limit, offset],
    queryFn: async () => {
      try {
        const data = await notificationsApi.getHistory(limit, offset)
        // Asegurar que siempre tenga la estructura correcta
        return {
          notifications: Array.isArray(data?.notifications) ? data.notifications : [],
          total: typeof data?.total === 'number' ? data.total : 0,
          limit: typeof data?.limit === 'number' ? data.limit : limit,
          offset: typeof data?.offset === 'number' ? data.offset : offset,
        }
      } catch (error) {
        // Si hay error, retornar estructura por defecto
        console.warn('[useNotificationHistory] Error obteniendo historial:', error)
        return {
          notifications: [],
          total: 0,
          limit,
          offset,
        }
      }
    },
    enabled: !!hasToken, // Solo ejecutar si hay token
    refetchOnWindowFocus: !!hasToken, // Solo refetch si hay token
    // Valores por defecto para evitar undefined
    placeholderData: {
      notifications: [],
      total: 0,
      limit,
      offset,
    },
  })
}

export function useUnreadCount() {
  // Verificar si hay un token de autenticación disponible
  const hasToken =
    typeof window !== 'undefined' &&
    (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token'))

  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      try {
        const count = await notificationsApi.getUnreadCount()
        // Asegurar que siempre retorne un número válido
        const safeCount = typeof count === 'number' ? count : 0
        console.log('[useUnreadCount] Conteo obtenido:', safeCount)
        return safeCount
      } catch (error) {
        console.error('[useUnreadCount] Error obteniendo conteo:', error)
        return 0
      }
    },
    enabled: !!hasToken, // Solo ejecutar si hay token
    refetchInterval: hasToken ? 30000 : false, // Actualizar cada 30 segundos solo si hay token
    refetchOnWindowFocus: !!hasToken, // Solo refetch si hay token
    // Valor por defecto para evitar undefined
    initialData: 0,
    placeholderData: 0,
    staleTime: 10000, // Considerar datos frescos por 10 segundos
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Todas las notificaciones marcadas como leídas')
    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Notificación eliminada')
    },
    onError: () => {
      toast.error('Error al eliminar la notificación')
    },
  })
}

export function useDeleteNotifications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (options: { ids?: string[]; deleteRead?: boolean; olderThanDays?: number }) =>
      notificationsApi.deleteMultiple(options),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success(data.message || 'Notificaciones eliminadas')
    },
    onError: () => {
      toast.error('Error al eliminar las notificaciones')
    },
  })
}
