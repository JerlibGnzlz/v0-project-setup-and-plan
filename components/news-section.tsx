'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Newspaper,
  Calendar,
  ArrowRight,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
  TrendingUp,
  Radio,
  Zap,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNoticiasPublicadas } from '@/lib/hooks/use-noticias'
import { Noticia, categoriaLabels, categoriaColors } from '@/lib/api/noticias'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatViews } from '@/lib/utils/view-tracker'

// Formatear fecha con hora
function formatDate(dateString: string | Date | null): string {
  if (!dateString) return ''
  try {
    // Si es un string, crear Date. Si ya es Date, usar directamente
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    // Asegurarse de que la fecha es válida
    if (isNaN(date.getTime())) return ''
    // Formato: "26 de noviembre, 2025 a las 14:30"
    // date-fns maneja correctamente las zonas horarias: la fecha viene en UTC de la BD
    // y se muestra en la zona horaria local del navegador
    return format(date, "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })
  } catch {
    return ''
  }
}

// Formatear fecha corta
function formatShortDate(dateString: string | Date | null): string {
  if (!dateString) return ''
  try {
    // Si es un string, crear Date. Si ya es Date, usar directamente
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    // Asegurarse de que la fecha es válida
    if (isNaN(date.getTime())) return ''
    // Formato corto: "26 Nov"
    // date-fns maneja correctamente las zonas horarias
    return format(date, 'd MMM', { locale: es })
  } catch {
    return ''
  }
}

// Breaking News Ticker
function NewsTicker({ noticias }: { noticias: Noticia[] }) {
  const tickerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-red-600 py-2.5">
      {/* Live indicator */}
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-4 bg-gradient-to-r from-red-700 to-red-600">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio className="w-4 h-4 text-white" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white rounded-full animate-ping" />
          </div>
          <span className="text-white font-bold text-sm tracking-wider uppercase">En Vivo</span>
        </div>
      </div>

      {/* Ticker content */}
      <div className="flex animate-ticker pl-32">
        {[...noticias, ...noticias].map((noticia, i) => (
          <div key={`${noticia.id}-${i}`} className="flex items-center whitespace-nowrap">
            <span className="text-white/90 text-sm font-medium px-4">{noticia.titulo}</span>
            <span className="text-white/50 text-lg">•</span>
          </div>
        ))}
      </div>

      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-red-600 to-transparent pointer-events-none" />
    </div>
  )
}

// Noticia Principal Hero
function MainNewsHero({ noticia }: { noticia: Noticia }) {
  return (
    <Link
      href={`/noticias/${noticia.slug}`}
      className="group relative block overflow-hidden rounded-2xl bg-slate-900"
    >
      {/* Image container */}
      <div className="relative aspect-[16/9] lg:aspect-[21/10] bg-black/20">
        {noticia.imagenUrl ? (
          <Image
            src={noticia.imagenUrl}
            alt={noticia.titulo}
            fill
            className="object-contain transition-transform duration-700 group-hover:scale-105"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600" />
        )}

        {/* Multiple overlay gradients for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          {/* Breaking badge */}
          <div className="flex items-center gap-2">
            {noticia.destacado && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-600 text-white text-xs font-bold uppercase tracking-wider animate-pulse">
                <Zap className="w-3 h-3" />
                Breaking
              </div>
            )}
            <div
              className={cn(
                'px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider',
                'bg-emerald-500/90 text-white'
              )}
            >
              {categoriaLabels[noticia.categoria]}
            </div>
          </div>

          {/* Views */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded bg-black/50 backdrop-blur-sm text-white/80 text-xs">
            <Eye className="w-3 h-3" />
            {formatViews(noticia.vistas || 0)} vistas
          </div>
        </div>
      </div>

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-10">
        {/* Date and author */}
        <div className="flex items-center gap-4 text-white/60 text-sm mb-4">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {formatDate(noticia.fechaPublicacion)}
          </span>
          {noticia.autor && (
            <>
              <span className="text-white/30">|</span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                Por {noticia.autor}
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors leading-tight">
          {noticia.titulo}
        </h3>

        {/* Excerpt */}
        {noticia.extracto && (
          <p className="text-white/70 text-base md:text-lg mb-6 line-clamp-2 max-w-4xl">
            {noticia.extracto}
          </p>
        )}

        {/* Read more */}
        <div className="inline-flex items-center gap-2 text-emerald-400 font-semibold group-hover:gap-3 transition-all">
          Leer artículo completo
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>

      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-emerald-500/20 to-transparent" />
      </div>
    </Link>
  )
}

// Noticia secundaria en grid
function SecondaryNewsCard({
  noticia,
  size = 'normal',
}: {
  noticia: Noticia
  size?: 'normal' | 'small'
}) {
  const isSmall = size === 'small'

  return (
    <Link href={`/noticias/${noticia.slug}`} className="group block h-full">
      <div
        className={cn(
          'relative h-full overflow-hidden rounded-xl transition-all duration-300',
          'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm',
          'border border-white/10 hover:border-emerald-500/50',
          'hover:shadow-2xl hover:shadow-emerald-500/10',
          'hover:-translate-y-1'
        )}
      >
        {/* Image */}
        <div
          className={cn(
            'relative overflow-hidden bg-black/20',
            isSmall ? 'aspect-[16/10]' : 'aspect-[16/9]'
          )}
        >
          {noticia.imagenUrl ? (
            <Image
              src={noticia.imagenUrl}
              alt={noticia.titulo}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
              <Newspaper className="w-12 h-12 text-white/10" />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent opacity-60" />

          {/* Category */}
          <div className="absolute top-3 left-3">
            <span
              className={cn(
                'px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider',
                'bg-emerald-500/90 text-white'
              )}
            >
              {categoriaLabels[noticia.categoria]}
            </span>
          </div>

          {/* Date badge */}
          <div className="absolute top-3 right-3 flex flex-col items-center px-2.5 py-1.5 rounded bg-white/10 backdrop-blur-sm">
            <span className="text-white text-xs font-bold leading-none">
              {formatShortDate(noticia.fechaPublicacion)?.split(' ')[0]}
            </span>
            <span className="text-white/60 text-[10px] uppercase">
              {formatShortDate(noticia.fechaPublicacion)?.split(' ')[1]}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          <h3
            className={cn(
              'font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2',
              isSmall ? 'text-sm' : 'text-base sm:text-lg'
            )}
          >
            {noticia.titulo}
          </h3>

          {!isSmall && noticia.extracto && (
            <p className="text-white/50 text-sm mb-4 line-clamp-2">{noticia.extracto}</p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div className="flex items-center gap-2 text-white/40 text-xs">
              <Eye className="w-3 h-3" />
              {formatViews(noticia.vistas || 0)} vistas
            </div>
            <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium group-hover:gap-2 transition-all">
              Leer
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Hover line effect */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </div>
    </Link>
  )
}

// Lista de noticias lateral
function SideNewsList({ noticias }: { noticias: Noticia[] }) {
  return (
    <div className="space-y-1">
      {noticias.map((noticia, index) => (
        <Link
          key={noticia.id}
          href={`/noticias/${noticia.slug}`}
          className="group flex gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors"
        >
          {/* Number */}
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
            <span className="text-emerald-400 font-bold text-sm">{index + 1}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <span
              className={cn(
                'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded',
                'bg-emerald-500/20 text-emerald-400'
              )}
            >
              {categoriaLabels[noticia.categoria]}
            </span>
            <h4 className="text-white text-sm font-medium mt-1.5 group-hover:text-emerald-400 transition-colors line-clamp-2">
              {noticia.titulo}
            </h4>
            <p className="text-white/40 text-xs mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(noticia.fechaPublicacion)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}

export function NewsSection() {
  const { data: noticias = [], isLoading } = useNoticiasPublicadas(10)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Separar noticias
  const destacada = noticias.find(n => n.destacado) || noticias[0]
  const secundarias = noticias.filter(n => n.id !== destacada?.id).slice(0, 3)
  const laterales = noticias
    .filter(n => n.id !== destacada?.id && !secundarias.find(s => s.id === n.id))
    .slice(0, 5)

  if (isLoading) {
    return (
      <section className="relative py-24 overflow-hidden bg-[#0a1628]">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
              <p className="text-white/40 text-sm">Cargando noticias...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Estado vacío profesional cuando no hay noticias
  if (noticias.length === 0) {
    return (
      <section id="noticias" className="relative overflow-hidden bg-[#0a1628]">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px]" />
        </div>

        <div className="container mx-auto px-4 py-16 sm:py-20 lg:py-24 relative z-10">
          {/* Header */}
          <div className="mb-10 sm:mb-12">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400 font-medium">Noticias</span>
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
                Noticias y{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                    Actualidad
                  </span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-emerald-500/30"
                    viewBox="0 0 100 12"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 6 Q 25 0 50 6 T 100 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </span>
              </h2>

              <p className="text-white/50 text-base sm:text-lg max-w-xl">
                Mantente al día con los últimos acontecimientos y anuncios de nuestra comunidad
              </p>
            </div>
          </div>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 lg:py-24">
            <div className="relative max-w-2xl mx-auto text-center">
              {/* Icon container with glow */}
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl border border-emerald-500/30 flex items-center justify-center backdrop-blur-sm">
                  <Newspaper className="w-12 h-12 text-emerald-400" />
                </div>
              </div>

              {/* Message */}
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">Próximamente</h3>
              <p className="text-white/60 text-lg mb-2 max-w-md mx-auto">
                Estamos preparando contenido especial para ti
              </p>
              <p className="text-white/40 text-sm max-w-md mx-auto mb-8">
                Muy pronto compartiremos noticias, anuncios y actualizaciones importantes de nuestra
                comunidad
              </p>

              {/* Decorative elements */}
              <div className="flex items-center justify-center gap-2 mt-8">
                <div
                  className="w-2 h-2 rounded-full bg-emerald-500/50 animate-pulse"
                  style={{ animationDelay: '0s' }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-teal-500/50 animate-pulse"
                  style={{ animationDelay: '0.2s' }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-cyan-500/50 animate-pulse"
                  style={{ animationDelay: '0.4s' }}
                />
              </div>

              {/* Quote */}
              <div className="mt-12 p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm max-w-lg mx-auto">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <span className="text-emerald-400 text-xl">"</span>
                  </div>
                  <div className="text-left">
                    <p className="text-white/70 italic text-sm leading-relaxed">
                      La información oportuna fortalece nuestra comunidad y nos mantiene unidos en
                      propósito y visión.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decorative line */}
        <div className="h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
      </section>
    )
  }

  return (
    <section id="noticias" className="relative overflow-hidden bg-[#0a1628]">
      {/* Breaking News Ticker */}
      {noticias.length > 0 && <NewsTicker noticias={noticias.slice(0, 5)} />}

      {/* Main content */}
      <div className="py-16 sm:py-20 lg:py-24">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px]" />

          {/* Newspaper pattern */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 50px,
                  rgba(255,255,255,0.03) 50px,
                  rgba(255,255,255,0.03) 51px
                )
              `,
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="mb-10 sm:mb-12">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400 font-medium">Lo Último</span>
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
                Noticias y{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                    Actualidad
                  </span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-emerald-500/30"
                    viewBox="0 0 100 12"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 6 Q 25 0 50 6 T 100 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </span>
              </h2>

              <p className="text-white/50 text-base sm:text-lg max-w-xl">
                Mantente al día con los últimos acontecimientos y anuncios de nuestra comunidad
              </p>
            </div>
          </div>

          {/* News Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Main column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Featured article */}
              {destacada && <MainNewsHero noticia={destacada} />}

              {/* Secondary grid */}
              {secundarias.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {secundarias.map(noticia => (
                    <SecondaryNewsCard key={noticia.id} noticia={noticia} />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-24">
                {/* Sidebar header */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                  <div className="w-1 h-6 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full" />
                  <h3 className="text-white font-bold">Más Noticias</h3>
                </div>

                {/* Side news list */}
                {laterales.length > 0 && <SideNewsList noticias={laterales} />}

                {/* CTA Card */}
                <div className="mt-6 p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span className="text-white font-semibold">¿Te interesa más?</span>
                  </div>
                  <p className="text-white/60 text-sm mb-4">
                    Explora todas nuestras noticias, devocionales y anuncios.
                  </p>
                  <Link
                    href="/noticias"
                    className="block"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        sessionStorage.setItem('amva_last_section', 'noticias')
                      }
                    }}
                  >
                    <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white">
                      Ver todas las noticias
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      {/* Ticker animation styles */}
      <style jsx global>{`
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-ticker {
          animation: ticker 30s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}
