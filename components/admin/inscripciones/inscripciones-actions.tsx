'use client'

import { Button } from '@/components/ui/button'
import { UserPlus, Bell, BarChart3, Printer } from 'lucide-react'

interface InscripcionesActionsProps {
  onNuevaInscripcion: () => void
  onRecordatorios: () => void
  onReporte: () => void
  onExport: () => void
}

export function InscripcionesActions({
  onNuevaInscripcion,
  onRecordatorios,
  onReporte,
  onExport,
}: InscripcionesActionsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        size="sm"
        onClick={onNuevaInscripcion}
        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md"
      >
        <UserPlus className="size-4 mr-2" />
        Agregar
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onRecordatorios}
        className="border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
      >
        <Bell className="size-4 mr-2" />
        Recordatorios
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onReporte}
        className="border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30"
      >
        <BarChart3 className="size-4 mr-2" />
        Reporte
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onExport}
        className="border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
      >
        <Printer className="size-4 mr-2" />
        Imprimir
      </Button>
    </div>
  )
}






























