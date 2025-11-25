'use client'

import { useState } from 'react'
import { ImageWithSkeleton } from './image-with-skeleton'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog'
import { ZoomIn, Loader2, ImageIcon, Video, Camera } from 'lucide-react'
import { useGaleria } from '@/lib/hooks/use-galeria'
import type { GaleriaImagen } from '@/lib/api/galeria'

export function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const { data: galeria = [], isLoading } = useGaleria()

  const imagenes = galeria.filter((item: GaleriaImagen) =>
    (item.tipo === 'IMAGEN' || !item.tipo) && item.activa
  )
  const videos = galeria.filter((item: GaleriaImagen) =>
    item.tipo === 'VIDEO' && item.activa
  )

  if (!isLoading && imagenes.length === 0 && videos.length === 0) {
    return null
  }

  return (
    <section id="galeria" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0a1628]">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[120px]" />
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
            <Camera className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-white/80 font-medium">Momentos Capturados</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Nuestra{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Galería
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Momentos que capturan el impacto de nuestro trabajo misionero
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-purple-400" />
          </div>
        ) : (
          <>
            {/* Images Section */}
            {imagenes.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                    <ImageIcon className="size-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Fotografías</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent ml-4" />
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {imagenes.map((image: GaleriaImagen, index: number) => (
                    <Dialog key={image.id}>
                      <DialogTrigger asChild>
                        <div
                          className="relative aspect-[4/3] overflow-hidden rounded-xl group cursor-pointer"
                          onClick={() => setSelectedImage(index)}
                        >
                          {/* Glow on hover */}
                          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
                          <div className="relative h-full rounded-xl overflow-hidden border border-white/10 group-hover:border-white/20 transition-all duration-300">
                            <ImageWithSkeleton
                              src={image.imagenUrl || "/placeholder.svg"}
                              alt={image.titulo}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent opacity-60" />
                            <div className="absolute inset-0 bg-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                                <ZoomIn className="w-6 h-6 text-white" />
                              </div>
                            </div>
                            {image.titulo && (
                              <div className="absolute bottom-0 left-0 right-0 p-3">
                                <p className="text-white text-sm font-medium truncate">
                                  {image.titulo}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl bg-[#0a1628]/95 backdrop-blur-xl border-white/10">
                        <DialogTitle className="sr-only">{image.titulo}</DialogTitle>
                        <img
                          src={image.imagenUrl || "/placeholder.svg"}
                          alt={image.titulo}
                          className="w-full h-auto rounded-xl"
                        />
                        {image.descripcion && (
                          <p className="text-center text-white/60 mt-4">
                            {image.descripcion}
                          </p>
                        )}
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </div>
            )}

            {/* Videos Section */}
            {videos.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                    <Video className="size-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Videos</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-blue-500/50 to-transparent ml-4" />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {videos.map((video: GaleriaImagen) => {
                    const isCloudinary = video.imagenUrl.includes('cloudinary.com')
                    const urlParts = isCloudinary
                      ? video.imagenUrl.match(/cloudinary\.com\/([^/]+)\/video\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/)
                      : null
                    
                    // Only use Cloudinary player if URL matched the expected pattern
                    const canUseCloudinaryPlayer = urlParts && urlParts[1] && urlParts[2]

                    if (canUseCloudinaryPlayer) {
                      const cloudName = urlParts[1]
                      const publicId = urlParts[2]
                      const playerUrl = `https://player.cloudinary.com/embed/?cloud_name=${cloudName}&public_id=${publicId}&controls=true&source_types%5B0%5D=mp4`

                      return (
                        <div key={video.id} className="relative group">
                          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                          <div className="relative aspect-video overflow-hidden rounded-xl bg-[#0a1628] border border-white/10 group-hover:border-white/20 transition-all duration-300">
                            <iframe
                              src={playerUrl}
                              className="w-full h-full"
                              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                              allowFullScreen
                              frameBorder="0"
                              title={video.titulo}
                            />
                          </div>
                        </div>
                      )
                    }

                    // Fallback to native video player for non-Cloudinary URLs or invalid Cloudinary URLs
                    return (
                      <div key={video.id} className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                        <div className="relative aspect-video overflow-hidden rounded-xl bg-[#0a1628] border border-white/10">
                          <video
                            src={video.imagenUrl}
                            className="w-full h-full object-contain"
                            controls
                            playsInline
                            preload="auto"
                          >
                            Tu navegador no soporta videos HTML5
                          </video>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Decorative */}
      <div className="absolute top-20 right-8 w-32 h-px bg-gradient-to-l from-purple-500/50 to-transparent" />
      <div className="absolute bottom-20 left-8 w-32 h-px bg-gradient-to-r from-pink-500/50 to-transparent" />
    </section>
  )
}
