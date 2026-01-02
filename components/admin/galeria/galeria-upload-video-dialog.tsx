'use client'

import { useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { VideoTrimmer } from '@/components/video-trimmer'
import { Upload, Video, Loader2, Trash2, Scissors } from 'lucide-react'
import { toast } from 'sonner'

interface GaleriaUploadVideoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    titulo: string
    descripcion: string
    videoFile: File
    trimOptions?: { startTime: number; endTime: number } | null
    thumbnailTime: number
  }) => Promise<void>
  isUploading: boolean
  videoTitulo: string
  setVideoTitulo: (titulo: string) => void
  videoDescripcion: string
  setVideoDescripcion: (descripcion: string) => void
  videoFile: File | null
  setVideoFile: (file: File | null) => void
  videoPreview: string
  setVideoPreview: (preview: string) => void
  videoTrimOptions: { startTime: number; endTime: number } | null
  setVideoTrimOptions: (options: { startTime: number; endTime: number } | null) => void
  videoThumbnailTime: number
  setVideoThumbnailTime: (time: number) => void
  maxDuration: number
}

export function GaleriaUploadVideoDialog({
  open,
  onOpenChange,
  onSubmit,
  isUploading,
  videoTitulo,
  setVideoTitulo,
  videoDescripcion,
  setVideoDescripcion,
  videoFile,
  setVideoFile,
  videoPreview,
  setVideoPreview,
  videoTrimOptions,
  setVideoTrimOptions,
  videoThumbnailTime,
  setVideoThumbnailTime,
  maxDuration,
}: GaleriaUploadVideoDialogProps) {
  const videoInputRef = useRef<HTMLInputElement>(null)

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
  }, [videoPreview, setVideoFile, setVideoPreview, setVideoTrimOptions])

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato no válido', {
        description: 'Solo se permiten videos MP4, WebM o MOV',
      })
      return
    }

    // Validar tamaño (100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video muy grande', {
        description: 'El video no debe superar los 100MB',
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

  const handleTrimChange = useCallback(
    (startTime: number, endTime: number) => {
      setVideoTrimOptions({ startTime, endTime })
    },
    [setVideoTrimOptions]
  )

  const handleThumbnailChange = useCallback(
    (time: number) => {
      setVideoThumbnailTime(time)
    },
    [setVideoThumbnailTime]
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      if (clipDuration > maxDuration) {
        toast.error('Video muy largo', {
          description: `El clip seleccionado dura ${Math.round(clipDuration)}s. Máximo permitido: ${maxDuration}s`,
        })
        return
      }
    }

    await onSubmit({
      titulo: videoTitulo,
      descripcion: videoDescripcion,
      videoFile,
      trimOptions: videoTrimOptions,
      thumbnailTime: videoThumbnailTime,
    })
  }

  const handleClose = () => {
    onOpenChange(false)
    setVideoTitulo('')
    setVideoDescripcion('')
    clearVideoPreview()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scissors className="size-5 text-rose-500" />
            Agregar Video
          </DialogTitle>
          <DialogDescription>
            Sube un video (máx. 100MB) y recórtalo si es necesario. El clip final debe ser de
            máximo {maxDuration / 60} minutos.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="videoTitulo">Título *</Label>
            <Input
              id="videoTitulo"
              value={videoTitulo}
              onChange={e => setVideoTitulo(e.target.value)}
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
                  maxDuration={maxDuration}
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
                <span className="text-sm font-medium text-rose-700 dark:text-rose-300">
                  Haz clic para seleccionar un video
                </span>
                <span className="text-xs text-rose-600/70 dark:text-rose-400/70 mt-1">
                  MP4, WebM o MOV (máx. 100MB)
                </span>
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
              onChange={e => setVideoDescripcion(e.target.value)}
              placeholder="Descripción del video..."
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isUploading || !videoFile}
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-500/25"
            >
              {isUploading ? (
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
  )
}






























