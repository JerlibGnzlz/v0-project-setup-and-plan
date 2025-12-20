'use client'

import { Button } from '@/components/ui/button'
import {
  Calendar,
  MapPin,
  Ticket,
  Sparkles,
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Image from 'next/image'
import { useCheckInscripcion } from '@/lib/hooks/use-inscripciones'
import { useUnifiedAuth } from '@/lib/hooks/use-unified-auth'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface Step2ConvencionInfoProps {
  convencion: {
    id: string
    titulo: string
    descripcion?: string
    fechaInicio: string
    fechaFin: string
    ubicacion: string
    costo?: number
    cupoMaximo?: number
    imagenUrl?: string
  }
  onComplete: (data?: { numeroCuotas?: number }) => void
  onBack: () => void
  initialNumeroCuotas?: number
}

export function Step2ConvencionInfo({
  convencion,
  onComplete,
  onBack,
  initialNumeroCuotas = 3,
}: Step2ConvencionInfoProps) {
  const router = useRouter()
  const { user } = useUnifiedAuth()
  const [numeroCuotas, setNumeroCuotas] = useState<number>(initialNumeroCuotas)

  // Verificar si el usuario ya está inscrito
  const { data: inscripcionExistente, isLoading: checkingInscripcion } = useCheckInscripcion(
    convencion?.id,
    user?.email
  )

  const fechaInicio = new Date(convencion.fechaInicio)
  const fechaFin = new Date(convencion.fechaFin)
  const fechaFormateada = format(fechaInicio, 'dd/MM/yyyy', { locale: es })
  const fechaFinFormateada = format(fechaFin, 'dd/MM/yyyy', { locale: es })

  // Convertir costo a número de forma segura (puede venir como Decimal de Prisma)
  const costo =
    typeof convencion.costo === 'number'
      ? convencion.costo
      : parseFloat(String(convencion.costo || 0))
  const montoPorCuota1 = costo
  const montoPorCuota2 = costo / 2
  const montoPorCuota3 = costo / 3

  const yaInscrito = !!inscripcionExistente
  const estaConfirmado = inscripcionExistente?.estado === 'confirmado'
  const puedeContinuar = !yaInscrito && !checkingInscripcion && !estaConfirmado

  const handleContinue = () => {
    if (yaInscrito) {
      if (estaConfirmado) {
        toast.error('Inscripción ya confirmada', {
          description: 'Tu inscripción ya está confirmada. No puedes inscribirte nuevamente.',
        })
      } else {
        toast.error('Ya estás inscrito', {
          description: 'Este correo electrónico ya está registrado para esta convención',
        })
      }
      return
    }
    onComplete({ numeroCuotas })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-emerald-500/20 border border-emerald-500/40">
            <Ticket className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">Inscripción Abierta</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{convencion.titulo}</h2>
          {convencion.descripcion && (
            <p className="text-white/70 text-sm sm:text-base">{convencion.descripcion}</p>
          )}
        </div>

        {/* Elegant divider */}
        <div className="flex items-center justify-center gap-3 my-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/50 to-amber-500/30" />
          <div className="relative">
            <Star className="w-3 h-3 text-amber-400/60 fill-amber-400/20" />
            <div className="absolute inset-0 animate-ping">
              <Star className="w-3 h-3 text-amber-400/30" />
            </div>
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-500/50 to-amber-500/30" />
        </div>

        {/* Image */}
        {convencion.imagenUrl && 
         !convencion.imagenUrl.includes('via.placeholder.com') && 
         !convencion.imagenUrl.includes('placeholder.com') && (
          <div className="mb-6 rounded-xl overflow-hidden">
            <Image
              src={convencion.imagenUrl}
              alt={convencion.titulo}
              width={800}
              height={400}
              className="w-full h-48 sm:h-64 object-cover"
              unoptimized={convencion.imagenUrl.includes('localhost')}
            />
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Fecha */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wide">Fecha</p>
                <p className="text-sm sm:text-base font-semibold text-white">{fechaFormateada}</p>
                {fechaInicio.getTime() !== fechaFin.getTime() && (
                  <p className="text-xs text-white/50 mt-1">Hasta {fechaFinFormateada}</p>
                )}
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-sky-500/20 rounded-lg">
                <MapPin className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wide">Ubicación</p>
                <p className="text-sm sm:text-base font-semibold text-white">
                  {convencion.ubicacion}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Costo y Selección de Cuotas */}
        {costo > 0 && (
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-amber-500/10 border border-amber-500/20 rounded-lg p-6 mb-6">
            <div className="text-center mb-4">
              <p className="text-sm text-white/70 mb-2">Costo Total</p>
              <p className="text-3xl font-bold text-amber-400">${costo.toFixed(2)}</p>
            </div>

            {/* Selector de número de cuotas */}
            <div className="mb-4">
              <Label htmlFor="numeroCuotas" className="text-white/90 mb-3 block text-center">
                Selecciona tu plan de pago <span className="text-red-400">*</span>
              </Label>
              <Select
                value={String(numeroCuotas)}
                onValueChange={value => setNumeroCuotas(parseInt(value))}
              >
                <SelectTrigger className="w-full bg-white/5 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1628] border-white/20">
                  <SelectItem value="1" className="text-white">
                    1 Cuota - ${montoPorCuota1.toFixed(2)} (Pago único)
                  </SelectItem>
                  <SelectItem value="2" className="text-white">
                    2 Cuotas - ${montoPorCuota2.toFixed(2)} cada una
                  </SelectItem>
                  <SelectItem value="3" className="text-white">
                    3 Cuotas - ${montoPorCuota3.toFixed(2)} cada una (Recomendado)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preview de opciones - Cards interactivos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div
                className={`rounded-lg p-3 text-center border transition-all cursor-pointer ${
                  numeroCuotas === 1
                    ? 'bg-emerald-500/20 border-emerald-500/50 shadow-lg shadow-emerald-500/20'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                onClick={() => setNumeroCuotas(1)}
              >
                <p className="text-xs text-white/50 mb-1">1 Cuota</p>
                <p
                  className={`text-lg font-semibold ${numeroCuotas === 1 ? 'text-emerald-400' : 'text-white'}`}
                >
                  ${montoPorCuota1.toFixed(2)}
                </p>
                <p className="text-xs text-white/40 mt-1">Pago único</p>
              </div>
              <div
                className={`rounded-lg p-3 text-center border transition-all cursor-pointer ${
                  numeroCuotas === 2
                    ? 'bg-emerald-500/20 border-emerald-500/50 shadow-lg shadow-emerald-500/20'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                onClick={() => setNumeroCuotas(2)}
              >
                <p className="text-xs text-white/50 mb-1">2 Cuotas</p>
                <p
                  className={`text-lg font-semibold ${numeroCuotas === 2 ? 'text-emerald-400' : 'text-white'}`}
                >
                  ${montoPorCuota2.toFixed(2)}
                </p>
                <p className="text-xs text-white/40 mt-1">c/u</p>
              </div>
              <div
                className={`rounded-lg p-3 text-center border transition-all cursor-pointer ${
                  numeroCuotas === 3
                    ? 'bg-emerald-500/20 border-emerald-500/50 shadow-lg shadow-emerald-500/20'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                onClick={() => setNumeroCuotas(3)}
              >
                <p className="text-xs text-white/50 mb-1">3 Cuotas</p>
                <p
                  className={`text-lg font-semibold ${numeroCuotas === 3 ? 'text-emerald-400' : 'text-white'}`}
                >
                  ${montoPorCuota3.toFixed(2)}
                </p>
                <p className="text-xs text-emerald-300 mt-1">⭐ Recomendado</p>
              </div>
            </div>

            {/* Resumen de la selección */}
            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-white/70 text-center">
                Has seleccionado:{' '}
                <span className="font-semibold text-emerald-400">
                  {numeroCuotas} cuota{numeroCuotas > 1 ? 's' : ''}
                </span>{' '}
                de{' '}
                <span className="font-semibold text-white">
                  $
                  {numeroCuotas === 1
                    ? montoPorCuota1.toFixed(2)
                    : numeroCuotas === 2
                      ? montoPorCuota2.toFixed(2)
                      : montoPorCuota3.toFixed(2)}
                </span>{' '}
                cada una
              </p>
            </div>

            {/* Información de métodos de pago */}
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-300 mb-2">
                    💳 Métodos de Pago Disponibles
                  </h4>
                  <ul className="text-xs text-white/70 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>
                        <strong>Transferencia Bancaria:</strong> Contacta a la administración para
                        obtener los datos bancarios.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>
                        <strong>Mercado Pago:</strong> Solicita el link de pago a la administración.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>
                        <strong>En efectivo:</strong> Acércate a tu sede más cercana.
                      </span>
                    </li>
                  </ul>
                  <p className="text-xs text-blue-300/80 mt-2">
                    💡 <strong>Nota:</strong> Una vez completada tu inscripción, recibirás un email
                    con instrucciones detalladas sobre cómo realizar el pago.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cupo */}
        {convencion.cupoMaximo && (
          <div className="mb-6 text-center">
            <p className="text-sm text-white/70">
              Cupos disponibles:{' '}
              <span className="font-semibold text-white">{convencion.cupoMaximo}</span>
            </p>
          </div>
        )}

        {/* Mensaje si ya está inscrito */}
        {yaInscrito &&
          inscripcionExistente &&
          (() => {
            const pagos = inscripcionExistente.pagos || []
            const numeroCuotas = inscripcionExistente.numeroCuotas || 3
            const cuotasPagadas = pagos.filter((p: any) => p.estado === 'COMPLETADO').length
            const cuotasPendientes = numeroCuotas - cuotasPagadas
            const estadoInscripcion = inscripcionExistente.estado
            const esConfirmado = estadoInscripcion === 'confirmado'

            return (
              <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className={`w-5 h-5 mt-0.5 flex-shrink-0 ${esConfirmado ? 'text-emerald-400' : 'text-amber-400'}`}
                  />
                  <div className="flex-1">
                    <h3
                      className={`text-sm font-semibold mb-1 ${esConfirmado ? 'text-emerald-300' : 'text-amber-300'}`}
                    >
                      {esConfirmado ? '✅ Inscripción Confirmada' : 'Ya estás inscrito'}
                    </h3>
                    <p className="text-sm text-white/70 mb-2">
                      Tu inscripción fue registrada el{' '}
                      {format(
                        new Date(inscripcionExistente.fechaInscripcion),
                        "d 'de' MMMM, yyyy",
                        { locale: es }
                      )}
                      .
                    </p>

                    {/* Estado de la inscripción */}
                    <div className="mb-3 p-2 bg-white/5 rounded-lg">
                      <p className="text-xs text-white/50 mb-1">Estado de inscripción:</p>
                      <p
                        className={`text-sm font-semibold ${esConfirmado ? 'text-emerald-400' : 'text-amber-300'}`}
                      >
                        {estadoInscripcion === 'confirmado'
                          ? '✅ Confirmado'
                          : estadoInscripcion === 'pendiente'
                            ? '⏳ Pendiente de pago'
                            : estadoInscripcion}
                      </p>
                    </div>

                    {/* Estado de pagos */}
                    {numeroCuotas > 0 && (
                      <div className="mb-3 p-2 bg-white/5 rounded-lg">
                        <p className="text-xs text-white/50 mb-1">Progreso de pagos:</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${esConfirmado ? 'bg-emerald-500' : 'bg-amber-500'}`}
                              style={{ width: `${(cuotasPagadas / numeroCuotas) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-white">
                            {cuotasPagadas}/{numeroCuotas} cuotas pagadas
                          </span>
                        </div>
                        {cuotasPendientes > 0 && (
                          <p className="text-xs text-amber-300 mt-1">
                            {cuotasPendientes} cuota{cuotasPendientes > 1 ? 's' : ''} pendiente
                            {cuotasPendientes > 1 ? 's' : ''}
                          </p>
                        )}
                        {esConfirmado && (
                          <p className="text-xs text-emerald-300 mt-1">
                            ✅ Todas las cuotas han sido validadas
                          </p>
                        )}
                      </div>
                    )}

                    {estaConfirmado && (
                      <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                        <p className="text-xs text-emerald-300 text-center">
                          ✅ Tu inscripción está completamente confirmada. ¡Te esperamos en la
                          convención!
                        </p>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/#convenciones')}
                      className={`mt-3 ${estaConfirmado ? 'text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10' : 'text-amber-300 border-amber-500/30 hover:bg-amber-500/10'}`}
                    >
                      Volver a la página principal
                    </Button>
                  </div>
                </div>
              </div>
            )
          })()}

        {/* Actions */}
        {!estaConfirmado && (
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="flex-1 text-white/70 hover:text-white hover:bg-white/5"
            >
              ← Atrás
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!puedeContinuar || checkingInscripcion}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkingInscripcion ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : yaInscrito ? (
                <>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Ya inscrito
                </>
              ) : (
                <>
                  Continuar
                  <Sparkles className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
