'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageWithSkeleton } from './image-with-skeleton'
import { useSedesLanding } from '@/lib/hooks/use-sedes-landing'
import type { Sede } from '@/lib/api/sedes'

export function SedesSection() {
  const { data: sedes = [], isLoading } = useSedesLanding()
  const [currentIndex, setCurrentIndex] = useState(0)
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

  // Resetear índice si cambia el número de sedes
  useEffect(() => {
    if (sedes.length > 0 && currentIndex >= sedes.length) {
      setCurrentIndex(0)
    }
  }, [sedes.length, currentIndex])

  const nextSlide = () => {
    if (sedes.length === 0) return
    setCurrentIndex(prev => (prev + 1) % sedes.length)
  }

  const prevSlide = () => {
    if (sedes.length === 0) return
    setCurrentIndex(prev => (prev - 1 + sedes.length) % sedes.length)
  }

  const goToSlide = (index: number) => {
    if (index >= 0 && index < sedes.length) {
      setCurrentIndex(index)
    }
  }

  // Si no hay sedes, no mostrar la sección
  if (isLoading || sedes.length === 0) {
    return null
  }

  const currentSede = sedes[currentIndex]

  return (
    <section id="sedes" className="relative py-24 overflow-hidden">
      {/* Fondo con gradiente mesh */}
      <div className="absolute inset-0 bg-[#0d1f35]">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: `
              radial-gradient(ellipse 60% 40% at ${mousePosition.x}% ${mousePosition.y}%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse 50% 50% at 80% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)
            `,
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
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
        {/* Header con badge */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-white/80 font-medium">Presencia Global</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Nuestras{' '}
            <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
              Sedes
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Presencia misionera en múltiples países, llevando el mensaje de vida abundante a todas
            las naciones
          </p>
        </div>

        {/* Carousel modernizado */}
        <div className="relative max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="relative h-[450px] sm:h-[500px] md:h-[550px]">
              {/* Image */}
              <div className="absolute inset-0">
                <ImageWithSkeleton
                  src={currentSede.imagenUrl || '/placeholder.svg'}
                  alt={`${currentSede.pais} - ${currentSede.ciudad}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/60 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-12">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{currentSede.bandera}</span>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span className="text-white/90 font-medium">{currentSede.ciudad}</span>
                  </div>
                </div>
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                  {currentSede.pais}
                </h3>
                <p className="text-base sm:text-lg text-white/70 max-w-xl leading-relaxed">
                  {currentSede.descripcion}
                </p>
              </div>

              {/* Navigation Buttons */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 h-12 w-12 transition-all duration-300"
                onClick={prevSlide}
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 h-12 w-12 transition-all duration-300"
                onClick={nextSlide}
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </Button>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {sedes.map((sede: Sede, index: number) => (
              <button
                key={sede.id}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-emerald-400 w-8'
                    : 'bg-white/20 hover:bg-white/40 w-2'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Country Pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {sedes.map((sede: Sede, index: number) => (
              <button
                key={sede.id}
                onClick={() => goToSlide(index)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  index === currentIndex
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }`}
              >
                <span>{sede.bandera}</span>
                {sede.pais}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-8 w-32 h-px bg-gradient-to-r from-emerald-500/50 to-transparent" />
      <div className="absolute bottom-20 right-8 w-32 h-px bg-gradient-to-l from-amber-500/50 to-transparent" />
    </section>
  )
}
