'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FloatingCTAProps {
  /** Si es false, no se muestra el botón (ej. cuando no hay convención activa). Default true. */
  enabled?: boolean
}

export function FloatingCTA({ enabled = true }: FloatingCTAProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isNearFooter, setIsNearFooter] = useState(false)

  if (!enabled) return null

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // Ocultar en el hero (primeros 600px)
      if (scrollY < 600) {
        setIsVisible(false)
        setIsNearFooter(false)
        return
      }

      // Mostrar después del hero
      setIsVisible(true)

      // Detectar si está cerca del footer (últimos 300px del documento)
      const distanceFromBottom = documentHeight - (scrollY + windowHeight)
      if (distanceFromBottom < 300) {
        setIsNearFooter(true)
      } else {
        setIsNearFooter(false)
      }
    }

    toggleVisibility()
    window.addEventListener('scroll', toggleVisibility, { passive: true })

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  const scrollToConvenciones = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    // Guardar la sección activa
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('amva_last_section', 'convenciones')
    }

    const element = document.getElementById('convenciones')
    if (element) {
      const offsetTop = element.offsetTop - 80
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      })
    }
  }

  return (
    <Link
      href="#convenciones"
      onClick={scrollToConvenciones}
      className={`fixed bottom-8 left-4 sm:left-8 z-50 transition-all duration-500 ease-out ${isVisible
          ? 'opacity-100 translate-x-0 translate-y-0'
          : 'opacity-0 -translate-x-16 pointer-events-none'
        } ${isNearFooter ? 'translate-y-0' : ''}`}
      aria-label="Inscribirse en convención"
    >
      <Button
        className="group relative h-auto px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 border-0 transition-all duration-300 hover:scale-105"
      >
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300 -z-10" />

        {/* Shimmer effect */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative flex items-center gap-2 sm:gap-3">
          {/* Icon badge */}
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-lg sm:rounded-xl blur-md group-hover:blur-lg transition-all duration-300" />
            <div className="relative p-1.5 sm:p-2 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/20 group-hover:bg-white/20 transition-colors duration-300">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col items-start">
            <span className="text-xs sm:text-sm font-bold text-white leading-tight whitespace-nowrap">
              Inscribirse
            </span>
            <span className="text-[10px] sm:text-xs text-white/80 leading-tight hidden sm:block whitespace-nowrap">
              en Convención
            </span>
          </div>

          {/* Arrow icon */}
          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" />

          {/* Sparkles decoration */}
          <Sparkles className="absolute -top-1 -right-1 h-2.5 w-2.5 sm:h-3 sm:w-3 text-amber-300 opacity-70 animate-pulse" />
        </div>
      </Button>
    </Link>
  )
}

