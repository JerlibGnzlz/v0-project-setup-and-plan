'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ImageWithSkeleton } from './image-with-skeleton'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog'
import {
  ZoomIn,
  Loader2,
  ImageIcon,
  Video,
  Camera,
  VideoOff,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowRight,
} from 'lucide-react'
import { VideoCardModern } from './video-card-modern'
import { useGaleria } from '@/lib/hooks/use-galeria'
import type { GaleriaImagen } from '@/lib/api/galeria'
import { Button } from './ui/button'

// Helper to check if URL is local (won't work in production)
function isLocalUrl(url: string): boolean {
  return url?.includes('localhost:') || url?.includes('127.0.0.1')
}

// 3D Tilt Card Component
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState('')
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 20
    const rotateY = (centerX - x) / 20

    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    )
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 0.15 })
  }

  const handleMouseLeave = () => {
    setTransform('')
    setGlare({ x: 50, y: 50, opacity: 0 })
  }

  return (
    <div
      ref={cardRef}
      className={`transition-transform duration-200 ease-out ${className}`}
      style={{ transform }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {/* Glare effect */}
      <div
        className="absolute inset-0 pointer-events-none rounded-xl transition-opacity duration-200"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 50%)`,
        }}
      />
    </div>
  )
}

// Animated section that fades in on scroll
function AnimateOnScroll({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {children}
    </div>
  )
}

export function GallerySection() {
  const router = useRouter()
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  const { data: galeria = [], isLoading } = useGaleria()

  // Limitar imágenes y videos para la landing page (el resto se ve en /galeria)
  const todasImagenes = galeria.filter(
    (item: GaleriaImagen) => (item.tipo === 'IMAGEN' || !item.tipo) && item.activa
  )
  const todosVideos = galeria.filter((item: GaleriaImagen) => item.tipo === 'VIDEO' && item.activa)
  
  // Mostrar más imágenes y videos en la landing (12 imágenes y 6 videos)
  // Todas las demás se pueden ver en la página completa /galeria
  const MAX_IMAGENES_LANDING = 12
  const MAX_VIDEOS_LANDING = 6
  
  const imagenes = todasImagenes.slice(0, MAX_IMAGENES_LANDING)
  const videos = todosVideos.slice(0, MAX_VIDEOS_LANDING)

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setSelectedImageIndex(null)
  }

  const nextImage = () => {
    if (selectedImageIndex !== null && imagenes.length > 0) {
      setSelectedImageIndex((selectedImageIndex + 1) % imagenes.length)
    }
  }

  const prevImage = () => {
    if (selectedImageIndex !== null && imagenes.length > 0) {
      setSelectedImageIndex((selectedImageIndex - 1 + imagenes.length) % imagenes.length)
    }
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'Escape') closeLightbox()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, selectedImageIndex])

  if (!isLoading && imagenes.length === 0 && videos.length === 0) {
    return null
  }

  // Bento grid classes - create visual variety
  const getBentoClass = (index: number) => {
    const patterns = [
      'col-span-1 row-span-1',
      'col-span-1 row-span-1',
      'col-span-1 row-span-2 md:col-span-1',
      'col-span-1 row-span-1',
    ]
    return patterns[index % patterns.length]
  }

  return (
    <section id="galeria" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0a1628]">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-sky-500/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] animate-blob" />
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
        <AnimateOnScroll>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <Camera className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-white/80 font-medium">Momentos Capturados</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
              Nuestra{' '}
              <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
                Galería
              </span>
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-6">
              Momentos que capturan el impacto de nuestro trabajo misionero
            </p>
            <Button
              onClick={() => router.push('/galeria')}
              variant="outline"
              className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30"
            >
              Ver Galería Completa
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </AnimateOnScroll>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-emerald-400" />
          </div>
        ) : (
          <>
            {/* Images Section - Bento Grid */}
            {imagenes.length > 0 && (
              <AnimateOnScroll delay={100}>
                <div className="mb-20">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25">
                      <ImageIcon className="size-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Fotografías</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/50 to-transparent ml-4" />
                    <span className="text-white/40 text-sm">
                      {imagenes.length} {todasImagenes.length > MAX_IMAGENES_LANDING && `de ${todasImagenes.length}`} imágenes
                    </span>
                  </div>

                  {/* Bento Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[220px]">
                    {imagenes.map((image: GaleriaImagen, index: number) => (
                      <AnimateOnScroll key={image.id} delay={index * 100}>
                        <TiltCard
                          className={`relative cursor-pointer ${getBentoClass(index)} h-full`}
                        >
                          <div
                            className="relative h-full overflow-hidden rounded-xl group"
                            onClick={() => openLightbox(index)}
                          >
                            {/* Glow on hover */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 rounded-xl blur opacity-0 group-hover:opacity-50 transition-all duration-500" />

                            <div className="relative h-full rounded-xl overflow-hidden border border-white/10 group-hover:border-emerald-500/50 transition-all duration-500">
                              <ImageWithSkeleton
                                src={image.imagenUrl || '/placeholder.svg'}
                                alt={image.titulo}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />

                              {/* Gradient overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent opacity-70 group-hover:opacity-40 transition-opacity duration-300" />

                              {/* Hover overlay */}
                              <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/20 transition-all duration-300 flex items-center justify-center">
                                <div className="p-4 rounded-full bg-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300">
                                  <ZoomIn className="w-6 h-6 text-white" />
                                </div>
                              </div>

                              {/* Title */}
                              {image.titulo && (
                                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                  <p className="text-white text-sm font-medium truncate">
                                    {image.titulo}
                                  </p>
                                  {image.descripcion && (
                                    <p className="text-white/60 text-xs truncate mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                      {image.descripcion}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </TiltCard>
                      </AnimateOnScroll>
                    ))}
                  </div>
                  
                  {/* Mensaje si hay más imágenes */}
                  {todasImagenes.length > MAX_IMAGENES_LANDING && (
                    <div className="text-center mt-8">
                      <p className="text-white/60 text-sm mb-4">
                        Mostrando {MAX_IMAGENES_LANDING} de {todasImagenes.length} imágenes
                      </p>
                      <Button
                        onClick={() => router.push('/galeria')}
                        variant="outline"
                        size="sm"
                        className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                      >
                        Ver todas las imágenes
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              </AnimateOnScroll>
            )}

            {/* Videos Section */}
            {videos.length > 0 && (
              <AnimateOnScroll delay={200}>
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 shadow-lg shadow-sky-500/25">
                      <Video className="size-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Videos</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-sky-500/50 to-transparent ml-4" />
                    <span className="text-white/40 text-sm">
                      {videos.length} {todosVideos.length > MAX_VIDEOS_LANDING && `de ${todosVideos.length}`} videos
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {videos.map((video: GaleriaImagen, index: number) => {
                      // Check if video URL is local (won't work in production)
                      if (isLocalUrl(video.imagenUrl)) {
                        return (
                          <AnimateOnScroll key={video.id} delay={index * 150}>
                            <TiltCard className="relative">
                              <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-blue-500 rounded-2xl blur opacity-20" />
                              <div className="relative aspect-video overflow-hidden rounded-2xl bg-[#0d1f35] border border-white/10 flex items-center justify-center">
                                <div className="text-center text-white/60 p-4">
                                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                    <VideoOff className="size-8 opacity-50" />
                                  </div>
                                  <p className="text-sm font-medium text-white">{video.titulo}</p>
                                  <p className="text-xs mt-1">Video no disponible en producción</p>
                                </div>
                              </div>
                            </TiltCard>
                          </AnimateOnScroll>
                        )
                      }

                      const isCloudinary = video.imagenUrl.includes('cloudinary.com')
                      const isPlaying = playingVideo === video.id

                      // Generar thumbnail para videos de Cloudinary
                      let thumbnailUrl = '/placeholder.svg'
                      if (isCloudinary) {
                        const cloudMatch = video.imagenUrl.match(
                          /cloudinary\.com\/([^/]+)\/video\/upload\//
                        )
                        if (cloudMatch) {
                          const cloudName = cloudMatch[1]
                          const afterUpload = video.imagenUrl.split('/video/upload/')[1]
                          if (afterUpload) {
                            const parts = afterUpload.split('/')
                            const filteredParts = parts.filter(part => {
                              if (
                                part.includes('_') &&
                                (part.includes(',') || part.match(/^[a-z]+_[\d.]+$/))
                              )
                                return false
                              if (part.match(/^v\d+$/)) return false
                              return true
                            })
                            const publicId = filteredParts.join('/').replace(/\.[^.]+$/, '')

                            const thumbnailOffset =
                              video.thumbnailTime !== undefined && video.thumbnailTime !== null
                                ? video.thumbnailTime.toFixed(1)
                                : video.videoStartTime !== undefined &&
                                    video.videoStartTime !== null
                                  ? video.videoStartTime.toFixed(1)
                                  : '0'

                            thumbnailUrl = `https://res.cloudinary.com/${cloudName}/video/upload/so_${thumbnailOffset},w_640,h_360,c_fill,f_jpg/${publicId}.jpg`
                          }
                        }
                      }

                      // Si está reproduciendo en pantalla completa, mostrar el modal
                      if (isPlaying) {
                        return (
                          <AnimateOnScroll key={video.id} delay={index * 150}>
                            <div className="relative aspect-video overflow-hidden rounded-2xl bg-black border border-sky-500/50 shadow-2xl shadow-sky-500/20">
                              <video
                                src={video.imagenUrl}
                                className="w-full h-full object-contain"
                                controls
                                autoPlay
                                playsInline
                              >
                                Tu navegador no soporta videos HTML5
                              </video>
                              <button
                                onClick={() => setPlayingVideo(null)}
                                className="absolute top-3 right-3 p-2 rounded-full bg-black/70 hover:bg-black/90 text-white transition-colors z-10 backdrop-blur-sm"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </AnimateOnScroll>
                        )
                      }

                      // Modern video card with hover preview
                      return (
                        <AnimateOnScroll key={video.id} delay={index * 150}>
                          <VideoCardModern
                            video={video}
                            thumbnailUrl={thumbnailUrl}
                            onPlay={() => setPlayingVideo(video.id)}
                            isFullPlaying={isPlaying}
                          />
                        </AnimateOnScroll>
                      )
                    })}
                  </div>
                  
                  {/* Mensaje si hay más videos */}
                  {todosVideos.length > MAX_VIDEOS_LANDING && (
                    <div className="text-center mt-8">
                      <p className="text-white/60 text-sm mb-4">
                        Mostrando {MAX_VIDEOS_LANDING} de {todosVideos.length} videos
                      </p>
                      <Button
                        onClick={() => router.push('/galeria')}
                        variant="outline"
                        size="sm"
                        className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                      >
                        Ver todos los videos
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              </AnimateOnScroll>
            )}
          </>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && selectedImageIndex !== null && imagenes[selectedImageIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation */}
          {imagenes.length > 1 && (
            <>
              <button
                onClick={e => {
                  e.stopPropagation()
                  prevImage()
                }}
                className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={e => {
                  e.stopPropagation()
                  nextImage()
                }}
                className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image */}
          <div className="max-w-5xl max-h-[85vh] px-4" onClick={e => e.stopPropagation()}>
            <img
              src={imagenes[selectedImageIndex].imagenUrl || '/placeholder.svg'}
              alt={imagenes[selectedImageIndex].titulo}
              className="w-full h-full object-contain rounded-xl"
            />
            {/* Caption */}
            <div className="text-center mt-4">
              <p className="text-white font-medium text-lg">
                {imagenes[selectedImageIndex].titulo}
              </p>
              {imagenes[selectedImageIndex].descripcion && (
                <p className="text-white/60 mt-2">{imagenes[selectedImageIndex].descripcion}</p>
              )}
              <p className="text-white/40 text-sm mt-2">
                {selectedImageIndex + 1} / {imagenes.length}
              </p>
            </div>
          </div>

          {/* Thumbnail strip */}
          {imagenes.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4 py-2 rounded-full bg-white/5 backdrop-blur-md">
              {imagenes.map((img: GaleriaImagen, idx: number) => (
                <button
                  key={img.id}
                  onClick={e => {
                    e.stopPropagation()
                    setSelectedImageIndex(idx)
                  }}
                  className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    idx === selectedImageIndex
                      ? 'border-emerald-500 scale-110'
                      : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.imagenUrl || '/placeholder.svg'}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Decorative */}
      <div className="absolute top-20 right-8 w-32 h-px bg-gradient-to-l from-emerald-500/50 to-transparent" />
      <div className="absolute bottom-20 left-8 w-32 h-px bg-gradient-to-r from-amber-500/50 to-transparent" />
    </section>
  )
}
