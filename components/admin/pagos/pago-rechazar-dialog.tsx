'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle } from 'lucide-react'

interface PagoRechazarDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pago: any
  motivoRechazo: string
  onMotivoChange: (motivo: string) => void
  onConfirm: () => void
  isRechazando: boolean
}

export function PagoRechazarDialog({
  open,
  onOpenChange,
  pago,
  motivoRechazo,
  onMotivoChange,
  onConfirm,
  isRechazando,
}: PagoRechazarDialogProps) {
  if (!pago) return null

  const monto = typeof pago.monto === 'number' ? pago.monto : parseFloat(pago.monto || 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="size-5" />
            Rechazar Pago
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas rechazar este pago? Se notificará al usuario.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4 space-y-2 text-sm border border-red-200 dark:border-red-800">
            <div className="flex justify-between">
              <span className="text-red-700 dark:text-red-300">Inscrito:</span>
              <span className="font-medium text-red-900 dark:text-red-100">
                {pago.inscripcion?.nombre} {pago.inscripcion?.apellido}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-700 dark:text-red-300">Cuota:</span>
              <span className="font-medium text-red-900 dark:text-red-100">
                {pago.numeroCuota || 1} / {pago.inscripcion?.numeroCuotas || 3}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-700 dark:text-red-300">Monto:</span>
              <span className="font-bold text-red-900 dark:text-red-100">
                ${monto.toLocaleString('es-AR')}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo" className="text-sm font-medium">
              Motivo del rechazo
            </Label>
            <Select value={motivoRechazo} onValueChange={onMotivoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un motivo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Comprobante ilegible o no válido">
                  Comprobante ilegible o no válido
                </SelectItem>
                <SelectItem value="Monto incorrecto">Monto incorrecto</SelectItem>
                <SelectItem value="Código de referencia no coincide">
                  Código de referencia no coincide
                </SelectItem>
                <SelectItem value="Pago duplicado">Pago duplicado</SelectItem>
                <SelectItem value="Datos bancarios incorrectos">
                  Datos bancarios incorrectos
                </SelectItem>
                <SelectItem value="otro">Otro motivo...</SelectItem>
              </SelectContent>
            </Select>

            {motivoRechazo === 'otro' && (
              <Textarea
                placeholder="Describe el motivo del rechazo..."
                value={motivoRechazo === 'otro' ? '' : motivoRechazo}
                onChange={e => onMotivoChange(e.target.value)}
                className="mt-2"
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isRechazando || !motivoRechazo || motivoRechazo === 'otro'}
          >
            {isRechazando ? 'Rechazando...' : 'Confirmar Rechazo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}



