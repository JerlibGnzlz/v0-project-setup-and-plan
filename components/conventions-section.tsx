'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Loader2, Ticket, Sparkles, Bell, PartyPopper, Clock, Star } from 'lucide-react'
import { CountdownTimer } from './countdown-timer'
import { useConvencionActiva } from '@/lib/hooks/use-convencion'
import { useEffect, useState } from 'react'
import Image from 'next/image'

// Decorative corner component for invitation
function DecorativeCorner({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const rotations = {
    'top-left': 'rotate-0',
    'top-right': 'rotate-90',
    'bottom-right': 'rotate-180',
    'bottom-left': '-rotate-90',
  }
  
  const positions = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
  }

  return (
    <div className={`absolute ${positions[position]} w-12 h-12 sm:w-14 sm:h-14 ${rotations[position]}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500/60">
        <path
          d="M0,0 L30,0 C20,0 10,10 10,20 L10,30 C10,15 15,10 30,10 L40,10 C25,10 20,15 20,30 L20,40 L0,40 Z"
          fill="currentColor"
        />
        <path
          d="M0,0 L0,30 L3,30 L3,3 L30,3 L30,0 Z"
          fill="currentColor"
          opacity="0.5"
        />
      </svg>
    </div>
  )
}

// Elegant divider line - Compact version
function ElegantDividerCompact() {
  return (
    <div className="flex items-center justify-center gap-2 my-3">
      <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-500/40" />
      <Star className="w-2 h-2 text-amber-400/50" />
      <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-500/40" />
    </div>
  )
}

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

// Horizontal Invitation Card Component
function HorizontalInvitationCard({ 
  convencion, 
  fechaFormateada 
}: { 
  convencion: any
  fechaFormateada: string 
}) {
  return (
    <div className="relative group h-full">
      {/* Outer glow */}
      <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 via-yellow-400/15 to-amber-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-700" />
      
      {/* Card shadow */}
      <div className="absolute inset-0 translate-y-2 translate-x-1 bg-black/20 rounded-xl blur-lg" />
      
      {/* Main invitation card */}
      <div 
        className="relative h-full rounded-xl overflow-hidden transform transition-all duration-500 group-hover:scale-[1.01]"
        style={{
          background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 0 0 1px rgba(251,191,36,0.3)',
        }}
      >
        {/* Texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Decorative corners */}
        <DecorativeCorner position="top-left" />
        <DecorativeCorner position="top-right" />
        <DecorativeCorner position="bottom-left" />
        <DecorativeCorner position="bottom-right" />
        
        {/* Golden border frame */}
        <div className="absolute inset-2 border border-amber-500/25 rounded-lg pointer-events-none" />
        
        {/* Content */}
        <div className="relative p-5 sm:p-6 h-full flex flex-col">
          {/* Header with logo - compact */}
          <div className="text-center mb-3">
            {/* Seal/Emblem */}
            <div className="relative inline-block mb-2">
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 rounded-full blur-lg animate-pulse" />
              <div className="relative w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-2 border-amber-500/40 flex items-center justify-center">
                <Image
                  src="/mundo.png"
                  alt="AMVA"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
            </div>
            
            {/* Organization name */}
            <p className="text-amber-400/70 text-[10px] tracking-[0.2em] uppercase font-medium">
              A.M.V.A
            </p>
            <p className="text-white/40 text-[9px] tracking-wider uppercase">
              Le invita a
            </p>
          </div>

          <ElegantDividerCompact />

          {/* Event title */}
          <div className="text-center mb-3 flex-shrink-0">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Georgia, serif' }}>
              {convencion.titulo}
            </h3>
            
            {/* Badge */}
            <Badge className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[10px]">
              <Ticket className="w-2.5 h-2.5 mr-1" />
              Inscripción Abierta
            </Badge>
          </div>

          <ElegantDividerCompact />

          {/* Event details - Compact */}
          <div className="space-y-2 mb-4 flex-grow">
            {/* Date */}
            <div className="flex items-center gap-2 justify-center">
              <Calendar className="w-4 h-4 text-amber-400/70" />
              <span className="text-sm text-white/80" style={{ fontFamily: 'Georgia, serif' }}>
                {fechaFormateada}
              </span>
            </div>
            
            {/* Location */}
            <div className="flex items-center gap-2 justify-center">
              <MapPin className="w-4 h-4 text-amber-400/70" />
              <span className="text-sm text-white/80" style={{ fontFamily: 'Georgia, serif' }}>
                {convencion.ubicacion}
              </span>
            </div>

            {/* Price - if exists */}
            {convencion.costo && Number(convencion.costo) > 0 && (
              <div className="text-center pt-2 mt-2 border-t border-amber-500/20">
                <p className="text-amber-400/50 text-[9px] tracking-wider uppercase">Inversión</p>
                <div className="text-xl font-bold bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
                  ${Number(convencion.costo).toLocaleString('es-AR')}
                  <span className="text-xs ml-0.5 text-amber-400/50">ARS</span>
                </div>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <Button
            className="w-full h-10 text-sm bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:via-yellow-400 hover:to-amber-400 text-slate-900 font-semibold border-0 shadow-md shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300 rounded-lg"
            onClick={() => {
              const inscripcionSection = document.getElementById('inscripcion')
              if (inscripcionSection) {
                inscripcionSection.scrollIntoView({ behavior: 'smooth' })
              }
            }}
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            Confirmar Asistencia
          </Button>

          {/* Bottom seal */}
          <div className="flex justify-center mt-3">
            <div className="flex items-center gap-1.5 text-amber-500/30">
              <Star className="w-2 h-2" />
              <Star className="w-2.5 h-2.5" />
              <Star className="w-2 h-2" />
            </div>
          </div>
        </div>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
            style={{ transform: 'skewX(-20deg)' }}
          />
        </div>
      </div>
    </div>
  )
}

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
    return null
  }

  if (!convencion || convencion.activa === false) {
    return <ComingSoonAnnouncement />
  }

  const fechaConvencion = new Date(convencion.fechaInicio)
  const fechaFormateada = fechaConvencion.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <section
      id="convenciones"
      className={`relative py-16 sm:py-20 lg:py-24 overflow-hidden transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full blur-[120px] animate-blob" />
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
        <div className="text-center mb-10 lg:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm relative overflow-hidden">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-white/80 font-medium">Evento Especial</span>
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
            Próxima{' '}
            <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
              Convención
            </span>
          </h2>
          <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto">
            Únete a nosotros en un evento transformador
          </p>
        </div>

        {/* Horizontal Layout: Countdown + Invitation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto">
          {/* Countdown Section */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8 flex-grow flex flex-col justify-center">
              <CountdownTimer
                targetDate={fechaConvencion}
                title={convencion.titulo}
              />
            </div>
          </div>

          {/* Invitation Card */}
          <div className="lg:col-span-5">
            <HorizontalInvitationCard 
              convencion={convencion} 
              fechaFormateada={fechaFormateada}
            />
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-8 w-32 h-px bg-gradient-to-r from-amber-500/50 to-transparent" />
      <div className="absolute bottom-20 right-8 w-32 h-px bg-gradient-to-l from-orange-500/50 to-transparent" />
    </section>
  )
}
