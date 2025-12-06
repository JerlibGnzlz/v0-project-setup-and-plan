'use client'

import { useState } from 'react'
import { z } from 'zod'
import {
  useNoticias,
  useCreateNoticia,
  useUpdateNoticia,
  useDeleteNoticia,
  useTogglePublicado,
  useToggleDestacado,
} from '@/lib/hooks/use-noticias'
import {
  Noticia,
  CategoriaNoticia,
  CreateNoticiaData,
  UpdateNoticiaData,
} from '@/lib/api/noticias'
import { uploadApi } from '@/lib/api/upload'
import {
  NoticiasHeader,
  NoticiasFilters,
  NoticiasStats,
  NoticiasList,
  NoticiasDialog,
} from '@/components/admin/noticias'

// Schema de validación
const noticiaSchema = z.object({
  titulo: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(200),
  extracto: z.string().max(500).optional().or(z.literal('')),
  contenido: z.string().min(10, 'El contenido debe tener al menos 10 caracteres'),
  imagenUrl: z.string().optional().or(z.literal('')),
  categoria: z.enum([
    'ANUNCIO',
    'EVENTO',
    'ACTIVIDAD',
    'OPORTUNIDADES',
    'CAPACITACION',
    'COMUNICADO',
  ]),
  autor: z.string().optional().or(z.literal('')),
  publicado: z.boolean().default(false),
  destacado: z.boolean().default(false),
  fechaPublicacion: z.string().optional().or(z.literal('')),
})

type NoticiaFormData = z.infer<typeof noticiaSchema>

// Todas las categorías
const categorias: CategoriaNoticia[] = [
  'ANUNCIO',
  'EVENTO',
  'ACTIVIDAD',
  'OPORTUNIDADES',
  'CAPACITACION',
  'COMUNICADO',
]

export default function NoticiasPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNoticia, setEditingNoticia] = useState<Noticia | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategoria, setFilterCategoria] = useState<CategoriaNoticia | 'TODAS'>('TODAS')
  const [filterPublicado, setFilterPublicado] = useState<'TODOS' | 'PUBLICADOS' | 'BORRADORES'>(
    'TODOS'
  )

  const { data: noticias = [], isLoading } = useNoticias()
  const createNoticia = useCreateNoticia()
  const updateNoticia = useUpdateNoticia()
  const deleteNoticia = useDeleteNoticia()
  const togglePublicado = useTogglePublicado()
  const toggleDestacado = useToggleDestacado()

  // Filtrar noticias
  const filteredNoticias = noticias.filter(noticia => {
    const matchesSearch =
      noticia.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      noticia.extracto?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      noticia.autor?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategoria = filterCategoria === 'TODAS' || noticia.categoria === filterCategoria

    const matchesPublicado =
      filterPublicado === 'TODOS' ||
      (filterPublicado === 'PUBLICADOS' && noticia.publicado) ||
      (filterPublicado === 'BORRADORES' && !noticia.publicado)

    return matchesSearch && matchesCategoria && matchesPublicado
  })

  const openCreateDialog = () => {
    setEditingNoticia(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (noticia: Noticia) => {
    setEditingNoticia(noticia)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (data: NoticiaFormData) => {
    const submitData = {
      ...data,
      extracto: data.extracto || undefined,
      imagenUrl: data.imagenUrl || undefined,
      autor: data.autor || undefined,
      fechaPublicacion: data.fechaPublicacion || undefined,
    }

    if (editingNoticia) {
      await updateNoticia.mutateAsync({
        id: editingNoticia.id,
        data: submitData as UpdateNoticiaData,
      })
    } else {
      await createNoticia.mutateAsync(submitData as CreateNoticiaData)
    }
    setIsDialogOpen(false)
    setEditingNoticia(null)
  }

  const handleDelete = async (id: string) => {
    await deleteNoticia.mutateAsync(id)
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    const result = await uploadApi.uploadNoticiaImage(file)
    return result.url
  }

  return (
    <div className="space-y-6">
      <NoticiasHeader onAddClick={openCreateDialog} />

      <NoticiasFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterCategoria={filterCategoria}
        onCategoriaChange={setFilterCategoria}
        filterPublicado={filterPublicado}
        onPublicadoChange={setFilterPublicado}
        categorias={categorias}
      />

      <NoticiasStats noticias={noticias} />

      <NoticiasList
        noticias={filteredNoticias}
        isLoading={isLoading}
        searchQuery={searchQuery}
        filterCategoria={filterCategoria}
        filterPublicado={filterPublicado}
        onEdit={openEditDialog}
        onDelete={handleDelete}
        onTogglePublicado={id => togglePublicado.mutate(id)}
        onToggleDestacado={id => toggleDestacado.mutate(id)}
        onCreateClick={openCreateDialog}
      />

      <NoticiasDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        noticia={editingNoticia}
        isEditing={!!editingNoticia}
        onSubmit={handleSubmit}
        onImageUpload={handleImageUpload}
        categorias={categorias}
      />
    </div>
  )
}
