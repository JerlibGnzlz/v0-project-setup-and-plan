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

// Horizontal Invitation Card Component - Premium Design
function HorizontalInvitationCard({ 
  convencion, 
  fechaFormateada 
}: { 
  convencion: any
  fechaFormateada: string 
}) {
  return (
    <div className="relative group h-full">
      {/* Multi-layer glow effects */}
      <div className="absolute -inset-3 bg-gradient-to-r from-amber-500/30 via-yellow-400/20 to-amber-500/30 rounded-3xl blur-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-700 animate-pulse" />
      <div className="absolute -inset-1 bg-gradient-to-br from-amber-400/20 via-orange-500/15 to-amber-400/20 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
      
      {/* Card shadow with depth */}
      <div className="absolute inset-0 translate-y-3 translate-x-2 bg-gradient-to-br from-black/40 to-amber-900/20 rounded-2xl blur-xl" />
      
      {/* Main invitation card - Premium design */}
      <div 
        className="relative h-full rounded-2xl overflow-hidden transform transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:shadow-amber-500/30"
        style={{
          background: 'linear-gradient(165deg, #1e293b 0%, #0f172a 30%, #1e293b 70%, #0f172a 100%)',
          boxShadow: `
            inset 0 2px 4px rgba(255,255,255,0.05),
            inset 0 -2px 4px rgba(0,0,0,0.3),
            0 0 0 1px rgba(251,191,36,0.4),
            0 8px 32px rgba(0,0,0,0.4)
          `,
        }}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10 opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
        
        {/* Texture overlay - premium paper effect */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grain' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='25' cy='25' r='1' fill='%23fff' opacity='0.3'/%3E%3Ccircle cx='75' cy='75' r='1' fill='%23fff' opacity='0.3'/%3E%3Ccircle cx='50' cy='10' r='0.5' fill='%23fff' opacity='0.2'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grain)'/%3E%3C/svg%3E")`,
            backgroundSize: '100px 100px',
          }}
        />
        
        {/* Decorative corners - enhanced */}
        <DecorativeCorner position="top-left" />
        <DecorativeCorner position="top-right" />
        <DecorativeCorner position="bottom-left" />
        <DecorativeCorner position="bottom-right" />
        
        {/* Premium border frame with gradient */}
        <div className="absolute inset-2 rounded-xl pointer-events-none overflow-hidden">
          <div className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-amber-500/40 via-yellow-400/30 to-amber-500/40 rounded-xl" 
            style={{
              maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              WebkitMaskComposite: 'xor',
            }}
          />
        </div>
        
        {/* Ornamental top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
        
        {/* Content */}
        <div className="relative p-6 sm:p-8 h-full flex flex-col">
          {/* Header with logo - Premium */}
          <div className="text-center mb-4">
            {/* Premium Seal/Emblem */}
            <div className="relative inline-block mb-3">
              {/* Outer glow rings */}
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/30 via-yellow-400/20 to-amber-500/30 rounded-full blur-xl animate-pulse" />
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 via-yellow-400/15 to-amber-500/20 rounded-full blur-md" />
              
              {/* Main seal */}
              <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-500/30 via-amber-600/20 to-amber-700/10 border-2 border-amber-500/50 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
                <Image
                  src="/mundo.png"
                  alt="AMVA"
                  width={48}
                  height={48}
                  className="object-contain relative z-10 drop-shadow-lg"
                />
              </div>
              
              {/* Decorative rings */}
              <div className="absolute -inset-1 border border-amber-500/20 rounded-full" />
            </div>
            
            {/* Organization name - Premium typography */}
            <div className="space-y-1">
              <p className="text-amber-300/90 text-xs tracking-[0.3em] uppercase font-bold letter-spacing-wider">
                A.M.V.A
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-500/40" />
                <p className="text-white/50 text-[10px] tracking-[0.15em] uppercase font-medium">
                  Le invita cordialmente
                </p>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-500/40" />
              </div>
            </div>
          </div>

          {/* Elegant divider - Enhanced */}
          <div className="flex items-center justify-center gap-3 my-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/50 to-amber-500/30" />
            <div className="relative">
              <Star className="w-3 h-3 text-amber-400/60 fill-amber-400/20" />
              <div className="absolute inset-0 animate-ping">
                <Star className="w-3 h-3 text-amber-400/30" />
              </div>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-500/50 to-amber-500/30" />
          </div>

          {/* Event title - Premium */}
          <div className="text-center mb-4 flex-shrink-0">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 leading-tight" 
              style={{ 
                fontFamily: 'Georgia, serif',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              {convencion.titulo}
            </h3>
            
            {/* Premium Badge */}
            <Badge className="bg-gradient-to-r from-amber-500/30 via-yellow-500/25 to-orange-500/30 text-amber-200 border border-amber-400/40 px-3 py-1 text-xs font-semibold shadow-lg shadow-amber-500/20 backdrop-blur-sm">
              <Ticket className="w-3 h-3 mr-1.5" />
              Inscripción Abierta
            </Badge>
          </div>

          {/* Elegant divider - Enhanced */}
          <div className="flex items-center justify-center gap-3 my-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/50 to-amber-500/30" />
            <div className="relative">
              <Star className="w-3 h-3 text-amber-400/60 fill-amber-400/20" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-500/50 to-amber-500/30" />
          </div>

          {/* Event details - Premium layout */}
          <div className="space-y-3 mb-6 flex-grow">
            {/* Date - Enhanced */}
            <div className="flex items-center gap-3 justify-center p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30">
                <Calendar className="w-5 h-5 text-amber-300" />
              </div>
              <span className="text-sm text-white/90 font-medium flex-1" style={{ fontFamily: 'Georgia, serif' }}>
                {fechaFormateada}
              </span>
            </div>
            
            {/* Location - Enhanced */}
            <div className="flex items-center gap-3 justify-center p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30">
                <MapPin className="w-5 h-5 text-amber-300" />
              </div>
              <span className="text-sm text-white/90 font-medium flex-1" style={{ fontFamily: 'Georgia, serif' }}>
                {convencion.ubicacion}
              </span>
            </div>

            {/* Price - Premium display */}
            {convencion.costo && Number(convencion.costo) > 0 && (
              <div className="text-center pt-3 mt-3 border-t border-amber-500/30">
                <p className="text-amber-400/60 text-[10px] tracking-[0.2em] uppercase font-semibold mb-2">Inversión</p>
                <div className="relative inline-block">
                  <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 via-yellow-400/15 to-amber-500/20 rounded-lg blur-md" />
                  <div className="relative text-2xl font-bold bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 bg-clip-text text-transparent">
                    ${Number(convencion.costo).toLocaleString('es-AR')}
                    <span className="text-sm ml-1 text-amber-400/70 font-normal">ARS</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Premium CTA Button */}
          <Button
            className="w-full h-12 text-base bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:via-yellow-400 hover:to-amber-400 text-slate-900 font-bold border-0 shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 rounded-xl relative overflow-hidden group/btn"
            onClick={() => {
              // Detectar si es dispositivo móvil para deep linking
              const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
              
              if (isMobile) {
                // Intentar abrir la app móvil con deep link
                const deepLink = `amva-app://convencion/${convencion.id}/inscripcion`
                
                // Intentar abrir la app
                window.location.href = deepLink
                
                // Si después de 1 segundo no se abrió la app, redirigir a página de inscripción
                setTimeout(() => {
                  window.location.href = '/convencion/inscripcion'
                }, 1000)
              } else {
                // Desktop: redirigir a página de inscripción
                window.location.href = '/convencion/inscripcion'
              }
            }}
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
            <Sparkles className="w-5 h-5 mr-2 relative z-10" />
            <span className="relative z-10">Confirmar Asistencia</span>
          </Button>

          {/* Premium bottom seal */}
          <div className="flex justify-center items-center gap-2 mt-4">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-500/30" />
            <div className="flex items-center gap-1.5 text-amber-500/40">
              <Star className="w-2.5 h-2.5 fill-amber-500/20" />
              <Star className="w-3 h-3 fill-amber-500/30" />
              <Star className="w-2.5 h-2.5 fill-amber-500/20" />
            </div>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-500/30" />
          </div>
        </div>

        {/* Premium shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden rounded-2xl">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
            style={{ transform: 'skewX(-25deg)' }}
          />
        </div>
        
        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 rounded-2xl border-2 border-amber-400/30 animate-pulse" />
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
