import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://amva.org.es'

export const metadata: Metadata = {
  title: 'Galería',
  description:
    'Galería de fotos y videos de la Asociación Misionera Vida Abundante. Eventos, convenciones y momentos especiales.',
  openGraph: {
    title: 'Galería | AMVA - Asociación Misionera Vida Abundante',
    description: 'Fotos y videos de eventos, convenciones y momentos especiales',
    type: 'website',
    url: `${SITE_URL}/galeria`,
  },
  alternates: {
    canonical: `${SITE_URL}/galeria`,
  },
}

export default function GaleriaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
