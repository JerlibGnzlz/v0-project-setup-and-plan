'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DollarSign, CheckCircle2, CreditCard, ImageIcon, Plus } from 'lucide-react'
import { type Inscripcion } from '@/lib/api/inscripciones'
import { type PagosInfo } from '@/lib/hooks/use-inscripcion-utils'

interface InscripcionPagosSectionProps {
  inscripcion: Inscripcion
  pagosInfo: PagosInfo
  onCrearPago: (inscripcion: Inscripcion & { numeroCuota: number }, pago?: any) => void
}

export function InscripcionPagosSection({
  inscripcion,
  pagosInfo,
  onCrearPago,
}: InscripcionPagosSectionProps) {
  return (
    <div className="lg:col-span-7">
      <div className="space-y-4">
        {/* Resumen de pagos */}
        <div
          className={`p-4 rounded-lg border ${
            pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas
              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/50'
              : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DollarSign
                className={`size-4 ${
                  pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              />
              <span className="font-semibold text-sm">Estado de Pagos</span>
            </div>
            <Badge
              variant={pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas ? 'default' : 'outline'}
              className={
                pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-white dark:bg-background'
              }
            >
              {pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas ? (
                <>
                  <CheckCircle2 className="size-3 mr-1" />
                  {pagosInfo.cuotasPagadas}/{pagosInfo.numeroCuotas} cuotas
                </>
              ) : (
                `${pagosInfo.cuotasPagadas}/${pagosInfo.numeroCuotas} cuotas`
              )}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold">
                ${pagosInfo.costoTotal.toLocaleString('es-AR')}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pagado:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                ${pagosInfo.totalPagado.toLocaleString('es-AR')}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pendiente:</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                ${(pagosInfo.costoTotal - pagosInfo.totalPagado).toLocaleString('es-AR')}
              </span>
            </div>
            <div className="mt-2 h-2 bg-amber-200/50 dark:bg-amber-900/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                style={{ width: `${pagosInfo.porcentajePagado}%` }}
              />
            </div>
          </div>
        </div>

        {/* Lista de cuotas */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">
            Cuotas ({pagosInfo.numeroCuotas} {pagosInfo.numeroCuotas === 1 ? 'pago' : 'pagos'})
          </h4>
          {pagosInfo.cuotas.map(cuota => (
            <div
              key={cuota.numero}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    cuota.estado === 'COMPLETADO'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {cuota.numero}
                </div>
                <div>
                  <div className="text-sm font-medium">Cuota {cuota.numero}</div>
                  <div className="text-xs text-muted-foreground">
                    ${cuota.monto.toLocaleString('es-AR')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {cuota.pago ? (
                  <>
                    {/* Badge de estado */}
                    <Badge
                      variant={cuota.estado === 'COMPLETADO' ? 'default' : 'secondary'}
                      className={
                        cuota.estado === 'COMPLETADO'
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                      }
                    >
                      {cuota.estado === 'COMPLETADO' ? 'Pagado' : 'Pendiente'}
                    </Badge>

                    {/* Referencia si existe */}
                    {cuota.pago.referencia && (
                      <span className="text-xs text-muted-foreground">
                        {cuota.pago.referencia}
                      </span>
                    )}

                    {/* Ver comprobante si existe */}
                    {cuota.pago.comprobanteUrl && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs hover:bg-amber-50 dark:hover:bg-amber-950/30"
                          >
                            <ImageIcon className="size-3 mr-1" />
                            Ver
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Comprobante de Pago</DialogTitle>
                            <DialogDescription>
                              Cuota {cuota.numero} - {inscripcion.nombre} {inscripcion.apellido}
                              {cuota.pago.referencia && ` - ${cuota.pago.referencia}`}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="relative w-full h-[500px] rounded-lg overflow-hidden border bg-muted/30">
                            <Image
                              src={cuota.pago.comprobanteUrl}
                              alt="Comprobante de pago"
                              fill
                              className="object-contain"
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {/* Si está PENDIENTE, mostrar mensaje informativo */}
                    {cuota.estado === 'PENDIENTE' && (
                      <span className="text-xs text-muted-foreground italic">
                        En proceso de confirmación
                      </span>
                    )}

                    {/* Si está COMPLETADO, no permitir editar (pago ya confirmado) */}
                    {cuota.estado === 'COMPLETADO' && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ Confirmado
                      </span>
                    )}
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCrearPago({ ...inscripcion, numeroCuota: cuota.numero }, cuota.pago)}
                    className="text-xs"
                  >
                    <Plus className="size-3 mr-1" />
                    Crear
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Botón para ver en pagos */}
        <Link href={`/admin/pagos?inscripcionId=${inscripcion.id}`}>
          <Button variant="outline" size="sm" className="w-full">
            <CreditCard className="size-4 mr-2" />
            Ver todos los pagos
          </Button>
        </Link>
      </div>
    </div>
  )
}


