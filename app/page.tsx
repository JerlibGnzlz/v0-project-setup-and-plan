'use client'

import { Navbar } from '@/components/navbar'
import { HeroSection } from '@/components/hero-section'
import { SedesSection } from '@/components/sedes-section'
import { AboutSection } from '@/components/about-section'
import { LeadershipSection } from '@/components/leadership-section'
import { PastoresSection } from '@/components/pastores-section'
import { ConventionsSection } from '@/components/conventions-section'
import { GallerySection } from '@/components/gallery-section'
import { EducacionSection } from '@/components/educacion-section'
import { RegistrationSection } from '@/components/registration-section'
import { Footer } from '@/components/footer'
import { ScrollReveal } from '@/components/scroll-reveal'
import { SectionIndicator } from '@/components/section-indicator'
import { QueryProvider } from '@/lib/providers/query-provider'

export default function HomePage() {
  return (
    <QueryProvider>
      <main>
        <Navbar />
        <SectionIndicator />
        <div id="inicio">
          <HeroSection />
        </div>
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
        <div id="pastores">
          <ScrollReveal delay={100}>
            <PastoresSection />
          </ScrollReveal>
        </div>
        <ScrollReveal delay={100}>
          <ConventionsSection />
        </ScrollReveal>
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
        <div id="inscripcion">
          <ScrollReveal delay={100}>
            <RegistrationSection />
          </ScrollReveal>
        </div>
        <Footer />
      </main>
    </QueryProvider>
  )
}
