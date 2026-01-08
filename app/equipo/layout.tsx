import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nuestro Equipo Pastoral',
  description:
    'Conoce a nuestro equipo pastoral: directiva, presidentes de país, supervisores regionales y pastores de la Asociación Misionera Vida Abundante',
  openGraph: {
    title: 'Nuestro Equipo Pastoral - Vida Abundante',
    description: 'Conoce a nuestro equipo pastoral y su liderazgo',
    type: 'website',
  },
}

export default function EquipoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}































