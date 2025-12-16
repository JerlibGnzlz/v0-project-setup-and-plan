'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Trash2, Scissors } from 'lucide-react'
import type { GaleriaImagen } from '@/lib/api/galeria'

interface GaleriaVideoItemProps {
  video: GaleriaImagen
  onDelete: (id: string) => void
  onEdit: (video: GaleriaImagen) => void
}

export function GaleriaVideoItem({ video, onDelete, onEdit }: GaleriaVideoItemProps) {
  const clipDuration =
    video.videoStartTime !== undefined && video.videoEndTime !== undefined
      ? Math.round(video.videoEndTime - video.videoStartTime)
      : null

  return (
    <div className="relative aspect-video rounded-lg border overflow-hidden group bg-black">
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
                onClick={() => onEdit(video)}
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
            <Button size="sm" variant="destructive" onClick={() => onDelete(video.id)}>
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
          <p className="text-xs text-white truncate flex-1">{video.titulo}</p>
          {clipDuration !== null && (
            <Badge
              variant="outline"
              className="border-white/30 text-white bg-black/50 text-xs ml-2"
            >
              {clipDuration}s
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}










