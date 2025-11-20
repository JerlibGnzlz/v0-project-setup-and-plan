'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
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

const pagos = [
  {
    id: 1,
    pastorId: 1,
    pastor: 'Rev. Juan Pérez',
    fecha: '2025-01-15',
    monto: 5000,
    cuota: 1,
    metodoPago: 'MercadoPago',
    estado: 'confirmado',
    comprobante: 'MP-2025-001',
    voucher: '/mercadopago-payment-receipt.jpg'
  },
  {
    id: 2,
    pastorId: 1,
    pastor: 'Rev. Juan Pérez',
    fecha: '2025-02-01',
    monto: 5000,
    cuota: 2,
    metodoPago: 'MercadoPago',
    estado: 'confirmado',
    comprobante: 'MP-2025-002',
    voucher: '/mercadopago-payment-receipt.jpg'
  },
  {
    id: 3,
    pastorId: 1,
    pastor: 'Rev. Juan Pérez',
    fecha: '2025-02-15',
    monto: 5000,
    cuota: 3,
    metodoPago: 'MercadoPago',
    estado: 'confirmado',
    comprobante: 'MP-2025-003',
    voucher: '/mercadopago-payment-receipt.jpg'
  },
  {
    id: 4,
    pastorId: 2,
    pastor: 'Ptra. María González',
    fecha: '2025-01-16',
    monto: 5000,
    cuota: 1,
    metodoPago: 'MercadoPago',
    estado: 'confirmado',
    comprobante: 'MP-2025-004',
    voucher: '/mercadopago-payment-receipt.jpg'
  },
  {
    id: 5,
    pastorId: 2,
    pastor: 'Ptra. María González',
    fecha: '2025-02-02',
    monto: 5000,
    cuota: 2,
    metodoPago: 'MercadoPago',
    estado: 'confirmado',
    comprobante: 'MP-2025-005',
    voucher: '/mercadopago-payment-receipt.jpg'
  },
  {
    id: 6,
    pastorId: 5,
    pastor: 'Rev. Luis Fernández',
    fecha: '2025-01-19',
    monto: 5000,
    cuota: 1,
    metodoPago: 'Transferencia Bancaria',
    estado: 'confirmado',
    comprobante: 'TRANS-2025-001',
    voucher: '/bank-transfer-receipt-voucher.jpg'
  },
]

export default function PagosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('todos')

  const filteredPagos = pagos.filter((pago) => {
    const matchSearch = pago.pastor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchEstado = estadoFilter === 'todos' || pago.estado === estadoFilter
    return matchSearch && matchEstado
  })

  const confirmarPago = (pagoId: number) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Validando pago...',
        success: 'Pago confirmado exitosamente',
        error: 'Error al validar el pago',
      }
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
                    placeholder="Buscar por pastor..."
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
                      <th className="p-3 text-sm font-medium">Pastor</th>
                      <th className="p-3 text-sm font-medium">Cuota</th>
                      <th className="p-3 text-sm font-medium">Fecha</th>
                      <th className="p-3 text-sm font-medium">Monto</th>
                      <th className="p-3 text-sm font-medium">Método</th>
                      <th className="p-3 text-sm font-medium">Estado</th>
                      <th className="p-3 text-sm font-medium">Voucher</th>
                      <th className="p-3 text-sm font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPagos.map((pago) => (
                      <tr key={pago.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-3">
                          <p className="font-medium text-sm">{pago.pastor}</p>
                          <p className="text-xs text-muted-foreground">{pago.comprobante}</p>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">
                            Cuota {pago.cuota}/3
                          </Badge>
                        </td>
                        <td className="p-3 text-sm">
                          {new Date(pago.fecha).toLocaleDateString('es-ES')}
                        </td>
                        <td className="p-3 text-sm font-semibold">
                          ${pago.monto.toLocaleString('es-AR')}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <CreditCard className="size-4 text-muted-foreground" />
                            <span className="text-sm">{pago.metodoPago}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={pago.estado === 'confirmado' ? 'default' : 'secondary'}
                          >
                            {pago.estado === 'confirmado' ? 'Confirmado' : 'Pendiente'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          {pago.voucher ? (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <FileText className="size-4 mr-1" />
                                      Ver
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Ver comprobante de pago</p>
                                  </TooltipContent>
                                </Tooltip>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>Comprobante de Pago</DialogTitle>
                                  <DialogDescription>
                                    {pago.comprobante} - {pago.pastor} - Cuota {pago.cuota}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="border rounded-lg p-4 bg-muted/20">
                                  <div className="aspect-[4/3] bg-muted rounded flex items-center justify-center">
                                    <img src={pago.voucher || "/placeholder.svg"} alt="Voucher" className="max-w-full max-h-full object-contain rounded"/>
                                  </div>
                                  <div className="mt-4 space-y-2">
                                    <p className="text-sm"><strong>Pastor:</strong> {pago.pastor}</p>
                                    <p className="text-sm"><strong>Cuota:</strong> {pago.cuota} de 3</p>
                                    <p className="text-sm"><strong>Monto:</strong> ${pago.monto.toLocaleString('es-AR')}</p>
                                    <p className="text-sm"><strong>Método:</strong> {pago.metodoPago}</p>
                                    <p className="text-sm"><strong>Fecha:</strong> {new Date(pago.fecha).toLocaleDateString('es-ES')}</p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <span className="text-xs text-muted-foreground">Sin voucher</span>
                          )}
                        </td>
                        <td className="p-3">
                          {pago.estado === 'pendiente' && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  onClick={() => confirmarPago(pago.id)}
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
                    ))}
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
