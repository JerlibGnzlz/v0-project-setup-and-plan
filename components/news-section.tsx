'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Newspaper, 
  Calendar, 
  ArrowRight, 
  Clock, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNoticiasPublicadas } from '@/lib/hooks/use-noticias'
import { Noticia, categoriaLabels, categoriaColors } from '@/lib/api/noticias'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Formatear fecha
function formatDate(dateString: string | null): string {
  if (!dateString) return ''
  try {
    return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es })
  } catch {
    return ''
  }
}

// Tiempo de lectura estimado
function getReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

// Card de noticia destacada
function FeaturedNewsCard({ noticia }: { noticia: Noticia }) {
  return (
    <Link 
      href={`/noticias/${noticia.slug}`}
      className="group relative block overflow-hidden rounded-2xl"
    >
      {/* Background image */}
      <div className="relative aspect-[16/10] md:aspect-[21/9]">
        {noticia.imagenUrl ? (
          <Image
            src={noticia.imagenUrl}
            alt={noticia.titulo}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-sky-600 to-emerald-600" />
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        
        {/* Destacado badge */}
        {noticia.destacado && (
          <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/90 text-black text-xs font-bold">
            <Star className="w-3 h-3 fill-current" />
            Destacado
          </div>
        )}
        
        {/* Category badge */}
        <div className={cn(
          "absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-medium border",
          categoriaColors[noticia.categoria]
        )}>
          {categoriaLabels[noticia.categoria]}
        </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors line-clamp-2">
          {noticia.titulo}
        </h3>
        
        {noticia.extracto && (
          <p className="text-white/70 text-sm md:text-base mb-4 line-clamp-2 max-w-3xl">
            {noticia.extracto}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm">
          {noticia.fechaPublicacion && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(noticia.fechaPublicacion)}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {getReadingTime(noticia.contenido)} min de lectura
          </span>
          {noticia.autor && (
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {noticia.autor}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

// Card de noticia normal
function NewsCard({ noticia, index }: { noticia: Noticia; index: number }) {
  return (
    <Link 
      href={`/noticias/${noticia.slug}`}
      className="group block"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-[16/9] overflow-hidden">
          {noticia.imagenUrl ? (
            <Image
              src={noticia.imagenUrl}
              alt={noticia.titulo}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
              <Newspaper className="w-12 h-12 text-white/20" />
            </div>
          )}
          
          {/* Category badge */}
          <div className={cn(
            "absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium border",
            categoriaColors[noticia.categoria]
          )}>
            {categoriaLabels[noticia.categoria]}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2">
            {noticia.titulo}
          </h3>
          
          {noticia.extracto && (
            <p className="text-white/60 text-sm mb-4 line-clamp-2">
              {noticia.extracto}
            </p>
          )}

          <div className="flex items-center justify-between text-white/50 text-xs">
            <div className="flex items-center gap-3">
              {noticia.fechaPublicacion && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(noticia.fechaPublicacion)}
                </span>
              )}
            </div>
            <span className="flex items-center gap-1 text-emerald-400 group-hover:translate-x-1 transition-transform">
              Leer más
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function NewsSection() {
  const { data: noticias = [], isLoading } = useNoticiasPublicadas(7)
  const [currentPage, setCurrentPage] = useState(0)

  // Separar destacada del resto
  const destacada = noticias.find(n => n.destacado) || noticias[0]
  const resto = noticias.filter(n => n.id !== destacada?.id).slice(0, 6)

  // Paginación para móvil
  const itemsPerPage = 3
  const totalPages = Math.ceil(resto.length / itemsPerPage)
  const currentItems = resto.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)

  if (isLoading) {
    return (
      <section className="relative py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
          </div>
        </div>
      </section>
    )
  }

  if (noticias.length === 0) {
    return null // No mostrar si no hay noticias
  }

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0d1f35] to-[#0a1628]">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 -left-32 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[150px]" />
        
        {/* Subtle pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <Newspaper className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-white/80 font-medium">Noticias y Anuncios</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
              Últimas{' '}
              <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
                Noticias
              </span>
            </h2>
            <p className="text-lg text-white/60 max-w-2xl">
              Mantente informado sobre los últimos acontecimientos, eventos y anuncios de nuestra comunidad
            </p>
          </div>

          <Link href="/noticias">
            <Button 
              variant="ghost" 
              className="group text-white/70 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/20"
            >
              Ver todas las noticias
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Featured news */}
        {destacada && (
          <div className="mb-8">
            <FeaturedNewsCard noticia={destacada} />
          </div>
        )}

        {/* News grid - Desktop */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resto.map((noticia, index) => (
            <NewsCard key={noticia.id} noticia={noticia} index={index} />
          ))}
        </div>

        {/* News list - Mobile with pagination */}
        <div className="md:hidden">
          <div className="grid gap-4">
            {currentItems.map((noticia, index) => (
              <NewsCard key={noticia.id} noticia={noticia} index={index} />
            ))}
          </div>

          {/* Mobile pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      i === currentPage
                        ? "w-6 bg-gradient-to-r from-sky-400 to-emerald-400"
                        : "bg-white/20 hover:bg-white/40"
                    )}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <Link href="/noticias">
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300"
            >
              <Newspaper className="w-5 h-5 mr-2" />
              Explorar Todas las Noticias
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Decorative lines */}
      <div className="absolute top-20 left-8 w-32 h-px bg-gradient-to-r from-emerald-500/50 to-transparent" />
      <div className="absolute bottom-20 right-8 w-32 h-px bg-gradient-to-l from-sky-500/50 to-transparent" />
    </section>
  )
}

