'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { TypingEffect } from './typing-effect'
import { useEffect, useState } from 'react'

// Generar partículas una sola vez (fuera del componente)
const generateParticles = () => {
  return Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    width: Math.random() * 6 + 2,
    height: Math.random() * 6 + 2,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5,
  }))
}

export function HeroSection() {
  const [scrollY, setScrollY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [particles, setParticles] = useState<ReturnType<typeof generateParticles>>([])
  const [isClient, setIsClient] = useState(false)

  // Generar partículas solo en cliente después de montar
  useEffect(() => {
    setIsClient(true)
    setParticles(generateParticles())
  }, [])

  useEffect(() => {
    if (!isClient) return

    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isClient])

  const blurAmount = Math.min(scrollY / 100, 10)
  const opacity = Math.max(1 - scrollY / 500, 0.3)

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-green-600/20 to-amber-700/20 animate-gradient-shift" />
      </div>

      <div
        className="absolute inset-0 z-0 transition-all duration-300"
        style={{
          transform: `translateY(${scrollY * 0.5}px) translateX(${mousePosition.x}px) translateZ(0)`,
          filter: `blur(${blurAmount}px)`,
          opacity: opacity,
        }}
      >
        <img
          src="/global-missionary-work-diverse-people-praying-toge.jpg"
          alt="Missionary work"
          className="w-full h-full object-cover scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/70 to-background" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/30 via-transparent to-green-900/30 animate-pulse-slow" />
      </div>

      {/* Partículas flotantes - Solo renderiza en cliente */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
        {isClient &&
          particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full bg-white/10 backdrop-blur-sm"
              style={{
                width: `${particle.width}px`,
                height: `${particle.height}px`,
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animation: `float ${particle.duration}s linear infinite`,
                animationDelay: `${particle.delay}s`,
              }}
            />
          ))}
      </div>

      <div className="container mx-auto px-4 z-10 text-center">
        <div className="animate-fade-in-up">
          <h1
            className="text-5xl md:text-7xl font-bold text-white mb-6 text-balance drop-shadow-2xl animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            <span className="inline-block hover:scale-105 transition-transform duration-300">
              Llevando Vida Abundante
            </span>
            <span className="block text-accent mt-2 [text-shadow:_0_0_30px_rgb(217_119_6_/_50%)] animate-glow">
              al Mundo
            </span>
          </h1>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto text-pretty leading-relaxed min-h-[4rem] drop-shadow-lg">
            <TypingEffect
              text="Formando pastores y líderes para transformar naciones a través del poder del evangelio"
              speed={50}
            />
          </p>
        </div>

        <div
          className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up"
          style={{ animationDelay: '0.5s' }}
        >
          <Button
            asChild
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:[box-shadow:_0_0_40px_rgb(217_119_6_/_50%)]"
          >
            <Link href="#convenciones">
              Ver Convenciones <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/30 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <Link href="#nosotros">Conocer Más</Link>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-scroll-down" />
        </div>
      </div>
    </section>
  )
}