'use client'

import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { CheckSquare, Square, ChevronLeft, ChevronRight, AlertTriangle, XCircle } from 'lucide-react'
import { PagoRow } from './pago-row'
import type { Pago, PaginatedResponse } from '@/lib/api/pagos'

interface PaginationMeta {
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface PagosTableProps {
  pagos: Pago[]
  pagosSeleccionados: Set<string>
  onToggleSeleccion: (pagoId: string, pago: Pago) => void
  onToggleSeleccionarTodos: () => void
  onValidar: (pago: Pago) => void
  onRechazar: (pago: Pago) => void
  onRehabilitar: (pago: Pago) => void
  isValidando: boolean
  isRechazando: boolean
  isRehabilitando: boolean
  mostrarAdvertenciaMonto: string | null
  onCerrarAdvertencia: () => void
  getOrigenIcon: (origen: string) => JSX.Element
  getOrigenLabel: (origen: string) => string
  paginationMeta: PaginationMeta | null
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  isLoading: boolean
}

export function PagosTable({
  pagos,
  pagosSeleccionados,
  onToggleSeleccion,
  onToggleSeleccionarTodos,
  onValidar,
  onRechazar,
  onRehabilitar,
  isValidando,
  isRechazando,
  isRehabilitando,
  mostrarAdvertenciaMonto,
  onCerrarAdvertencia,
  getOrigenIcon,
  getOrigenLabel,
  paginationMeta,
  currentPage,
  pageSize,
  onPageChange,
  isLoading,
}: PagosTableProps) {
  const pagosPendientes = pagos.filter((p: Pago) => p.estado === 'PENDIENTE')
  const todosSeleccionados =
    pagosPendientes.length > 0 &&
    pagosPendientes.every((p: Pago) => pagosSeleccionados.has(p.id))

  return (
    <CardContent>
      {mostrarAdvertenciaMonto && (
        <div className="px-6 pb-4">
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Advertencia de Monto
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  {mostrarAdvertenciaMonto}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCerrarAdvertencia}
                className="ml-auto"
              >
                <XCircle className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full table-auto">
          <colgroup>
            <col className="w-[40px]" />
            <col className="w-[160px]" />
            <col className="w-[70px]" />
            <col className="w-[80px]" />
            <col className="w-[90px]" />
            <col className="w-[100px]" />
            <col className="w-[90px]" />
            <col className="w-[100px]" />
            <col className="w-[100px]" />
            <col className="w-[130px]" />
            <col className="w-[90px]" />
          </colgroup>
          <thead className="border-b bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/30">
            <tr className="text-left">
              <th className="p-2 text-xs font-medium">
                <button
                  onClick={onToggleSeleccionarTodos}
                  className="flex items-center justify-center hover:opacity-70 transition-opacity"
                  title="Seleccionar todos los pagos pendientes"
                  disabled={pagosPendientes.length === 0}
                >
                  {todosSeleccionados ? (
                    <CheckSquare className="size-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Square className="size-4 text-muted-foreground" />
                  )}
                </button>
              </th>
              <th className="p-2 text-xs font-medium">Inscrito</th>
              <th className="p-2 text-xs font-medium">Origen</th>
              <th className="p-2 text-xs font-medium">Tipo</th>
              <th className="p-2 text-xs font-medium">Fecha</th>
              <th className="p-2 text-xs font-medium">Monto</th>
              <th className="p-2 text-xs font-medium">Método</th>
              <th className="p-2 text-xs font-medium">Estado</th>
              <th className="p-2 text-xs font-medium">Comprobante</th>
              <th className="p-2 text-xs font-medium">Notas</th>
              <th className="p-2 text-xs font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagos.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-8 text-center text-muted-foreground">
                  No se encontraron pagos
                </td>
              </tr>
            ) : (
              pagos.map((pago: Pago) => (
                <PagoRow
                  key={pago.id}
                  pago={pago}
                  estaSeleccionado={pagosSeleccionados.has(pago.id)}
                  onToggleSeleccion={onToggleSeleccion}
                  onValidar={onValidar}
                  onRechazar={onRechazar}
                  onRehabilitar={onRehabilitar}
                  isValidando={isValidando}
                  isRechazando={isRechazando}
                  isRehabilitando={isRehabilitando}
                  getOrigenIcon={getOrigenIcon}
                  getOrigenLabel={getOrigenLabel}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Controles de paginación */}
      {paginationMeta && paginationMeta.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * pageSize + 1} -{' '}
            {Math.min(currentPage * pageSize, paginationMeta.total)} de {paginationMeta.total}{' '}
            pagos
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={!paginationMeta.hasPreviousPage || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <div className="text-sm text-muted-foreground">
              Página {currentPage} de {paginationMeta.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!paginationMeta.hasNextPage || isLoading}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </CardContent>
  )
}



