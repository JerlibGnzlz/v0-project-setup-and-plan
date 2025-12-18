'use client'

import { CardDescription, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, CheckCircle, RefreshCw } from 'lucide-react'

interface PagosTableHeaderProps {
  totalPagos: number
  pagosSeleccionados: number
  onValidarSeleccionados: () => void
  isValidando: boolean
  mostrarBotonValidar: boolean
}

export function PagosTableHeader({
  totalPagos,
  pagosSeleccionados,
  onValidarSeleccionados,
  isValidando,
  mostrarBotonValidar,
}: PagosTableHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500/10 to-sky-500/10 dark:from-teal-500/20 dark:to-sky-500/20">
            <CreditCard className="size-4 text-teal-600 dark:text-teal-400" />
          </div>
          <span className="bg-gradient-to-r from-teal-600 to-sky-600 dark:from-teal-400 dark:to-sky-400 bg-clip-text text-transparent">
            Listado de Pagos
          </span>
        </CardTitle>
        <CardDescription>
          {totalPagos} pago(s) encontrado(s)
          {pagosSeleccionados > 0 && (
            <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-medium">
              • {pagosSeleccionados} seleccionado(s)
            </span>
          )}
        </CardDescription>
      </div>
      {mostrarBotonValidar && (
        <Button
          onClick={onValidarSeleccionados}
          disabled={isValidando}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
        >
          {isValidando ? (
            <>
              <RefreshCw className="size-4 mr-2 animate-spin" />
              Validando...
            </>
          ) : (
            <>
              <CheckCircle className="size-4 mr-2" />
              Validar {pagosSeleccionados} pago(s)
            </>
          )}
        </Button>
      )}
    </div>
  )
}














