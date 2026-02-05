'use client'

import dynamic from 'next/dynamic'

const HomePageContent = dynamic(
  () => import('@/components/home-page-content').then(m => ({ default: m.HomePageContent })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center" style={{ colorScheme: 'dark' }}>
        <div className="animate-pulse text-white/60">Cargando...</div>
      </div>
    ),
  }
)

const InscripcionSuccessHandler = dynamic(
  () => import('@/components/home-page-content').then(m => ({ default: m.InscripcionSuccessHandler })),
  { ssr: false }
)

export default function HomePage() {
  return (
    <>
      <InscripcionSuccessHandler />
      <HomePageContent />
    </>
  )
}
