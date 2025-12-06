'use client'

import React, { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { VideoTrimmer } from '@/components/video-trimmer'
import { Scissors, Loader2 } from 'lucide-react'

interface GaleriaEditVideoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  video: {
    id: string
    videoOriginalUrl?: string
    imagenUrl: string
    videoStartTime?: number
    videoEndTime?: number
    thumbnailTime?: number
  } | null
  onSave: (data: {
    startTime: number
    endTime: number
    thumbnailTime: number
  }) => Promise<void>
  isSaving: boolean
  maxDuration: number
}

export function GaleriaEditVideoDialog({
  open,
  onOpenChange,
  video,
  onSave,
  isSaving,
  maxDuration,
}: GaleriaEditVideoDialogProps) {
  const [editTrimOptions, setEditTrimOptions] = React.useState<{
    startTime: number
    endTime: number
  } | null>(null)
  const [editThumbnailTime, setEditThumbnailTime] = React.useState<number>(0)

  // Inicializar valores cuando se abre el dialog
  React.useEffect(() => {
    if (video && open) {
      setEditTrimOptions({
        startTime: video.videoStartTime || 0,
        endTime: video.videoEndTime || 0,
      })
      setEditThumbnailTime(video.thumbnailTime || video.videoStartTime || 0)
    }
  }, [video, open])

  const handleEditTrimChange = useCallback((startTime: number, endTime: number) => {
    setEditTrimOptions({ startTime, endTime })
  }, [])

  const handleEditThumbnailChange = useCallback((time: number) => {
    setEditThumbnailTime(time)
  }, [])

  const handleSave = async () => {
    if (!editTrimOptions) return
    await onSave({
      startTime: editTrimOptions.startTime,
      endTime: editTrimOptions.endTime,
      thumbnailTime: editThumbnailTime,
    })
  }

  const handleClose = () => {
    onOpenChange(false)
    setEditTrimOptions(null)
    setEditThumbnailTime(0)
  }

  if (!video || !video.videoOriginalUrl) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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

        <div className="space-y-4">
          {/* Video Trimmer for editing */}
          <VideoTrimmer
            videoUrl={video.videoOriginalUrl}
            initialStartTime={video.videoStartTime}
            initialEndTime={video.videoEndTime}
            initialThumbnailTime={video.thumbnailTime}
            maxDuration={maxDuration}
            onTrimChange={handleEditTrimChange}
            onThumbnailChange={handleEditThumbnailChange}
          />

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !editTrimOptions}
              className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white shadow-lg shadow-sky-500/25"
            >
              {isSaving ? (
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
      </DialogContent>
    </Dialog>
  )
}

