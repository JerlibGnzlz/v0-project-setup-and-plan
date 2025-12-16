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

    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY)
          ticking = false
        })
        ticking = true
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        })
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isClient])

  const parallaxY = scrollY * 0.4
  const opacity = Math.max(1 - scrollY / 600, 0.2)

  // Limitar el scale para evitar deformaciones extremas
  const scaleValue = Math.min(1 + scrollY * 0.0002, 1.1)

  return (
    <section
      ref={heroRef}
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Fondo base con gradiente mesh animado */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#0a1628]" />

        {/* Aurora/Mesh gradient effect */}
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 20% 80%, rgba(16, 185, 129, 0.25) 0%, transparent 50%),
              radial-gradient(ellipse 50% 60% at 80% 20%, rgba(245, 158, 11, 0.2) 0%, transparent 50%),
              radial-gradient(ellipse 40% 40% at 50% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)
            `,
            transition: 'background 0.3s ease-out',
          }}
        />

        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-amber-500/15 rounded-full blur-[100px] animate-blob animation-delay-4000" />
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

      {/* Imagen del mundo con parallax y seguimiento del cursor */}
      <div
        className="absolute inset-0 z-[3] flex items-center justify-center"
        style={{
          transform: `translateY(${parallaxY}px)`,
          opacity: opacity,
          willChange: 'transform, opacity',
        }}
      >
        <div
          className={`relative w-[600px] h-[600px] md:w-[800px] md:h-[800px] transition-transform duration-300 ease-out ${!isAnimated ? 'animate-world-entry' : ''}`}
          style={{
            transform: isClient && isAnimated
              ? `
                  perspective(1000px)
                  rotateY(${(mousePosition.x - 50) * 0.15}deg)
                  rotateX(${(50 - mousePosition.y) * 0.15}deg)
                  translateX(${(mousePosition.x - 50) * 0.3}px)
                  translateY(${(mousePosition.y - 50) * 0.3}px)
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
          {/* Imagen principal con efecto de flotación */}
          <img
            src="/mundo.png"
            alt="Asociación Misionera Vida Abundante"
            className={`w-full h-full object-contain drop-shadow-[0_0_80px_rgba(59,130,246,0.3)] ${isAnimated ? 'animate-float' : ''}`}
            style={{
              filter: `
                drop-shadow(0 0 60px rgba(59, 130, 246, 0.3))
                drop-shadow(0 0 120px rgba(16, 185, 129, 0.2))
              `,
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              imageRendering: 'crisp-edges',
              opacity: isAnimated ? 1 : 0,
              transition: 'opacity 0.5s ease-out 1s',
            }}
            draggable={false}
          />

          {/* Glow ring that follows mouse */}
          <div
            className="absolute inset-0 rounded-full blur-3xl animate-spin-slow pointer-events-none"
            style={{
              background: isClient
                ? `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
                   radial-gradient(circle at ${100 - mousePosition.x}% ${100 - mousePosition.y}%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)`
                : 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
            }}
          />

          {/* Secondary glow layer */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 via-transparent to-emerald-500/10 blur-3xl opacity-50" />
        </div>
      </div>

      {/* Spotlight que sigue el cursor */}
      {isClient && (
        <div
          className="absolute inset-0 z-[4] pointer-events-none opacity-40"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.06), transparent 40%)`,
          }}
        />
      )}

      {/* Contenido principal */}
      <div className="container mx-auto px-4 z-10 text-center relative">
        {/* Badge con shimmer effect */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-fade-in-up"
          style={{ animationDelay: '0s' }}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-white/80 font-medium">Transformando vidas desde 1995</span>
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </div>

        {/* Título principal con gradient text */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
            <span className="block text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Llevando Vida
            </span>
            <span
              className="block mt-2 bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-2xl"
              style={{
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 40px rgba(245, 158, 11, 0.4))',
              }}
            >
              Abundante
            </span>
            <span className="block text-3xl sm:text-4xl md:text-5xl mt-4 font-light text-white/70">
              al Mundo
            </span>
          </h1>
        </div>

        {/* Subtítulo */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-lg sm:text-xl md:text-2xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            <TypingEffect
              text="Formando pastores y líderes para transformar naciones a través del poder del evangelio"
              speed={40}
            />
          </p>
        </div>

        {/* Botones con efectos modernos */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up"
          style={{ animationDelay: '0.5s' }}
        >
          {/* Botón principal con glow */}
          <Button
            asChild
            size="lg"
            className="group relative px-8 py-6 text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white border-0 shadow-[0_0_40px_rgba(245,158,11,0.3)] hover:shadow-[0_0_60px_rgba(245,158,11,0.5)] transition-all duration-500 hover:scale-105"
          >
            <Link href="#convenciones">
              <span className="relative z-10 flex items-center gap-2">
                Ver Convenciones
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Link>
          </Button>

          {/* Botón secundario glassmorphism */}
          <Button
            asChild
            size="lg"
            variant="outline"
            className="px-8 py-6 text-lg bg-white/5 backdrop-blur-md border border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-500 hover:scale-105"
          >
            <Link href="#nosotros">Conocer Más</Link>
          </Button>
        </div>

        {/* Stats badges */}
        <div
          className="flex flex-wrap justify-center gap-6 mt-16 animate-fade-in-up"
          style={{ animationDelay: '0.7s' }}
        >
          {[
            { number: '30+', label: 'Años de servicio' },
            { number: '500+', label: 'Pastores formados' },
            { number: '15+', label: 'Países alcanzados' },
          ].map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <span className="text-2xl md:text-3xl font-bold text-white">{stat.number}</span>
              <span className="text-xs md:text-sm text-white/60">{stat.label}</span>
            </div>
          ))}
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
