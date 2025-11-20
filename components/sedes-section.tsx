'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ImageWithSkeleton } from './image-with-skeleton'

const locations = [
  {
    country: 'Colombia',
    city: 'Bogotá',
    description: 'Nuestra sede principal en América del Sur, alcanzando comunidades con el mensaje de esperanza.',
    image: '/bogota-colombia-cityscape-with-mountains.jpg',
  },
  {
    country: 'España',
    city: 'Madrid',
    description: 'Expandiendo el reino en Europa, conectando con la comunidad hispana y europea.',
    image: '/madrid-spain-cityscape-with-architecture.jpg',
  },
  {
    country: 'Argentina',
    city: 'Buenos Aires',
    description: 'Ministerio activo en el corazón de Argentina, transformando vidas con el evangelio.',
    image: '/buenos-aires-argentina-cityscape.jpg',
  },
  {
    country: 'Chile',
    city: 'Santiago',
    description: 'Presencia misionera en Chile, llevando luz a las comunidades locales.',
    image: '/santiago-chile-cityscape-with-andes-mountains.jpg',
  },
  {
    country: 'Uruguay',
    city: 'Montevideo',
    description: 'Alcanzando Uruguay con amor y servicio, edificando la iglesia local.',
    image: '/montevideo-uruguay-cityscape-waterfront.jpg',
  },
]

export function SedesSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % locations.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + locations.length) % locations.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <section id="sedes" className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Nuestras Sedes
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Presencia misionera en múltiples países, llevando el mensaje de vida abundante a todas las naciones
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Carousel */}
          <Card className="overflow-hidden bg-card border-border">
            <div className="relative h-[400px] sm:h-[500px] md:h-[600px]">
              {/* Image */}
              <div className="absolute inset-0">
                <ImageWithSkeleton
                  src={locations[currentIndex].image || "/placeholder.svg"}
                  alt={`${locations[currentIndex].country} - ${locations[currentIndex].city}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-12 text-white">
                <div className="flex items-center gap-2 mb-2 sm:mb-4">
                  <MapPin className="w-4 h-4 sm:w-6 sm:h-6" />
                  <span className="text-base sm:text-lg font-semibold">{locations[currentIndex].city}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
                  {locations[currentIndex].country}
                </h3>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl text-white/90 leading-relaxed">
                  {locations[currentIndex].description}
                </p>
              </div>

              {/* Navigation Buttons */}
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white hover:scale-110 border-0 h-8 w-8 sm:h-10 sm:w-10 transition-all duration-300"
                onClick={prevSlide}
              >
                <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 text-foreground" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white hover:scale-110 border-0 h-8 w-8 sm:h-10 sm:w-10 transition-all duration-300"
                onClick={nextSlide}
              >
                <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-foreground" />
              </Button>
            </div>
          </Card>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-3 mt-6">
            {locations.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-primary w-8'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Country Names List */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-6 sm:mt-8">
            {locations.map((location, index) => (
              <button
                key={location.country}
                onClick={() => goToSlide(index)}
                className={`px-3 py-2 sm:px-6 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-all hover:scale-105 ${
                  index === currentIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {location.country}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
