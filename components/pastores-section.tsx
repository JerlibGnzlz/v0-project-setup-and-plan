'use client'

import { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Eye, MapPin, Mail, Church, ChevronRight } from 'lucide-react'

const regionalPastors = [
  {
    region: 'Argentina - Provincia de Buenos Aires',
    gradient: 'from-sky-400 to-blue-500',
    pastors: [
      {
        name: 'Pastor Roberto Fernández',
        role: 'Supervisor Provincial',
        image: '/hispanic-male-pastor-portrait-professional.jpg',
        email: 'roberto.fernandez@vidaabundante.org',
        city: 'Buenos Aires',
        churches: 12,
        journey: [
          { year: '2007', milestone: 'Fundación de primera iglesia en La Plata' },
          { year: '2011', milestone: 'Plantación de 5 iglesias en zona sur' },
          { year: '2015', milestone: 'Supervisor Regional Buenos Aires' },
          { year: '2019', milestone: 'Red de 12 iglesias en la provincia' },
          { year: '2023', milestone: 'Programa de mentoría para nuevos pastores' },
        ],
      },
      {
        name: 'Pastora Laura Martínez',
        role: 'Coordinadora de Capacitación',
        image: '/hispanic-female-pastor-portrait-professional.jpg',
        email: 'laura.martinez@vidaabundante.org',
        city: 'Mar del Plata',
        churches: 8,
        journey: [
          { year: '2009', milestone: 'Pastora en Mar del Plata' },
          { year: '2013', milestone: 'Directora de escuela bíblica regional' },
          { year: '2017', milestone: 'Coordinadora de capacitación pastoral' },
          { year: '2021', milestone: 'Expansión a 8 iglesias costeras' },
          { year: '2024', milestone: 'Más de 200 líderes capacitados' },
        ],
      },
    ],
  },
  {
    region: 'Argentina - Provincia de Córdoba',
    gradient: 'from-emerald-500 to-teal-500',
    pastors: [
      {
        name: 'Pastor Miguel Ángel Sosa',
        role: 'Supervisor Provincial',
        image: '/hispanic-male-pastor-portrait-professional.jpg',
        email: 'miguel.sosa@vidaabundante.org',
        city: 'Córdoba Capital',
        churches: 10,
        journey: [
          { year: '2008', milestone: 'Inicio del ministerio en Córdoba' },
          { year: '2012', milestone: 'Plantación de iglesias en sierras' },
          { year: '2016', milestone: 'Supervisor Provincial Córdoba' },
          { year: '2020', milestone: 'Red de 10 iglesias establecidas' },
          { year: '2023', milestone: 'Centro de capacitación provincial' },
        ],
      },
    ],
  },
  {
    region: 'Argentina - Provincia de Mendoza',
    gradient: 'from-amber-400 to-orange-500',
    pastors: [
      {
        name: 'Pastor Daniel Gutiérrez',
        role: 'Supervisor Provincial',
        image: '/hispanic-male-pastor-portrait-professional.jpg',
        email: 'daniel.gutierrez@vidaabundante.org',
        city: 'Mendoza',
        churches: 7,
        journey: [
          { year: '2010', milestone: 'Misionero en zona rural de Mendoza' },
          { year: '2014', milestone: 'Fundación de iglesias en Cuyo' },
          { year: '2018', milestone: 'Supervisor Provincial Mendoza' },
          { year: '2022', milestone: 'Red de 7 iglesias en la región' },
          { year: '2024', milestone: 'Programa de evangelismo regional' },
        ],
      },
    ],
  },
  {
    region: 'Colombia - Región Central',
    gradient: 'from-amber-500 to-orange-500',
    pastors: [
      {
        name: 'Pastor Andrés Vargas',
        role: 'Supervisor Regional',
        image: '/hispanic-male-pastor-portrait-professional.jpg',
        email: 'andres.vargas@vidaabundante.org',
        city: 'Bogotá',
        churches: 15,
        journey: [
          { year: '2006', milestone: 'Pastor fundador en Bogotá' },
          { year: '2010', milestone: 'Expansión a municipios cercanos' },
          { year: '2014', milestone: 'Supervisor Regional Central' },
          { year: '2018', milestone: 'Red de 15 iglesias en Cundinamarca' },
          { year: '2023', milestone: 'Centro de entrenamiento misionero' },
        ],
      },
    ],
  },
  {
    region: 'España - Comunidad de Madrid',
    gradient: 'from-sky-400 to-emerald-500',
    pastors: [
      {
        name: 'Pastor Javier Moreno',
        role: 'Supervisor Regional',
        image: '/hispanic-male-pastor-portrait-professional.jpg',
        email: 'javier.moreno@vidaabundante.org',
        city: 'Madrid',
        churches: 9,
        journey: [
          { year: '2011', milestone: 'Plantación de iglesia en Madrid' },
          { year: '2015', milestone: 'Expansión a ciudades satélite' },
          { year: '2019', milestone: 'Supervisor Regional Madrid' },
          { year: '2022', milestone: 'Red de 9 iglesias en la comunidad' },
          { year: '2024', milestone: 'Integración con otras comunidades hispanas' },
        ],
      },
    ],
  },
]

export function PastoresSection() {
  return (
    <section id="pastores" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0a1628]">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-emerald-500/20 to-transparent rounded-full blur-[100px]" />
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
            <Church className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-white/80 font-medium">Líderes Regionales</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Pastores{' '}
            <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
              Supervisores
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-3xl mx-auto">
            Líderes regionales comprometidos con el crecimiento y desarrollo de las iglesias locales
          </p>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="max-w-4xl mx-auto space-y-4">
          {regionalPastors.map((region, regionIndex) => (
            <AccordionItem
              key={region.region}
              value={`region-${regionIndex}`}
              className="border-0"
            >
              <AccordionTrigger className="group px-6 py-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:no-underline transition-all duration-300 data-[state=open]:rounded-b-none data-[state=open]:border-b-0">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${region.gradient}`} />
                  <div className="text-left">
                    <span className="text-white font-semibold text-lg">{region.region}</span>
                    <span className="block text-sm text-white/50 mt-1">
                      {region.pastors.length} {region.pastors.length === 1 ? 'pastor' : 'pastores'}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-0 rounded-b-xl bg-white/5 backdrop-blur-sm border border-t-0 border-white/10">
                <div className="grid gap-4 pt-6">
                  {region.pastors.map((pastor) => (
                    <div
                      key={pastor.name}
                      className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300"
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <img
                          src={pastor.image || "/placeholder.svg"}
                          alt={pastor.name}
                          className="w-20 h-20 rounded-xl object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white">{pastor.name}</h3>
                        <p className={`text-sm font-medium bg-gradient-to-r ${region.gradient} bg-clip-text text-transparent`}>
                          {pastor.role}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-white/50">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {pastor.city}
                          </div>
                          <div className="flex items-center gap-1">
                            <Church className="w-3 h-3" />
                            {pastor.churches} iglesias
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="flex-shrink-0 sm:self-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/10 gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Ver Más
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl bg-[#0d1f35] border-white/10 text-white">
                            <DialogHeader>
                              <DialogTitle className="text-2xl text-white">{pastor.name}</DialogTitle>
                              <DialogDescription className={`text-base bg-gradient-to-r ${region.gradient} bg-clip-text text-transparent font-medium`}>
                                {pastor.role} - {pastor.city}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 pt-4">
                              <div className="flex flex-wrap gap-4 text-white/60 text-sm">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
                                  <MapPin className="w-4 h-4" />
                                  {region.region}
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
                                  <Church className="w-4 h-4" />
                                  {pastor.churches} iglesias
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
                                  <Mail className="w-4 h-4" />
                                  {pastor.email}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-bold text-lg mb-4 text-white">Recorrido Ministerial</h4>
                                <div className="space-y-4">
                                  {pastor.journey.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-start">
                                      <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-r ${region.gradient} flex items-center justify-center shadow-lg`}>
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
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
