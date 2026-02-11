'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ScrollReveal } from '@/components/scroll-reveal'
import { Calendar, Clock, Edit } from 'lucide-react'
import { ConvencionEditDialog } from './convencion-edit-dialog'
import type { ConvencionFormData } from '@/lib/validations/convencion'
import { formatConvencionFechaDisplay } from '@/lib/utils/event-date'

interface DashboardConvencionControlProps {
  convencionActiva: {
    id: string
    titulo?: string
    fechaInicio?: string | Date
    fechaInicioDateOnly?: string
    ubicacion?: string
    costo?: number | string
    activa?: boolean
    invitadoNombre?: string
    invitadoFotoUrl?: string
  } | null
  convencionCuotas: number
  onUpdate: (data: ConvencionFormData) => Promise<void>
  onToggleVisibility: (checked: boolean) => Promise<void>
  onImageUpload: (file: File) => Promise<string>
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  isPending: boolean
}

export function DashboardConvencionControl({
  convencionActiva,
  convencionCuotas,
  onUpdate,
  onToggleVisibility,
  onImageUpload,
  dialogOpen,
  setDialogOpen,
  isPending,
}: DashboardConvencionControlProps) {
  return (
    <ScrollReveal>
      <Card className="border-2 border-sky-200/50 dark:border-sky-500/20 bg-gradient-to-br from-white to-sky-50/50 dark:from-background dark:to-sky-950/20 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500/10 to-emerald-500/10 dark:from-sky-500/20 dark:to-emerald-500/20">
                  <Calendar className="size-5 text-sky-600 dark:text-sky-400" />
                </div>
                <span className="bg-gradient-to-r from-sky-600 to-emerald-600 dark:from-sky-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  Control de Convención
                </span>
              </CardTitle>
              <CardDescription className="mt-2">
                Gestiona la visibilidad y activación de la convención en la landing page
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors"
              onClick={() => setDialogOpen(true)}
            >
              <Edit className="size-4 mr-2 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-700 dark:text-emerald-300">
                Editar Convención
              </span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info de la convención */}
          <div className="p-4 bg-gradient-to-br from-sky-50/50 to-emerald-50/50 dark:from-sky-950/30 dark:to-emerald-950/30 rounded-lg space-y-3 border border-sky-200/50 dark:border-sky-500/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-sky-700 dark:text-sky-300">Nombre:</span>
              <span className="text-sm font-semibold">{convencionActiva?.titulo || '-'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Fecha:
              </span>
              <span className="text-sm font-semibold">
                {formatConvencionFechaDisplay(
                  convencionActiva?.fechaInicio,
                  convencionActiva?.fechaInicioDateOnly
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                Lugar:
              </span>
              <span className="text-sm font-semibold">{convencionActiva?.ubicacion || '-'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-sky-700 dark:text-sky-300">Monto:</span>
              <span className="text-sm font-semibold">
                $
                {convencionActiva?.costo
                  ? Number(convencionActiva.costo).toLocaleString('es-AR')
                  : '0'}{' '}
                en {convencionCuotas} cuota{convencionCuotas > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Switch de visibilidad */}
          <div
            className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 ${convencionActiva?.activa
                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-emerald-200 dark:border-emerald-500/30'
                : 'bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/40 dark:to-gray-950/40 border-slate-200 dark:border-slate-500/30'
              }`}
          >
            <div className="space-y-1">
              <Label htmlFor="mostrar-landing" className="text-base font-semibold">
                Mostrar en Landing Page
              </Label>
              <p
                className={`text-sm ${convencionActiva?.activa ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}
              >
                {convencionActiva?.activa
                  ? '✓ La convención, cuenta regresiva e inscripciones son visibles en la página principal'
                  : '✗ La convención está oculta del público'}
              </p>
            </div>
            <Switch
              id="mostrar-landing"
              checked={convencionActiva?.activa || false}
              onCheckedChange={onToggleVisibility}
              disabled={isPending}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-teal-500"
            />
          </div>

          {/* Cuenta regresiva info */}
          <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-500/20 rounded-lg">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-500/20">
              <Clock className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-sm mb-1 text-amber-800 dark:text-amber-300">
                Cuenta Regresiva Activa
              </p>
              <p className="text-sm text-amber-700/80 dark:text-amber-400/80">
                La cuenta regresiva se mostrará automáticamente cuando la convención esté visible
                en la landing page. Fecha objetivo:{' '}
                <span className="font-semibold">
                  {formatConvencionFechaDisplay(
                    convencionActiva?.fechaInicio,
                    convencionActiva?.fechaInicioDateOnly
                  )}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConvencionEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        convencion={convencionActiva}
        onSubmit={onUpdate}
        onImageUpload={onImageUpload}
        isPending={isPending}
      />
    </ScrollReveal>
  )
}
















