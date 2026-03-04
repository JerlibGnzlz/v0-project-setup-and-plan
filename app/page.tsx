'use client'

import dynamic from 'next/dynamic'
import { Navbar } from '@/components/navbar'
import { HeroSection } from '@/components/hero-section'
import { InscripcionSuccessHandler } from '@/components/inscripcion-success-handler'

const HomePageBelowFoldDynamic = dynamic(
  () => import('@/components/home-page-content').then(m => ({ default: m.HomePageBelowFold })),
  { ssr: false, loading: () => null }
)

export default function HomePage() {
  return (
    <>
      <InscripcionSuccessHandler />
      <div
        className="min-h-screen bg-[#0a1628] text-white overflow-x-hidden"
        style={{ colorScheme: 'dark' }}
      >
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
        <HomePageBelowFoldDynamic />
      </div>
    </>
  )
}
