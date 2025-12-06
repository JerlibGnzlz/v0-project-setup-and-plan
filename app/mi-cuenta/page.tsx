'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePastorAuth } from '@/lib/hooks/use-pastor-auth'
import { useInscripciones } from '@/lib/hooks/use-inscripciones'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  FileText,
  LogOut,
  ArrowLeft,
  Copy,
  Check,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { QueryProvider } from '@/lib/providers/query-provider'
import Link from 'next/link'
import { useState } from 'react'

function MiCuentaContent() {
  const router = useRouter()
  const { pastor, isAuthenticated, isHydrated, logout, checkAuth } = usePastorAuth()
  const { data: inscripciones = [], isLoading } = useInscripciones()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/convencion/inscripcion')
    }
  }, [isHydrated, isAuthenticated, router])

  const handleLogout = () => {
    logout()
    router.push('/')
    toast.success('Sesión cerrada exitosamente')
  }

  const copyToClipboard = (text: string, code: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(code)
    toast.success('Código copiado al portapapeles')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !pastor) {
    return null
  }

  // Filtrar inscripciones del pastor autenticado
  const misInscripciones = inscripciones.filter(
    (insc: any) => insc.email?.toLowerCase() === pastor.email?.toLowerCase()
  )

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white hover:bg-white/5"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
                Mi Cuenta
              </h1>
              <p className="text-white/70 text-sm">Gestiona tus inscripciones y pagos</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-white/70 border-white/20 hover:bg-white/5"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información del Perfil */}
          <div className="lg:col-span-1">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <User className="w-5 h-5 text-emerald-400" />
                  Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-white/50 mb-1">Nombre completo</p>
                  <p className="text-white font-medium">
                    {pastor.nombre} {pastor.apellido}
                  </p>
                </div>
                {pastor.email && (
                  <div>
                    <p className="text-sm text-white/50 mb-1 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Email
                    </p>
                    <p className="text-white font-medium">{pastor.email}</p>
                  </div>
                )}
                {pastor.telefono && (
                  <div>
                    <p className="text-sm text-white/50 mb-1 flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      Teléfono
                    </p>
                    <p className="text-white font-medium">{pastor.telefono}</p>
                  </div>
                )}
                {pastor.sede && (
                  <div>
                    <p className="text-sm text-white/50 mb-1 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Sede
                    </p>
                    <p className="text-white font-medium">{pastor.sede}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Mis Inscripciones */}
          <div className="lg:col-span-2">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  Mis Inscripciones
                </CardTitle>
                <CardDescription className="text-white/70">
                  {misInscripciones.length} inscripción{misInscripciones.length !== 1 ? 'es' : ''}{' '}
                  registrada{misInscripciones.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : misInscripciones.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/70 mb-4">No tienes inscripciones registradas</p>
                    <Link href="/convencion/inscripcion">
                      <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                        Inscribirme a una Convención
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {misInscripciones.map((inscripcion: any) => {
                      const pagos = inscripcion.pagos || []
                      const numeroCuotas = inscripcion.numeroCuotas || 3
                      const cuotasPagadas = pagos.filter(
                        (p: any) => p.estado === 'COMPLETADO'
                      ).length
                      const cuotasPendientes = numeroCuotas - cuotasPagadas
                      const estaConfirmado = inscripcion.estado === 'confirmado'
                      const progreso = (cuotasPagadas / numeroCuotas) * 100

                      return (
                        <Card key={inscripcion.id} className="bg-white/5 border-white/10">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-semibold text-white mb-1">
                                  {inscripcion.convencion?.titulo || 'Convención'}
                                </h3>
                                <p className="text-sm text-white/70">
                                  Inscrito el{' '}
                                  {format(
                                    new Date(inscripcion.fechaInscripcion),
                                    "d 'de' MMMM, yyyy",
                                    { locale: es }
                                  )}
                                </p>
                              </div>
                              <Badge
                                className={
                                  estaConfirmado
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                }
                              >
                                {estaConfirmado ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Confirmado
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 mr-1" />
                                    Pendiente
                                  </>
                                )}
                              </Badge>
                            </div>

                            {/* Código de Referencia */}
                            {inscripcion.codigoReferencia && (
                              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-xs text-emerald-300 mb-1">
                                      🔖 Código de Referencia
                                    </p>
                                    <p className="text-lg font-mono font-bold text-emerald-400">
                                      {inscripcion.codigoReferencia}
                                    </p>
                                    <p className="text-xs text-emerald-300/70 mt-1">
                                      Incluye este código en el concepto de tu transferencia
                                    </p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      copyToClipboard(
                                        inscripcion.codigoReferencia,
                                        inscripcion.codigoReferencia
                                      )
                                    }
                                    className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                                  >
                                    {copiedCode === inscripcion.codigoReferencia ? (
                                      <>
                                        <Check className="w-4 h-4 mr-1" />
                                        Copiado
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-4 h-4 mr-1" />
                                        Copiar
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Progreso de Pagos */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-white/70">Progreso de pagos</p>
                                <p className="text-sm font-semibold text-white">
                                  {cuotasPagadas}/{numeroCuotas} cuotas pagadas
                                </p>
                              </div>
                              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ${
                                    estaConfirmado ? 'bg-emerald-500' : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${progreso}%` }}
                                />
                              </div>
                              {cuotasPendientes > 0 && (
                                <p className="text-xs text-amber-300 mt-1">
                                  {cuotasPendientes} cuota{cuotasPendientes > 1 ? 's' : ''}{' '}
                                  pendiente{cuotasPendientes > 1 ? 's' : ''}
                                </p>
                              )}
                            </div>

                            {/* Detalles de Pagos */}
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-white/90 mb-2">
                                Detalles de pagos:
                              </p>
                              {pagos.length > 0 ? (
                                <div className="space-y-2">
                                  {pagos.map((pago: any) => (
                                    <div
                                      key={pago.id}
                                      className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                                    >
                                      <div className="flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-white/50" />
                                        <span className="text-sm text-white">
                                          Cuota {pago.numeroCuota || 'N/A'}
                                        </span>
                                        <span className="text-sm text-white/70">
                                          - $
                                          {typeof pago.monto === 'number'
                                            ? pago.monto.toFixed(2)
                                            : parseFloat(pago.monto || 0).toFixed(2)}
                                        </span>
                                      </div>
                                      <Badge
                                        className={
                                          pago.estado === 'COMPLETADO'
                                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                        }
                                      >
                                        {pago.estado === 'COMPLETADO' ? (
                                          <>
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Pagado
                                          </>
                                        ) : (
                                          <>
                                            <Clock className="w-3 h-3 mr-1" />
                                            Pendiente
                                          </>
                                        )}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-white/50">No hay pagos registrados</p>
                              )}
                            </div>

                            {/* Información de la Convención */}
                            {inscripcion.convencion && (
                              <div className="mt-4 pt-4 border-t border-white/10">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-white/50 mb-1">Fechas</p>
                                    <p className="text-white">
                                      {format(
                                        new Date(inscripcion.convencion.fechaInicio),
                                        'd MMM',
                                        { locale: es }
                                      )}{' '}
                                      -{' '}
                                      {format(
                                        new Date(inscripcion.convencion.fechaFin),
                                        'd MMM, yyyy',
                                        { locale: es }
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-white/50 mb-1">Ubicación</p>
                                    <p className="text-white">{inscripcion.convencion.ubicacion}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MiCuentaPage() {
  return (
    <QueryProvider>
      <MiCuentaContent />
    </QueryProvider>
  )
}
