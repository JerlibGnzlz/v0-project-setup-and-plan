'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Eye, Mail, MapPin, Users, ChevronRight, Phone, Briefcase, Loader2, Globe } from 'lucide-react'
import { usePastoresLanding } from '@/lib/hooks/use-pastores'
import type { Pastor } from '@/lib/api/pastores'

// Colores para las tarjetas (se rotan)
const gradients = [
  'from-sky-400 to-blue-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-purple-400 to-pink-500',
  'from-sky-400 to-emerald-500',
  'from-rose-400 to-red-500',
]

export function LeadershipSection() {
  // Fetch pastores para landing con sincronización automática
  const { data: pastores = [], isLoading } = usePastoresLanding()

  // Si no hay pastores para mostrar, no renderizar la sección
  if (!isLoading && pastores.length === 0) {
    return null
  }

  return (
    <section id="directiva" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0d1f35]">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/20 rounded-full blur-[120px]" />
        </div>
        {/* Grid */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <Users className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-white/80 font-medium">Nuestro Equipo</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Directiva{' '}
            <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
              Pastoral
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-3xl mx-auto">
            Líderes comprometidos con la excelencia ministerial y el servicio al Reino
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
          </div>
        ) : (
          <>
            {/* Leaders Grid */}
            <div className={`grid gap-6 max-w-6xl mx-auto ${
              pastores.length === 1 ? 'grid-cols-1 max-w-sm' :
              pastores.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl' :
              pastores.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl' :
              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            }`}>
              {pastores.map((pastor: Pastor, index: number) => {
                const gradient = gradients[index % gradients.length]
                return (
                  <PastorCard key={pastor.id} pastor={pastor} gradient={gradient} />
                )
              })}
            </div>

            {/* Ver todo el equipo button */}
            <div className="text-center mt-12">
              <a
                href="/equipo"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                <Users className="w-5 h-5 text-emerald-400" />
                Ver Todo el Equipo
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </>
        )}
      </div>

      {/* Decorative lines */}
      <div className="absolute top-20 right-8 w-32 h-px bg-gradient-to-l from-sky-500/50 to-transparent" />
      <div className="absolute bottom-20 left-8 w-32 h-px bg-gradient-to-r from-amber-500/50 to-transparent" />
    </section>
  )
}

// Componente separado para la tarjeta del pastor (mejor rendimiento)
function PastorCard({ pastor, gradient }: { pastor: Pastor; gradient: string }) {
  const fullName = `${pastor.nombre} ${pastor.apellido}`
  const location = pastor.sede || pastor.region || pastor.pais || ''

  return (
    <div className="group">
      <div className="relative">
        {/* Glow effect */}
        <div className={`absolute -inset-1 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />
        
        {/* Card */}
        <div className="relative rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300">
          {/* Image with lazy loading */}
          <div className="relative aspect-square overflow-hidden bg-white/5">
            {pastor.fotoUrl ? (
              <Image
                src={pastor.fotoUrl}
                alt={fullName}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5">
                <span className="text-4xl font-bold text-white/30">
                  {pastor.nombre?.[0]}{pastor.apellido?.[0]}
                </span>
              </div>
            )}
            <div className={`absolute inset-0 bg-gradient-to-t ${gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="text-lg font-bold text-white mb-1">{fullName}</h3>
            <p className={`text-sm font-medium bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-2`}>
              {pastor.cargo || pastor.ministerio || 'Pastor'}
            </p>
            {location && (
              <div className="flex items-center gap-2 text-white/50 text-xs mb-4">
                <MapPin className="w-3 h-3" />
                <span>{location}</span>
              </div>
            )}

            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 gap-2 group/btn"
                >
                  <Eye className="h-4 w-4" />
                  Ver Más
                  <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-[#0d1f35] border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-white">{fullName}</DialogTitle>
                  <DialogDescription className={`text-base bg-gradient-to-r ${gradient} bg-clip-text text-transparent font-medium`}>
                    {pastor.cargo || pastor.ministerio || 'Pastor'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  {/* Contacto */}
                  <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm">
                    {location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {location}
                      </div>
                    )}
                    {pastor.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {pastor.email}
                      </div>
                    )}
                    {pastor.telefono && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {pastor.telefono}
                      </div>
                    )}
                    {pastor.ministerio && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        {pastor.ministerio}
                      </div>
                    )}
                  </div>
                  
                  {/* Biografía */}
                  {pastor.biografia && (
                    <div>
                      <h4 className="font-bold text-lg mb-3 text-white">Acerca de</h4>
                      <p className="text-white/70 leading-relaxed">{pastor.biografia}</p>
                    </div>
                  )}

                  {/* Trayectoria */}
                  {pastor.trayectoria && (
                    <div>
                      <h4 className="font-bold text-lg mb-3 text-white">Trayectoria Ministerial</h4>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-white/70 leading-relaxed whitespace-pre-line">{pastor.trayectoria}</p>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
}
