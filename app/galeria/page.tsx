'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useGaleria } from '@/lib/hooks/use-galeria'
import { useConvenciones } from '@/lib/hooks/use-convenciones'
import type { GaleriaImagen, TipoGaleria } from '@/lib/api/galeria'
import { ImageWithSkeleton } from '@/components/image-with-skeleton'
import { VideoCardModern } from '@/components/video-card-modern'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Filter,
  ImageIcon,
  Video,
  Loader2,
  ArrowLeft,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { QueryProvider } from '@/lib/providers/query-provider'

// Helper para verificar si URL es local
function isLocalUrl(url: string): boolean {
  return url?.includes('localhost:') || url?.includes('127.0.0.1')
}

// Lightbox para imágenes
function ImageLightbox({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: {
  images: GaleriaImagen[]
  currentIndex: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}) {
  const currentImage = images[currentIndex]

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation */}
      {images.length > 1 && (
        <>
          <button
            onClick={e => {
              e.stopPropagation()
              onPrev()
            }}
            className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={e => {
              e.stopPropagation()
              onNext()
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
          src={currentImage.imagenUrl || '/placeholder.svg'}
          alt={currentImage.titulo}
          className="w-full h-full object-contain rounded-xl"
        />
        {/* Caption */}
        <div className="text-center mt-4">
          <p className="text-white font-medium text-lg">{currentImage.titulo}</p>
          {currentImage.descripcion && (
            <p className="text-white/60 mt-2">{currentImage.descripcion}</p>
          )}
          <p className="text-white/40 text-sm mt-2">
            {currentIndex + 1} / {images.length}
          </p>
        </div>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4 py-2 rounded-full bg-white/5 backdrop-blur-md">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={e => {
                e.stopPropagation()
                // Navigate to specific image
                const diff = idx - currentIndex
                if (diff > 0) {
                  for (let i = 0; i < diff; i++) onNext()
                } else if (diff < 0) {
                  for (let i = 0; i < Math.abs(diff); i++) onPrev()
                }
              }}
              className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                idx === currentIndex
                  ? 'border-emerald-500 scale-110'
                  : 'border-transparent opacity-50 hover:opacity-100'
              }`}
            >
              <img src={img.imagenUrl || '/placeholder.svg'} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function GaleriaPageContent() {
  const router = useRouter()
  const { data: galeria = [], isLoading: isLoadingGaleria } = useGaleria()
  const { data: convenciones = [], isLoading: isLoadingConvenciones } = useConvenciones()

  // Estados de filtros
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedConvencion, setSelectedConvencion] = useState<string>('all')
  const [selectedTipo, setSelectedTipo] = useState<string>('all')
  const [selectedCategoria, setSelectedCategoria] = useState<string>('all')

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)

  // Filtrar galería
  const filteredGaleria = useMemo(() => {
    return galeria.filter((item: GaleriaImagen) => {
      // Solo mostrar activos
      if (!item.activa) return false

      // Filtro de búsqueda
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = item.titulo?.toLowerCase().includes(query)
        const matchesDescription = item.descripcion?.toLowerCase().includes(query)
        if (!matchesTitle && !matchesDescription) return false
      }

      // Filtro por convención
      if (selectedConvencion !== 'all') {
        if (item.convencionId !== selectedConvencion) return false
      }

      // Filtro por tipo
      if (selectedTipo !== 'all') {
        if (item.tipo !== selectedTipo) return false
      }

      // Filtro por categoría
      if (selectedCategoria !== 'all') {
        if (item.categoria !== selectedCategoria) return false
      }

      return true
    })
  }, [galeria, searchQuery, selectedConvencion, selectedTipo, selectedCategoria])

  // Separar imágenes y videos
  const imagenes = filteredGaleria.filter(
    (item: GaleriaImagen) => (item.tipo === 'IMAGEN' || !item.tipo) && item.activa
  )
  const videos = filteredGaleria.filter((item: GaleriaImagen) => item.tipo === 'VIDEO' && item.activa)

  // Obtener categorías únicas
  const categorias = useMemo(() => {
    const cats = new Set<string>()
    galeria.forEach((item: GaleriaImagen) => {
      if (item.categoria) cats.add(item.categoria)
    })
    return Array.from(cats).sort()
  }, [galeria])

  // Handlers para lightbox
  const openLightbox = (index: number) => {
    setSelectedImageIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const nextImage = () => {
    if (selectedImageIndex < imagenes.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1)
    } else {
      setSelectedImageIndex(0)
    }
  }

  const prevImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1)
    } else {
      setSelectedImageIndex(imagenes.length - 1)
    }
  }

  // Generar thumbnail para videos de Cloudinary
  const getVideoThumbnail = (video: GaleriaImagen): string => {
    if (isLocalUrl(video.imagenUrl)) return '/placeholder.svg'

    const isCloudinary = video.imagenUrl.includes('cloudinary.com')
    if (!isCloudinary) return '/placeholder.svg'

    const cloudMatch = video.imagenUrl.match(/cloudinary\.com\/([^/]+)\/video\/upload\//)
    if (!cloudMatch) return '/placeholder.svg'

    const cloudName = cloudMatch[1]
    const afterUpload = video.imagenUrl.split('/video/upload/')[1]
    if (!afterUpload) return '/placeholder.svg'

    const parts = afterUpload.split('/')
    const filteredParts = parts.filter(part => {
      if (part.includes('_') && (part.includes(',') || part.match(/^[a-z]+_[\d.]+$/))) return false
      if (part.match(/^v\d+$/)) return false
      return true
    })
    const publicId = filteredParts.join('/').replace(/\.[^.]+$/, '')

    const thumbnailOffset =
      video.thumbnailTime !== undefined && video.thumbnailTime !== null
        ? video.thumbnailTime.toFixed(1)
        : video.videoStartTime !== undefined && video.videoStartTime !== null
          ? video.videoStartTime.toFixed(1)
          : '0'

    return `https://res.cloudinary.com/${cloudName}/video/upload/so_${thumbnailOffset},w_640,h_360,c_fill,f_jpg/${publicId}.jpg`
  }

  // Limpiar filtros
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedConvencion('all')
    setSelectedTipo('all')
    setSelectedCategoria('all')
  }

  const hasActiveFilters =
    searchQuery || selectedConvencion !== 'all' || selectedTipo !== 'all' || selectedCategoria !== 'all'

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      <Navbar />
      <main className="pt-20">
        {/* Header */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-[#0a1628]">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px]" />
              <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-sky-500/20 rounded-full blur-[120px]" />
            </div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="mb-6 text-white/60 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>

            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-white/80 font-medium">Galería Completa</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
                Nuestra{' '}
                <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
                  Galería
                </span>
              </h1>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                Explora todos los momentos capturados de nuestras convenciones
              </p>
            </div>

            {/* Filtros */}
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Barra de búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  type="text"
                  placeholder="Buscar por título o descripción..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Filter className="w-4 h-4" />
                  <span>Filtros:</span>
                </div>

                <Select value={selectedConvencion} onValueChange={setSelectedConvencion}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Todas las convenciones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las convenciones</SelectItem>
                    {convenciones.map(conv => (
                      <SelectItem key={conv.id} value={conv.id}>
                        {conv.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedTipo} onValueChange={setSelectedTipo}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="IMAGEN">Imágenes</SelectItem>
                    <SelectItem value="VIDEO">Videos</SelectItem>
                  </SelectContent>
                </Select>

                {categorias.length > 0 && (
                  <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {categorias.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Limpiar
                  </Button>
                )}
              </div>

              {/* Contador de resultados */}
              <div className="text-sm text-white/40">
                Mostrando {filteredGaleria.length} de {galeria.length} elementos
              </div>
            </div>
          </div>
        </section>

        {/* Contenido */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoadingGaleria || isLoadingConvenciones ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="size-8 animate-spin text-emerald-400" />
              </div>
            ) : filteredGaleria.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-white/60 text-lg">No se encontraron elementos</p>
                {hasActiveFilters && (
                  <Button variant="ghost" onClick={clearFilters} className="mt-4 text-white/60">
                    Limpiar filtros
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Imágenes */}
                {imagenes.length > 0 && (
                  <div className="mb-16">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25">
                        <ImageIcon className="size-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Fotografías</h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/50 to-transparent ml-4" />
                      <span className="text-white/40 text-sm">{imagenes.length} imágenes</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {imagenes.map((image: GaleriaImagen, index: number) => (
                        <div
                          key={image.id}
                          className="relative cursor-pointer group"
                          onClick={() => openLightbox(index)}
                        >
                          <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10 group-hover:border-emerald-500/50 transition-all duration-500">
                            <ImageWithSkeleton
                              src={image.imagenUrl || '/placeholder.svg'}
                              alt={image.titulo}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent opacity-70 group-hover:opacity-40 transition-opacity duration-300" />
                            {image.titulo && (
                              <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                <p className="text-white text-sm font-medium truncate">{image.titulo}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Videos */}
                {videos.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 shadow-lg shadow-sky-500/25">
                        <Video className="size-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Videos</h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-sky-500/50 to-transparent ml-4" />
                      <span className="text-white/40 text-sm">{videos.length} videos</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {videos.map((video: GaleriaImagen) => {
                        if (isLocalUrl(video.imagenUrl)) {
                          return (
                            <div
                              key={video.id}
                              className="relative aspect-video overflow-hidden rounded-2xl bg-[#0d1f35] border border-white/10 flex items-center justify-center"
                            >
                              <div className="text-center text-white/60 p-4">
                                <Video className="size-8 opacity-50 mx-auto mb-4" />
                                <p className="text-sm font-medium text-white">{video.titulo}</p>
                                <p className="text-xs mt-1">Video no disponible</p>
                              </div>
                            </div>
                          )
                        }

                        const isPlaying = playingVideo === video.id
                        const thumbnailUrl = getVideoThumbnail(video)

                        if (isPlaying) {
                          return (
                            <div
                              key={video.id}
                              className="relative aspect-video overflow-hidden rounded-2xl bg-black border border-sky-500/50 shadow-2xl shadow-sky-500/20"
                            >
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
                          )
                        }

                        return (
                          <VideoCardModern
                            key={video.id}
                            video={video}
                            thumbnailUrl={thumbnailUrl}
                            onPlay={() => setPlayingVideo(video.id)}
                            isFullPlaying={isPlaying}
                          />
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Lightbox */}
      {lightboxOpen && imagenes.length > 0 && (
        <ImageLightbox
          images={imagenes}
          currentIndex={selectedImageIndex}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}
    </div>
  )
}

export default function GaleriaPage() {
  return (
    <QueryProvider>
      <GaleriaPageContent />
    </QueryProvider>
  )
}

