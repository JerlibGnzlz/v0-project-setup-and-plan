'use client'

import { useState } from 'react'
import { ImageWithSkeleton } from './image-with-skeleton'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ZoomIn } from 'lucide-react'

const galleryImages = [
  {
    url: '/pastoral-conference-worship-crowd.jpg',
    alt: 'Adoración en convención',
  },
  {
    url: '/pastor-teaching-seminar-classroom.jpg',
    alt: 'Seminario de enseñanza',
  },
  {
    url: '/pastors-praying-together-circle.jpg',
    alt: 'Pastores orando juntos',
  },
  {
    url: '/missionary-outreach-community-service.jpg',
    alt: 'Alcance misionero',
  },
]

const galleryVideos = [
  {
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    title: 'Testimonio Convención 2024',
  },
  {
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    title: 'Alcance Misionero Global',
  },
]

export function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  return (
    <section id="galeria" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Galería
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
            Momentos que capturan el impacto de nuestro trabajo misionero
          </p>
        </div>
        
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-6">Fotografías</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {galleryImages.map((image, index) => (
              <Dialog key={index}>
                <DialogTrigger asChild>
                  <div
                    className="relative aspect-[4/3] overflow-hidden rounded-lg group cursor-pointer"
                    onClick={() => setSelectedImage(index)}
                  >
                    <ImageWithSkeleton
                      src={image.url || "/placeholder.svg"}
                      alt={image.alt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <ZoomIn className="w-12 h-12 text-white" />
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={image.alt}
                    className="w-full h-auto rounded-lg"
                  />
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-semibold mb-6">Videos</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {galleryVideos.map((video, index) => (
              <div
                key={index}
                className="relative aspect-video overflow-hidden rounded-lg bg-muted animate-pulse"
              >
                <iframe
                  src={video.url}
                  title={video.title}
                  className="w-full h-full absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
