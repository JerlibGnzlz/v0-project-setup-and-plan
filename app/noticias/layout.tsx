import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Noticias',
  description:
    'Mantente informado sobre los últimos acontecimientos, eventos y anuncios de la Asociación Misionera Vida Abundante',
  openGraph: {
    title: 'Noticias - Vida Abundante',
    description: 'Mantente informado sobre los últimos acontecimientos, eventos y anuncios',
    type: 'website',
  },
}

export default function NoticiasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}











