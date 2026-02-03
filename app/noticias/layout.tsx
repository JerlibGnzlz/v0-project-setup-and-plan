import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://amva.org.es'

export const metadata: Metadata = {
  title: 'Noticias',
  description:
    'Mantente informado sobre los últimos acontecimientos, eventos y anuncios de la Asociación Misionera Vida Abundante (AMVA)',
  openGraph: {
    title: 'Noticias | AMVA - Asociación Misionera Vida Abundante',
    description: 'Mantente informado sobre los últimos acontecimientos, eventos y anuncios',
    type: 'website',
    url: `${SITE_URL}/noticias`,
  },
  alternates: {
    canonical: `${SITE_URL}/noticias`,
  },
}

export default function NoticiasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}































