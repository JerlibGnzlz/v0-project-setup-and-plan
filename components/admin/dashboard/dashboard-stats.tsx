import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollReveal } from '@/components/scroll-reveal'
import { User, Smartphone } from 'lucide-react'
import type { DashboardStats as DashboardStatsType } from '@/lib/hooks/use-dashboard-stats'

interface DashboardStatsProps {
  stats: DashboardStatsType
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-6">
      <ScrollReveal delay={0}>
        <Card className="border-sky-200/50 dark:border-sky-500/20 bg-gradient-to-br from-white to-sky-50/30 dark:from-background dark:to-sky-950/20 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-sky-600 dark:text-sky-400">
              Total Inscritos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">
              {stats.totalInscritos}
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      <ScrollReveal delay={50}>
        <Card className="border-emerald-200/50 dark:border-emerald-500/20 bg-gradient-to-br from-white to-emerald-50/30 dark:from-background dark:to-emerald-950/20 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Pagos Completos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              {stats.pagosConfirmados}
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <Card className="border-amber-200/50 dark:border-amber-500/20 bg-gradient-to-br from-white to-amber-50/30 dark:from-background dark:to-amber-950/20 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">
              Pagos Parciales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
              {stats.pagosParciales}
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      <ScrollReveal delay={150}>
        <Card className="border-rose-200/50 dark:border-rose-500/20 bg-gradient-to-br from-white to-rose-50/30 dark:from-background dark:to-rose-950/20 hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-rose-600 dark:text-rose-400">
              Pagos Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-red-600 dark:from-rose-400 dark:to-red-400 bg-clip-text text-transparent">
              {stats.pagosPendientes}
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <Card className="border-emerald-200/50 dark:border-emerald-500/20 bg-gradient-to-br from-white to-emerald-50/30 dark:from-background dark:to-emerald-950/20 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Recaudado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              ${stats.totalRecaudado.toLocaleString('es-AR')}
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      <ScrollReveal delay={250}>
        <Card className="border-sky-200/50 dark:border-sky-500/20 bg-gradient-to-br from-white to-sky-50/30 dark:from-background dark:to-sky-950/20 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-sky-600 dark:text-sky-400">
              Origen Registro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <User className="size-4 text-sky-500" />
                  <span className="font-semibold text-lg">{stats.registrosManual}</span>
                  <span className="text-xs text-muted-foreground ml-1">Web/Dashboard</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="size-4 text-emerald-500" />
                  <span className="font-semibold text-lg">{stats.registrosMobile}</span>
                  <span className="text-xs text-muted-foreground ml-1">App Móvil</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  )
}







