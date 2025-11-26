'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { usePagos, useUpdatePago } from '@/lib/hooks/use-pagos'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Search, CheckCircle, CreditCard, FileText, ChevronLeft } from 'lucide-react'
import { ScrollReveal } from '@/components/scroll-reveal'

export default function PagosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('todos')
  const { data: pagos = [], isLoading } = usePagos()
  const updatePagoMutation = useUpdatePago()

  const filteredPagos = pagos.filter((pago: any) => {
    const nombreCompleto = pago.inscripcion
      ? `${pago.inscripcion.nombre} ${pago.inscripcion.apellido}`
      : ''
    const matchSearch = nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pago.referencia && pago.referencia.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchEstado = estadoFilter === 'todos' ||
      (estadoFilter === 'confirmado' && pago.estado === 'COMPLETADO') ||
      (estadoFilter === 'pendiente' && pago.estado === 'PENDIENTE') ||
      pago.estado === estadoFilter
    return matchSearch && matchEstado
  })

  const confirmarPago = async (pagoId: string) => {
    try {
      await updatePagoMutation.mutateAsync({
        id: pagoId,
        data: {
          estado: 'COMPLETADO',
          fechaPago: new Date().toISOString()
        }
      })
    } catch (error) {
      // Error manejado por el hook
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header con gradiente */}
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="hover:bg-emerald-50 dark:hover:bg-emerald-500/10">
              <ChevronLeft className="size-5 text-emerald-600 dark:text-emerald-400" />
            </Button>
          </Link>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 rounded-xl blur-xl dark:from-emerald-500/5 dark:via-teal-500/5 dark:to-sky-500/5" />
            <div className="relative">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 dark:from-emerald-400 dark:via-teal-400 dark:to-sky-400 bg-clip-text text-transparent">
                Gestión de Pagos
              </h1>
              <p className="text-muted-foreground mt-1">
                Verificar pagos, cuotas de MercadoPago y vouchers
              </p>
            </div>
          </div>
        </div>

        <ScrollReveal>
          <Card className="border-emerald-200/50 dark:border-emerald-500/20 bg-gradient-to-br from-white to-emerald-50/30 dark:from-background dark:to-emerald-950/20 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20">
                  <Search className="size-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">Filtros y Búsqueda</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o referencia..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="CANCELADO">Cancelado</SelectItem>
                    <SelectItem value="REEMBOLSADO">Reembolsado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <Card className="border-emerald-200/50 dark:border-emerald-500/20 bg-gradient-to-br from-white to-emerald-50/30 dark:from-background dark:to-emerald-950/20 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500/10 to-sky-500/10 dark:from-teal-500/20 dark:to-sky-500/20">
                  <CreditCard className="size-4 text-teal-600 dark:text-teal-400" />
                </div>
                <span className="bg-gradient-to-r from-teal-600 to-sky-600 dark:from-teal-400 dark:to-sky-400 bg-clip-text text-transparent">Listado de Pagos</span>
              </CardTitle>
              <CardDescription>
                {filteredPagos.length} pago(s) encontrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/30">
                    <tr className="text-left">
                      <th className="p-3 text-sm font-medium">Inscrito</th>
                      <th className="p-3 text-sm font-medium">Tipo</th>
                      <th className="p-3 text-sm font-medium">Fecha</th>
                      <th className="p-3 text-sm font-medium">Monto</th>
                      <th className="p-3 text-sm font-medium">Método</th>
                      <th className="p-3 text-sm font-medium">Estado</th>
                      <th className="p-3 text-sm font-medium">Notas</th>
                      <th className="p-3 text-sm font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPagos.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-muted-foreground">
                          No se encontraron pagos
                        </td>
                      </tr>
                    ) : (
                      filteredPagos.map((pago: any) => {
                        const inscripcion = pago.inscripcion
                        const nombreCompleto = inscripcion
                          ? `${inscripcion.nombre} ${inscripcion.apellido}`
                          : 'N/A'
                        const monto = typeof pago.monto === 'number' ? pago.monto : parseFloat(pago.monto || 0)
                        const estadoEsCompletado = pago.estado === 'COMPLETADO'
                        const estadoEsPendiente = pago.estado === 'PENDIENTE'

                        return (
                          <tr key={pago.id} className="border-b last:border-0 hover:bg-muted/50">
                            <td className="p-3">
                              <p className="font-medium text-sm">{nombreCompleto}</p>
                              {pago.referencia && (
                                <p className="text-xs text-muted-foreground">{pago.referencia}</p>
                              )}
                            </td>
                            <td className="p-3">
                              <Badge variant="outline">
                                Pago único
                              </Badge>
                            </td>
                            <td className="p-3 text-sm">
                              {pago.fechaPago
                                ? new Date(pago.fechaPago).toLocaleDateString('es-ES')
                                : new Date(pago.createdAt).toLocaleDateString('es-ES')
                              }
                            </td>
                            <td className="p-3 text-sm font-semibold">
                              ${monto.toLocaleString('es-AR')}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <CreditCard className="size-4 text-muted-foreground" />
                                <span className="text-sm">{pago.metodoPago}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge
                                variant={estadoEsCompletado ? 'default' : 'secondary'}
                              >
                                {pago.estado === 'COMPLETADO' ? 'Confirmado' :
                                  pago.estado === 'PENDIENTE' ? 'Pendiente' :
                                    pago.estado}
                              </Badge>
                            </td>
                            <td className="p-3">
                              {pago.notas ? (
                                <span className="text-xs text-muted-foreground">{pago.notas}</span>
                              ) : (
                                <span className="text-xs text-muted-foreground">Sin notas</span>
                              )}
                            </td>
                            <td className="p-3">
                              {estadoEsPendiente && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      onClick={() => confirmarPago(pago.id)}
                                      disabled={updatePagoMutation.isPending}
                                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
                                    >
                                      <CheckCircle className="size-4 mr-1" />
                                      Validar
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Confirmar y validar este pago</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </TooltipProvider>
  )
}
