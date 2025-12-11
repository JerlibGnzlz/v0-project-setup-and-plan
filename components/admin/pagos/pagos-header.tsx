'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, XCircle } from 'lucide-react'

interface PagosHeaderProps {
  inscripcionFiltrada?: {
    nombre: string
    apellido: string
    codigoReferencia?: string
  } | null
}

export function PagosHeader({ inscripcionFiltrada }: PagosHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Link href="/admin">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
        >
          <ChevronLeft className="size-5 text-emerald-600 dark:text-emerald-400" />
        </Button>
      </Link>
      <div className="relative flex-1">
        <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 rounded-xl blur-xl dark:from-emerald-500/5 dark:via-teal-500/5 dark:to-sky-500/5" />
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 dark:from-emerald-400 dark:via-teal-400 dark:to-sky-400 bg-clip-text text-transparent">
            Gestión de Pagos
          </h1>
          <p className="text-muted-foreground mt-1">
            Ver y gestionar todos los pagos de inscripciones
          </p>
        </div>
      </div>
      {inscripcionFiltrada && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
          <span className="text-sm text-emerald-700 dark:text-emerald-300">
            Filtrado por:{' '}
            <strong>
              {inscripcionFiltrada.nombre} {inscripcionFiltrada.apellido}
            </strong>
            {inscripcionFiltrada.codigoReferencia && (
              <span className="text-xs ml-2">({inscripcionFiltrada.codigoReferencia})</span>
            )}
          </span>
          <Link href="/admin/pagos">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50"
            >
              <XCircle className="size-3 mr-1" />
              Limpiar filtro
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}





