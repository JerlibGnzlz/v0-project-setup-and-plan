'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUpload } from '@/components/ui/image-upload'
import type { Noticia, CategoriaNoticia } from '@/lib/api/noticias'
import { categoriaLabels } from '@/lib/api/noticias'
import { format } from 'date-fns'

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

interface NoticiasDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  noticia: Noticia | null
  isEditing: boolean
  onSubmit: (data: NoticiaFormData) => Promise<void>
  onImageUpload: (file: File) => Promise<string>
  categorias: CategoriaNoticia[]
}

export function NoticiasDialog({
  open,
  onOpenChange,
  noticia,
  isEditing,
  onSubmit,
  onImageUpload,
  categorias,
}: NoticiasDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NoticiaFormData>({
    resolver: zodResolver(noticiaSchema),
    defaultValues: {
      titulo: '',
      extracto: '',
      contenido: '',
      imagenUrl: '',
      categoria: 'ANUNCIO',
      autor: '',
      publicado: false,
      destacado: false,
      fechaPublicacion: '',
    },
  })

  const imagenUrl = watch('imagenUrl')
  const categoria = watch('categoria')

  // Cargar datos cuando se abre para editar
  useEffect(() => {
    if (noticia && open && isEditing) {
      reset({
        titulo: noticia.titulo,
        extracto: noticia.extracto || '',
        contenido: noticia.contenido,
        imagenUrl: noticia.imagenUrl || '',
        categoria: noticia.categoria,
        autor: noticia.autor || '',
        publicado: noticia.publicado,
        destacado: noticia.destacado,
        fechaPublicacion: noticia.fechaPublicacion
          ? format(new Date(noticia.fechaPublicacion), "yyyy-MM-dd'T'HH:mm")
          : '',
      })
    } else if (!open) {
      reset({
        titulo: '',
        extracto: '',
        contenido: '',
        imagenUrl: '',
        categoria: 'ANUNCIO',
        autor: '',
        publicado: false,
        destacado: false,
        fechaPublicacion: '',
      })
    }
  }, [noticia, open, isEditing, reset])

  const handleFormSubmit = async (data: NoticiaFormData) => {
    await onSubmit(data)
  }

  const handleClose = () => {
    onOpenChange(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Noticia' : 'Nueva Noticia'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 mt-4">
          {/* Título */}
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input {...register('titulo')} placeholder="Título de la noticia" />
            {errors.titulo && <p className="text-sm text-red-500">{errors.titulo.message}</p>}
          </div>

          {/* Extracto */}
          <div className="space-y-2">
            <Label>Extracto / Resumen</Label>
            <Textarea
              {...register('extracto')}
              placeholder="Breve resumen de la noticia (máx 500 caracteres)"
              rows={2}
            />
            {errors.extracto && <p className="text-sm text-red-500">{errors.extracto.message}</p>}
          </div>

          {/* Contenido */}
          <div className="space-y-2">
            <Label>Contenido *</Label>
            <Textarea
              {...register('contenido')}
              placeholder="Contenido completo de la noticia..."
              rows={8}
            />
            {errors.contenido && (
              <p className="text-sm text-red-500">{errors.contenido.message}</p>
            )}
          </div>

          {/* Imagen */}
          <div className="space-y-2">
            <Label>Imagen destacada</Label>
            <ImageUpload
              value={imagenUrl}
              onChange={url => setValue('imagenUrl', url)}
              onUpload={onImageUpload}
            />
          </div>

          {/* Categoría y Autor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoría *</Label>
              <Select value={categoria} onValueChange={value => setValue('categoria', value as CategoriaNoticia)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {categoriaLabels[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Autor</Label>
              <Input {...register('autor')} placeholder="Nombre del autor" />
            </div>
          </div>

          {/* Fecha de publicación */}
          <div className="space-y-2">
            <Label>Fecha de publicación</Label>
            <Input
              type="datetime-local"
              {...register('fechaPublicacion')}
              placeholder="Fecha y hora de publicación"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="publicado"
                checked={watch('publicado')}
                onCheckedChange={checked => setValue('publicado', checked === true)}
              />
              <Label htmlFor="publicado" className="cursor-pointer">
                Publicar inmediatamente
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="destacado"
                checked={watch('destacado')}
                onCheckedChange={checked => setValue('destacado', checked === true)}
              />
              <Label htmlFor="destacado" className="cursor-pointer">
                Destacar noticia
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">{isEditing ? 'Actualizar' : 'Crear Noticia'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

































