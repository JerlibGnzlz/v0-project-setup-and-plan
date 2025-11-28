'use client'

import { use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
  Loader2,
  Newspaper,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNoticiaBySlug, useNoticiasPublicadas } from '@/lib/hooks/use-noticias'
import { categoriaLabels, categoriaColors } from '@/lib/api/noticias'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { QueryProvider } from '@/lib/providers/query-provider'
import { useState } from 'react'
import { toast } from 'sonner'

function formatDate(dateString: string | null): string {
  if (!dateString) return ''
  try {
    return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es })
  } catch {
    return ''
  }
}

function getReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

function NoticiaContent({ slug }: { slug: string }) {
  const { data: noticia, isLoading, error } = useNoticiaBySlug(slug)
  const { data: otrasNoticias = [] } = useNoticiasPublicadas(4)
  const [copied, setCopied] = useState(false)

  const relacionadas = otrasNoticias.filter(n => n.slug !== slug).slice(0, 3)

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
            <Link href="/noticias" className="flex items-center gap-2 text-white hover:text-emerald-400 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Noticias</span>
            </Link>
            
            {/* Share buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyLink}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-white/60 hover:text-[#1877F2] hover:bg-white/10 rounded-lg transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-white/60 hover:text-[#1DA1F2] hover:bg-white/10 rounded-lg transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <article className="max-w-3xl mx-auto">
          {/* Category & Date */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className={cn(
              "px-3 py-1 rounded-full text-sm font-medium border",
              categoriaColors[noticia.categoria]
            )}>
              {categoriaLabels[noticia.categoria]}
            </span>
            {noticia.fechaPublicacion && (
              <span className="flex items-center gap-1.5 text-white/50 text-sm">
                <Calendar className="w-4 h-4" />
                {formatDate(noticia.fechaPublicacion)}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-white/50 text-sm">
              <Clock className="w-4 h-4" />
              {getReadingTime(noticia.contenido)} min de lectura
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {noticia.titulo}
          </h1>

          {/* Extracto */}
          {noticia.extracto && (
            <p className="text-xl text-white/70 mb-8 leading-relaxed">
              {noticia.extracto}
            </p>
          )}

          {/* Author */}
          {noticia.autor && (
            <div className="flex items-center gap-3 mb-8 pb-8 border-b border-white/10">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
                {noticia.autor.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="text-white font-medium">{noticia.autor}</p>
                <p className="text-white/50 text-sm">Autor</p>
              </div>
            </div>
          )}

          {/* Featured Image */}
          {noticia.imagenUrl && (
            <div className="relative aspect-video mb-10 rounded-2xl overflow-hidden">
              <Image
                src={noticia.imagenUrl}
                alt={noticia.titulo}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            {noticia.contenido.split('\n').map((paragraph, index) => (
              paragraph.trim() && (
                <p key={index} className="text-white/80 leading-relaxed mb-4">
                  {paragraph}
                </p>
              )
            ))}
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
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1DA1F2]/20 text-[#1DA1F2] hover:bg-[#1DA1F2]/30 transition-colors"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </a>
              <a
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0A66C2]/20 text-[#0A66C2] hover:bg-[#0A66C2]/30 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
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
              {relacionadas.map((n) => (
                <Link
                  key={n.id}
                  href={`/noticias/${n.slug}`}
                  className="group block bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden hover:bg-white/[0.06] hover:border-white/20 transition-all"
                >
                  <div className="relative aspect-video">
                    {n.imagenUrl ? (
                      <Image
                        src={n.imagenUrl}
                        alt={n.titulo}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                        <Newspaper className="w-8 h-8 text-white/20" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <span className={cn(
                      "inline-block px-2 py-0.5 rounded-full text-xs font-medium border mb-2",
                      categoriaColors[n.categoria]
                    )}>
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
            href="/" 
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
