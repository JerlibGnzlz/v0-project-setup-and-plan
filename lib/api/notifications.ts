import { apiClient } from './client'

export interface NotificationHistory {
  id: string
  pastorId: string
  email: string
  title: string
  body: string
  type: string
  data?: any
  sentVia: 'push' | 'email' | 'both' | 'none'
  pushSuccess: boolean
  emailSuccess: boolean
  read: boolean
  readAt?: string
  createdAt: string
}

export interface NotificationHistoryResponse {
  notifications: NotificationHistory[]
  total: number
  limit: number
  offset: number
}

export interface UnreadCountResponse {
  count: number
}

export const notificationsApi = {
  getHistory: async (limit = 50, offset = 0): Promise<NotificationHistoryResponse> => {
    const response = await apiClient.get<NotificationHistoryResponse>('/notifications/history', {
      params: { limit, offset },
    })
    return response.data
  },

  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await apiClient.get<UnreadCountResponse>('/notifications/unread-count')
      // Asegurar que siempre retorne un número válido
      return response.data?.count ?? 0
    } catch (error) {
      // Si hay error, retornar 0 en lugar de undefined
      console.error('Error obteniendo conteo de notificaciones no leídas:', error)
      return 0
    }
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/notifications/mark-read/${id}`)
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/mark-all-read')
  },
}

