'use client'

import { useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { toast } from 'sonner'
import { HeroSection } from '@/components/hero-section'
import { MarqueeTicker } from '@/components/marquee-ticker'
import { SedesSection } from '@/components/sedes-section'
import { AboutSection } from '@/components/about-section'
import { LeadershipSection } from '@/components/leadership-section'
import { NewsSection } from '@/components/news-section'
import { ConventionsSection } from '@/components/conventions-section'
import { GallerySection } from '@/components/gallery-section'
import { EducacionSection } from '@/components/educacion-section'
import { Footer } from '@/components/footer'
import { ScrollReveal } from '@/components/scroll-reveal'
import { ScrollProgress } from '@/components/scroll-progress'
import { FloatingCTA } from '@/components/floating-cta'
import { QueryProvider } from '@/lib/providers/query-provider'
import { restoreScrollPosition } from '@/lib/utils/scroll-restore'

function InscripcionSuccessHandler() {
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return

    // Mostrar mensaje de éxito si viene de una inscripción exitosa
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('inscripcion') === 'exito') {
      toast.success('¡Inscripción exitosa!', {
        description: 'Tu inscripción ha sido registrada correctamente. Te contactaremos pronto.',
        duration: 5000,
      })

      // Limpiar el parámetro de la URL sin recargar la página
      const url = new URL(window.location.href)
      url.searchParams.delete('inscripcion')
      window.history.replaceState({}, '', url.toString())
    }
  }, [])

  return null
}

function HomePageContent() {
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return

    // Al recargar la página, SIEMPRE comenzar en el inicio
    // Esto previene el scroll automático a cualquier sección (directiva, convenciones, etc.)
    const ensureScrollToTop = () => {
      // Limpiar cualquier posición de scroll guardada
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('amva_last_section')
      }

      // Limpiar hash de la URL para prevenir scroll automático del navegador
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      }

      // Forzar scroll al inicio
      window.scrollTo(0, 0)
    }

    // Ejecutar inmediatamente
    ensureScrollToTop()

    // También asegurar después de que el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(ensureScrollToTop, 100)
      })
    } else {
      setTimeout(ensureScrollToTop, 100)
    }

    // Y después de que la página se cargue completamente
    window.addEventListener('load', () => {
      setTimeout(ensureScrollToTop, 100)
    }, { once: true })

    // Cleanup
    return () => {
      window.removeEventListener('load', ensureScrollToTop)
    }
  }, [])

  return (
    <div
      className="min-h-screen bg-[#0a1628] text-white"
      style={{
        colorScheme: 'dark',
      }}
    >
      <ScrollProgress />
      <FloatingCTA />
      <main>
        <Navbar />
        <div id="inicio">
          <HeroSection />
        </div>
        <MarqueeTicker />
        <div id="sedes">
          <ScrollReveal>
            <SedesSection />
          </ScrollReveal>
        </div>
        <div id="mision">
          <ScrollReveal delay={100}>
            <AboutSection />
          </ScrollReveal>
        </div>
        <div id="directiva">
          <ScrollReveal delay={100}>
            <LeadershipSection />
          </ScrollReveal>
        </div>
        <div id="noticias">
          <ScrollReveal delay={100}>
            <NewsSection />
          </ScrollReveal>
        </div>
        <div id="convenciones">
          <ScrollReveal delay={100}>
            <ConventionsSection />
          </ScrollReveal>
        </div>
        <div id="galeria">
          <ScrollReveal delay={100}>
            <GallerySection />
          </ScrollReveal>
        </div>
        <div id="educacion">
          <ScrollReveal delay={100}>
            <EducacionSection />
          </ScrollReveal>
        </div>
        <Footer />
      </main>
    </div>
  )
}

export default function HomePage() {
  // Agregar error boundary para capturar errores del cliente
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      console.error('[HomePage] Error capturado:', event.error)
    })

    window.addEventListener('unhandledrejection', (event) => {
      console.error('[HomePage] Promise rechazada:', event.reason)
    })
  }

  return (
    <QueryProvider>
      <InscripcionSuccessHandler />
      <HomePageContent />
    </QueryProvider>
  )
}
