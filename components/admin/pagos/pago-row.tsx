'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  CheckSquare,
  Square,
  ImageIcon,
  CheckCircle,
  XCircle,
  RefreshCw,
  CreditCard,
  Smartphone,
  Globe,
  User,
} from 'lucide-react'

interface PagoRowProps {
  pago: any
  estaSeleccionado: boolean
  onToggleSeleccion: (pagoId: string, pago: any) => void
  onValidar: (pago: any) => void
  onRechazar: (pago: any) => void
  onRehabilitar: (pago: any) => void
  isValidando: boolean
  isRechazando: boolean
  isRehabilitando: boolean
  getOrigenIcon: (origen: string) => JSX.Element
  getOrigenLabel: (origen: string) => string
}

export function PagoRow({
  pago,
  estaSeleccionado,
  onToggleSeleccion,
  onValidar,
  onRechazar,
  onRehabilitar,
  isValidando,
  isRechazando,
  isRehabilitando,
  getOrigenIcon,
  getOrigenLabel,
}: PagoRowProps) {
  const inscripcion = pago.inscripcion
  const nombreCompleto = inscripcion
    ? `${inscripcion.nombre} ${inscripcion.apellido}`
    : 'N/A'
  const monto = typeof pago.monto === 'number' ? pago.monto : parseFloat(pago.monto || 0)
  const estadoEsCompletado = pago.estado === 'COMPLETADO'
  const estadoEsPendiente = pago.estado === 'PENDIENTE'
  const estadoEsCancelado = pago.estado === 'CANCELADO'
  const origenInscripcion = inscripcion?.origenRegistro || 'web'

  return (
    <tr
      className={`border-b last:border-0 hover:bg-muted/50 ${estaSeleccionado ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''}`}
    >
      <td className="p-3">
        <button
          onClick={() => onToggleSeleccion(pago.id, pago)}
          disabled={pago.estado !== 'PENDIENTE'}
          className={`flex items-center justify-center transition-opacity ${
            pago.estado !== 'PENDIENTE'
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:opacity-70 cursor-pointer'
          }`}
          title={
            pago.estado !== 'PENDIENTE'
              ? pago.estado === 'CANCELADO'
                ? 'Pago rechazado - Debes rehabilitarlo primero'
                : pago.estado === 'COMPLETADO'
                  ? 'Pago completado - No se puede seleccionar'
                  : `Pago ${pago.estado.toLowerCase()} - Solo se pueden validar pagos pendientes`
              : estaSeleccionado
                ? 'Deseleccionar'
                : 'Seleccionar para validar'
          }
        >
          {estaSeleccionado ? (
            <CheckSquare className="size-5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Square
              className={`size-5 ${pago.estado !== 'PENDIENTE' ? 'text-muted-foreground/40' : 'text-muted-foreground'}`}
            />
          )}
        </button>
      </td>
      <td className="p-3">
        <p className="font-medium text-sm">{nombreCompleto}</p>
        {inscripcion?.codigoReferencia && (
          <p className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
            🔖 {inscripcion.codigoReferencia}
          </p>
        )}
        {pago.referencia && pago.referencia !== inscripcion?.codigoReferencia && (
          <p className="text-xs text-muted-foreground mt-1">{pago.referencia}</p>
        )}
      </td>
      <td className="p-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={`text-xs cursor-help ${
                origenInscripcion === 'mobile'
                  ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                  : origenInscripcion === 'dashboard'
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                    : 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
              }`}
            >
              {getOrigenIcon(origenInscripcion)}
              <span className="ml-1">{getOrigenLabel(origenInscripcion)}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Inscrito desde:{' '}
              {origenInscripcion === 'mobile'
                ? 'Aplicación móvil'
                : origenInscripcion === 'dashboard'
                  ? 'Dashboard admin'
                  : 'Sitio web'}
            </p>
          </TooltipContent>
        </Tooltip>
      </td>
      <td className="p-3">
        {pago.numeroCuota ? (
          <Badge
            variant="outline"
            className="bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700"
          >
            Cuota {pago.numeroCuota}
            {pago.inscripcion?.numeroCuotas && `/${pago.inscripcion.numeroCuotas}`}
          </Badge>
        ) : (
          <Badge variant="outline">Pago único</Badge>
        )}
      </td>
      <td className="p-3 text-sm">
        {pago.fechaPago
          ? new Date(pago.fechaPago).toLocaleDateString('es-ES')
          : new Date(pago.createdAt).toLocaleDateString('es-ES')}
      </td>
      <td className="p-3 text-sm font-semibold">${monto.toLocaleString('es-AR')}</td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <CreditCard className="size-4 text-muted-foreground" />
          <span className="text-sm capitalize">{pago.metodoPago}</span>
        </div>
      </td>
      <td className="p-3">
        <Badge
          variant={estadoEsCompletado ? 'default' : estadoEsCancelado ? 'destructive' : 'secondary'}
          className={estadoEsCompletado ? 'bg-emerald-500' : ''}
        >
          {pago.estado === 'COMPLETADO'
            ? 'Confirmado'
            : pago.estado === 'PENDIENTE'
              ? 'Pendiente'
              : pago.estado === 'CANCELADO'
                ? 'Rechazado'
                : pago.estado}
        </Badge>
      </td>
      <td className="p-3">
        {pago.comprobanteUrl ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs hover:bg-amber-50 dark:hover:bg-amber-950/30"
              >
                <ImageIcon className="size-3 mr-1" />
                Ver
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Comprobante de Pago</DialogTitle>
                <DialogDescription>
                  {nombreCompleto} - {pago.referencia || 'Sin referencia'}
                </DialogDescription>
              </DialogHeader>
              <div className="relative w-full h-[500px] rounded-lg overflow-hidden border">
                <Image
                  src={pago.comprobanteUrl}
                  alt="Comprobante de pago"
                  fill
                  className="object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <span className="text-xs text-muted-foreground">Sin comprobante</span>
        )}
      </td>
      <td className="p-3">
        {pago.notas ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-muted-foreground cursor-help truncate max-w-[100px] block">
                {pago.notas.substring(0, 30)}...
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{pago.notas}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </td>
      <td className="p-3">
        {estadoEsPendiente && !estadoEsCompletado && (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={() => onValidar(pago)}
                  disabled={isValidando}
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRechazar(pago)}
                  disabled={isValidando || isRechazando}
                  className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <XCircle className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Rechazar pago</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
        {estadoEsCancelado && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRehabilitar(pago)}
                disabled={isRehabilitando}
                className="border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
              >
                <RefreshCw className="size-4 mr-1" />
                Rehabilitar
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Permitir que el usuario vuelva a enviar su pago</p>
            </TooltipContent>
          </Tooltip>
        )}
      </td>
    </tr>
  )
}



