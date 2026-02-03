import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ScrollProgress } from '@/components/scroll-progress'
import { BackToTop } from '@/components/back-to-top'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'

const _inter = Inter({ subsets: ['latin'] })
const _montserrat = Montserrat({ subsets: ['latin'] })

// URL canónica: usar amva.org.es sin www para consistencia SEO
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://amva.org.es'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'AMVA - Asociación Misionera Vida Abundante | Ministerio Internacional',
    template: '%s | AMVA',
  },
  description:
    'Asociación Misionera Vida Abundante (AMVA). Formación pastoral, convenciones, instituto bíblico y escuela de capellanía. Ministerio misionero con alcance global.',
  keywords: [
    'AMVA',
    'Asociación Misionera Vida Abundante',
    'ministerio misionero',
    'formación pastoral',
    'convenciones',
    'instituto bíblico',
    'escuela de capellanía',
    'iglesias',
    'evangelio',
    'misiones internacionales',
    'pastores',
    'ministerio',
    'cristianismo',
  ],
  authors: [{ name: 'Asociación Misionera Vida Abundante', url: SITE_URL }],
  creator: 'Asociación Misionera Vida Abundante',
  publisher: 'Asociación Misionera Vida Abundante',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: SITE_URL,
    siteName: 'AMVA - Asociación Misionera Vida Abundante',
    title: 'AMVA - Asociación Misionera Vida Abundante | Ministerio Internacional',
    description:
      'Formación pastoral, convenciones, instituto bíblico y escuela de capellanía. Ministerio misionero con alcance global.',
    images: [
      {
        url: '/mundo.png',
        width: 1200,
        height: 630,
        alt: 'AMVA - Asociación Misionera Vida Abundante',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AMVA - Asociación Misionera Vida Abundante | Ministerio Internacional',
    description:
      'Formación pastoral, convenciones, instituto bíblico y escuela de capellanía. Ministerio misionero con alcance global.',
    images: ['/mundo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Agregar cuando tengas los códigos: google: 'xxx', yandex: 'xxx'
  },
  alternates: {
    canonical: SITE_URL, // Homepage - otras páginas sobrescriben en sus layouts
  },
  category: 'religion',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Structured Data (JSON-LD) para SEO
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Asociación Misionera Vida Abundante',
    alternateName: ['AMVA', 'Vida Abundante'],
    url: SITE_URL,
    logo: `${SITE_URL}/mundo.png`,
    image: `${SITE_URL}/mundo.png`,
    description:
      'Organización misionera dedicada a la formación pastoral y el alcance global del evangelio',
    sameAs: [],
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AMVA - Asociación Misionera Vida Abundante',
    url: SITE_URL,
    description: 'Sitio oficial de la Asociación Misionera Vida Abundante',
    publisher: {
      '@type': 'Organization',
      name: 'Asociación Misionera Vida Abundante',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/mundo.png` },
    },
    inLanguage: 'es-ES',
  }

  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={`font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ScrollProgress />
          {children}
          <BackToTop />
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
