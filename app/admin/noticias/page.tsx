'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Newspaper, 
  Eye, 
  EyeOff,
  Star,
  StarOff,
  Calendar,
  Filter,
  X,
  Loader2,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImageUpload } from '@/components/ui/image-upload'
import { 
  useNoticias, 
  useCreateNoticia, 
  useUpdateNoticia, 
  useDeleteNoticia,
  useTogglePublicado,
  useToggleDestacado
} from '@/lib/hooks/use-noticias'
import { Noticia, CategoriaNoticia, categoriaLabels, categoriaColors, CreateNoticiaData, UpdateNoticiaData } from '@/lib/api/noticias'
import { uploadApi } from '@/lib/api/upload'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Schema de validación
const noticiaSchema = z.object({
  titulo: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(200),
  extracto: z.string().max(500).optional().or(z.literal('')),
  contenido: z.string().min(10, 'El contenido debe tener al menos 10 caracteres'),
  imagenUrl: z.string().optional().or(z.literal('')),
  categoria: z.enum(['ANUNCIO', 'EVENTO', 'DEVOCIONAL', 'CAPACITACION', 'TESTIMONIO', 'COMUNICADO']),
  autor: z.string().optional().or(z.literal('')),
  publicado: z.boolean().default(false),
  destacado: z.boolean().default(false),
  fechaPublicacion: z.string().optional().or(z.literal('')),
})

type NoticiaFormData = z.infer<typeof noticiaSchema>

// Todas las categorías
const categorias: CategoriaNoticia[] = ['ANUNCIO', 'EVENTO', 'DEVOCIONAL', 'CAPACITACION', 'TESTIMONIO', 'COMUNICADO']

export default function NoticiasPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNoticia, setEditingNoticia] = useState<Noticia | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategoria, setFilterCategoria] = useState<CategoriaNoticia | 'TODAS'>('TODAS')
  const [filterPublicado, setFilterPublicado] = useState<'TODOS' | 'PUBLICADOS' | 'BORRADORES'>('TODOS')

  const { data: noticias = [], isLoading } = useNoticias()
  const createNoticia = useCreateNoticia()
  const updateNoticia = useUpdateNoticia()
  const deleteNoticia = useDeleteNoticia()
  const togglePublicado = useTogglePublicado()
  const toggleDestacado = useToggleDestacado()

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

  // Función para subir imagen
  const handleImageUpload = async (file: File): Promise<string> => {
    const result = await uploadApi.uploadNoticiaImage(file)
    return result.url
  }

  // Filtrar noticias
  const filteredNoticias = noticias.filter((noticia) => {
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
    setIsDialogOpen(true)
  }

  const openEditDialog = (noticia: Noticia) => {
    setEditingNoticia(noticia)
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
    setIsDialogOpen(true)
  }

  const onSubmit = async (data: NoticiaFormData) => {
    const submitData = {
      ...data,
      extracto: data.extracto || undefined,
      imagenUrl: data.imagenUrl || undefined,
      autor: data.autor || undefined,
      fechaPublicacion: data.fechaPublicacion || undefined,
    }

    if (editingNoticia) {
      await updateNoticia.mutateAsync({ id: editingNoticia.id, data: submitData as UpdateNoticiaData })
    } else {
      await createNoticia.mutateAsync(submitData as CreateNoticiaData)
    }
    setIsDialogOpen(false)
  }

  const handleDelete = async (id: string) => {
    await deleteNoticia.mutateAsync(id)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sin fecha'
    try {
      return format(new Date(dateString), "d MMM yyyy, HH:mm", { locale: es })
    } catch {
      return 'Fecha inválida'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Newspaper className="w-7 h-7 text-emerald-600" />
            Gestión de Noticias
          </h1>
          <p className="text-gray-500 mt-1">
            Administra las noticias y anuncios de la organización
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Noticia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingNoticia ? 'Editar Noticia' : 'Nueva Noticia'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
              {/* Título */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Título *</label>
                <Input {...register('titulo')} placeholder="Título de la noticia" />
                {errors.titulo && (
                  <p className="text-sm text-red-500">{errors.titulo.message}</p>
                )}
              </div>

              {/* Extracto */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Extracto / Resumen</label>
                <Textarea 
                  {...register('extracto')} 
                  placeholder="Breve resumen de la noticia (máx 500 caracteres)"
                  rows={2}
                />
                {errors.extracto && (
                  <p className="text-sm text-red-500">{errors.extracto.message}</p>
                )}
              </div>

              {/* Contenido */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Contenido *</label>
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
                <label className="text-sm font-medium">Imagen de portada</label>
                <ImageUpload
                  value={imagenUrl || ''}
                  onChange={(url) => setValue('imagenUrl', url)}
                  onUpload={handleImageUpload}
                />
              </div>

              {/* Categoría y Autor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoría *</label>
                  <Select
                    value={categoria}
                    onValueChange={(value: CategoriaNoticia) => setValue('categoria', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {categoriaLabels[cat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Autor</label>
                  <Input {...register('autor')} placeholder="Nombre del autor" />
                </div>
              </div>

              {/* Fecha de publicación */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha de publicación</label>
                <Input 
                  type="datetime-local" 
                  {...register('fechaPublicacion')} 
                />
                <p className="text-xs text-gray-500">
                  Dejar vacío para usar la fecha actual al publicar
                </p>
              </div>

              {/* Opciones */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={watch('publicado')}
                    onCheckedChange={(checked) => setValue('publicado', checked as boolean)}
                  />
                  <span className="text-sm font-medium">Publicar inmediatamente</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={watch('destacado')}
                    onCheckedChange={(checked) => setValue('destacado', checked as boolean)}
                  />
                  <span className="text-sm font-medium">Marcar como destacada</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={createNoticia.isPending || updateNoticia.isPending}
                >
                  {(createNoticia.isPending || updateNoticia.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingNoticia ? 'Actualizar' : 'Crear'} Noticia
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar noticias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterCategoria} onValueChange={(value: CategoriaNoticia | 'TODAS') => setFilterCategoria(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODAS">Todas las categorías</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {categoriaLabels[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterPublicado} onValueChange={(value: 'TODOS' | 'PUBLICADOS' | 'BORRADORES') => setFilterPublicado(value)}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos</SelectItem>
            <SelectItem value="PUBLICADOS">Publicados</SelectItem>
            <SelectItem value="BORRADORES">Borradores</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{noticias.length}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Publicadas</p>
          <p className="text-2xl font-bold text-emerald-600">
            {noticias.filter(n => n.publicado).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Borradores</p>
          <p className="text-2xl font-bold text-amber-600">
            {noticias.filter(n => !n.publicado).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Destacadas</p>
          <p className="text-2xl font-bold text-purple-600">
            {noticias.filter(n => n.destacado).length}
          </p>
        </div>
      </div>

      {/* Noticias List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      ) : filteredNoticias.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
          <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchQuery || filterCategoria !== 'TODAS' || filterPublicado !== 'TODOS'
              ? 'No se encontraron noticias con los filtros aplicados'
              : 'No hay noticias todavía'}
          </p>
          {!searchQuery && filterCategoria === 'TODAS' && filterPublicado === 'TODOS' && (
            <Button onClick={openCreateDialog} className="mt-4" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Crear primera noticia
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNoticias.map((noticia) => (
            <div
              key={noticia.id}
              className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Image */}
                {noticia.imagenUrl && (
                  <div className="w-full sm:w-48 h-32 sm:h-auto flex-shrink-0">
                    <img
                      src={noticia.imagenUrl}
                      alt={noticia.titulo}
                      className="w-full h-full object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-t-none"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 p-4">
                  <div className="flex flex-wrap items-start gap-2 mb-2">
                    {/* Category badge */}
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium border",
                      categoriaColors[noticia.categoria]
                    )}>
                      {categoriaLabels[noticia.categoria]}
                    </span>

                    {/* Status badges */}
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      noticia.publicado 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-gray-100 text-gray-600"
                    )}>
                      {noticia.publicado ? 'Publicado' : 'Borrador'}
                    </span>

                    {noticia.destacado && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        Destacada
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                    {noticia.titulo}
                  </h3>

                  {noticia.extracto && (
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                      {noticia.extracto}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                    {noticia.autor && (
                      <span>Por: {noticia.autor}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(noticia.fechaPublicacion || noticia.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center justify-end gap-2 p-4 border-t sm:border-t-0 sm:border-l">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePublicado.mutate(noticia.id)}
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
                    onClick={() => toggleDestacado.mutate(noticia.id)}
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
                    onClick={() => openEditDialog(noticia)}
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
                          Esta acción no se puede deshacer. Se eliminará permanentemente 
                          la noticia "{noticia.titulo}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(noticia.id)}
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
          ))}
        </div>
      )}
    </div>
  )
}

