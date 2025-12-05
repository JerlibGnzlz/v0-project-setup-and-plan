import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ScrollProgress } from '@/components/scroll-progress'
import { BackToTop } from '@/components/back-to-top'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'

const _inter = Inter({ subsets: ["latin"] });
const _montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://vidaabundante.org'),
  title: {
    default: 'Vida Abundante - Ministerio Misionero Internacional',
    template: '%s | Vida Abundante'
  },
  description: 'Organización misionera dedicada a la formación pastoral y el alcance global del evangelio. Formamos pastores, establecemos iglesias y llevamos el mensaje de esperanza a todo el mundo.',
  keywords: [
    'ministerio misionero',
    'formación pastoral',
    'iglesias',
    'evangelio',
    'misiones internacionales',
    'vida abundante',
    'pastores',
    'ministerio',
    'cristianismo',
    'fe'
  ],
  authors: [{ name: 'Asociación Misionera Vida Abundante' }],
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
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://vidaabundante.org',
    siteName: 'Vida Abundante',
    title: 'Vida Abundante - Ministerio Misionero Internacional',
    description: 'Organización misionera dedicada a la formación pastoral y el alcance global del evangelio',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Vida Abundante - Ministerio Misionero Internacional',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vida Abundante - Ministerio Misionero Internacional',
    description: 'Organización misionera dedicada a la formación pastoral y el alcance global del evangelio',
    images: ['/og-image.jpg'],
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
    // Agregar cuando tengas los códigos de verificación
    // google: 'google-site-verification-code',
    // yandex: 'yandex-verification-code',
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://vidaabundante.org',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vidaabundante.org'
  
  // Structured Data (JSON-LD) para SEO
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Asociación Misionera Vida Abundante',
    alternateName: 'Vida Abundante',
    url: baseUrl,
    logo: `${baseUrl}/mundo.png`,
    description: 'Organización misionera dedicada a la formación pastoral y el alcance global del evangelio',
    sameAs: [
      // Agregar redes sociales cuando estén disponibles
    ],
  }
  
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
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
