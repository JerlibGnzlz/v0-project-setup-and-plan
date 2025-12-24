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

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`)
  },

  deleteMultiple: async (options: {
    ids?: string[]
    deleteRead?: boolean
    olderThanDays?: number
  }): Promise<{ deleted: number; message: string }> => {
    const response = await apiClient.delete<{ deleted: number; message: string }>(
      '/notifications',
      {
        data: options,
      }
    )
    return response.data
  },

  sendPushNotificationsCredencialesVencidas: async (tipo: 'vencidas' | 'por_vencer' | 'ambas'): Promise<{
    enviadas: number
    errores: number
    detalles: Array<{ email: string; nombre: string; estado: string; exito: boolean; error?: string }>
  }> => {
    const response = await apiClient.post<{
      enviadas: number
      errores: number
      detalles: Array<{ email: string; nombre: string; estado: string; exito: boolean; error?: string }>
    }>('/notifications/push/credenciales-vencidas', { tipo })
    return response.data
  },

  sendTestPushNotificationByDocumento: async (documento: string): Promise<{
    encontrado: boolean
    credencial?: {
      id: string
      tipo: 'ministerial' | 'capellania'
      documento: string
      nombre: string
      apellido: string
      fechaVencimiento: string
      invitadoId: string | null
    }
    invitado?: {
      id: string
      email: string
      nombre: string
      apellido: string
      tieneAuth: boolean
      tokensActivos: number
      tokens: Array<{ token: string; platform: string; active: boolean }>
    }
    enviado: boolean
    error?: string
  }> => {
    const response = await apiClient.post('/notifications/push/test-by-documento', { documento })
    return response.data
  },

  getDiagnostics: async (): Promise<{
    deviceTokens: {
      total: number
      activos: number
      porPlataforma: { ios: number; android: number }
      porTipoUsuario: { admin: number; pastor: number; invitado: number }
    }
    credenciales: {
      total: number
      conInvitadoId: number
      vencidas: number
      porVencer: number
      sinInvitadoId: number
    }
    usuariosConTokens: Array<{
      email: string
      tipo: 'admin' | 'pastor' | 'invitado'
      tokensActivos: number
      plataformas: string[]
    }>
    credencialesConUsuariosSinTokens: Array<{
      credencialId: string
      tipo: 'ministerial' | 'capellania'
      documento: string
      nombre: string
      email: string
      estado: string
      diasRestantes: number
    }>
  }> => {
    const response = await apiClient.get('/notifications/diagnostics')
    return response.data
  },
}
