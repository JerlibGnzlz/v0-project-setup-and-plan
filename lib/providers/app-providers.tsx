'use client'

import type React from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { QueryProvider } from '@/lib/providers/query-provider'
import { ScrollProgress } from '@/components/scroll-progress'
import { BackToTop } from '@/components/back-to-top'
import { Toaster } from '@/components/ui/sonner'

interface AppProvidersProps {
  children: React.ReactNode
}

/**
 * Wrapper único que agrupa todos los providers en un solo boundary de cliente.
 * Garantiza que QueryProvider envuelva correctamente todo el árbol y evita
 * el error "No QueryClient set" en Next.js App Router.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <ScrollProgress />
        {children}
        <BackToTop />
        <Toaster position="top-right" richColors closeButton />
      </QueryProvider>
    </ThemeProvider>
  )
}
