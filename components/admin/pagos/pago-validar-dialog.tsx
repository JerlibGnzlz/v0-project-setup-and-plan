'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { CheckCircle } from 'lucide-react'

interface PagoValidarDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pago: any
  onConfirm: () => void
  isValidando: boolean
}

export function PagoValidarDialog({
  open,
  onOpenChange,
  pago,
  onConfirm,
  isValidando,
}: PagoValidarDialogProps) {
  if (!pago) return null

  const monto = typeof pago.monto === 'number' ? pago.monto : parseFloat(pago.monto || 0)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <CheckCircle className="size-5 text-emerald-500" />
            Confirmar Validación de Pago
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>¿Estás seguro de que deseas validar este pago?</p>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Inscrito:</span>
                  <span className="font-medium text-foreground">
                    {pago.inscripcion?.nombre} {pago.inscripcion?.apellido}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pago:</span>
                  <span className="font-medium text-foreground">
                    {pago.numeroCuota || 1} / {pago.inscripcion?.numeroCuotas || 3}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monto:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    ${monto.toLocaleString('es-AR')} <span className="text-xs text-muted-foreground font-normal">(pesos argentinos)</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Método:</span>
                  <span className="font-medium text-foreground capitalize">
                    {pago.metodoPago}
                  </span>
                </div>
                {pago.inscripcion?.codigoReferencia && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Código:</span>
                    <span className="font-mono font-medium text-amber-600 dark:text-amber-400">
                      {pago.inscripcion.codigoReferencia}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                Al validar este pago, se enviará una notificación al usuario. Si es la última
                cuota, la inscripción será confirmada automáticamente.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isValidando}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          >
            {isValidando ? 'Validando...' : 'Confirmar Validación'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}





