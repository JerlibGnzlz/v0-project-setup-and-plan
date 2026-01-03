'use client'

import { ReactNode } from 'react'

interface LoginCardProps {
  children: ReactNode
}

export function LoginCard({ children }: LoginCardProps) {
  return (
    <div className="relative w-full max-w-sm">
      {/* Glow effect behind card */}
      <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500 rounded-3xl blur-xl opacity-30 animate-pulse" />

      {/* Main Card */}
      <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Top gradient bar */}
        <div className="h-1 bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500" />

        {/* Card content */}
        <div className="p-6 sm:p-7">{children}</div>
      </div>

      {/* Bottom decorative element */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
    </div>
  )
}






























