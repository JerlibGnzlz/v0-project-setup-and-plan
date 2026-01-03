'use client'

import { useState, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useGaleria,
  useCreateGaleriaImagen,
  useUpdateGaleriaImagen,
  useDeleteGaleriaImagen,
} from '@/lib/hooks/use-galeria'
import { uploadApi } from '@/lib/api/upload'
import type { GaleriaImagen, TipoGaleria } from '@/lib/api/galeria'
import {
  GaleriaHeader,
  GaleriaImagenesSection,
  GaleriaVideosSection,
  GaleriaUploadImagenDialog,
  GaleriaUploadVideoDialog,
  GaleriaEditVideoDialog,
  GaleriaDeleteDialog,
} from '@/components/admin/galeria'

const MAX_IMAGENES = 12
const MAX_VIDEOS = 6
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
  const [videoTrimOptions, setVideoTrimOptions] = useState<{
    startTime: number
    endTime: number
  } | null>(null)
  const [videoThumbnailTime, setVideoThumbnailTime] = useState<number>(0)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Estados para editar video
  const [editingVideo, setEditingVideo] = useState<GaleriaImagen | null>(null)
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  const { data: galeria = [], isLoading } = useGaleria()
  const createMutation = useCreateGaleriaImagen()
  const updateMutation = useUpdateGaleriaImagen()
  const deleteMutation = useDeleteGaleriaImagen()

  // Separar imágenes y videos
  const imagenes = galeria.filter((item: GaleriaImagen) => item.tipo === 'IMAGEN' || !item.tipo)
  const videos = galeria.filter((item: GaleriaImagen) => item.tipo === 'VIDEO')

  // Helper function to properly clear video preview and revoke object URL to prevent memory leaks
  const clearVideoPreview = useCallback(() => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
    }
    setVideoFile(null)
    setVideoPreview('')
    setVideoTrimOptions(null)
    if (videoInputRef.current) {
      videoInputRef.current.value = ''
    }
  }, [videoPreview])

  // Handlers
  const handleImageUpload = async (data: {
    titulo: string
    descripcion: string
    imagenUrl: string
  }) => {
    try {
      await createMutation.mutateAsync({
        titulo: data.titulo,
        descripcion: data.descripcion || undefined,
        imagenUrl: data.imagenUrl,
        tipo: 'IMAGEN' as TipoGaleria,
        activa: true,
        orden: imagenes.length,
      })

      setIsUploadingImage(false)
      setImageUrl('')
      setImageTitulo('')
      setImageDescripcion('')
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : 'No se pudo agregar la imagen'
      toast.error('Error al agregar imagen', {
        description: errorMessage,
      })
    }
  }

  const handleImageFileUpload = async (file: File): Promise<string> => {
    const uploadResult = await uploadApi.uploadGaleriaImage(file)
    return uploadResult.url
  }

  const handleVideoUpload = async (data: {
    titulo: string
    descripcion: string
    videoFile: File
    trimOptions?: { startTime: number; endTime: number } | null
    thumbnailTime: number
  }) => {
    setIsUploadingVideoFile(true)

    try {
      // Subir video con opciones de recorte
      const uploadResult = await uploadApi.uploadVideo(
        data.videoFile,
        data.trimOptions || undefined
      )

      // Extraer la URL original (sin transformaciones) del resultado
      let originalUrl = uploadResult.url
      if (uploadResult.url.includes('cloudinary.com') && data.trimOptions) {
        const parts = uploadResult.url.split('/upload/')
        if (parts.length === 2) {
          const afterUpload = parts[1]
          const pathParts = afterUpload.split('/')
          const filteredParts = pathParts.filter(part => {
            if (
              part.includes('so_') ||
              part.includes('eo_') ||
              part.includes('q_') ||
              part.includes('f_')
            )
              return false
            return true
          })
          originalUrl = `${parts[0]}/upload/${filteredParts.join('/')}`
        }
      }

      // Crear registro en la galería con metadata de video
      await createMutation.mutateAsync({
        titulo: data.titulo,
        descripcion: data.descripcion || undefined,
        imagenUrl: uploadResult.url,
        tipo: 'VIDEO' as TipoGaleria,
        activa: true,
        orden: videos.length,
        videoOriginalUrl: originalUrl,
        videoStartTime: data.trimOptions?.startTime || 0,
        videoEndTime: data.trimOptions?.endTime || 0,
        thumbnailTime: data.thumbnailTime || data.trimOptions?.startTime || 0,
      })

      setIsUploadingVideo(false)
      setVideoTitulo('')
      setVideoDescripcion('')
      setVideoThumbnailTime(0)
      clearVideoPreview()
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : 'No se pudo subir el video'
      toast.error('Error al subir video', {
        description: errorMessage,
      })
    } finally {
      setIsUploadingVideoFile(false)
    }
  }

  const handleSaveVideoEdit = async (data: {
    startTime: number
    endTime: number
    thumbnailTime: number
  }) => {
    if (!editingVideo) return

    setIsSavingEdit(true)

    try {
      // Construir la nueva URL con las transformaciones
      let newImageUrl = editingVideo.imagenUrl
      const originalUrl = editingVideo.videoOriginalUrl || editingVideo.imagenUrl

      // Si es una URL de Cloudinary, reconstruir con nuevas transformaciones
      if (originalUrl.includes('cloudinary.com')) {
        const baseUrl = originalUrl.split('/upload/')[0]
        const afterUpload = originalUrl.split('/upload/')[1]

        const parts = afterUpload?.split('/') || []
        const filteredParts = parts.filter(part => {
          if (
            part.includes('so_') ||
            part.includes('eo_') ||
            part.includes('q_') ||
            part.includes('f_')
          )
            return false
          if (part.match(/^v\d+$/)) return false
          return true
        })

        const publicIdWithExt = filteredParts.join('/')
        newImageUrl = `${baseUrl}/upload/so_${data.startTime.toFixed(1)},eo_${data.endTime.toFixed(1)},q_auto,f_mp4/${publicIdWithExt}`
      }

      await updateMutation.mutateAsync({
        id: editingVideo.id,
        data: {
          imagenUrl: newImageUrl,
          videoOriginalUrl: editingVideo.videoOriginalUrl || editingVideo.imagenUrl,
          videoStartTime: data.startTime,
          videoEndTime: data.endTime,
          thumbnailTime: data.thumbnailTime,
        },
      })

      toast.success('Video actualizado', {
        description: 'Los cambios han sido guardados',
      })

      setEditingVideo(null)
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : 'No se pudieron guardar los cambios'
      toast.error('Error al guardar', {
        description: errorMessage,
      })
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await deleteMutation.mutateAsync(deleteId)
      toast.success('Elemento eliminado', {
        description: 'El contenido ha sido eliminado de la galería',
      })
    } catch (error) {
      // Error manejado por el hook
    } finally {
      setDeleteId(null)
    }
  }

  const openEditVideo = useCallback((video: GaleriaImagen) => {
    setEditingVideo(video)
  }, [])

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
        <GaleriaHeader />

        <GaleriaImagenesSection
          imagenes={imagenes}
          maxImagenes={MAX_IMAGENES}
          onUploadClick={() => setIsUploadingImage(true)}
          onDelete={id => setDeleteId(id)}
        />

        <GaleriaVideosSection
          videos={videos}
          maxVideos={MAX_VIDEOS}
          onUploadClick={() => setIsUploadingVideo(true)}
          onDelete={id => setDeleteId(id)}
          onEdit={openEditVideo}
        />

        <GaleriaUploadImagenDialog
          open={isUploadingImage}
          onOpenChange={setIsUploadingImage}
          onSubmit={handleImageUpload}
          isUploading={createMutation.isPending}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          imageTitulo={imageTitulo}
          setImageTitulo={setImageTitulo}
          imageDescripcion={imageDescripcion}
          setImageDescripcion={setImageDescripcion}
          onImageFileUpload={handleImageFileUpload}
        />

        <GaleriaUploadVideoDialog
          open={isUploadingVideo}
          onOpenChange={setIsUploadingVideo}
          onSubmit={handleVideoUpload}
          isUploading={isUploadingVideoFile}
          videoTitulo={videoTitulo}
          setVideoTitulo={setVideoTitulo}
          videoDescripcion={videoDescripcion}
          setVideoDescripcion={setVideoDescripcion}
          videoFile={videoFile}
          setVideoFile={setVideoFile}
          videoPreview={videoPreview}
          setVideoPreview={setVideoPreview}
          videoTrimOptions={videoTrimOptions}
          setVideoTrimOptions={setVideoTrimOptions}
          videoThumbnailTime={videoThumbnailTime}
          setVideoThumbnailTime={setVideoThumbnailTime}
          maxDuration={MAX_VIDEO_DURATION}
        />

        <GaleriaEditVideoDialog
          open={!!editingVideo}
          onOpenChange={open => {
            if (!open) {
              setEditingVideo(null)
            }
          }}
          video={editingVideo}
          onSave={handleSaveVideoEdit}
          isSaving={isSavingEdit}
          maxDuration={MAX_VIDEO_DURATION}
        />

        <GaleriaDeleteDialog
          open={!!deleteId}
          onOpenChange={open => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      </div>
    </TooltipProvider>
  )
}
