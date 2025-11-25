'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Loader2, Ticket, Sparkles } from 'lucide-react'
import { CountdownTimer } from './countdown-timer'
import { useConvencionActiva } from '@/lib/hooks/use-convencion'
import { useEffect, useState } from 'react'

export function ConventionsSection() {
  const { data: convencion, isLoading, isFetching } = useConvencionActiva()
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    if (convencion?.activa) {
      const timer = setTimeout(() => setIsVisible(true), 50)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [convencion?.activa])

  if (isLoading) {
    return (
      <section id="convenciones" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[#0d1f35]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-amber-400" />
          </div>
        </div>
      </section>
    )
  }

  if (!convencion || !convencion.activa) {
    return null
  }

  const fechaConvencion = new Date(convencion.fechaInicio)
  const fechaFormateada = fechaConvencion.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <section
      id="convenciones"
      className={`relative py-24 overflow-hidden transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[#0d1f35]">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: `
              radial-gradient(ellipse 50% 50% at ${mousePosition.x}% ${mousePosition.y}%, rgba(245, 158, 11, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 20% 80%, rgba(249, 115, 22, 0.1) 0%, transparent 50%)
            `,
          }}
        />
        {/* Animated blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full blur-[120px] animate-blob" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Loading indicator */}
        {isFetching && (
          <div className="absolute top-4 right-4">
            <Loader2 className="size-4 animate-spin text-amber-400/50" />
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm relative overflow-hidden">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-white/80 font-medium">Evento Especial</span>
            {/* Shimmer */}
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Próxima{' '}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Convención
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Únete a nosotros en un evento transformador diseñado para equipar y fortalecer tu ministerio
          </p>
        </div>

        {/* Countdown */}
        <div className="mb-16 max-w-3xl mx-auto">
          <CountdownTimer
            targetDate={fechaConvencion}
            title={convencion.titulo}
          />
        </div>

        {/* Convention Card */}
        <div className="max-w-lg mx-auto">
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />

            <div className="relative rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
              {/* Gradient header */}
              <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500" />

              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <h3 className="text-2xl font-bold text-white">{convencion.titulo}</h3>
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 flex-shrink-0">
                    <Ticket className="w-3 h-3 mr-1" />
                    Inscripción Abierta
                  </Badge>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-white/70">
                    <div className="p-2 rounded-lg bg-white/5">
                      <Calendar className="h-5 w-5 text-amber-400" />
                    </div>
                    <span className="text-lg">{fechaFormateada}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/70">
                    <div className="p-2 rounded-lg bg-white/5">
                      <MapPin className="h-5 w-5 text-orange-400" />
                    </div>
                    <span className="text-lg">{convencion.ubicacion}</span>
                  </div>
                </div>

                {convencion.costo && Number(convencion.costo) > 0 && (
                  <div className="text-center py-4 mb-6 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                    <span className="text-sm text-white/60">Inversión</span>
                    <div className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                      ${Number(convencion.costo).toLocaleString('es-AR')} ARS
                    </div>
                  </div>
                )}

                <Button
                  className="w-full h-14 text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white border-0 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300 hover:scale-[1.02]"
                  onClick={() => {
                    const inscripcionSection = document.getElementById('inscripcion')
                    if (inscripcionSection) {
                      inscripcionSection.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                >
                  Inscríbete Ahora
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-8 w-32 h-px bg-gradient-to-r from-amber-500/50 to-transparent" />
      <div className="absolute bottom-20 right-8 w-32 h-px bg-gradient-to-l from-orange-500/50 to-transparent" />
    </section>
  )
}
