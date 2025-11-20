'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users } from 'lucide-react'
import { CountdownTimer } from './countdown-timer'

interface ConventionsSectionProps {
  visible?: boolean
  inscripcionesActivas?: boolean
}

export function ConventionsSection({ 
  visible = true, 
  inscripcionesActivas = false 
}: ConventionsSectionProps) {
  if (!visible) return null

  const nextConventionDate = new Date('2025-03-15T09:00:00')

  return (
    <section id="convenciones" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Próxima Convención
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
            Únete a nosotros en un evento transformador diseñado para equipar y fortalecer tu ministerio
          </p>
        </div>
        
        <div className="mb-16 max-w-2xl mx-auto">
          <CountdownTimer 
            targetDate={nextConventionDate}
            title="Convención Nacional Argentina 2025"
          />
        </div>
        
        <div className="max-w-md mx-auto">
          <Card className="flex flex-col backdrop-blur-sm bg-background/80 hover:shadow-xl transition-all">
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <CardTitle className="text-2xl text-balance">Convención Nacional Argentina 2025</CardTitle>
                <Badge variant={inscripcionesActivas ? 'default' : 'secondary'}>
                  {inscripcionesActivas ? 'Inscripción Abierta' : 'Próximamente'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Marzo 15, 2025</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-5 w-5 text-accent" />
                <span>Buenos Aires, Argentina</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Users className="h-5 w-5 text-secondary" />
                <span>500+ pastores esperados</span>
              </div>
              <Button className="w-full mt-auto" disabled={!inscripcionesActivas}>
                {inscripcionesActivas ? 'Inscríbete Ahora' : 'Próximamente'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
