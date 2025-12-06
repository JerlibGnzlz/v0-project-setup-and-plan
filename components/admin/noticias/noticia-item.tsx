'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Eye, EyeOff, Star, StarOff, Pencil, Trash2, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Noticia } from '@/lib/api/noticias'
import { categoriaLabels, categoriaColors } from '@/lib/api/noticias'

interface NoticiaItemProps {
  noticia: Noticia
  onEdit: (noticia: Noticia) => void
  onDelete: (id: string) => void
  onTogglePublicado: (id: string) => void
  onToggleDestacado: (id: string) => void
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Sin fecha'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Sin fecha'
    return format(date, "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })
  } catch {
    return 'Sin fecha'
  }
}

export function NoticiaItem({
  noticia,
  onEdit,
  onDelete,
  onTogglePublicado,
  onToggleDestacado,
}: NoticiaItemProps) {
  return (
    <div className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        {noticia.imagenUrl && (
          <div className="sm:w-48 h-48 sm:h-auto">
            <img
              src={noticia.imagenUrl}
              alt={noticia.titulo}
              className="w-full h-full object-cover rounded-t-lg sm:rounded-t-none sm:rounded-l-lg"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold text-foreground">{noticia.titulo}</h3>
                {noticia.destacado && (
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    <Star className="w-3 h-3 mr-1" />
                    Destacada
                  </Badge>
                )}
                <Badge
                  className={`${categoriaColors[noticia.categoria]} border-0`}
                >
                  {categoriaLabels[noticia.categoria]}
                </Badge>
                {noticia.publicado ? (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    Publicada
                  </Badge>
                ) : (
                  <Badge variant="secondary">Borrador</Badge>
                )}
              </div>
              {noticia.extracto && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {noticia.extracto}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            {noticia.autor && <span>Por: {noticia.autor}</span>}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(noticia.fechaPublicacion || noticia.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {noticia.vistas || 0} vistas
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex sm:flex-col items-center justify-end gap-2 p-4 border-t sm:border-t-0 sm:border-l">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onTogglePublicado(noticia.id)}
            title={noticia.publicado ? 'Despublicar' : 'Publicar'}
          >
            {noticia.publicado ? (
              <EyeOff className="w-4 h-4 text-gray-500" />
            ) : (
              <Eye className="w-4 h-4 text-emerald-600" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleDestacado(noticia.id)}
            title={noticia.destacado ? 'Quitar destacado' : 'Destacar'}
          >
            {noticia.destacado ? (
              <StarOff className="w-4 h-4 text-amber-500" />
            ) : (
              <Star className="w-4 h-4 text-gray-400" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(noticia)}
            title="Editar"
          >
            <Pencil className="w-4 h-4 text-blue-600" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" title="Eliminar">
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar noticia?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente la noticia
                  "{noticia.titulo}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(noticia.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}



