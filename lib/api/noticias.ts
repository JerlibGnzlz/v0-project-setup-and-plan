import api from './client'

export type CategoriaNoticia = 
  | 'ANUNCIO' 
  | 'EVENTO' 
  | 'DEVOCIONAL' 
  | 'CAPACITACION' 
  | 'TESTIMONIO' 
  | 'COMUNICADO'

export interface Noticia {
  id: string
  titulo: string
  slug: string
  extracto: string | null
  contenido: string
  imagenUrl: string | null
  categoria: CategoriaNoticia
  autor: string | null
  publicado: boolean
  destacado: boolean
  fechaPublicacion: string | null
  metaTitle: string | null
  metaDescription: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateNoticiaData {
  titulo: string
  slug?: string
  extracto?: string
  contenido: string
  imagenUrl?: string
  categoria?: CategoriaNoticia
  autor?: string
  publicado?: boolean
  destacado?: boolean
  fechaPublicacion?: string
  metaTitle?: string
  metaDescription?: string
}

export interface UpdateNoticiaData extends Partial<CreateNoticiaData> {}

// Categorías con labels para UI
export const categoriaLabels: Record<CategoriaNoticia, string> = {
  ANUNCIO: 'Anuncio',
  EVENTO: 'Evento',
  DEVOCIONAL: 'Devocional',
  CAPACITACION: 'Capacitación',
  TESTIMONIO: 'Testimonio',
  COMUNICADO: 'Comunicado',
}

// Colores para categorías
export const categoriaColors: Record<CategoriaNoticia, string> = {
  ANUNCIO: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  EVENTO: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  DEVOCIONAL: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  CAPACITACION: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  TESTIMONIO: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  COMUNICADO: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
}

export const noticiasApi = {
  // Rutas públicas
  getPublicadas: async (limit?: number): Promise<Noticia[]> => {
    const params = limit ? `?limit=${limit}` : ''
    const response = await api.get(`/noticias/publicadas${params}`)
    return response.data
  },

  getDestacadas: async (limit: number = 3): Promise<Noticia[]> => {
    const response = await api.get(`/noticias/destacadas?limit=${limit}`)
    return response.data
  },

  getByCategoria: async (categoria: CategoriaNoticia, limit?: number): Promise<Noticia[]> => {
    const params = limit ? `?limit=${limit}` : ''
    const response = await api.get(`/noticias/categoria/${categoria}${params}`)
    return response.data
  },

  getBySlug: async (slug: string): Promise<Noticia> => {
    const response = await api.get(`/noticias/slug/${slug}`)
    return response.data
  },

  // Rutas admin
  getAll: async (): Promise<Noticia[]> => {
    const response = await api.get('/noticias')
    return response.data
  },

  getById: async (id: string): Promise<Noticia> => {
    const response = await api.get(`/noticias/${id}`)
    return response.data
  },

  create: async (data: CreateNoticiaData): Promise<Noticia> => {
    const response = await api.post('/noticias', data)
    return response.data
  },

  update: async (id: string, data: UpdateNoticiaData): Promise<Noticia> => {
    const response = await api.put(`/noticias/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/noticias/${id}`)
  },

  togglePublicado: async (id: string): Promise<Noticia> => {
    const response = await api.patch(`/noticias/${id}/toggle-publicado`)
    return response.data
  },

  toggleDestacado: async (id: string): Promise<Noticia> => {
    const response = await api.patch(`/noticias/${id}/toggle-destacado`)
    return response.data
  },
}
