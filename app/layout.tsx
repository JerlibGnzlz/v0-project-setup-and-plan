import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ScrollProgress } from '@/components/scroll-progress'
import { BackToTop } from '@/components/back-to-top'
import { ThemeProvider } from '@/components/theme-provider'

const _inter = Inter({ subsets: ["latin"] });
const _montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Vida Abundante - Ministerio Misionero Internacional',
  description: 'Organización misionera dedicada a la formación pastoral y el alcance global del evangelio',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
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
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
