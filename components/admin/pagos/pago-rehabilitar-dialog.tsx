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
import { RefreshCw } from 'lucide-react'

interface PagoRehabilitarDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pago: any
  onConfirm: () => void
  isRehabilitando: boolean
}

export function PagoRehabilitarDialog({
  open,
  onOpenChange,
  pago,
  onConfirm,
  isRehabilitando,
}: PagoRehabilitarDialogProps) {
  if (!pago) return null

  const monto = typeof pago.monto === 'number' ? pago.monto : parseFloat(pago.monto || 0)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <RefreshCw className="size-5 text-blue-500" />
            Rehabilitar Pago
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                ¿Estás seguro de que deseas rehabilitar este pago? El estado cambiará de <strong>CANCELADO</strong> a <strong>PENDIENTE</strong>, 
                permitiendo que el usuario vuelva a enviar su comprobante de pago.
              </p>

              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 space-y-2 text-sm border border-blue-200 dark:border-blue-800">
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Inscrito:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    {pago.inscripcion?.nombre} {pago.inscripcion?.apellido}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Pago:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    {pago.numeroCuota || 1} / {pago.inscripcion?.numeroCuotas || 3}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Monto:</span>
                  <span className="font-bold text-blue-900 dark:text-blue-100">
                    ${monto.toLocaleString('es-AR')} <span className="text-xs text-muted-foreground font-normal">(pesos argentinos)</span>
                  </span>
                </div>
                {pago.notas && (
                  <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                    <span className="text-blue-700 dark:text-blue-300 text-xs">
                      Motivo del rechazo anterior:
                    </span>
                    <p className="font-medium text-blue-900 dark:text-blue-100 text-xs mt-1">
                      {pago.notas}
                    </p>
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                Se enviará un email al usuario notificándole que puede volver a enviar su
                comprobante de pago.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isRehabilitando}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          >
            {isRehabilitando ? 'Rehabilitando...' : 'Confirmar Rehabilitación'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}





