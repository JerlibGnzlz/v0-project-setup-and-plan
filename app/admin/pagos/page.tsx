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
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="size-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Pagos</h1>
            <p className="text-muted-foreground mt-1">
              Verificar pagos, cuotas de MercadoPago y vouchers
            </p>
          </div>
        </div>

        <ScrollReveal>
          <Card>
            <CardHeader>
              <CardTitle>Filtros y Búsqueda</CardTitle>
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
          <Card>
            <CardHeader>
              <CardTitle>Listado de Pagos</CardTitle>
              <CardDescription>
                {filteredPagos.length} pago(s) encontrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
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
