'use client'

import Image from 'next/image'

export function LoginLogo() {
  return (
    <div className="flex flex-col items-center mb-6">
      <div className="relative group">
        {/* Logo glow */}
        <div className="absolute -inset-3 bg-gradient-to-r from-sky-500/30 via-emerald-500/30 to-amber-500/30 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
        <Image
          src="/amvadigital.png"
          alt="Logo AMVA"
          width={100}
          height={100}
          className="relative w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-xl"
          priority
        />
      </div>

      {/* Title with gradient */}
      <h1 className="mt-4 text-xl sm:text-2xl font-bold text-center bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
        AMVA Digital
      </h1>

      {/* Subtitle */}
      <p className="mt-1 text-xs text-white/60 text-center">Asociación Misionera Vida Abundante</p>
    </div>
  )
}













