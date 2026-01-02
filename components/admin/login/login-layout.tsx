'use client'

import { ReactNode } from 'react'

interface LoginLayoutProps {
  children: ReactNode
}

export function LoginLayout({ children }: LoginLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0a1628]">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-950/50 via-[#0a1628] to-emerald-950/30" />

      {/* Animated orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-1/4 -right-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '1s' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '2s' }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {children}
    </div>
  )
}





























