'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export function InscripcionesHeader() {
  return (
    <div className="flex items-center gap-4">
      <Link href="/admin">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-amber-50 dark:hover:bg-amber-500/10"
        >
          <ChevronLeft className="size-5 text-amber-600 dark:text-amber-400" />
        </Button>
      </Link>
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 rounded-xl blur-xl dark:from-amber-500/5 dark:via-yellow-500/5 dark:to-orange-500/5" />
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 dark:from-amber-400 dark:via-yellow-400 dark:to-orange-400 bg-clip-text text-transparent">
            Gestión de Inscripciones
          </h1>
          <p className="text-muted-foreground mt-1">
            Ver y gestionar todas las inscripciones a convenciones
          </p>
        </div>
      </div>
    </div>
  )
}













