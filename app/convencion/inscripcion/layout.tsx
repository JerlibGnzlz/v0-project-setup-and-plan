import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://amva.org.es'

export const metadata: Metadata = {
  title: 'Inscripción a Convención',
  description:
    'Inscríbete a la convención de la Asociación Misionera Vida Abundante. Registro en línea para participantes.',
  openGraph: {
    title: 'Inscripción a Convención | AMVA - Asociación Misionera Vida Abundante',
    description: 'Registro en línea para la convención AMVA',
    type: 'website',
    url: `${SITE_URL}/convencion/inscripcion`,
  },
  alternates: {
    canonical: `${SITE_URL}/convencion/inscripcion`,
  },
}

export default function InscripcionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
