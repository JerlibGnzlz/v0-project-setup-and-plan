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
import { Eye } from 'lucide-react'
import { ImageWithSkeleton } from './image-with-skeleton'

const leaders = [
  {
    name: 'Pastor Juan Rodríguez',
    role: 'Director General',
    image: '/hispanic-pastor-portrait-professional.jpg',
    email: 'juan.rodriguez@vidaabundante.org',
    country: 'Colombia',
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
  return (
    <section id="directiva" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Directiva Pastoral
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
            Líderes comprometidos con la excelencia ministerial y el servicio al Reino
          </p>
        </div>
        
        <Accordion type="single" collapsible className="max-w-5xl mx-auto">
          {leaders.map((leader, index) => (
            <AccordionItem key={leader.name} value={`item-${index}`}>
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <ImageWithSkeleton
                      src={leader.image || "/placeholder.svg"}
                      alt={leader.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">{leader.name}</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      {leader.role}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card className="border-0 shadow-none">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-1">
                        <ImageWithSkeleton
                          src={leader.image || "/placeholder.svg"}
                          alt={leader.name}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-4">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">{leader.name}</h3>
                          <p className="text-lg text-primary font-semibold mb-1">{leader.role}</p>
                          <p className="text-muted-foreground">{leader.country}</p>
                          <p className="text-sm text-muted-foreground">{leader.email}</p>
                        </div>
                        
                        <div className="flex gap-3">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="default" className="gap-2 hover:scale-105 transition-transform">
                                <Eye className="h-4 w-4" />
                                Ver Recorrido Ministerial
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="text-2xl">{leader.name}</DialogTitle>
                                <DialogDescription className="text-base">
                                  {leader.role} - Recorrido Ministerial
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6 pt-4">
                                {leader.journey.map((item, idx) => (
                                  <div key={idx} className="flex gap-4">
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
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
