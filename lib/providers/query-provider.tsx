'use client'

import type React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

// Solo importar ReactQueryDevtools en desarrollo
let ReactQueryDevtools: React.ComponentType<{ initialIsOpen?: boolean }> | null = null

if (process.env.NODE_ENV === 'development') {
  try {
    const devtools = require('@tanstack/react-query-devtools')
    ReactQueryDevtools = devtools.ReactQueryDevtools
  } catch (error) {
    // Si falla la importación, continuar sin devtools
    console.warn('ReactQueryDevtools no disponible:', error)
  }
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
            // Agregar manejo de errores para evitar crashes
            onError: (error: unknown) => {
              const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
              console.error('[React Query] Error en query:', errorMessage)
            },
          },
          mutations: {
            // Agregar manejo de errores para mutaciones
            onError: (error: unknown) => {
              const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
              console.error('[React Query] Error en mutation:', errorMessage)
            },
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {ReactQueryDevtools && process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
