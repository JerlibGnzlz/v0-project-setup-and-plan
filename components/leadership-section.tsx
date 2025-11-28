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
import { Eye, Mail, MapPin, Users, ChevronRight, Phone, Briefcase, Loader2, Quote, Sparkles } from 'lucide-react'
import { usePastoresLanding } from '@/lib/hooks/use-pastores'
import type { Pastor } from '@/lib/api/pastores'

// Colores para los acentos (se rotan)
const accentColors = [
  { gradient: 'from-sky-400 to-blue-500', ring: 'ring-sky-400/50', glow: 'bg-sky-500/20', text: 'text-sky-400' },
  { gradient: 'from-emerald-400 to-teal-500', ring: 'ring-emerald-400/50', glow: 'bg-emerald-500/20', text: 'text-emerald-400' },
  { gradient: 'from-amber-400 to-orange-500', ring: 'ring-amber-400/50', glow: 'bg-amber-500/20', text: 'text-amber-400' },
  { gradient: 'from-purple-400 to-pink-500', ring: 'ring-purple-400/50', glow: 'bg-purple-500/20', text: 'text-purple-400' },
  { gradient: 'from-rose-400 to-red-500', ring: 'ring-rose-400/50', glow: 'bg-rose-500/20', text: 'text-rose-400' },
  { gradient: 'from-cyan-400 to-blue-500', ring: 'ring-cyan-400/50', glow: 'bg-cyan-500/20', text: 'text-cyan-400' },
]

export function LeadershipSection() {
  const { data: pastores = [], isLoading } = usePastoresLanding()

  if (!isLoading && pastores.length === 0) {
    return null
  }

  return (
    <section id="directiva" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0d1f35] to-[#0a1628]">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[120px]" />
        </div>
        {/* Subtle pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
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
            {/* Leaders Grid - Modern Cards */}
            <div className={`grid gap-5 max-w-5xl mx-auto ${
              pastores.length === 1 ? 'grid-cols-1 max-w-md' :
              pastores.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl' :
              pastores.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
              pastores.length === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' :
              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}>
              {pastores.map((pastor: Pastor, index: number) => {
                const accent = accentColors[index % accentColors.length]
                return (
                  <ModernPastorCard key={pastor.id} pastor={pastor} accent={accent} index={index} />
                )
              })}
            </div>

            {/* Ver todo el equipo button */}
            <div className="text-center mt-14">
              <a
                href="/equipo"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10 text-white font-medium hover:from-white/10 hover:to-white/15 hover:border-white/20 transition-all duration-300 group backdrop-blur-sm"
              >
                <Users className="w-5 h-5 text-emerald-400" />
                Ver Todo el Equipo Pastoral
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </>
        )}
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-8 w-32 h-px bg-gradient-to-l from-sky-500/50 to-transparent" />
      <div className="absolute bottom-20 left-8 w-32 h-px bg-gradient-to-r from-amber-500/50 to-transparent" />
    </section>
  )
}

// Modern Pastor Card Component
function ModernPastorCard({ pastor, accent, index }: { pastor: Pastor; accent: typeof accentColors[0]; index: number }) {
  const fullName = `${pastor.nombre} ${pastor.apellido}`
  const location = pastor.sede || pastor.region || pastor.pais || ''
  const initials = `${pastor.nombre?.[0] || ''}${pastor.apellido?.[0] || ''}`

  return (
    <div 
      className="group relative"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Animated border gradient */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[0.5px]" />
      
      {/* Glow effect on hover */}
      <div className={`absolute -inset-3 ${accent.glow} rounded-3xl blur-2xl opacity-0 group-hover:opacity-60 transition-all duration-500`} />
      
      {/* Card */}
      <div className="relative rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-500">
        {/* Top accent line */}
        <div className={`h-[2px] bg-gradient-to-r ${accent.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />
        
        {/* Content */}
        <div className="p-5">
          {/* Header with avatar */}
          <div className="flex items-start gap-4 mb-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {/* Avatar glow */}
              <div className={`absolute -inset-1 bg-gradient-to-br ${accent.gradient} rounded-full blur-md opacity-40 group-hover:opacity-70 transition-opacity`} />
              
              <div className={`relative w-16 h-16 rounded-full overflow-hidden ring-2 ${accent.ring} ring-offset-2 ring-offset-[#0d1f35]`}>
                {pastor.fotoUrl ? (
                  <Image
                    src={pastor.fotoUrl}
                    alt={fullName}
                    fill
                    sizes="64px"
                    className="object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${accent.gradient} flex items-center justify-center`}>
                    <span className="text-lg font-bold text-white">{initials}</span>
                  </div>
                )}
              </div>
              
              {/* Status indicator */}
              <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-br ${accent.gradient} border-2 border-[#0d1f35] flex items-center justify-center`}>
                <Sparkles className="w-2 h-2 text-white" />
              </div>
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-white mb-0.5 truncate group-hover:text-white/90">
                {fullName}
              </h3>
              <p className={`text-sm font-medium bg-gradient-to-r ${accent.gradient} bg-clip-text text-transparent`}>
                {pastor.cargo || pastor.ministerio || 'Pastor'}
              </p>
              {location && (
                <div className="flex items-center gap-1.5 mt-1.5 text-white/40 text-xs">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio preview if exists */}
          {pastor.biografia && (
            <div className="relative mb-4">
              <div className={`absolute left-0 top-0 w-0.5 h-full bg-gradient-to-b ${accent.gradient} rounded-full opacity-40`} />
              <p className="text-white/50 text-xs leading-relaxed pl-3 line-clamp-2 italic">
                "{pastor.biografia}"
              </p>
            </div>
          )}

          {/* Action Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className={`w-full bg-gradient-to-r from-white/[0.03] to-white/[0.06] hover:from-white/[0.08] hover:to-white/[0.12] text-white/80 hover:text-white border border-white/[0.08] hover:border-white/[0.15] gap-2 group/btn transition-all duration-300 rounded-xl h-9`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Ver Perfil</span>
                <ChevronRight className="h-3.5 w-3.5 opacity-0 -ml-2 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all duration-300" />
              </Button>
            </DialogTrigger>
            
            {/* Modal Content */}
            <DialogContent className="max-w-lg bg-[#0d1f35]/95 backdrop-blur-2xl border-white/10 text-white">
              <DialogHeader className="pb-4">
                <div className="flex items-center gap-4">
                  {/* Avatar in modal */}
                  <div className={`relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ${accent.ring}`}>
                    {pastor.fotoUrl ? (
                      <Image
                        src={pastor.fotoUrl}
                        alt={fullName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${accent.gradient} flex items-center justify-center`}>
                        <span className="text-2xl font-bold text-white">{initials}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <DialogTitle className="text-xl text-white">{fullName}</DialogTitle>
                    <DialogDescription className={`text-sm bg-gradient-to-r ${accent.gradient} bg-clip-text text-transparent font-medium`}>
                      {pastor.cargo || pastor.ministerio || 'Pastor'}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-5">
                {/* Contact info */}
                <div className="flex flex-wrap gap-3">
                  {location && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-sm">
                      <MapPin className="w-3.5 h-3.5" />
                      {location}
                    </div>
                  )}
                  {pastor.email && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-sm">
                      <Mail className="w-3.5 h-3.5" />
                      {pastor.email}
                    </div>
                  )}
                  {pastor.telefono && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-sm">
                      <Phone className="w-3.5 h-3.5" />
                      {pastor.telefono}
                    </div>
                  )}
                  {pastor.ministerio && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-sm">
                      <Briefcase className="w-3.5 h-3.5" />
                      {pastor.ministerio}
                    </div>
                  )}
                </div>
                
                {/* Biography */}
                {pastor.biografia && (
                  <div className="relative">
                    <Quote className={`absolute -top-1 -left-1 w-6 h-6 ${accent.text} opacity-30`} />
                    <p className="text-white/70 text-sm leading-relaxed pl-5 italic">
                      {pastor.biografia}
                    </p>
                  </div>
                )}

                {/* Trayectoria */}
                {pastor.trayectoria && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-white flex items-center gap-2">
                      <div className={`w-1 h-4 rounded-full bg-gradient-to-b ${accent.gradient}`} />
                      Trayectoria Ministerial
                    </h4>
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                      <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">
                        {pastor.trayectoria}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
