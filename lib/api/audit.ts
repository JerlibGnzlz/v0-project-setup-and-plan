import { apiClient } from './client'

export interface AuditLog {
  id: string
  entityType: string
  entityId: string
  action: string
  userId: string
  userEmail: string
  userName: string | null
  changes: Array<{
    field: string
    oldValue: unknown
    newValue: unknown
  }> | null
  metadata: Record<string, unknown> | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  user?: {
    id: string
    email: string
    nombre: string
    rol: string
  }
}

export interface AuditLogsResponse {
  logs: AuditLog[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface UserActivityResponse {
  user: {
    id: string
    email: string
    nombre: string
    rol: string
    ultimoLogin: string | null
    loginCount: number
    ultimaIp: string | null
  } | null
  activity: {
    logs: AuditLog[]
    pagination: {
      total: number
      limit: number
      offset: number
      hasMore: boolean
    }
  }
}

export interface AuditStatsResponse {
  totalLogs: number
  byEntityType: Array<{
    entityType: string
    _count: number
  }>
  byAction: Array<{
    action: string
    _count: number
  }>
  topUsers: Array<{
    userId: string
    _count: number
    user: {
      id: string
      nombre: string
      email: string
    } | null
  }>
  recentActivity: AuditLog[]
}

export interface AuditLogsFilters {
  entityType?: string
  entityId?: string
  userId?: string
  action?: string
  limit?: number
  offset?: number
}

export const auditApi = {
  getLogs: async (filters?: AuditLogsFilters): Promise<AuditLogsResponse> => {
    try {
      const params = new URLSearchParams()
      if (filters?.entityType) params.append('entityType', filters.entityType)
      if (filters?.entityId) params.append('entityId', filters.entityId)
      if (filters?.userId) params.append('userId', filters.userId)
      if (filters?.action) params.append('action', filters.action)
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.offset) params.append('offset', filters.offset.toString())

      const queryString = params.toString()
      const url = queryString ? `/audit/logs?${queryString}` : '/audit/logs'
      
      console.log('[auditApi] Fetching logs from:', url)
      const response = await apiClient.get<AuditLogsResponse>(url)
      console.log('[auditApi] Logs response:', response.data)
      return response.data
    } catch (error: unknown) {
      console.error('[auditApi] Error fetching logs:', error)
      throw error
    }
  },

  getUserActivity: async (userId: string, limit?: number, offset?: number): Promise<UserActivityResponse> => {
    try {
      const params = new URLSearchParams()
      if (limit) params.append('limit', limit.toString())
      if (offset) params.append('offset', offset.toString())

      const queryString = params.toString()
      const url = queryString ? `/audit/users/${userId}/activity?${queryString}` : `/audit/users/${userId}/activity`
      
      const response = await apiClient.get<UserActivityResponse>(url)
      return response.data
    } catch (error: unknown) {
      console.error('[auditApi] Error fetching user activity:', error)
      throw error
    }
  },

  getStats: async (startDate?: string, endDate?: string): Promise<AuditStatsResponse> => {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const queryString = params.toString()
      const url = queryString ? `/audit/stats?${queryString}` : '/audit/stats'
      
      console.log('[auditApi] Fetching stats from:', url)
      const response = await apiClient.get<AuditStatsResponse>(url)
      console.log('[auditApi] Stats response:', response.data)
      return response.data
    } catch (error: unknown) {
      console.error('[auditApi] Error fetching stats:', error)
      throw error
    }
  },
}

