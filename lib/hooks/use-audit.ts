import { useQuery } from '@tanstack/react-query'
import { auditApi, type AuditLogsFilters, type UserActivityResponse, type AuditStatsResponse } from '@/lib/api/audit'

export function useAuditLogs(filters?: AuditLogsFilters) {
  return useQuery({
    queryKey: ['audit', 'logs', filters],
    queryFn: () => auditApi.getLogs(filters),
    staleTime: 1000 * 30, // 30 segundos
  })
}

export function useUserActivity(userId: string, limit?: number, offset?: number) {
  return useQuery({
    queryKey: ['audit', 'user-activity', userId, limit, offset],
    queryFn: () => auditApi.getUserActivity(userId, limit, offset),
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 segundos
  })
}

export function useAuditStats(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['audit', 'stats', startDate, endDate],
    queryFn: () => auditApi.getStats(startDate, endDate),
    staleTime: 1000 * 60, // 1 minuto
  })
}

