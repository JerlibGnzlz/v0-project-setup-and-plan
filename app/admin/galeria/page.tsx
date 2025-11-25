'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useGaleria, useCreateGaleriaImagen, useDeleteGaleriaImagen } from '@/lib/hooks/use-galeria'
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
import { Upload, Trash2, ImageIcon, Video, ChevronLeft, Plus, Loader2 } from 'lucide-react'
import { ScrollReveal } from '@/components/scroll-reveal'
import { ImageUpload } from '@/components/ui/image-upload'
import { uploadApi } from '@/lib/api/upload'
import type { GaleriaImagen, TipoGaleria } from '@/lib/api/galeria'

const MAX_IMAGENES = 4
const MAX_VIDEOS = 2

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
  const videoInputRef = useRef<HTMLInputElement>(null)

  const { data: galeria = [], isLoading } = useGaleria()
  const createMutation = useCreateGaleriaImagen()
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
    if (videoInputRef.current) {
      videoInputRef.current.value = ''
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

    // Validar tamaño (50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video muy grande', {
        description: 'El video no debe superar los 50MB'
      })
      return
    }

    // Revoke previous object URL if exists to prevent memory leak
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
    }

    setVideoFile(file)
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

    setIsUploadingVideoFile(true)

    try {
      // Subir video
      const uploadResult = await uploadApi.uploadVideo(videoFile)

      // Crear registro en la galería
      await createMutation.mutateAsync({
        titulo: videoTitulo,
        descripcion: videoDescripcion || undefined,
        imagenUrl: uploadResult.url,
        tipo: 'VIDEO' as TipoGaleria,
        activa: true,
        orden: videos.length,
      })

      // Toast is handled by the createMutation hook - no duplicate needed

      setIsUploadingVideo(false)
      setVideoTitulo('')
      setVideoDescripcion('')
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
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="size-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Galería</h1>
            <p className="text-muted-foreground mt-1">
              Administra las imágenes y videos que se muestran en la landing page
            </p>
          </div>
        </div>

        {/* Sección de Imágenes */}
        <ScrollReveal>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="size-5" />
                  Imágenes
                  <Badge variant="outline">{imagenes.length}/{MAX_IMAGENES}</Badge>
                </CardTitle>
                <CardDescription>
                  Sube hasta {MAX_IMAGENES} imágenes para mostrar en la galería de la landing
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsUploadingImage(true)}
                disabled={imagenes.length >= MAX_IMAGENES}
              >
                <Plus className="size-4 mr-2" />
                Agregar Imagen
              </Button>
            </CardHeader>
            <CardContent>
              {imagenes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                  <ImageIcon className="size-12 mx-auto mb-4 opacity-50" />
                  <p>No hay imágenes en la galería</p>
                  <p className="text-sm">Agrega imágenes para mostrarlas en la landing page</p>
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Video className="size-5" />
                  Videos
                  <Badge variant="outline">{videos.length}/{MAX_VIDEOS}</Badge>
                </CardTitle>
                <CardDescription>
                  Sube hasta {MAX_VIDEOS} videos cortos (máx. 50MB cada uno)
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsUploadingVideo(true)}
                disabled={videos.length >= MAX_VIDEOS}
              >
                <Plus className="size-4 mr-2" />
                Agregar Video
              </Button>
            </CardHeader>
            <CardContent>
              {videos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Video className="size-12 mx-auto mb-4 opacity-50" />
                  <p>No hay videos en la galería</p>
                  <p className="text-sm">Sube videos cortos para mostrarlos en la landing page</p>
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
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                        <p className="text-xs text-white truncate">
                          {video.titulo}
                        </p>
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
                <Button type="submit" disabled={createMutation.isPending || !imageUrl}>
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
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Agregar Video</DialogTitle>
              <DialogDescription>
                Sube un video corto (máximo 50MB) para mostrar en la galería
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

                {videoPreview ? (
                  <div className="relative aspect-video rounded-lg border overflow-hidden bg-black">
                    <video
                      src={videoPreview}
                      className="w-full h-full object-contain"
                      controls
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={clearVideoPreview}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="video-upload"
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Upload className="size-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Haz clic para seleccionar un video</span>
                    <span className="text-xs text-muted-foreground mt-1">MP4, WebM o MOV (máx. 50MB)</span>
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

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsUploadingVideo(false)
                  setVideoTitulo('')
                  setVideoDescripcion('')
                  clearVideoPreview()
                }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isUploadingVideoFile || !videoFile}>
                  {isUploadingVideoFile ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    'Subir Video'
                  )}
                </Button>
              </DialogFooter>
            </form>
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
