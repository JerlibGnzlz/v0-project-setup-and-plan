'use client'

import { use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Eye,
  User,
  Share2,
  Facebook,
  Copy,
  Check,
  Loader2,
  Newspaper,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNoticiaBySlug, useNoticiasPublicadas } from '@/lib/hooks/use-noticias'
import { categoriaLabels, categoriaColors } from '@/lib/api/noticias'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { QueryProvider } from '@/lib/providers/query-provider'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { getReturnUrl } from '@/lib/utils/scroll-restore'
import { trackView, formatViews, clearViewCache } from '@/lib/utils/view-tracker'
import { noticiasApi } from '@/lib/api/noticias'
import { useQueryClient } from '@tanstack/react-query'

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

function NoticiaContent({ slug }: { slug: string }) {
  const queryClient = useQueryClient()
  const { data: noticia, isLoading, error } = useNoticiaBySlug(slug)
  const { data: otrasNoticias = [] } = useNoticiasPublicadas(4)
  const [copied, setCopied] = useState(false)

  const relacionadas = otrasNoticias.filter(n => n.slug !== slug).slice(0, 3)

  // Exponer función de limpieza en desarrollo (solo para debugging)
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      // @ts-ignore - Solo para debugging
      window.clearViewCache = clearViewCache
      console.log('💡 Para limpiar el cache de vistas, ejecuta: window.clearViewCache()')
    }
  }, [])

  // Tracking de vistas optimizado (no bloquea la carga)
  // Se ejecuta cuando la noticia se carga completamente
  useEffect(() => {
    console.log(
      `📰 [NoticiaContent] useEffect ejecutado - noticia:`,
      noticia ? { slug: noticia.slug, titulo: noticia.titulo, vistas: noticia.vistas } : 'null',
      `isLoading: ${isLoading}`
    )

    if (noticia && noticia.slug && !isLoading) {
      console.log(
        `✅ [NoticiaContent] Noticia cargada, slug: "${noticia.slug}", vistas actuales: ${noticia.vistas || 0}, iniciando tracking...`
      )

      // Si la noticia tiene 0 vistas o no tiene vistas, limpiar cualquier cache previo
      // Esto asegura que las noticias nuevas siempre se trackeen
      if ((noticia.vistas === 0 || noticia.vistas === undefined) && typeof window !== 'undefined') {
        const cacheKey = `amva_viewed_${noticia.slug}`
        if (localStorage.getItem(cacheKey)) {
          console.log(
            `🧹 [NoticiaContent] Limpiando cache previo para noticia nueva: "${noticia.slug}"`
          )
          localStorage.removeItem(cacheKey)
        }
      }

      // Función personalizada que incrementa la vista y actualiza la UI
      const incrementarVistaConActualizacion = async (slug: string) => {
        console.log(`📞 [incrementarVistaConActualizacion] Llamado para: "${slug}"`)
        try {
          console.log(
            `🌐 [incrementarVistaConActualizacion] Llamando a noticiasApi.incrementarVista("${slug}")...`
          )
          await noticiasApi.incrementarVista(slug)
          console.log(
            `✅ [incrementarVistaConActualizacion] API respondió exitosamente para "${slug}"`
          )

          // Invalidar queries para actualizar la UI con el nuevo contador
          // La queryKey correcta es ['noticia', 'slug', slug] según useNoticiaBySlug
          console.log(
            `🔄 [incrementarVistaConActualizacion] Invalidando queries para actualizar UI...`
          )
          queryClient.invalidateQueries({ queryKey: ['noticia', 'slug', slug] })
          queryClient.invalidateQueries({ queryKey: ['noticias', 'publicadas'] })

          // También actualizar el cache directamente para respuesta inmediata
          queryClient.setQueryData(['noticia', 'slug', slug], (oldData: any) => {
            if (oldData) {
              const nuevasVistas = (oldData.vistas || 0) + 1
              console.log(
                `📊 [incrementarVistaConActualizacion] Actualizando cache: ${oldData.vistas || 0} → ${nuevasVistas} vistas`
              )
              return { ...oldData, vistas: nuevasVistas }
            }
            return oldData
          })
          console.log(
            `✅ [incrementarVistaConActualizacion] Vista incrementada y UI actualizada para: ${slug}`
          )
        } catch (error) {
          console.error(
            `❌ [incrementarVistaConActualizacion] Error al incrementar vista para ${slug}:`,
            error
          )
        }
      }

      // Pequeño delay para asegurar que la página se cargó completamente
      const timer = setTimeout(() => {
        console.log(`⏰ [NoticiaContent] Timer ejecutado para "${noticia.slug}"`)

        // Trackear vista de forma asíncrona y optimizada
        // Cada noticia (slug) se cuenta de forma INDEPENDIENTE
        console.log(
          `🎯 [NoticiaContent] Llamando trackView("${noticia.slug}", incrementarVistaConActualizacion)`
        )
        trackView(
          noticia.slug,
          incrementarVistaConActualizacion,
          noticia.vistas === 0 || noticia.vistas === undefined
        )
      }, 500) // 500ms después de que la noticia se carga

      return () => {
        console.log(`🧹 [NoticiaContent] Limpiando timer para "${noticia.slug}"`)
        clearTimeout(timer)
      }
    } else {
      console.log(`⏸️ [NoticiaContent] No se puede trackear vista:`, {
        tieneNoticia: !!noticia,
        tieneSlug: !!noticia?.slug,
        isLoading,
      })
    }
  }, [noticia, isLoading, queryClient])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      toast.success('Enlace copiado')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Error al copiar')
    }
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = noticia?.titulo || ''

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  if (error || !noticia) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex flex-col items-center justify-center px-4">
        <Newspaper className="w-16 h-16 text-white/20 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Noticia no encontrada</h1>
        <p className="text-white/60 mb-6">La noticia que buscas no existe o ha sido eliminada</p>
        <Link href="/noticias">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ver todas las noticias
          </Button>
        </Link>
      </div>
    )
  }

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

            {/* Share buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-2 text-white/70 hover:text-[#1877F2] hover:bg-white/10 rounded-lg transition-colors min-w-[40px]"
                title="Compartir en Facebook"
                aria-label="Compartir en Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyLink}
                className="text-white/70 hover:text-white hover:bg-white/10 min-w-[40px]"
                title="Copiar enlace"
                aria-label="Copiar enlace"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <article className="max-w-3xl mx-auto">
          {/* Category & Date */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium border',
                categoriaColors[noticia.categoria]
              )}
            >
              {categoriaLabels[noticia.categoria]}
            </span>
            {noticia.fechaPublicacion && (
              <span className="flex items-center gap-1.5 text-white/50 text-sm" title="Fecha de publicación">
                <Calendar className="w-4 h-4" />
                Publicado: {formatDate(noticia.fechaPublicacion)}
              </span>
            )}
            {noticia.createdAt && (
              <span className="flex items-center gap-1.5 text-white/50 text-sm" title="Fecha de creación">
                <Calendar className="w-4 h-4" />
                Creado: {formatDate(noticia.createdAt)}
              </span>
            )}
            {noticia.updatedAt && noticia.updatedAt !== noticia.createdAt && (
              <span className="flex items-center gap-1.5 text-white/50 text-sm" title="Última modificación">
                <Calendar className="w-4 h-4" />
                Modificado: {formatDate(noticia.updatedAt)}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-white/50 text-sm">
              <Eye className="w-4 h-4" />
              {formatViews(noticia.vistas || 0)} vistas
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {noticia.titulo}
          </h1>

          {/* Extracto */}
          {noticia.extracto && (
            <p className="text-xl text-white/70 mb-8 leading-relaxed">{noticia.extracto}</p>
          )}

          {/* Author */}
          {noticia.autor && (
            <div className="flex items-center gap-3 mb-8 pb-8 border-b border-white/10">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
                {noticia.autor
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div>
                <p className="text-white font-medium">{noticia.autor}</p>
                <p className="text-white/50 text-sm">Autor</p>
              </div>
            </div>
          )}

          {/* Featured Image */}
          {noticia.imagenUrl && (
            <div className="relative aspect-video mb-10 rounded-2xl overflow-hidden bg-white/5 flex items-center justify-center">
              <Image
                src={noticia.imagenUrl}
                alt={noticia.titulo}
                fill
                className="object-contain"
                priority
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            {noticia.contenido.split('\n').map(
              (paragraph, index) =>
                paragraph.trim() && (
                  <p key={index} className="text-white/80 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                )
            )}
          </div>

          {/* Share section */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Compartir esta noticia
            </h3>
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1877F2]/20 text-[#1877F2] hover:bg-[#1877F2]/30 transition-colors"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </a>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado' : 'Copiar enlace'}
              </button>
            </div>
          </div>
        </article>

        {/* Related news */}
        {relacionadas.length > 0 && (
          <section className="mt-16 pt-12 border-t border-white/10">
            <h2 className="text-2xl font-bold text-white mb-8">Más Noticias</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relacionadas.map(n => (
                <Link
                  key={n.id}
                  href={`/noticias/${n.slug}`}
                  className="group block bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden hover:bg-white/[0.06] hover:border-white/20 transition-all"
                >
                  <div className="relative aspect-video bg-white/5">
                    {n.imagenUrl ? (
                      <Image src={n.imagenUrl} alt={n.titulo} fill className="object-contain" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                        <Newspaper className="w-8 h-8 text-white/20" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <span
                      className={cn(
                        'inline-block px-2 py-0.5 rounded-full text-xs font-medium border mb-2',
                        categoriaColors[n.categoria]
                      )}
                    >
                      {categoriaLabels[n.categoria]}
                    </span>
                    <h3 className="text-white font-semibold group-hover:text-emerald-400 transition-colors line-clamp-2">
                      {n.titulo}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
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

export default function NoticiaPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)

  return (
    <QueryProvider>
      <NoticiaContent slug={resolvedParams.slug} />
    </QueryProvider>
  )
}
