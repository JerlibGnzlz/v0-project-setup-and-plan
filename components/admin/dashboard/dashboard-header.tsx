import { Calendar } from 'lucide-react'

interface DashboardHeaderProps {
  convencionActiva: {
    titulo?: string
    ubicacion?: string
    fechaInicio?: string | Date
  } | null
}

export function DashboardHeader({ convencionActiva }: DashboardHeaderProps) {
  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-gradient-to-r from-sky-500/10 via-emerald-500/10 to-amber-500/10 rounded-xl blur-xl dark:from-sky-500/5 dark:via-emerald-500/5 dark:to-amber-500/5" />
      <div className="relative bg-white/50 dark:bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-sky-200/50 dark:border-sky-500/20">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-sky-600 via-emerald-600 to-amber-600 dark:from-sky-400 dark:via-emerald-400 dark:to-amber-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-foreground/80 mt-2 font-medium text-lg">
              {convencionActiva?.titulo || 'Sin convención activa'}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse" />
              {convencionActiva?.ubicacion || ''} •{' '}
              {convencionActiva?.fechaInicio
                ? new Date(convencionActiva.fechaInicio).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : ''}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-sky-50 to-emerald-50 dark:from-sky-950/30 dark:to-emerald-950/30 border border-sky-200/50 dark:border-sky-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Sistema Activo
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}









