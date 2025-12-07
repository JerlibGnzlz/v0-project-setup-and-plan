'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { usePagosStats } from '@/lib/hooks/use-pagos'
import {
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  TrendingUp,
  Users,
  Receipt,
} from 'lucide-react'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-AR').format(num)
}

export function PagosStatsDashboard() {
  const { data: stats, isLoading, error } = usePagosStats()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Error al cargar estadísticas. Por favor, intenta nuevamente.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  const porcentajeCompletados =
    stats.totalPagos > 0
      ? ((stats.pagosCompletados / stats.totalPagos) * 100).toFixed(1)
      : '0'
  const porcentajePendientes =
    stats.totalPagos > 0
      ? ((stats.pagosPendientes / stats.totalPagos) * 100).toFixed(1)
      : '0'

  return (
    <div className="space-y-6 mb-6">
      {/* Cards principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recaudado</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalRecaudado)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pagosCompletados} pagos completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendiente</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(stats.totalPendiente)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pagosPendientes} pagos pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Pago</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.promedioPorPago)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Basado en {stats.pagosCompletados} pagos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inscripciones</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatNumber(stats.totalInscripciones)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Inscripciones registradas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cards de estados */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.pagosCompletados)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {porcentajeCompletados}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.pagosPendientes)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {porcentajePendientes}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.pagosCancelados)}</div>
            <p className="text-xs text-muted-foreground mt-1">Pagos rechazados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pagos</CardTitle>
            <Receipt className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalPagos)}</div>
            <p className="text-xs text-muted-foreground mt-1">Todos los pagos</p>
          </CardContent>
        </Card>
      </div>

      {/* Cards de comprobantes */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Comprobante</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(stats.pagosConComprobante || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalPagos > 0
                ? (((stats.pagosConComprobante || 0) / stats.totalPagos) * 100).toFixed(1)
                : '0'}
              % del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Comprobante</CardTitle>
            <FileText className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {formatNumber(stats.pagosSinComprobante || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pendientes sin comprobante
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Últimos pagos */}
      {stats.ultimosPagos && stats.ultimosPagos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Últimos Pagos Completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.ultimosPagos.map((pago) => (
                <div
                  key={pago.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {pago.inscripcion.nombre} {pago.inscripcion.apellido}
                    </p>
                    <p className="text-xs text-muted-foreground">{pago.inscripcion.email}</p>
                    {pago.fechaPago && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(pago.fechaPago).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">
                      {formatCurrency(pago.monto)}
                    </p>
                    <p className="text-xs text-muted-foreground">{pago.estado}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

