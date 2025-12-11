'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import { ConvencionCreateDialog } from './convencion-create-dialog'
import type { ConvencionFormData } from '@/lib/validations/convencion'

interface DashboardEmptyStateProps {
  onCreateConvencion: (data: ConvencionFormData) => Promise<void>
  createDialogOpen: boolean
  setCreateDialogOpen: (open: boolean) => void
  isPending: boolean
}

export function DashboardEmptyState({
  onCreateConvencion,
  createDialogOpen,
  setCreateDialogOpen,
  isPending,
}: DashboardEmptyStateProps) {
  return (
    <div className="space-y-8">
      {/* Header con gradiente */}
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-sky-500/10 via-emerald-500/10 to-amber-500/10 rounded-xl blur-xl dark:from-sky-500/5 dark:via-emerald-500/5 dark:to-amber-500/5" />
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-sky-600 via-emerald-600 to-amber-600 dark:from-sky-400 dark:via-emerald-400 dark:to-amber-400 bg-clip-text text-transparent">
            Panel Administrativo
          </h1>
          <p className="text-muted-foreground mt-2">Bienvenido al panel de administración</p>
        </div>
      </div>

      <Card className="border-2 border-dashed border-sky-200 dark:border-sky-500/30 bg-gradient-to-br from-white to-sky-50/30 dark:from-background dark:to-sky-950/20">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="p-4 rounded-full bg-gradient-to-br from-sky-500/10 to-emerald-500/10 dark:from-sky-500/20 dark:to-emerald-500/20 mb-4">
            <Calendar className="h-12 w-12 text-sky-600 dark:text-sky-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-sky-600 to-emerald-600 dark:from-sky-400 dark:to-emerald-400 bg-clip-text text-transparent">
            No hay convención activa
          </h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Crea una nueva convención para comenzar a gestionar inscripciones, pastores y pagos.
          </p>
          <Button
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Crear Nueva Convención
          </Button>
        </CardContent>
      </Card>

      <ConvencionCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={onCreateConvencion}
        isPending={isPending}
      />
    </div>
  )
}





