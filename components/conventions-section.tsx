'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Loader2, Ticket, Sparkles, Bell, PartyPopper, Clock } from 'lucide-react'
import { CountdownTimer } from './countdown-timer'
import { useConvencionActiva } from '@/lib/hooks/use-convencion'
import { useEffect, useState } from 'react'

// Componente para el anuncio de "Próximamente"
function ComingSoonAnnouncement() {
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

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

  return (
    <section
      id="convenciones"
      className={`relative py-24 overflow-hidden transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
    >
      {/* Background con efecto especial */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f35] via-[#0a1628] to-[#0d1f35]">
        {/* Aurora effect */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background: `
              radial-gradient(ellipse 60% 40% at ${mousePosition.x}% ${mousePosition.y}%, rgba(14, 165, 233, 0.2) 0%, transparent 50%),
              radial-gradient(ellipse 50% 50% at 80% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse 40% 60% at 20% 80%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)
            `,
          }}
        />
        {/* Animated blobs */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-sky-500/10 to-emerald-500/10 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-gradient-to-r from-emerald-500/10 to-amber-500/10 rounded-full blur-[80px] animate-blob animation-delay-2000" />
        {/* Grid pattern */}
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
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Icon animado */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500 rounded-full blur-xl opacity-30 animate-pulse" />
            <div className="relative p-6 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
              <PartyPopper className="w-12 h-12 text-amber-400 animate-bounce" style={{ animationDuration: '2s' }} />
            </div>
          </div>
        </div>

        {/* Título principal */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm relative overflow-hidden">
            <Bell className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-sm text-white/80 font-medium">¡Mantente Atento!</span>
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            <span className="block mb-2">Muy Pronto</span>
            <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
              Gran Convención
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            Estamos preparando un evento extraordinario para ti.
            <br className="hidden sm:block" />
            ¡Pronto tendrás toda la información!
          </p>
        </div>

        {/* Card con información */}
        <div className="max-w-md mx-auto">
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-pulse" />

            <div className="relative rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
              {/* Gradient header animado */}
              <div className="h-2 bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500 bg-[length:200%_100%] animate-gradient" />

              <div className="p-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-emerald-400" />
                  <span className="text-xl font-semibold text-white">Próximamente</span>
                </div>

                <p className="text-white/50 mb-6">
                  Estamos definiendo la fecha, ubicación y todos los detalles de nuestra próxima convención.
                </p>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <Calendar className="w-5 h-5 text-sky-400" />
                    <span className="text-white/70">Fecha por confirmar</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <MapPin className="w-5 h-5 text-amber-400" />
                    <span className="text-white/70">Ubicación por confirmar</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-sm text-white/40 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Te notificaremos cuando tengamos novedades
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative lines */}
      <div className="absolute top-20 left-8 w-32 h-px bg-gradient-to-r from-sky-500/50 to-transparent" />
      <div className="absolute bottom-20 right-8 w-32 h-px bg-gradient-to-l from-amber-500/50 to-transparent" />
    </section>
  )
}

export function ConventionsSection() {
  // La sincronización inteligente está manejada en useConvencionActiva()
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

  // No mostrar nada si está cargando (solo la primera vez)
  if (isLoading) {
    return null
  }

  // Mostrar anuncio de "Próximamente" si no hay convención activa
  if (!convencion || convencion.activa === false) {
    return <ComingSoonAnnouncement />
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
            <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
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
