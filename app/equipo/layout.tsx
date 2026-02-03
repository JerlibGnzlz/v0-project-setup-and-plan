import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://amva.org.es'

export const metadata: Metadata = {
  title: 'Nuestro Equipo Pastoral',
  description:
    'Conoce a nuestro equipo pastoral: directiva, presidentes de país, supervisores regionales y pastores de la Asociación Misionera Vida Abundante (AMVA)',
  openGraph: {
    title: 'Nuestro Equipo Pastoral | AMVA - Asociación Misionera Vida Abundante',
    description: 'Conoce a nuestro equipo pastoral y su liderazgo',
    type: 'website',
    url: `${SITE_URL}/equipo`,
  },
  alternates: {
    canonical: `${SITE_URL}/equipo`,
  },
}

export default function EquipoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}































