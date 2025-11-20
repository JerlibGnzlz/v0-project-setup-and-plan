'use client'

import { Card, CardContent } from '@/components/ui/card'
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
import { Eye, MapPin } from 'lucide-react'

const regionalPastors = [
  {
    region: 'Argentina - Provincia de Buenos Aires',
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
    <section id="pastores" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Pastores Supervisores
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
            Líderes regionales comprometidos con el crecimiento y desarrollo de las iglesias locales
          </p>
        </div>
        
        <Accordion type="single" collapsible className="max-w-6xl mx-auto space-y-4">
          {regionalPastors.map((region, regionIndex) => (
            <AccordionItem 
              key={region.region} 
              value={`region-${regionIndex}`}
              className="border rounded-lg px-4 bg-card"
            >
              <AccordionTrigger className="text-lg font-semibold hover:no-underline py-6">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>{region.region}</span>
                  <span className="text-sm text-muted-foreground font-normal ml-2">
                    ({region.pastors.length} {region.pastors.length === 1 ? 'pastor' : 'pastores'})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid md:grid-cols-2 gap-6 pb-6">
                  {region.pastors.map((pastor) => (
                    <Card key={pastor.name} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex gap-4 mb-4">
                          <div className="flex-shrink-0">
                            <img
                              src={pastor.image || "/placeholder.svg"}
                              alt={pastor.name}
                              className="w-20 h-20 rounded-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-1">{pastor.name}</h3>
                            <p className="text-primary font-semibold text-sm mb-1">{pastor.role}</p>
                            <p className="text-sm text-muted-foreground">{pastor.city}</p>
                            <p className="text-xs text-muted-foreground mt-1">{pastor.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                            <span className="text-muted-foreground">
                              {pastor.churches} iglesias bajo supervisión
                            </span>
                          </div>
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="default" className="w-full gap-2">
                              <Eye className="h-4 w-4" />
                              Ver Recorrido Ministerial
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-2xl">{pastor.name}</DialogTitle>
                              <DialogDescription className="text-base">
                                {pastor.role} - {pastor.city}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 pt-4">
                              <div className="bg-muted/50 p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">Región</p>
                                <p className="font-semibold">{region.region}</p>
                                <p className="text-sm text-muted-foreground mt-2 mb-1">Iglesias supervisadas</p>
                                <p className="font-semibold">{pastor.churches} congregaciones</p>
                              </div>
                              
                              <div>
                                <h4 className="font-bold text-lg mb-4">Recorrido Ministerial</h4>
                                {pastor.journey.map((item, idx) => (
                                  <div key={idx} className="flex gap-4 mb-6 last:mb-0">
                                    <div className="flex-shrink-0">
                                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-sm font-bold text-primary">{item.year}</span>
                                      </div>
                                    </div>
                                    <div className="flex-1 pt-2">
                                      <p className="text-base leading-relaxed">{item.milestone}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
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
