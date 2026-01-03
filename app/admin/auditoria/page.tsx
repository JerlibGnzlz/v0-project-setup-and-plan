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

// Función simple para formatear fecha relativa
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'hace unos segundos'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `hace ${days} ${days === 1 ? 'día' : 'días'}`
  } else {
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }
}

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

  const { data: logsData, isLoading: isLoadingLogs, error: logsError } = useAuditLogs(filters)
  const { data: statsData, isLoading: isLoadingStats, error: statsError } = useAuditStats()

  // Debug: Log errors para troubleshooting
  if (logsError) {
    console.error('[AuditoriaPage] Error en logs:', logsError)
  }
  if (statsError) {
    console.error('[AuditoriaPage] Error en stats:', statsError)
  }

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
      ) : statsError ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-destructive mb-2 font-semibold">Error al cargar estadísticas</p>
              <p className="text-sm text-muted-foreground mb-2">
                {statsError instanceof Error 
                  ? statsError.message 
                  : typeof statsError === 'object' && statsError !== null && 'message' in statsError
                    ? String(statsError.message)
                    : 'Error desconocido'}
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                Verifica que el backend esté corriendo y que tengas permisos de ADMIN.
              </p>
              {statsError && typeof statsError === 'object' && 'response' in statsError && (
                <p className="text-xs text-muted-foreground">
                  Status: {(statsError as { response?: { status?: number } }).response?.status || 'N/A'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
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
              <Select value={filters.entityType || 'all'} onValueChange={value => handleFilterChange('entityType', value === 'all' ? undefined : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
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
              <Select value={filters.action || 'all'} onValueChange={value => handleFilterChange('action', value === 'all' ? undefined : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
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
              ? 'Cargando registros...'
              : logsError
                ? 'Error al cargar registros'
                : logsData
                  ? `${logsData.pagination.total} registro(s) encontrado(s)`
                  : 'No hay registros disponibles'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingLogs ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : logsError ? (
            <div className="text-center py-12">
              <FileText className="size-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-destructive">Error al cargar logs</h3>
              <p className="text-muted-foreground mb-2">
                {logsError instanceof Error 
                  ? logsError.message 
                  : typeof logsError === 'object' && logsError !== null && 'message' in logsError
                    ? String(logsError.message)
                    : 'Error desconocido al cargar los registros de auditoría'}
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                Verifica que el backend esté corriendo y que tengas permisos de ADMIN.
              </p>
              {logsError && typeof logsError === 'object' && 'response' in logsError && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Status: {(logsError as { response?: { status?: number } }).response?.status || 'N/A'}</p>
                  {(logsError as { response?: { status?: number } }).response?.status === 404 && (
                    <p className="text-amber-600 dark:text-amber-400">
                      ⚠️ El endpoint /api/audit/logs no se encontró. Verifica que el backend esté desplegado correctamente.
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : !logsData || logsData.logs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay registros de auditoría</h3>
              <p className="text-muted-foreground mb-4">
                {filters.entityType || filters.action
                  ? 'No se encontraron registros con los filtros seleccionados. Intenta cambiar los filtros.'
                  : 'Aún no se han registrado acciones en el sistema.'}
              </p>
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-medium">Los registros aparecerán automáticamente cuando:</p>
                <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
                  <li>Los usuarios (ADMIN o EDITOR) creen, editen o eliminen noticias</li>
                  <li>Los usuarios (ADMIN o EDITOR) creen, editen o eliminen elementos de galería</li>
                  <li>Los usuarios publiquen, oculten o destaquen noticias</li>
                  <li>Los usuarios inicien sesión (se registra automáticamente)</li>
                </ul>
                <p className="mt-4 text-xs">
                  💡 <strong>Tip:</strong> Realiza alguna acción en Noticias o Galería para generar registros de auditoría.
                </p>
              </div>
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
                          {formatDate(log.createdAt)}
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


