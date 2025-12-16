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

    // Asegurar que la página comience en el inicio al recargar
    // Solo restaurar scroll si hay un hash explícito en la URL (navegación directa)
    // NO restaurar al recargar sin hash
    if (!window.location.hash) {
      // Si no hay hash, asegurar que estamos en el inicio
      window.scrollTo(0, 0)
      
      // Limpiar cualquier posición de scroll guardada al recargar
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('amva_last_section')
      }
      return
    }

    // Solo restaurar si hay hash en la URL
    const restore = () => {
      try {
        // Esperar a que Next.js termine de hidratar
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
              try {
                restoreScrollPosition()
              } catch (error) {
                console.warn('Error restaurando scroll position:', error)
              }
            }, 300)
          })
        } else {
          setTimeout(() => {
            try {
              restoreScrollPosition()
            } catch (error) {
              console.warn('Error restaurando scroll position:', error)
            }
          }, 300)
        }
      } catch (error) {
        console.warn('Error en restore scroll:', error)
      }
    }

    restore()

    // También escuchar cuando la página se carga completamente (solo si hay hash)
    const handleLoad = () => {
      if (window.location.hash) {
        setTimeout(() => {
          try {
            restoreScrollPosition()
          } catch (error) {
            console.warn('Error restaurando scroll position en load:', error)
          }
        }, 200)
      }
    }

    window.addEventListener('load', handleLoad)

    // Cleanup
    return () => {
      window.removeEventListener('load', handleLoad)
    }
  }, [])

  return (
    <div
      className="min-h-screen bg-[#0a1628] text-white"
      style={{
        colorScheme: 'dark',
      }}
    >
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
