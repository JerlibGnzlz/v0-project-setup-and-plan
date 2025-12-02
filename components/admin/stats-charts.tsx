'use client'

import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Users, CreditCard, DollarSign, Calendar } from 'lucide-react'

interface StatsChartsProps {
  inscripciones: any[]
  pagos: any[]
  pastores: any[]
}

const COLORS = {
  confirmado: '#10b981', // emerald-500
  pendiente: '#f59e0b', // amber-500
  cancelado: '#ef4444', // red-500
  completado: '#10b981', // emerald-500
  rechazado: '#ef4444', // red-500
  web: '#3b82f6', // blue-500
  mobile: '#8b5cf6', // purple-500
  dashboard: '#06b6d4', // cyan-500
}

export function StatsCharts({ inscripciones, pagos, pastores }: StatsChartsProps) {
  // Preparar datos para gráficos
  const inscripcionesPorEstado = useMemo(() => {
    const estados = inscripciones.reduce((acc: any, insc: any) => {
      const estado = insc.estado || 'pendiente'
      acc[estado] = (acc[estado] || 0) + 1
      return acc
    }, {})

    return Object.entries(estados).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: COLORS[name as keyof typeof COLORS] || '#6b7280',
    }))
  }, [inscripciones])

  const pagosPorEstado = useMemo(() => {
    const estados = pagos.reduce((acc: any, pago: any) => {
      const estado = pago.estado || 'PENDIENTE'
      acc[estado] = (acc[estado] || 0) + 1
      return acc
    }, {})

    return Object.entries(estados).map(([name, value]) => ({
      name: name.charAt(0) + name.slice(1).toLowerCase(),
      value,
      color: COLORS[name.toLowerCase() as keyof typeof COLORS] || '#6b7280',
    }))
  }, [pagos])

  const inscripcionesPorOrigen = useMemo(() => {
    const origenes = inscripciones.reduce((acc: any, insc: any) => {
      const origen = insc.origenRegistro || 'web'
      acc[origen] = (acc[origen] || 0) + 1
      return acc
    }, {})

    return Object.entries(origenes).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: COLORS[name as keyof typeof COLORS] || '#6b7280',
    }))
  }, [inscripciones])

  // Inscripciones por mes (últimos 6 meses)
  const inscripcionesPorMes = useMemo(() => {
    const meses: Record<string, number> = {}
    const ahora = new Date()
    
    // Inicializar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
      const key = fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
      meses[key] = 0
    }

    inscripciones.forEach((insc: any) => {
      if (insc.fechaInscripcion) {
        const fecha = new Date(insc.fechaInscripcion)
        const key = fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
        if (meses.hasOwnProperty(key)) {
          meses[key]++
        }
      }
    })

    return Object.entries(meses).map(([name, value]) => ({
      name,
      inscripciones: value,
    }))
  }, [inscripciones])

  // Ingresos por mes (últimos 6 meses)
  const ingresosPorMes = useMemo(() => {
    const meses: Record<string, number> = {}
    const ahora = new Date()
    
    // Inicializar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
      const key = fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
      meses[key] = 0
    }

    pagos
      .filter((p: any) => p.estado === 'COMPLETADO')
      .forEach((pago: any) => {
        if (pago.fechaPago || pago.createdAt) {
          const fecha = new Date(pago.fechaPago || pago.createdAt)
          const key = fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
          if (meses.hasOwnProperty(key)) {
            const monto = typeof pago.monto === 'number' ? pago.monto : parseFloat(pago.monto || 0)
            meses[key] += monto
          }
        }
      })

    return Object.entries(meses).map(([name, value]) => ({
      name,
      ingresos: Math.round(value),
    }))
  }, [pagos])

  // Inscripciones por día (últimos 30 días)
  const inscripcionesPorDia = useMemo(() => {
    const dias: Record<string, number> = {}
    const ahora = new Date()
    
    // Inicializar últimos 30 días
    for (let i = 29; i >= 0; i--) {
      const fecha = new Date(ahora)
      fecha.setDate(fecha.getDate() - i)
      const key = fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
      dias[key] = 0
    }

    inscripciones.forEach((insc: any) => {
      if (insc.fechaInscripcion) {
        const fecha = new Date(insc.fechaInscripcion)
        const hoy = new Date()
        const diasDiferencia = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diasDiferencia >= 0 && diasDiferencia < 30) {
          const key = fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
          if (dias.hasOwnProperty(key)) {
            dias[key]++
          }
        }
      }
    })

    return Object.entries(dias).map(([name, value]) => ({
      name,
      inscripciones: value,
    }))
  }, [inscripciones])

  const totalRecaudado = useMemo(() => {
    return pagos
      .filter((p: any) => p.estado === 'COMPLETADO')
      .reduce((sum: number, p: any) => {
        const monto = typeof p.monto === 'number' ? p.monto : parseFloat(p.monto || 0)
        return sum + monto
      }, 0)
  }, [pagos])

  return (
    <div className="space-y-6">
      {/* Resumen de métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inscritos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inscripciones.length}</div>
            <p className="text-xs text-muted-foreground">
              {inscripcionesPorEstado.find((e) => e.name === 'Confirmado')?.value || 0} confirmados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recaudado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRecaudado.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {pagosPorEstado.find((e) => e.name === 'Completado')?.value || 0} pagos completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pagosPorEstado.find((e) => e.name === 'Pendiente')?.value || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren validación
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pastores Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pastores.filter((p: any) => p.activo).length}
            </div>
            <p className="text-xs text-muted-foreground">
              En estructura organizacional
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principales */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gráfico de inscripciones por estado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Inscripciones por Estado
            </CardTitle>
            <CardDescription>Distribución de inscripciones según su estado</CardDescription>
          </CardHeader>
          <CardContent>
            {inscripcionesPorEstado.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={inscripcionesPorEstado}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {inscripcionesPorEstado.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de pagos por estado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Pagos por Estado
            </CardTitle>
            <CardDescription>Distribución de pagos según su estado</CardDescription>
          </CardHeader>
          <CardContent>
            {pagosPorEstado.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pagosPorEstado}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pagosPorEstado.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de inscripciones por origen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Inscripciones por Origen
            </CardTitle>
            <CardDescription>Registros según su origen (web, mobile, dashboard)</CardDescription>
          </CardHeader>
          <CardContent>
            {inscripcionesPorOrigen.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={inscripcionesPorOrigen}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                    {inscripcionesPorOrigen.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de ingresos por mes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Ingresos por Mes
            </CardTitle>
            <CardDescription>Evolución de ingresos en los últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            {ingresosPorMes.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ingresosPorMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString('es-AR')}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="ingresos"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de inscripciones por día (últimos 30 días) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Inscripciones por Día (Últimos 30 días)
          </CardTitle>
          <CardDescription>Tendencia diaria de nuevas inscripciones</CardDescription>
        </CardHeader>
        <CardContent>
          {inscripcionesPorDia.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={inscripcionesPorDia}>
                <defs>
                  <linearGradient id="colorInscripciones" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="inscripciones"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorInscripciones)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No hay datos disponibles
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}



