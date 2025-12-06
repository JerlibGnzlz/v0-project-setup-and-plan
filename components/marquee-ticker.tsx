'use client'

import { Globe } from 'lucide-react'

const words = [
  'MISIONES',
  'CONVENCIONES',
  'FORMACIÓN',
  'LIDERAZGO',
  'FE',
  'SERVICIO',
  'ADORACIÓN',
  'COMUNIDAD',
  'TRANSFORMACIÓN',
  'ESPERANZA',
]

export function MarqueeTicker() {
  return (
    <div className="relative py-6 overflow-hidden bg-gradient-to-r from-[#0a1628] via-[#0d1f35] to-[#0a1628]">
      {/* Gradient overlays for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a1628] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a1628] to-transparent z-10" />

      {/* Top border glow - colores del mundo: azul y verde */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
      {/* Bottom border glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />

      {/* Marquee container */}
      <div className="flex animate-marquee">
        {/* First set of items */}
        <div className="flex items-center gap-8 pr-8">
          {words.map((word, index) => (
            <div key={`first-${index}`} className="flex items-center gap-8">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent whitespace-nowrap tracking-wider">
                {word}
              </span>
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
            </div>
          ))}
        </div>

        {/* Duplicate for seamless loop */}
        <div className="flex items-center gap-8 pr-8">
          {words.map((word, index) => (
            <div key={`second-${index}`} className="flex items-center gap-8">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent whitespace-nowrap tracking-wider">
                {word}
              </span>
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* CSS for animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee 30s linear infinite;
        }

        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
