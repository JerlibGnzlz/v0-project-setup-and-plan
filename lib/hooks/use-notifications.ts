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
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 30000, // Actualizar cada 30 segundos
    refetchOnWindowFocus: true,
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

