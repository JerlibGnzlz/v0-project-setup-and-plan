'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Eye, Mail, MapPin, Users, ChevronRight } from 'lucide-react'
import { ImageWithSkeleton } from './image-with-skeleton'

const leaders = [
  {
    name: 'Pastor Juan Rodríguez',
    role: 'Director General',
    image: '/hispanic-pastor-portrait-professional.jpg',
    email: 'juan.rodriguez@vidaabundante.org',
    country: 'Colombia',
    gradient: 'from-blue-500 to-cyan-500',
    journey: [
      { year: '2005', milestone: 'Ordenación como pastor en Bogotá' },
      { year: '2010', milestone: 'Director de Misiones Regionales' },
      { year: '2015', milestone: 'Fundación de 15 iglesias en Colombia' },
      { year: '2020', milestone: 'Nombrado Director General de Vida Abundante' },
      { year: '2023', milestone: 'Expansión internacional a 5 países' },
    ],
  },
  {
    name: 'Pastora María González',
    role: 'Directora de Formación',
    image: '/hispanic-female-pastor-portrait-professional.jpg',
    email: 'maria.gonzalez@vidaabundante.org',
    country: 'España',
    gradient: 'from-purple-500 to-pink-500',
    journey: [
      { year: '2008', milestone: 'Licenciada en Teología, Madrid' },
      { year: '2012', milestone: 'Pastora principal en Valencia' },
      { year: '2016', milestone: 'Creación del programa de capacitación pastoral' },
      { year: '2019', milestone: 'Directora de Formación Internacional' },
      { year: '2024', milestone: 'Más de 500 pastores capacitados' },
    ],
  },
  {
    name: 'Pastor Carlos Mendoza',
    role: 'Director de Misiones',
    image: '/hispanic-male-pastor-portrait-professional.jpg',
    email: 'carlos.mendoza@vidaabundante.org',
    country: 'Argentina',
    gradient: 'from-emerald-500 to-teal-500',
    journey: [
      { year: '2006', milestone: 'Misionero en zonas rurales de Argentina' },
      { year: '2011', milestone: 'Plantación de 20 iglesias en provincias argentinas' },
      { year: '2014', milestone: 'Coordinador de Misiones Latinoamérica' },
      { year: '2018', milestone: 'Director de Misiones Globales' },
      { year: '2022', milestone: 'Apertura de campos misioneros en Europa' },
    ],
  },
  {
    name: 'Pastora Ana Silva',
    role: 'Directora de Eventos',
    image: '/hispanic-female-pastor-portrait-professional.jpg',
    email: 'ana.silva@vidaabundante.org',
    country: 'Chile',
    gradient: 'from-amber-500 to-orange-500',
    journey: [
      { year: '2009', milestone: 'Líder de alabanza en Santiago' },
      { year: '2013', milestone: 'Organización de primera convención nacional' },
      { year: '2017', milestone: 'Coordinadora de eventos internacionales' },
      { year: '2021', milestone: 'Directora de Eventos y Conferencias' },
      { year: '2024', milestone: '30+ eventos internacionales realizados' },
    ],
  },
]

export function LeadershipSection() {
  const [expandedLeader, setExpandedLeader] = useState<number | null>(null)

  return (
    <section id="directiva" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0d1f35]">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]" />
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
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-white/80 font-medium">Nuestro Equipo</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Directiva{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Pastoral
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-3xl mx-auto">
            Líderes comprometidos con la excelencia ministerial y el servicio al Reino
          </p>
        </div>

        {/* Leaders Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {leaders.map((leader, index) => (
            <div key={leader.name} className="group">
              <div className="relative">
                {/* Glow effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${leader.gradient} rounded-2xl blur opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />
                
                {/* Card */}
                <div className="relative rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300">
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <ImageWithSkeleton
                      src={leader.image || "/placeholder.svg"}
                      alt={leader.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${leader.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white mb-1">{leader.name}</h3>
                    <p className={`text-sm font-medium bg-gradient-to-r ${leader.gradient} bg-clip-text text-transparent mb-2`}>
                      {leader.role}
                    </p>
                    <div className="flex items-center gap-2 text-white/50 text-xs mb-4">
                      <MapPin className="w-3 h-3" />
                      <span>{leader.country}</span>
                    </div>

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
                          <DialogTitle className="text-2xl text-white">{leader.name}</DialogTitle>
                          <DialogDescription className={`text-base bg-gradient-to-r ${leader.gradient} bg-clip-text text-transparent font-medium`}>
                            {leader.role}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 pt-4">
                          <div className="flex items-center gap-4 text-white/60 text-sm">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {leader.country}
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {leader.email}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-bold text-lg mb-4 text-white">Recorrido Ministerial</h4>
                            <div className="space-y-4">
                              {leader.journey.map((item, idx) => (
                                <div key={idx} className="flex gap-4 items-start">
                                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-r ${leader.gradient} flex items-center justify-center shadow-lg`}>
                                    <span className="text-sm font-bold text-white">{item.year}</span>
                                  </div>
                                  <div className="flex-1 pt-3">
                                    <p className="text-white/80 leading-relaxed">{item.milestone}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative lines */}
      <div className="absolute top-20 right-8 w-32 h-px bg-gradient-to-l from-purple-500/50 to-transparent" />
      <div className="absolute bottom-20 left-8 w-32 h-px bg-gradient-to-r from-pink-500/50 to-transparent" />
    </section>
  )
}
