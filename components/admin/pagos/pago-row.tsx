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
} from 'lucide-react'

interface InscripcionRow {
  nombre: string
  apellido?: string | null
  codigoReferencia?: string | null
  origenRegistro?: string | null
  numeroCuotas?: number | null
}

interface PagoWithInscripcion {
  id: string
  inscripcionId: string
  monto: number | string
  metodoPago: string
  numeroCuota?: number
  estado: 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO' | 'REEMBOLSADO'
  referencia?: string | null
  comprobanteUrl?: string
  fechaPago?: string | null
  notas?: string
  inscripcion?: InscripcionRow | null
  createdAt: string
  updatedAt: string
  advertenciaMonto?: string
}

interface PagoRowProps {
  pago: PagoWithInscripcion
  estaSeleccionado: boolean
  onToggleSeleccion: (pagoId: string, pago: PagoWithInscripcion) => void
  onValidar: (pago: PagoWithInscripcion) => void
  onRechazar: (pago: PagoWithInscripcion) => void
  onRehabilitar: (pago: PagoWithInscripcion) => void
  isValidando: boolean
  isRechazando: boolean
  isRehabilitando: boolean
  getOrigenIcon: (origen: string) => React.ReactElement
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
  const monto =
    typeof pago.monto === 'number'
      ? pago.monto
      : typeof pago.monto === 'string'
        ? parseFloat(pago.monto) || 0
        : 0
  const estadoEsCompletado = pago.estado === 'COMPLETADO'
  const estadoEsPendiente = pago.estado === 'PENDIENTE'
  const estadoEsCancelado = pago.estado === 'CANCELADO'
  const origenInscripcion = inscripcion?.origenRegistro || 'web'

  return (
    <tr
      className={`border-b last:border-0 hover:bg-muted/50 ${estaSeleccionado ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''}`}
    >
      <td className="p-2">
        <button
          onClick={() => {
            const pagoId = typeof pago.id === 'string' ? pago.id : String(pago.id)
            onToggleSeleccion(pagoId, pago)
          }}
          disabled={pago.estado !== 'PENDIENTE'}
          className={`flex items-center justify-center transition-opacity ${pago.estado !== 'PENDIENTE'
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
            <CheckSquare className="size-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Square
              className={`size-4 ${pago.estado !== 'PENDIENTE' ? 'text-muted-foreground/40' : 'text-muted-foreground'}`}
            />
          )}
        </button>
      </td>
      <td className="p-2">
        <p className="font-medium text-xs truncate">{nombreCompleto}</p>
        {inscripcion?.codigoReferencia && (
          <p className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
            🔖 {inscripcion.codigoReferencia}
          </p>
        )}
        {pago.referencia && pago.referencia !== inscripcion?.codigoReferencia && (
          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{pago.referencia}</p>
        )}
      </td>
      <td className="p-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0.5 cursor-help ${origenInscripcion === 'mobile'
                  ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                  : origenInscripcion === 'dashboard'
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                    : 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                }`}
            >
              {getOrigenIcon(origenInscripcion)}
              <span className="ml-0.5">{getOrigenLabel(origenInscripcion)}</span>
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
      <td className="p-2">
        {pago.numeroCuota ? (
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700"
          >
            Cuota {pago.numeroCuota}
            {pago.inscripcion?.numeroCuotas && `/${pago.inscripcion.numeroCuotas}`}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">Pago único</Badge>
        )}
      </td>
      <td className="p-2 text-xs">
        {pago.fechaPago
          ? new Date(pago.fechaPago).toLocaleDateString('es-ES')
          : new Date(pago.createdAt).toLocaleDateString('es-ES')}
      </td>
      <td className="p-2 text-xs font-semibold">${monto.toLocaleString('es-AR')}</td>
      <td className="p-2">
        <div className="flex items-center gap-1">
          <CreditCard className="size-3 text-muted-foreground" />
          <span className="text-xs capitalize truncate">{pago.metodoPago}</span>
          {pago.metodoPago === 'Mercado Pago' && estadoEsPendiente && (
            <Badge variant="outline" className="text-[9px] px-1 py-0 ml-1 border-blue-500/50 text-blue-400">
              En proceso
            </Badge>
          )}
        </div>
      </td>
      <td className="p-2">
        <Badge
          variant={estadoEsCompletado ? 'default' : estadoEsCancelado ? 'destructive' : 'secondary'}
          className={`text-[10px] px-1.5 py-0.5 ${estadoEsCompletado ? 'bg-emerald-500' : ''}`}
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
      <td className="p-2">
        {pago.comprobanteUrl ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] px-2 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              >
                <ImageIcon className="size-3 mr-0.5" />
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
          <span className="text-[10px] text-muted-foreground">Sin comprobante</span>
        )}
      </td>
      <td className="p-2">
        {pago.notas ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-[10px] text-muted-foreground cursor-help truncate max-w-[120px] block">
                {pago.notas.substring(0, 25)}...
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{pago.notas}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-[10px] text-muted-foreground">-</span>
        )}
      </td>
      <td className="p-2">
        {estadoEsPendiente && !estadoEsCompletado && (
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={() => onValidar(pago)}
                  disabled={isValidando}
                  className="h-7 text-[10px] px-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
                >
                  <CheckCircle className="size-3 mr-0.5" />
                  Valida
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
                  className="h-7 w-7 p-0 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <XCircle className="size-3" />
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
                className="h-7 text-[10px] px-2 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-medium"
              >
                <RefreshCw className="size-3 mr-1" />
                Rehabilitar
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Rehabilitar pago: cambiará a estado PENDIENTE</p>
            </TooltipContent>
          </Tooltip>
        )}
      </td>
    </tr>
  )
}



