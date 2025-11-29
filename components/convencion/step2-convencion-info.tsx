'use client'

import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Ticket, Sparkles, Star, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Image from 'next/image'
import { useCheckInscripcion } from '@/lib/hooks/use-inscripciones'
import { usePastorAuth } from '@/lib/hooks/use-pastor-auth'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

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
  onComplete: () => void
  onBack: () => void
}

export function Step2ConvencionInfo({ convencion, onComplete, onBack }: Step2ConvencionInfoProps) {
  const router = useRouter()
  const { pastor } = usePastorAuth()
  
  // Verificar si el usuario ya está inscrito
  const { data: inscripcionExistente, isLoading: checkingInscripcion } = useCheckInscripcion(
    convencion?.id,
    pastor?.email
  )

  const fechaInicio = new Date(convencion.fechaInicio)
  const fechaFin = new Date(convencion.fechaFin)
  const fechaFormateada = format(fechaInicio, "d 'de' MMMM, yyyy", { locale: es })
  const fechaFinFormateada = format(fechaFin, "d 'de' MMMM, yyyy", { locale: es })

  // Convertir costo a número de forma segura (puede venir como Decimal de Prisma)
  const costo = typeof convencion.costo === 'number' 
    ? convencion.costo 
    : parseFloat(String(convencion.costo || 0))
  const montoPorCuota1 = costo
  const montoPorCuota2 = costo / 2
  const montoPorCuota3 = costo / 3

  const yaInscrito = !!inscripcionExistente
  const puedeContinuar = !yaInscrito && !checkingInscripcion

  const handleContinue = () => {
    if (yaInscrito) {
      toast.error("Ya estás inscrito", {
        description: "Este correo electrónico ya está registrado para esta convención",
      })
      return
    }
    onComplete()
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
        {convencion.imagenUrl && (
          <div className="mb-6 rounded-xl overflow-hidden">
            <Image
              src={convencion.imagenUrl}
              alt={convencion.titulo}
              width={800}
              height={400}
              className="w-full h-48 sm:h-64 object-cover"
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
                <p className="text-sm sm:text-base font-semibold text-white">
                  {fechaFormateada}
                </p>
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
                <p className="text-sm sm:text-base font-semibold text-white">{convencion.ubicacion}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Costo y Cuotas */}
        {costo > 0 && (
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-amber-500/10 border border-amber-500/20 rounded-lg p-6 mb-6">
            <div className="text-center mb-4">
              <p className="text-sm text-white/70 mb-2">Costo Total</p>
              <p className="text-3xl font-bold text-amber-400">${costo.toFixed(2)}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
                <p className="text-xs text-white/50 mb-1">1 Cuota</p>
                <p className="text-lg font-semibold text-white">${montoPorCuota1.toFixed(2)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
                <p className="text-xs text-white/50 mb-1">2 Cuotas</p>
                <p className="text-lg font-semibold text-white">${montoPorCuota2.toFixed(2)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center border border-emerald-500/30 bg-emerald-500/5">
                <p className="text-xs text-emerald-300 mb-1">3 Cuotas</p>
                <p className="text-lg font-semibold text-emerald-400">${montoPorCuota3.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Cupo */}
        {convencion.cupoMaximo && (
          <div className="mb-6 text-center">
            <p className="text-sm text-white/70">
              Cupos disponibles: <span className="font-semibold text-white">{convencion.cupoMaximo}</span>
            </p>
          </div>
        )}

        {/* Mensaje si ya está inscrito */}
        {yaInscrito && inscripcionExistente && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-300 mb-1">Ya estás inscrito</h3>
                <p className="text-sm text-white/70 mb-3">
                  Tu inscripción fue registrada el {format(new Date(inscripcionExistente.fechaInscripcion), "d 'de' MMMM, yyyy", { locale: es })}.
                  Estado: <span className="font-semibold text-amber-300">{inscripcionExistente.estado}</span>
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/#convenciones')}
                  className="text-amber-300 border-amber-500/30 hover:bg-amber-500/10"
                >
                  Volver a la página principal
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
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
      </div>
    </div>
  )
}

