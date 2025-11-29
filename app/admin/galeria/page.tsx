'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useGaleria, useCreateGaleriaImagen, useUpdateGaleriaImagen, useDeleteGaleriaImagen } from '@/lib/hooks/use-galeria'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
} from '@/components/ui/alert-dialog'
import { Upload, Trash2, ImageIcon, Video, ChevronLeft, Plus, Loader2, Scissors, Pencil } from 'lucide-react'
import { ScrollReveal } from '@/components/scroll-reveal'
import { ImageUpload } from '@/components/ui/image-upload'
import { VideoTrimmer } from '@/components/video-trimmer'
import { uploadApi } from '@/lib/api/upload'
import type { GaleriaImagen, TipoGaleria } from '@/lib/api/galeria'

const MAX_IMAGENES = 4
const MAX_VIDEOS = 2
const MAX_VIDEO_DURATION = 120 // 2 minutos máximo

export default function GaleriaPage() {
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [imageTitulo, setImageTitulo] = useState<string>('')
  const [imageDescripcion, setImageDescripcion] = useState<string>('')

  // Estados para video
  const [videoTitulo, setVideoTitulo] = useState<string>('')
  const [videoDescripcion, setVideoDescripcion] = useState<string>('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string>('')
  const [isUploadingVideoFile, setIsUploadingVideoFile] = useState(false)
  const [videoTrimOptions, setVideoTrimOptions] = useState<{ startTime: number; endTime: number } | null>(null)
  const [videoThumbnailTime, setVideoThumbnailTime] = useState<number>(0)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Estados para editar video
  const [editingVideo, setEditingVideo] = useState<GaleriaImagen | null>(null)
  const [editTrimOptions, setEditTrimOptions] = useState<{ startTime: number; endTime: number } | null>(null)
  const [editThumbnailTime, setEditThumbnailTime] = useState<number>(0)
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  const { data: galeria = [], isLoading } = useGaleria()
  const createMutation = useCreateGaleriaImagen()
  const updateMutation = useUpdateGaleriaImagen()
  const deleteMutation = useDeleteGaleriaImagen()

  // Separar imágenes y videos
  const imagenes = galeria.filter((item: GaleriaImagen) => item.tipo === 'IMAGEN' || !item.tipo)
  const videos = galeria.filter((item: GaleriaImagen) => item.tipo === 'VIDEO')

  // Helper function to properly clear video preview and revoke object URL to prevent memory leaks
  const clearVideoPreview = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
    }
    setVideoFile(null)
    setVideoPreview('')
    setVideoTrimOptions(null)
    if (videoInputRef.current) {
      videoInputRef.current.value = ''
    }
  }

  // Handler para cambios en el recorte del video
  const handleTrimChange = useCallback((startTime: number, endTime: number) => {
    setVideoTrimOptions({ startTime, endTime })
  }, [])

  // Handler para cambios en el thumbnail
  const handleThumbnailChange = useCallback((time: number) => {
    setVideoThumbnailTime(time)
  }, [])

  // Handler para abrir edición de video
  const openEditVideo = useCallback((video: GaleriaImagen) => {
    setEditingVideo(video)
    setEditTrimOptions({
      startTime: video.videoStartTime || 0,
      endTime: video.videoEndTime || 0
    })
    setEditThumbnailTime(video.thumbnailTime || video.videoStartTime || 0)
  }, [])

  // Handler para cambios en el recorte al editar
  const handleEditTrimChange = useCallback((startTime: number, endTime: number) => {
    setEditTrimOptions({ startTime, endTime })
  }, [])

  // Handler para cambios en el thumbnail al editar
  const handleEditThumbnailChange = useCallback((time: number) => {
    setEditThumbnailTime(time)
  }, [])

  // Handler para guardar cambios del video editado
  const handleSaveVideoEdit = async () => {
    if (!editingVideo || !editTrimOptions) return

    setIsSavingEdit(true)

    try {
      // Construir la nueva URL con las transformaciones
      let newImageUrl = editingVideo.imagenUrl
      const originalUrl = editingVideo.videoOriginalUrl || editingVideo.imagenUrl

      // Si es una URL de Cloudinary, reconstruir con nuevas transformaciones
      if (originalUrl.includes('cloudinary.com')) {
        // Extraer la URL base sin transformaciones
        const baseUrl = originalUrl.split('/upload/')[0]
        const afterUpload = originalUrl.split('/upload/')[1]

        // Limpiar transformaciones existentes
        const parts = afterUpload?.split('/') || []
        const filteredParts = parts.filter(part => {
          if (part.includes('so_') || part.includes('eo_') || part.includes('q_') || part.includes('f_')) return false
          if (part.match(/^v\d+$/)) return false
          return true
        })

        const publicIdWithExt = filteredParts.join('/')

        // Construir nueva URL con transformaciones
        newImageUrl = `${baseUrl}/upload/so_${editTrimOptions.startTime.toFixed(1)},eo_${editTrimOptions.endTime.toFixed(1)},q_auto,f_mp4/${publicIdWithExt}`
      }

      await updateMutation.mutateAsync({
        id: editingVideo.id,
        data: {
          imagenUrl: newImageUrl,
          videoOriginalUrl: editingVideo.videoOriginalUrl || editingVideo.imagenUrl,
          videoStartTime: editTrimOptions.startTime,
          videoEndTime: editTrimOptions.endTime,
          thumbnailTime: editThumbnailTime,
        }
      })

      toast.success('Video actualizado', {
        description: 'Los cambios han sido guardados'
      })

      setEditingVideo(null)
    } catch (error: any) {
      toast.error('Error al guardar', {
        description: error.message || 'No se pudieron guardar los cambios'
      })
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleImageUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!imageTitulo) {
      toast.error('Por favor ingresa un título')
      return
    }

    if (!imageUrl) {
      toast.error('Por favor sube una imagen')
      return
    }

    try {
      await createMutation.mutateAsync({
        titulo: imageTitulo,
        descripcion: imageDescripcion || undefined,
        imagenUrl: imageUrl,
        tipo: 'IMAGEN' as TipoGaleria,
        activa: true,
        orden: imagenes.length,
      })

      setIsUploadingImage(false)
      setImageUrl('')
      setImageTitulo('')
      setImageDescripcion('')
    } catch (error: any) {
      toast.error('Error al agregar imagen', {
        description: error.message || 'No se pudo agregar la imagen'
      })
    }
  }

  const handleImageFileUpload = async (file: File): Promise<string> => {
    const uploadResult = await uploadApi.uploadGaleriaImage(file)
    return uploadResult.url
  }

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato no válido', {
        description: 'Solo se permiten videos MP4, WebM o MOV'
      })
      return
    }

    // Validar tamaño (100MB - aumentado para permitir recortes)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video muy grande', {
        description: 'El video no debe superar los 100MB'
      })
      return
    }

    // Revoke previous object URL if exists to prevent memory leak
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
    }

    setVideoFile(file)
    setVideoTrimOptions(null) // Reset trim options for new file
    // Crear preview URL
    const url = URL.createObjectURL(file)
    setVideoPreview(url)
  }

  const handleVideoUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!videoTitulo) {
      toast.error('Por favor ingresa un título')
      return
    }

    if (!videoFile) {
      toast.error('Por favor selecciona un video')
      return
    }

    // Validar duración del clip si hay recorte
    if (videoTrimOptions) {
      const clipDuration = videoTrimOptions.endTime - videoTrimOptions.startTime
      if (clipDuration > MAX_VIDEO_DURATION) {
        toast.error('Video muy largo', {
          description: `El clip seleccionado dura ${Math.round(clipDuration)}s. Máximo permitido: ${MAX_VIDEO_DURATION}s`
        })
        return
      }
    }

    setIsUploadingVideoFile(true)

    try {
      // Subir video con opciones de recorte
      const uploadResult = await uploadApi.uploadVideo(
        videoFile,
        videoTrimOptions || undefined
      )

      // Extraer la URL original (sin transformaciones) del resultado
      // La URL original se puede reconstruir quitando los parámetros de recorte
      let originalUrl = uploadResult.url
      if (uploadResult.url.includes('cloudinary.com') && videoTrimOptions) {
        // Guardar una referencia a la URL base para poder editar después
        const parts = uploadResult.url.split('/upload/')
        if (parts.length === 2) {
          // Quitar transformaciones de la URL para obtener la original
          const afterUpload = parts[1]
          const pathParts = afterUpload.split('/')
          const filteredParts = pathParts.filter(part => {
            if (part.includes('so_') || part.includes('eo_') || part.includes('q_') || part.includes('f_')) return false
            return true
          })
          originalUrl = `${parts[0]}/upload/${filteredParts.join('/')}`
        }
      }

      // Crear registro en la galería con metadata de video
      await createMutation.mutateAsync({
        titulo: videoTitulo,
        descripcion: videoDescripcion || undefined,
        imagenUrl: uploadResult.url,
        tipo: 'VIDEO' as TipoGaleria,
        activa: true,
        orden: videos.length,
        // Metadata del video para poder editarlo después
        videoOriginalUrl: originalUrl,
        videoStartTime: videoTrimOptions?.startTime || 0,
        videoEndTime: videoTrimOptions?.endTime || 0,
        thumbnailTime: videoThumbnailTime || videoTrimOptions?.startTime || 0,
      })

      // Toast is handled by the createMutation hook - no duplicate needed

      setIsUploadingVideo(false)
      setVideoTitulo('')
      setVideoDescripcion('')
      setVideoThumbnailTime(0)
      clearVideoPreview()
    } catch (error: any) {
      toast.error('Error al subir video', {
        description: error.message || 'No se pudo subir el video'
      })
    } finally {
      setIsUploadingVideoFile(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await deleteMutation.mutateAsync(deleteId)
      toast.success('Elemento eliminado', {
        description: 'El contenido ha sido eliminado de la galería'
      })
    } catch (error) {
      // Error manejado por el hook
    } finally {
      setDeleteId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header con gradiente */}
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="hover:bg-amber-50 dark:hover:bg-amber-500/10">
              <ChevronLeft className="size-5 text-amber-600 dark:text-amber-400" />
            </Button>
          </Link>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 rounded-xl blur-xl dark:from-amber-500/5 dark:via-orange-500/5 dark:to-rose-500/5" />
            <div className="relative">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 dark:from-amber-400 dark:via-orange-400 dark:to-rose-400 bg-clip-text text-transparent">
                Multimedia
              </h1>
              <p className="text-muted-foreground mt-1">
                Administra las imágenes y videos que se muestran en la landing page
              </p>
            </div>
          </div>
        </div>

        {/* Sección de Imágenes */}
        <ScrollReveal>
          <Card className="border-amber-200/50 dark:border-amber-500/20 bg-gradient-to-br from-white to-amber-50/30 dark:from-background dark:to-amber-950/20 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20">
                    <ImageIcon className="size-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">Imágenes</span>
                  <Badge variant="outline" className="border-amber-300 dark:border-amber-500/50 text-amber-700 dark:text-amber-300">{imagenes.length}/{MAX_IMAGENES}</Badge>
                </CardTitle>
                <CardDescription>
                  Sube hasta {MAX_IMAGENES} imágenes para mostrar en la galería de la landing
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsUploadingImage(true)}
                disabled={imagenes.length >= MAX_IMAGENES}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all disabled:opacity-50"
              >
                <Plus className="size-4 mr-2" />
                Agregar Imagen
              </Button>
            </CardHeader>
            <CardContent>
              {imagenes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-amber-200 dark:border-amber-500/30 rounded-lg bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
                  <div className="p-4 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 w-fit mx-auto mb-4">
                    <ImageIcon className="size-12 text-amber-500 dark:text-amber-400" />
                  </div>
                  <p className="font-medium text-amber-700 dark:text-amber-300">No hay imágenes en la galería</p>
                  <p className="text-sm text-amber-600/70 dark:text-amber-400/70">Agrega imágenes para mostrarlas en la landing page</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagenes.map((imagen: GaleriaImagen) => (
                    <div key={imagen.id} className="relative aspect-[4/3] rounded-lg border bg-muted/20 group overflow-hidden">
                      <img
                        src={imagen.imagenUrl || "/placeholder.svg"}
                        alt={imagen.titulo}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteId(imagen.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Eliminar imagen</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-xs text-white bg-black/50 rounded px-2 py-1 truncate">
                          {imagen.titulo}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Sección de Videos */}
        <ScrollReveal>
          <Card className="border-rose-200/50 dark:border-rose-500/20 bg-gradient-to-br from-white to-rose-50/30 dark:from-background dark:to-rose-950/20 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500" />
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500/10 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20">
                    <Video className="size-4 text-rose-600 dark:text-rose-400" />
                  </div>
                  <span className="bg-gradient-to-r from-rose-600 to-pink-600 dark:from-rose-400 dark:to-pink-400 bg-clip-text text-transparent">Videos</span>
                  <Badge variant="outline" className="border-rose-300 dark:border-rose-500/50 text-rose-700 dark:text-rose-300">{videos.length}/{MAX_VIDEOS}</Badge>
                </CardTitle>
                <CardDescription>
                  Sube hasta {MAX_VIDEOS} videos (máx. 2 min cada uno). Puedes recortar videos largos.
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsUploadingVideo(true)}
                disabled={videos.length >= MAX_VIDEOS}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all disabled:opacity-50"
              >
                <Plus className="size-4 mr-2" />
                Agregar Video
              </Button>
            </CardHeader>
            <CardContent>
              {videos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-rose-200 dark:border-rose-500/30 rounded-lg bg-gradient-to-br from-rose-50/50 to-pink-50/50 dark:from-rose-950/20 dark:to-pink-950/20">
                  <div className="p-4 rounded-full bg-gradient-to-br from-rose-500/10 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20 w-fit mx-auto mb-4">
                    <Video className="size-12 text-rose-500 dark:text-rose-400" />
                  </div>
                  <p className="font-medium text-rose-700 dark:text-rose-300">No hay videos en la galería</p>
                  <p className="text-sm text-rose-600/70 dark:text-rose-400/70">Sube videos cortos para mostrarlos en la landing page</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {videos.map((video: GaleriaImagen) => (
                    <div key={video.id} className="relative aspect-video rounded-lg border overflow-hidden group bg-black">
                      <video
                        src={video.imagenUrl}
                        className="w-full h-full object-contain"
                        controls
                        preload="metadata"
                      />
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Botón Editar */}
                        {video.videoOriginalUrl && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => openEditVideo(video)}
                                className="bg-sky-500 hover:bg-sky-600 text-white"
                              >
                                <Scissors className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar recorte</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {/* Botón Eliminar */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteId(video.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Eliminar video</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-white truncate flex-1">
                            {video.titulo}
                          </p>
                          {video.videoStartTime !== undefined && video.videoEndTime !== undefined && (
                            <Badge variant="outline" className="text-[10px] bg-black/50 text-white border-white/30 ml-2">
                              {Math.round(video.videoEndTime - video.videoStartTime)}s
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Dialog para subir imagen */}
        <Dialog open={isUploadingImage} onOpenChange={(open) => {
          setIsUploadingImage(open)
          if (!open) {
            setImageUrl('')
            setImageTitulo('')
            setImageDescripcion('')
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Imagen</DialogTitle>
              <DialogDescription>
                Sube una imagen para mostrar en la galería de la landing page
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleImageUpload}>
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={imageTitulo}
                  onChange={(e) => setImageTitulo(e.target.value)}
                  placeholder="Título de la imagen"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Imagen *</Label>
                <ImageUpload
                  value={imageUrl}
                  onChange={setImageUrl}
                  onUpload={handleImageFileUpload}
                  disabled={createMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción (opcional)</Label>
                <Textarea
                  id="descripcion"
                  value={imageDescripcion}
                  onChange={(e) => setImageDescripcion(e.target.value)}
                  placeholder="Descripción de la imagen..."
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsUploadingImage(false)
                  setImageUrl('')
                  setImageTitulo('')
                  setImageDescripcion('')
                }}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || !imageUrl}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  {createMutation.isPending ? 'Agregando...' : 'Agregar Imagen'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para subir video */}
        <Dialog open={isUploadingVideo} onOpenChange={(open) => {
          setIsUploadingVideo(open)
          if (!open) {
            setVideoTitulo('')
            setVideoDescripcion('')
            clearVideoPreview()
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Scissors className="size-5 text-rose-500" />
                Agregar Video
              </DialogTitle>
              <DialogDescription>
                Sube un video (máx. 100MB) y recórtalo si es necesario. El clip final debe ser de máximo 2 minutos.
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleVideoUpload}>
              <div className="space-y-2">
                <Label htmlFor="videoTitulo">Título *</Label>
                <Input
                  id="videoTitulo"
                  value={videoTitulo}
                  onChange={(e) => setVideoTitulo(e.target.value)}
                  placeholder="Título del video"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Video *</Label>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleVideoFileChange}
                  className="hidden"
                  id="video-upload"
                />

                {videoFile ? (
                  <div className="space-y-4">
                    {/* Video Trimmer */}
                    <VideoTrimmer
                      file={videoFile}
                      maxDuration={MAX_VIDEO_DURATION}
                      onTrimChange={handleTrimChange}
                      onThumbnailChange={handleThumbnailChange}
                    />

                    {/* Botón para cambiar video */}
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearVideoPreview}
                        className="text-rose-600 hover:text-rose-700 border-rose-200 hover:border-rose-300"
                      >
                        <Trash2 className="size-4 mr-2" />
                        Cambiar video
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="video-upload"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-rose-200 dark:border-rose-500/30 rounded-lg cursor-pointer hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors bg-gradient-to-br from-rose-50/30 to-pink-50/30 dark:from-rose-950/10 dark:to-pink-950/10"
                  >
                    <div className="p-4 rounded-full bg-gradient-to-br from-rose-500/10 to-pink-500/10 mb-3">
                      <Upload className="size-8 text-rose-500" />
                    </div>
                    <span className="text-sm font-medium text-rose-700 dark:text-rose-300">Haz clic para seleccionar un video</span>
                    <span className="text-xs text-rose-600/70 dark:text-rose-400/70 mt-1">MP4, WebM o MOV (máx. 100MB)</span>
                    <div className="flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-xs text-rose-600 dark:text-rose-400">
                      <Scissors className="size-3" />
                      Podrás recortar el video después de seleccionarlo
                    </div>
                  </label>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoDescripcion">Descripción (opcional)</Label>
                <Textarea
                  id="videoDescripcion"
                  value={videoDescripcion}
                  onChange={(e) => setVideoDescripcion(e.target.value)}
                  placeholder="Descripción del video..."
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => {
                  setIsUploadingVideo(false)
                  setVideoTitulo('')
                  setVideoDescripcion('')
                  clearVideoPreview()
                }}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isUploadingVideoFile || !videoFile}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-500/25"
                >
                  {isUploadingVideoFile ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      {videoTrimOptions ? 'Recortando y subiendo...' : 'Subiendo...'}
                    </>
                  ) : (
                    <>
                      <Video className="size-4 mr-2" />
                      {videoTrimOptions ? 'Subir Clip Recortado' : 'Subir Video'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para editar video */}
        <Dialog open={!!editingVideo} onOpenChange={(open) => {
          if (!open) {
            setEditingVideo(null)
            setEditTrimOptions(null)
            setEditThumbnailTime(0)
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Scissors className="size-5 text-sky-500" />
                Editar Recorte de Video
              </DialogTitle>
              <DialogDescription>
                Ajusta el recorte del video sin necesidad de volver a subirlo
              </DialogDescription>
            </DialogHeader>

            {editingVideo && editingVideo.videoOriginalUrl && (
              <div className="space-y-4">
                {/* Video Trimmer for editing */}
                <VideoTrimmer
                  videoUrl={editingVideo.videoOriginalUrl}
                  initialStartTime={editingVideo.videoStartTime}
                  initialEndTime={editingVideo.videoEndTime}
                  initialThumbnailTime={editingVideo.thumbnailTime}
                  maxDuration={MAX_VIDEO_DURATION}
                  onTrimChange={handleEditTrimChange}
                  onThumbnailChange={handleEditThumbnailChange}
                />

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingVideo(null)}
                    disabled={isSavingEdit}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveVideoEdit}
                    disabled={isSavingEdit || !editTrimOptions}
                    className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white shadow-lg shadow-sky-500/25"
                  >
                    {isSavingEdit ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Scissors className="size-4 mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* AlertDialog para confirmar eliminación */}
        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar este contenido?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El contenido será eliminado permanentemente de la galería.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}
