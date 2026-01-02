'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { FileText, Filter, RefreshCw, Calendar, User, Activity } from 'lucide-react'
import { useAuditLogs, useAuditStats } from '@/lib/hooks/use-audit'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export default function AuditoriaPage() {
  const [filters, setFilters] = useState<{
    entityType?: string
    action?: string
    limit: number
    offset: number
  }>({
    limit: 50,
    offset: 0,
  })

  const { data: logsData, isLoading: isLoadingLogs } = useAuditLogs(filters)
  const { data: statsData, isLoading: isLoadingStats } = useAuditStats()

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
      offset: 0, // Reset offset when filters change
    }))
  }

  const handlePageChange = (newOffset: number) => {
    setFilters(prev => ({ ...prev, offset: newOffset }))
  }

  const actionColors: Record<string, string> = {
    CREATE: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    UPDATE: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    DELETE: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    PUBLICAR: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    OCULTAR: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
    DESTACAR: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
    QUITAR_DESTACADO: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
  }

  const entityTypeLabels: Record<string, string> = {
    NOTICIA: 'Noticia',
    GALERIA: 'Galería',
    USUARIO: 'Usuario',
    PAGO: 'Pago',
    INSCRIPCION: 'Inscripción',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <FileText className="size-6 text-purple-600 dark:text-purple-400" />
            </div>
            Auditoría del Sistema
          </h1>
          <p className="text-muted-foreground mt-1">
            Registro de todas las acciones realizadas por los usuarios
          </p>
        </div>
      </div>

      {/* Stats */}
      {isLoadingStats ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : statsData ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Logs</CardTitle>
              <Activity className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.totalLogs.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tipos de Entidad</CardTitle>
              <FileText className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.byEntityType.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tipos de Acción</CardTitle>
              <Activity className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.byAction.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <User className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.topUsers.length}</div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="size-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Tipo de Entidad</label>
              <Select value={filters.entityType || ''} onValueChange={value => handleFilterChange('entityType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="NOTICIA">Noticia</SelectItem>
                  <SelectItem value="GALERIA">Galería</SelectItem>
                  <SelectItem value="USUARIO">Usuario</SelectItem>
                  <SelectItem value="PAGO">Pago</SelectItem>
                  <SelectItem value="INSCRIPCION">Inscripción</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Acción</label>
              <Select value={filters.action || ''} onValueChange={value => handleFilterChange('action', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="CREATE">Crear</SelectItem>
                  <SelectItem value="UPDATE">Actualizar</SelectItem>
                  <SelectItem value="DELETE">Eliminar</SelectItem>
                  <SelectItem value="PUBLICAR">Publicar</SelectItem>
                  <SelectItem value="OCULTAR">Ocultar</SelectItem>
                  <SelectItem value="DESTACAR">Destacar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Actividad</CardTitle>
          <CardDescription>
            {isLoadingLogs
              ? 'Cargando...'
              : logsData
                ? `${logsData.pagination.total} registro(s) encontrado(s)`
                : 'No hay registros'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingLogs ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !logsData || logsData.logs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay registros</h3>
              <p className="text-muted-foreground">No se encontraron registros de auditoría con los filtros seleccionados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                {logsData.logs.map(log => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={actionColors[log.action] || 'bg-gray-500/10 text-gray-700 dark:text-gray-400'}>
                          {log.action}
                        </Badge>
                        <Badge variant="outline">{entityTypeLabels[log.entityType] || log.entityType}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: es })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="size-4 text-muted-foreground" />
                        <span className="font-medium">{log.userName || log.userEmail}</span>
                        {log.ipAddress && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">{log.ipAddress}</span>
                          </>
                        )}
                      </div>
                      {log.changes && log.changes.length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <span className="font-medium">Cambios:</span>{' '}
                          {log.changes.map((change, idx) => (
                            <span key={idx}>
                              {change.field}: {String(change.oldValue)} → {String(change.newValue)}
                              {idx < log.changes!.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {logsData.pagination.total > filters.limit && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {filters.offset + 1} - {Math.min(filters.offset + filters.limit, logsData.pagination.total)} de{' '}
                    {logsData.pagination.total}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.max(0, filters.offset - filters.limit))}
                      disabled={filters.offset === 0}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(filters.offset + filters.limit)}
                      disabled={!logsData.pagination.hasMore}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

