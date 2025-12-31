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
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [scrollY, setScrollY] = useState(0)

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

  // Parallax effect al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById('sedes')
      if (!section) return

      const rect = section.getBoundingClientRect()
      const sectionTop = rect.top
      const sectionHeight = rect.height
      const windowHeight = window.innerHeight

      // Calcular posición de parallax (solo cuando la sección es visible)
      if (sectionTop < windowHeight && sectionTop > -sectionHeight) {
        const parallaxOffset = (windowHeight - sectionTop) * 0.1
        setScrollY(parallaxOffset)
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Pre-cargar imágenes adyacentes para transiciones suaves
  useEffect(() => {
    if (sedes.length === 0) return

    const preloadImages = () => {
      const nextIndex = (currentIndex + 1) % sedes.length
      const prevIndex = (currentIndex - 1 + sedes.length) % sedes.length

      const imagesToPreload = [
        sedes[nextIndex]?.imagenUrl,
        sedes[prevIndex]?.imagenUrl,
      ].filter(Boolean)

      imagesToPreload.forEach(src => {
        if (src && !src.includes('localhost')) {
          const img = new Image()
          img.src = src
        }
      })
    }

    preloadImages()
  }, [currentIndex, sedes])

  // Resetear índice si cambia el número de sedes
  useEffect(() => {
    if (sedes.length > 0 && currentIndex >= sedes.length) {
      setCurrentIndex(0)
    }
  }, [sedes.length, currentIndex])

  const nextSlide = () => {
    if (sedes.length === 0 || isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex(prev => (prev + 1) % sedes.length)
    setTimeout(() => setIsTransitioning(false), 600)
  }

  const prevSlide = () => {
    if (sedes.length === 0 || isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex(prev => (prev - 1 + sedes.length) % sedes.length)
    setTimeout(() => setIsTransitioning(false), 600)
  }

  const goToSlide = (index: number) => {
    if (index >= 0 && index < sedes.length && !isTransitioning && index !== currentIndex) {
      setIsTransitioning(true)
      setCurrentIndex(index)
      setTimeout(() => setIsTransitioning(false), 600)
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

        {/* Carousel modernizado - Diseño compacto y profesional */}
        <div className="relative max-w-5xl mx-auto">
          <div className="relative rounded-xl overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl group">
            <div className="relative min-h-[450px] sm:min-h-[500px] bg-[#0d1f35] grid md:grid-cols-2 gap-0">
              {/* Image Container - Lado izquierdo, compacto */}
              <div
                className="relative min-h-[250px] sm:min-h-[300px] md:min-h-full overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0d1f35] to-[#0a1628]"
                style={{
                  transform: `translateY(${scrollY * 0.15}px)`,
                  willChange: 'transform',
                }}
              >
                {/* Imagen completa sin recortes */}
                <div
                  className="absolute inset-0 transition-opacity duration-500 ease-in-out flex items-center justify-center p-6"
                  style={{
                    opacity: isTransitioning ? 0.6 : 1,
                  }}
                >
                  <ImageWithSkeleton
                    src={currentSede.imagenUrl || '/placeholder.svg'}
                    alt={`${currentSede.pais} - ${currentSede.ciudad}`}
                    className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg transition-transform duration-500 ease-out group-hover:scale-[1.01] shadow-2xl"
                  />
                </div>

                {/* Overlay sutil */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0a1628]/40 z-10 pointer-events-none" />
              </div>

              {/* Content Section - Lado derecho, compacto */}
              <div className="relative flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-br from-[#0a1628] to-[#0d1f35] border-l border-white/10 md:border-l md:border-t-0 border-t">
                {/* Header compacto */}
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl sm:text-5xl flex-shrink-0">{currentSede.bandera}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1.5 leading-tight">
                        {currentSede.pais}
                      </h3>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-400/25 backdrop-blur-sm w-fit">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="text-white/90 font-medium text-sm">{currentSede.ciudad}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Descripción compacta */}
                  <p className="text-sm sm:text-base text-white/75 leading-relaxed line-clamp-4">
                    {currentSede.descripcion}
                  </p>
                </div>

                {/* Footer con indicador */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex gap-1.5">
                    {sedes.map((sede: Sede, index: number) => (
                      <button
                        key={sede.id}
                        onClick={() => goToSlide(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex
                          ? 'bg-emerald-400 w-6'
                          : 'bg-white/20 hover:bg-white/40 w-1.5'
                          }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-white/40 font-medium">
                    {currentIndex + 1} / {sedes.length}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons - Más compactos */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 h-10 w-10 transition-all duration-300 z-20 shadow-lg"
                onClick={prevSlide}
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 h-10 w-10 transition-all duration-300 z-20 shadow-lg"
                onClick={nextSlide}
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </Button>
            </div>
          </div>

          {/* Country Pills - Compacto y profesional */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {sedes.map((sede: Sede, index: number) => (
              <button
                key={sede.id}
                onClick={() => goToSlide(index)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${index === currentIndex
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80 border border-white/10'
                  }`}
              >
                <span className="text-lg">{sede.bandera}</span>
                <span>{sede.pais}</span>
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
