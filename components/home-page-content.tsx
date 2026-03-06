'use client'

import { useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { HeroSection } from '@/components/hero-section'
import { MarqueeTicker } from '@/components/marquee-ticker'
import { SedesSection } from '@/components/sedes-section'
import { AboutSection } from '@/components/about-section'
import { LeadershipSection } from '@/components/leadership-section'
import { NewsSection } from '@/components/news-section'
import { ConventionsSection } from '@/components/conventions-section'
import { GallerySection } from '@/components/gallery-section'
import { EducacionSection } from '@/components/educacion-section'
import { OfrendasSection } from '@/components/ofrendas-section'
import { Footer } from '@/components/footer'
import { ScrollReveal } from '@/components/scroll-reveal'
import { FloatingCTA } from '@/components/floating-cta'
import { MouseFollower } from '@/components/mouse-follower'
import { Calendar } from 'lucide-react'
import { useConvencionActiva, useConvenciones } from '@/lib/hooks/use-convencion'

/** Contenido debajo del hero: marquee, secciones y footer. Carga dinámica para hero visible de inmediato. */
export function HomePageBelowFold() {
  const { data: convencionActiva } = useConvencionActiva()
  const { data: convenciones } = useConvenciones()
  const hasActiveConvencion = Boolean(convencionActiva)
  const hasAnyConvencion = Boolean(convenciones?.length)
  const showConventionCtas = hasActiveConvencion || hasAnyConvencion

  useEffect(() => {
    if (typeof window === 'undefined') return
    const sectionIds = ['inicio', 'sedes', 'mision', 'directiva', 'noticias', 'convenciones', 'galeria', 'educacion', 'ofrendas']
    const scrollToSectionFromHash = () => {
      const hash = window.location.hash.replace('#', '').trim()
      if (!hash || !sectionIds.includes(hash)) return
      const el = document.getElementById(hash)
      if (el) {
        const offsetTop = el.getBoundingClientRect().top + window.scrollY - 80
        window.scrollTo({ top: offsetTop, behavior: 'smooth' })
      }
    }
    const ensureScrollToTop = () => {
      if (window.location.hash) {
        scrollToSectionFromHash()
        return
      }
      sessionStorage.removeItem('amva_last_section')
      window.scrollTo(0, 0)
    }
    if (window.location.hash) {
      const t1 = setTimeout(scrollToSectionFromHash, 100)
      const t2 = setTimeout(scrollToSectionFromHash, 500)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
    ensureScrollToTop()
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(ensureScrollToTop, 100))
    } else {
      setTimeout(ensureScrollToTop, 100)
    }
    window.addEventListener('load', () => setTimeout(ensureScrollToTop, 100), { once: true })
    return () => window.removeEventListener('load', ensureScrollToTop)
  }, [])

  return (
    <>
      {/* CTAs fuera del contenedor con animación para que position:fixed sea respecto al viewport y sigan visibles al hacer scroll */}
      <FloatingCTA enabled={showConventionCtas} />
      <MouseFollower
        enabled={showConventionCtas}
        showOnlyAfterScrollY={500}
        offsetX={20}
        offsetY={20}
        width={180}
        height={48}
        className="rounded-xl bg-gradient-to-r from-emerald-500/90 via-teal-500/90 to-cyan-500/90 backdrop-blur-md border border-white/25 px-3.5 py-2.5 text-xs font-semibold text-white shadow-xl shadow-emerald-500/20"
      >
        <span className="flex items-center gap-2">
          <Calendar className="size-3.5 shrink-0 text-white/95" />
          Inscribirse en convención
        </span>
      </MouseFollower>
      <div className="animate-in fade-in duration-700 ease-out">
      <main>
        <MarqueeTicker />
        <div id="sedes" className="scroll-mt-20">
          <ScrollReveal>
            <SedesSection />
          </ScrollReveal>
        </div>
        <div id="mision" className="scroll-mt-20">
          <ScrollReveal delay={100}>
            <AboutSection />
          </ScrollReveal>
        </div>
        <div id="directiva" className="scroll-mt-20">
          <ScrollReveal delay={100}>
            <LeadershipSection />
          </ScrollReveal>
        </div>
        <div id="noticias" className="scroll-mt-20">
          <ScrollReveal delay={100}>
            <NewsSection />
          </ScrollReveal>
        </div>
        <div id="convenciones" className="scroll-mt-20">
          <ScrollReveal delay={100}>
            <ConventionsSection />
          </ScrollReveal>
        </div>
        <div id="galeria" className="scroll-mt-20">
          <ScrollReveal delay={100}>
            <GallerySection />
          </ScrollReveal>
        </div>
        <div id="educacion" className="scroll-mt-20">
          <ScrollReveal delay={100}>
            <EducacionSection />
          </ScrollReveal>
        </div>
        <div id="ofrendas" className="scroll-mt-20">
          <ScrollReveal delay={100}>
            <OfrendasSection />
          </ScrollReveal>
        </div>
        <Footer />
      </main>
      </div>
    </>
  )
}

export function HomePageContent() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-white overflow-x-hidden" style={{ colorScheme: 'dark' }}>
      <a
        href="#inicio"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-[#0a1628] focus:rounded-lg focus:font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#0a1628]"
      >
        Saltar al contenido principal
      </a>
      <Navbar />
      <div id="inicio">
        <HeroSection />
      </div>
      <HomePageBelowFold />
    </div>
  )
}
