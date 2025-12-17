'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { TypingEffect } from './typing-effect'
import { useEffect, useState, useRef } from 'react'

export function HeroSection() {
  const [scrollY, setScrollY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const [isClient, setIsClient] = useState(false)
  const [isAnimated, setIsAnimated] = useState(false)
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    let scrollTicking = false
    let mouseTicking = false
    let rafId: number | null = null

    const handleScroll = () => {
      if (!scrollTicking) {
        rafId = window.requestAnimationFrame(() => {
          setScrollY(window.scrollY)
          scrollTicking = false
        })
        scrollTicking = true
      }
    }

    // Throttle mousemove para mejor rendimiento
    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseTicking && heroRef.current) {
        rafId = window.requestAnimationFrame(() => {
          const rect = heroRef.current?.getBoundingClientRect()
          if (rect) {
            setMousePosition({
              x: ((e.clientX - rect.left) / rect.width) * 100,
              y: ((e.clientY - rect.top) / rect.height) * 100,
            })
          }
          mouseTicking = false
        })
        mouseTicking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [isClient])

  // Calcular valores de parallax y opacity de forma suave
  // Cuando scrollY es 0, el mundo debe estar en su posición inicial
  const parallaxY = scrollY * 0.4
  const opacity = scrollY === 0 ? 0.85 : Math.max(1 - scrollY / 600, 0.2)

  // Limitar el scale para evitar deformaciones extremas
  // Cuando scrollY es 0, mantener scale en 1
  const scaleValue = scrollY === 0 ? 1 : Math.min(1 + scrollY * 0.0002, 1.1)

  return (
    <section
      ref={heroRef}
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Fondo base con gradiente mesh animado */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#0a1628]" />

        {/* Aurora/Mesh gradient effect - optimizado con useMemo implícito */}
        <div
          className="absolute inset-0 opacity-85"
          style={{
            background: `
              radial-gradient(ellipse 70% 45% at ${mousePosition.x}% ${mousePosition.y}%, rgba(56, 189, 248, 0.3) 0%, transparent 55%),
              radial-gradient(ellipse 50% 35% at 20% 80%, rgba(16, 185, 129, 0.25) 0%, transparent 55%),
              radial-gradient(ellipse 45% 50% at 80% 20%, rgba(34, 211, 238, 0.2) 0%, transparent 55%),
              radial-gradient(ellipse 35% 35% at 50% 50%, rgba(52, 211, 153, 0.18) 0%, transparent 55%)
            `,
            transition: 'background 0.2s ease-out',
            willChange: 'background',
          }}
        />

        {/* Animated gradient orbs - colores más vibrantes */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-sky-400/25 rounded-full blur-[120px] animate-blob" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-emerald-400/30 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-teal-400/20 rounded-full blur-[120px] animate-blob animation-delay-4000" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 z-[1] opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Noise texture */}
      <div
        className="absolute inset-0 z-[2] opacity-[0.015] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Imagen del mundo con parallax y seguimiento del cursor - MEJORADO */}
      <div
        className="absolute inset-0 z-[2] flex items-center justify-center"
        style={{
          transform: `translateY(${parallaxY * 0.5}px)`,
          opacity: Math.max(opacity * 0.85, 0.5),
          willChange: 'transform, opacity',
        }}
      >
        <div
          className={`relative w-[700px] h-[700px] md:w-[900px] md:h-[900px] lg:w-[1000px] lg:h-[1000px] transition-transform duration-300 ease-out ${!isAnimated ? 'animate-world-entry' : ''}`}
          style={{
            transform: isClient && isAnimated
              ? `
                  translateX(${(mousePosition.x - 50) * 0.25}px)
                  translateY(${(mousePosition.y - 50) * 0.25}px)
                  scale(${scaleValue})
                `
              : 'none',
            transformStyle: 'preserve-3d',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
          }}
          onAnimationEnd={() => {
            // Después de que termine la animación CSS, activar el estado para usar transformaciones del mouse
            if (!isAnimated) {
              setIsAnimated(true)
            }
          }}
        >
          {/* Glow base layer - optimizado */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-400/15 via-emerald-400/12 to-teal-400/15 blur-[80px] opacity-50" />

          {/* Glow ring that follows mouse - optimizado con menor blur */}
          <div
            className="absolute inset-0 rounded-full blur-[90px] pointer-events-none"
            style={{
              background: isClient
                ? `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(56, 189, 248, 0.3) 0%, transparent 65%),
                   radial-gradient(circle at ${100 - mousePosition.x}% ${100 - mousePosition.y}%, rgba(16, 185, 129, 0.25) 0%, transparent 65%)`
                : 'radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, transparent 50%)',
            }}
          />

          {/* Imagen principal con efecto de flotación - MEJORADA */}
          <img
            src="/mundo.png"
            alt="Asociación Misionera Vida Abundante"
            className={`w-full h-full object-contain ${isAnimated ? 'animate-float' : ''}`}
            style={{
              filter: `
                drop-shadow(0 0 60px rgba(56, 189, 248, 0.4))
                drop-shadow(0 0 120px rgba(16, 185, 129, 0.3))
                brightness(1.05)
              `,
              willChange: isAnimated ? 'transform' : 'auto',
              backfaceVisibility: 'hidden',
              imageRendering: 'auto',
              opacity: 1,
            }}
            draggable={false}
          />

          {/* Outer glow ring - optimizado */}
          <div className="absolute -inset-16 rounded-full bg-gradient-to-r from-sky-500/8 via-emerald-500/6 to-teal-500/8 blur-[70px] opacity-40" />
        </div>
      </div>

      {/* Spotlight que sigue el cursor */}
      {isClient && (
        <div
          className="absolute inset-0 z-[3] pointer-events-none opacity-30"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.05), transparent 40%)`,
          }}
        />
      )}

      {/* Overlay oscuro para mejorar contraste del texto */}
      <div className="absolute inset-0 z-[4] bg-gradient-to-b from-[#0a1628]/60 via-transparent to-[#0a1628]/80 pointer-events-none" />

      {/* Contenido principal */}
      <div className="container mx-auto px-4 z-[5] text-center relative">
        {/* Badge con shimmer effect - colores de marca */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-gradient-to-r from-sky-500/10 to-emerald-500/10 border border-sky-400/20 backdrop-blur-sm animate-fade-in-up"
          style={{ animationDelay: '0s' }}
        >
          <Sparkles className="w-4 h-4 text-sky-300" />
          <span className="text-sm text-white/90 font-medium">Transformando vidas desde 1989</span>
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent" />
          </div>
        </div>

        {/* Título principal con gradient text - mejor contraste */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
            <span className="block text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] drop-shadow-[0_0_30px_rgba(56,189,248,0.4)]">
              Llevando Vida
            </span>
            <span className="block mt-2 bg-gradient-to-r from-sky-300 via-emerald-300 to-teal-300 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] drop-shadow-[0_0_40px_rgba(16,185,129,0.5)]">
              Abundante
            </span>
            <span className="block text-3xl sm:text-4xl md:text-5xl mt-4 font-light text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] drop-shadow-[0_0_25px_rgba(34,211,238,0.3)]">
              al Mundo
            </span>
          </h1>
        </div>

        {/* Subtítulo - mejor contraste con color destacado */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-lg sm:text-xl md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed font-light drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
            <span className="bg-gradient-to-r from-sky-300 via-emerald-300 to-teal-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <TypingEffect
                text="Formando pastores y líderes para transformar naciones a través del poder del evangelio"
                speed={40}
              />
            </span>
          </p>
        </div>

        {/* Botones con efectos modernos */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up"
          style={{ animationDelay: '0.5s' }}
        >
          {/* Botón principal con glow - usando colores de marca */}
          <Button
            asChild
            size="lg"
            className="group relative px-8 py-6 text-lg bg-gradient-to-r from-sky-500/20 to-emerald-500/20 backdrop-blur-md border border-sky-400/30 text-white hover:from-sky-500/30 hover:to-emerald-500/30 hover:border-sky-400/50 shadow-[0_0_40px_rgba(56,189,248,0.2)] hover:shadow-[0_0_60px_rgba(56,189,248,0.4)] transition-all duration-500 hover:scale-105"
          >
            <Link href="#convenciones">
              <span className="relative z-10 flex items-center gap-2">
                Ver Convenciones
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Link>
          </Button>

          {/* Botón secundario glassmorphism - con acento de marca */}
          <Button
            asChild
            size="lg"
            variant="outline"
            className="px-8 py-6 text-lg bg-white/5 backdrop-blur-md border border-emerald-400/30 text-white hover:bg-emerald-500/10 hover:border-emerald-400/50 transition-all duration-500 hover:scale-105"
          >
            <Link href="#nosotros">Conocer Más</Link>
          </Button>
        </div>

      </div>

      {/* Scroll indicator mejorado */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-xs text-white/40 uppercase tracking-widest">Scroll</span>
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-2">
          <div className="w-1 h-2 bg-white/60 rounded-full animate-scroll-down" />
        </div>
      </div>

      {/* Líneas decorativas en esquinas */}
      <div className="absolute top-20 left-8 w-20 h-px bg-gradient-to-r from-white/20 to-transparent" />
      <div className="absolute top-20 left-8 w-px h-20 bg-gradient-to-b from-white/20 to-transparent" />
      <div className="absolute bottom-20 right-8 w-20 h-px bg-gradient-to-l from-white/20 to-transparent" />
      <div className="absolute bottom-20 right-8 w-px h-20 bg-gradient-to-t from-white/20 to-transparent" />
    </section>
  )
}
