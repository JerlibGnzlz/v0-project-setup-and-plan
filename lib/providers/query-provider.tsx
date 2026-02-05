'use client'

import type React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
            onError: (error: unknown) => {
              const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
              console.error('[React Query] Error en query:', errorMessage)
            },
          },
          mutations: {
            onError: (error: unknown) => {
              const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
              console.error('[React Query] Error en mutation:', errorMessage)
            },
          },
        },
      })
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  // Evitar renderizar hijos que usan React Query hasta que estemos en el cliente
  if (!mounted) {
    return (
      <div
        className="min-h-screen bg-[#0a1628] flex items-center justify-center"
        style={{ colorScheme: 'dark' }}
      >
        <div className="animate-pulse text-white/60">Cargando...</div>
      </div>
    )
  }

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
