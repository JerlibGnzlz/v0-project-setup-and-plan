'use client'

import Image from 'next/image'

export function LoginLogo() {
  return (
    <div className="flex flex-col items-center mb-6">
      <div className="relative group">
        {/* Logo glow */}
        <div className="absolute -inset-4 bg-gradient-to-r from-sky-500/30 via-emerald-500/30 to-amber-500/30 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
        <Image
          src="/amvadigital.png"
          alt="Logo AMVA"
          width={200}
          height={200}
          className="relative w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-xl"
          priority
        />
      </div>
    </div>
  )
}













