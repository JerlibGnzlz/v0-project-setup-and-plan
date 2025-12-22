'use client'

import { Button } from '@/components/ui/button'
import { Loader2, Newspaper, Plus } from 'lucide-react'
import { NoticiaItem } from './noticia-item'
import type { Noticia } from '@/lib/api/noticias'

interface NoticiasListProps {
  noticias: Noticia[]
  isLoading: boolean
  searchQuery: string
  filterCategoria: string
  filterPublicado: string
  onEdit: (noticia: Noticia) => void
  onDelete: (id: string) => void
  onTogglePublicado: (id: string) => void
  onToggleDestacado: (id: string) => void
  onCreateClick: () => void
}

export function NoticiasList({
  noticias,
  isLoading,
  searchQuery,
  filterCategoria,
  filterPublicado,
  onEdit,
  onDelete,
  onTogglePublicado,
  onToggleDestacado,
  onCreateClick,
}: NoticiasListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    )
  }

  if (noticias.length === 0) {
    const hasFilters = searchQuery || filterCategoria !== 'TODAS' || filterPublicado !== 'TODOS'
    return (
      <div className="text-center py-12 bg-muted/50 rounded-lg border-2 border-dashed">
        <Newspaper className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
        <p className="text-muted-foreground">
          {hasFilters
            ? 'No se encontraron noticias con los filtros aplicados'
            : 'No hay noticias todavía'}
        </p>
        {!hasFilters && (
          <Button onClick={onCreateClick} className="mt-4" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Crear primera noticia
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {noticias.map(noticia => (
        <NoticiaItem
          key={noticia.id}
          noticia={noticia}
          onEdit={onEdit}
          onDelete={onDelete}
          onTogglePublicado={onTogglePublicado}
          onToggleDestacado={onToggleDestacado}
        />
      ))}
    </div>
  )
}




















