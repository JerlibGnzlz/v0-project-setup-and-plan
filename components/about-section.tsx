'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Globe, Heart, Users } from 'lucide-react'
import { AnimatedCounter } from './animated-counter'

export function AboutSection() {
  return (
    <section id="nosotros" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Quiénes Somos
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
            Una organización misionera comprometida con la formación integral de líderes pastorales para el servicio del Reino
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
              <AnimatedCounter end={500} suffix="+" />
            </div>
            <div className="text-muted-foreground">Pastores Formados</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-accent mb-2">
              <AnimatedCounter end={5} />
            </div>
            <div className="text-muted-foreground">Países</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">
              <AnimatedCounter end={15} suffix="+" />
            </div>
            <div className="text-muted-foreground">Años de Ministerio</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
              <AnimatedCounter end={50} suffix="+" />
            </div>
            <div className="text-muted-foreground">Convenciones</div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold mb-6">Nuestra Misión</h3>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Capacitar, fortalecer y empoderar a pastores y líderes cristianos de habla hispana a través de convenciones, seminarios y recursos de formación continua, promoviendo el crecimiento espiritual y ministerial efectivo.
            </p>
            <h3 className="text-3xl font-bold mb-6">Nuestra Visión</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Ser una red global de formación pastoral reconocida por su excelencia e impacto, transformando vidas y fortaleciendo iglesias en toda América Latina y el mundo de habla hispana.
            </p>
          </div>
          <div className="relative h-96 rounded-lg overflow-hidden">
            <img
              src="/pastors-training-conference-worship.jpg"
              alt="Pastoral training"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
