'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi, type NotificationHistory } from '@/lib/api/notifications'
import { toast } from 'sonner'

export function useNotificationHistory(limit = 50, offset = 0) {
  return useQuery({
    queryKey: ['notifications', 'history', limit, offset],
    queryFn: () => notificationsApi.getHistory(limit, offset),
    refetchOnWindowFocus: true,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const count = await notificationsApi.getUnreadCount()
      // Asegurar que siempre retorne un número válido
      return typeof count === 'number' ? count : 0
    },
    refetchInterval: 30000, // Actualizar cada 30 segundos
    refetchOnWindowFocus: true,
    // Valor por defecto para evitar undefined
    initialData: 0,
    placeholderData: 0,
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success(data.message || 'Notificaciones eliminadas')
    },
    onError: () => {
      toast.error('Error al eliminar las notificaciones')
    },
  })
}

