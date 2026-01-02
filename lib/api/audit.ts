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
    const params = new URLSearchParams()
    if (filters?.entityType) params.append('entityType', filters.entityType)
    if (filters?.entityId) params.append('entityId', filters.entityId)
    if (filters?.userId) params.append('userId', filters.userId)
    if (filters?.action) params.append('action', filters.action)
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.offset) params.append('offset', filters.offset.toString())

    const response = await apiClient.get<AuditLogsResponse>(`/audit/logs?${params.toString()}`)
    return response.data
  },

  getUserActivity: async (userId: string, limit?: number, offset?: number): Promise<UserActivityResponse> => {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit.toString())
    if (offset) params.append('offset', offset.toString())

    const response = await apiClient.get<UserActivityResponse>(
      `/audit/users/${userId}/activity?${params.toString()}`
    )
    return response.data
  },

  getStats: async (startDate?: string, endDate?: string): Promise<AuditStatsResponse> => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const response = await apiClient.get<AuditStatsResponse>(`/audit/stats?${params.toString()}`)
    return response.data
  },
}

