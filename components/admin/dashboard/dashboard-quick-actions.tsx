import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollReveal } from '@/components/scroll-reveal'
import {
  Users,
  CreditCard,
  ImageIcon,
  ArrowRight,
  Newspaper,
  UserCheck,
  Shield,
} from 'lucide-react'
import type { DashboardStats as DashboardStatsType } from '@/lib/hooks/use-dashboard-stats'

interface DashboardQuickActionsProps {
  stats: DashboardStatsType
  loadingPastores?: boolean
  loadingInscripciones?: boolean
}

export function DashboardQuickActions({
  stats,
  loadingPastores = false,
  loadingInscripciones = false,
}: DashboardQuickActionsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <ScrollReveal delay={300}>
        <Link href="/admin/pastores">
          <Card className="hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 cursor-pointer group border-sky-200/50 dark:border-sky-500/20 bg-gradient-to-br from-white to-sky-50/30 dark:from-background dark:to-sky-950/20 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-sky-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500/10 to-blue-500/10 dark:from-sky-500/20 dark:to-blue-500/20 group-hover:from-sky-500/20 group-hover:to-blue-500/20 transition-colors">
                  <Users className="size-6 text-sky-600 dark:text-sky-400" />
                </div>
                <ArrowRight className="size-5 text-sky-500/50 group-hover:text-sky-500 group-hover:translate-x-1 transition-all" />
              </div>
              <CardTitle className="mt-4 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                Estructura Organizacional
              </CardTitle>
              <CardDescription>
                Registrar, editar y ver listado completo de pastores inscritos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-sky-600/70 dark:text-sky-400/70">
                {loadingPastores ? '...' : stats.totalPastores} pastores registrados
                {stats.pastoresActivos > 0 && stats.pastoresActivos !== stats.totalPastores && (
                  <span className="text-xs ml-1">({stats.pastoresActivos} activos)</span>
                )}
              </p>
            </CardContent>
          </Card>
        </Link>
      </ScrollReveal>

      <ScrollReveal delay={350}>
        <Link href="/admin/pagos">
          <Card className="hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer group border-emerald-200/50 dark:border-emerald-500/20 bg-gradient-to-br from-white to-emerald-50/30 dark:from-background dark:to-emerald-950/20 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 group-hover:from-emerald-500/20 group-hover:to-teal-500/20 transition-colors">
                  <CreditCard className="size-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <ArrowRight className="size-5 text-emerald-500/50 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </div>
              <CardTitle className="mt-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Gestión de Pagos
              </CardTitle>
              <CardDescription>Verificar pagos, cuotas y vouchers de MercadoPago</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70">
                ${stats.totalRecaudado.toLocaleString('es-AR')} recaudado
              </p>
            </CardContent>
          </Card>
        </Link>
      </ScrollReveal>

      <ScrollReveal delay={400}>
        <Link href="/admin/galeria">
          <Card className="hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer group border-amber-200/50 dark:border-amber-500/20 bg-gradient-to-br from-white to-amber-50/30 dark:from-background dark:to-amber-950/20 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 group-hover:from-amber-500/20 group-hover:to-orange-500/20 transition-colors">
                  <ImageIcon className="size-6 text-amber-600 dark:text-amber-400" />
                </div>
                <ArrowRight className="size-5 text-amber-500/50 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </div>
              <CardTitle className="mt-4 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Multimedia
              </CardTitle>
              <CardDescription>
                Subir y administrar imágenes y videos de la landing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-600/70 dark:text-amber-400/70">
                4 imágenes, 2 videos disponibles
              </p>
            </CardContent>
          </Card>
        </Link>
      </ScrollReveal>

      <ScrollReveal delay={500}>
        <Link href="/admin/noticias">
          <Card className="hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 cursor-pointer group border-sky-200/50 dark:border-sky-500/20 bg-gradient-to-br from-white to-sky-50/30 dark:from-background dark:to-sky-950/20 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-sky-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500/10 to-cyan-500/10 dark:from-sky-500/20 dark:to-cyan-500/20 group-hover:from-sky-500/20 group-hover:to-cyan-500/20 transition-colors">
                  <Newspaper className="size-6 text-sky-600 dark:text-sky-400" />
                </div>
                <ArrowRight className="size-5 text-sky-500/50 group-hover:text-sky-500 group-hover:translate-x-1 transition-all" />
              </div>
              <CardTitle className="mt-4 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                Gestión de Noticias
              </CardTitle>
              <CardDescription>
                Crear y administrar noticias, anuncios y comunicados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-sky-600/70 dark:text-sky-400/70">
                Blog y comunicación oficial
              </p>
            </CardContent>
          </Card>
        </Link>
      </ScrollReveal>

      <ScrollReveal delay={550}>
        <Link href="/admin/inscripciones">
          <Card className="hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer group border-amber-200/50 dark:border-amber-500/20 bg-gradient-to-br from-white to-amber-50/30 dark:from-background dark:to-amber-950/20 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 dark:from-amber-500/20 dark:to-yellow-500/20 group-hover:from-amber-500/20 group-hover:to-yellow-500/20 transition-colors">
                  <UserCheck className="size-6 text-amber-600 dark:text-amber-400" />
                </div>
                <ArrowRight className="size-5 text-amber-500/50 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </div>
              <CardTitle className="mt-4 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Gestión de Inscripciones
              </CardTitle>
              <CardDescription>
                Gestionar inscripciones, verificar pagos y cuotas de los participantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-600/70 dark:text-amber-400/70">
                {loadingInscripciones ? '...' : stats.totalInscritos} inscripción(es)
                registrada(s)
                {stats.inscripcionesConfirmadas > 0 && (
                  <span className="text-xs ml-1">
                    ({stats.inscripcionesConfirmadas} confirmadas)
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        </Link>
      </ScrollReveal>

      <ScrollReveal delay={600}>
        <Link href="/admin/visor-credenciales">
          <Card className="hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer group border-purple-200/50 dark:border-purple-500/20 bg-gradient-to-br from-white to-purple-50/30 dark:from-background dark:to-purple-950/20 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 dark:from-purple-500/20 dark:to-indigo-500/20 group-hover:from-purple-500/20 group-hover:to-indigo-500/20 transition-colors">
                  <Shield className="size-6 text-purple-600 dark:text-purple-400" />
                </div>
                <ArrowRight className="size-5 text-purple-500/50 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
              </div>
              <CardTitle className="mt-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Credencial de Pastores
              </CardTitle>
              <CardDescription>
                Gestiona las credenciales ministeriales físicas para impresión
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-600/70 dark:text-purple-400/70">
                {stats.totalCredenciales} credencial(es) activa(s)
                {stats.credencialesPorVencer > 0 && (
                  <span className="text-xs ml-1 text-amber-600 dark:text-amber-400">
                    ({stats.credencialesPorVencer} por vencer)
                  </span>
                )}
                {stats.credencialesVencidas > 0 && (
                  <span className="text-xs ml-1 text-red-600 dark:text-red-400">
                    ({stats.credencialesVencidas} vencidas)
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        </Link>
      </ScrollReveal>

      <ScrollReveal delay={650}>
        <Link href="/admin/visor-credenciales-capellania">
          <Card className="hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 cursor-pointer group border-green-200/50 dark:border-green-500/20 bg-gradient-to-br from-white to-green-50/30 dark:from-background dark:to-green-950/20 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 group-hover:from-green-500/20 group-hover:to-emerald-500/20 transition-colors">
                  <Shield className="size-6 text-green-600 dark:text-green-400" />
                </div>
                <ArrowRight className="size-5 text-green-500/50 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
              </div>
              <CardTitle className="mt-4 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                Credenciales de Capellanía
              </CardTitle>
              <CardDescription>
                Gestiona las credenciales de capellanía físicas para impresión
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-600/70 dark:text-green-400/70">
                {stats.totalCredencialesCapellania} credencial(es) activa(s)
                {stats.credencialesCapellaniaPorVencer > 0 && (
                  <span className="text-xs ml-1 text-amber-600 dark:text-amber-400">
                    ({stats.credencialesCapellaniaPorVencer} por vencer)
                  </span>
                )}
                {stats.credencialesCapellaniaVencidas > 0 && (
                  <span className="text-xs ml-1 text-red-600 dark:text-red-400">
                    ({stats.credencialesCapellaniaVencidas} vencidas)
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        </Link>
      </ScrollReveal>
    </div>
  )
}







