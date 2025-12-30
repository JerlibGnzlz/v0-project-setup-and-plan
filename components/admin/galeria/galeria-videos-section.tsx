'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollReveal } from '@/components/scroll-reveal'
import { Video, Plus } from 'lucide-react'
import { GaleriaVideoItem } from './galeria-video-item'
import type { GaleriaImagen } from '@/lib/api/galeria'

interface GaleriaVideosSectionProps {
  videos: GaleriaImagen[]
  maxVideos: number
  onUploadClick: () => void
  onDelete: (id: string) => void
  onEdit: (video: GaleriaImagen) => void
}

export function GaleriaVideosSection({
  videos,
  maxVideos,
  onUploadClick,
  onDelete,
  onEdit,
}: GaleriaVideosSectionProps) {
  return (
    <ScrollReveal>
      <Card className="border-rose-200/50 dark:border-rose-500/20 bg-gradient-to-br from-white to-rose-50/30 dark:from-background dark:to-rose-950/20 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500" />
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500/10 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20">
                <Video className="size-4 text-rose-600 dark:text-rose-400" />
              </div>
              <span className="bg-gradient-to-r from-rose-600 to-pink-600 dark:from-rose-400 dark:to-pink-400 bg-clip-text text-transparent">
                Videos
              </span>
              <Badge
                variant="outline"
                className="border-rose-300 dark:border-rose-500/50 text-rose-700 dark:text-rose-300"
              >
                {videos.length}/{maxVideos}
              </Badge>
            </CardTitle>
            <CardDescription>
              Sube hasta {maxVideos} videos (máx. 2 min cada uno). Puedes recortar videos largos.
            </CardDescription>
          </div>
          <Button
            onClick={onUploadClick}
            disabled={videos.length >= maxVideos}
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
              <p className="font-medium text-rose-700 dark:text-rose-300">
                No hay videos en la galería
              </p>
              <p className="text-sm text-rose-600/70 dark:text-rose-400/70">
                Sube videos cortos para mostrarlos en la landing page
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {videos.map(video => (
                <GaleriaVideoItem
                  key={video.id}
                  video={video}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </ScrollReveal>
  )
}




























