import type { Metadata } from 'next'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vidaabundante.org'
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

  // Fetch noticia data para metadata
  try {
    const response = await fetch(`${apiUrl}/noticias/slug/${resolvedParams.slug}`, {
      cache: 'no-store',
    })

    if (response.ok) {
      const noticia = await response.json()

      return {
        title: noticia.titulo || 'Noticia',
        description:
          noticia.extracto ||
          noticia.contenido?.substring(0, 160) ||
          'Lee la noticia completa en Vida Abundante',
        openGraph: {
          title: noticia.titulo,
          description: noticia.extracto || noticia.contenido?.substring(0, 160),
          images: noticia.imagenUrl ? [{ url: noticia.imagenUrl }] : [],
          type: 'article',
          publishedTime: noticia.fechaPublicacion,
        },
        twitter: {
          card: 'summary_large_image',
          title: noticia.titulo,
          description: noticia.extracto || noticia.contenido?.substring(0, 160),
          images: noticia.imagenUrl ? [noticia.imagenUrl] : [],
        },
        alternates: {
          canonical: `${baseUrl}/noticias/${resolvedParams.slug}`,
        },
      }
    }
  } catch (error) {
    console.error('Error fetching noticia for metadata:', error)
  }

  return {
    title: 'Noticia',
    description: 'Lee la noticia completa en Vida Abundante',
  }
}

export default function NoticiaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
