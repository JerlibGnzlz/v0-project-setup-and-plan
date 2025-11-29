'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Newspaper, 
  Calendar, 
  ArrowLeft, 
  ArrowRight, 
  Search, 
  Filter,
  Eye,
  User,
  Star,
  Loader2,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useNoticiasPublicadas } from '@/lib/hooks/use-noticias'
import { Noticia, CategoriaNoticia, categoriaLabels, categoriaColors } from '@/lib/api/noticias'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { QueryProvider } from '@/lib/providers/query-provider'
import { getReturnUrl } from '@/lib/utils/scroll-restore'
import { formatViews } from '@/lib/utils/view-tracker'

function formatDate(dateString: string | null): string {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    // Asegurarse de que la fecha es válida
    if (isNaN(date.getTime())) return ''
    // Formato: "26 de noviembre, 2025 a las 14:30"
    return format(date, "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })
  } catch {
    return ''
  }
}

const categorias: CategoriaNoticia[] = ['ANUNCIO', 'EVENTO', 'ACTIVIDAD', 'OPORTUNIDADES', 'CAPACITACION', 'COMUNICADO']

function NewsCard({ noticia }: { noticia: Noticia }) {
  return (
    <Link 
      href={`/noticias/${noticia.slug}`}
      className="group block bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-white/5">
        {noticia.imagenUrl ? (
          <Image
            src={noticia.imagenUrl}
            alt={noticia.titulo}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-105"
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

        {noticia.destacado && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/90 text-black text-xs font-bold">
            <Star className="w-3 h-3 fill-current" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2">
          {noticia.titulo}
        </h3>
        
        {noticia.extracto && (
          <p className="text-white/60 text-sm mb-4 line-clamp-3">
            {noticia.extracto}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-white/50 text-xs">
          {noticia.fechaPublicacion && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(noticia.fechaPublicacion)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {formatViews(noticia.vistas || 0)} vistas
          </span>
          {noticia.autor && (
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {noticia.autor}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function NoticiasContent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaNoticia | null>(null)
  const { data: noticias = [], isLoading } = useNoticiasPublicadas()

  const filteredNoticias = noticias.filter((noticia) => {
    const matchesSearch = 
      noticia.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      noticia.extracto?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategoria = !selectedCategoria || noticia.categoria === selectedCategoria

    return matchesSearch && matchesCategoria
  })

  const destacadas = filteredNoticias.filter(n => n.destacado)
  const regulares = filteredNoticias.filter(n => !n.destacado)

  return (
    <div className="min-h-screen bg-[#0a1628]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a1628]/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href={typeof window !== 'undefined' ? getReturnUrl() : '/#noticias'} 
              className="flex items-center gap-2 text-white hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Volver</span>
            </Link>
            <h1 className="text-xl font-bold text-white">Noticias</h1>
            <div className="w-20" /> {/* Spacer */}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10">
            <Newspaper className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-white/80 font-medium">Blog & Anuncios</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Últimas{' '}
            <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
              Noticias
            </span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Mantente informado sobre los últimos acontecimientos, eventos y anuncios de nuestra comunidad
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              placeholder="Buscar noticias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-emerald-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategoria(null)}
              className={cn(
                "rounded-full border transition-all",
                !selectedCategoria 
                  ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" 
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
              )}
            >
              Todas
            </Button>
            {categorias.map((cat) => (
              <Button
                key={cat}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategoria(selectedCategoria === cat ? null : cat)}
                className={cn(
                  "rounded-full border transition-all",
                  selectedCategoria === cat 
                    ? categoriaColors[cat]
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                )}
              >
                {categoriaLabels[cat]}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : filteredNoticias.length === 0 ? (
          <div className="text-center py-20">
            <Newspaper className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 text-lg">No se encontraron noticias</p>
            {(searchQuery || selectedCategoria) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategoria(null)
                }}
                className="mt-4 text-emerald-400 hover:text-emerald-300"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Destacadas */}
            {destacadas.length > 0 && (
              <div className="mb-12">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  Destacadas
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {destacadas.slice(0, 2).map((noticia) => (
                    <NewsCard key={noticia.id} noticia={noticia} />
                  ))}
                </div>
              </div>
            )}

            {/* Todas las noticias */}
            <div>
              <h2 className="text-xl font-bold text-white mb-6">
                {destacadas.length > 0 ? 'Más Noticias' : 'Todas las Noticias'}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {regulares.map((noticia) => (
                  <NewsCard key={noticia.id} noticia={noticia} />
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <Link 
            href={typeof window !== 'undefined' ? getReturnUrl() : '/#noticias'} 
            className="text-white/60 hover:text-emerald-400 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la página principal
          </Link>
        </div>
      </footer>
    </div>
  )
}

export default function NoticiasPage() {
  return (
    <QueryProvider>
      <NoticiasContent />
    </QueryProvider>
  )
}
