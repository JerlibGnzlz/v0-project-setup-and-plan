'use client'

import type React from 'react'
import { QueryProvider } from '@/lib/providers/query-provider'

export default function ConvencionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <QueryProvider>{children}</QueryProvider>
}

