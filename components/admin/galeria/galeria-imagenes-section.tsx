'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollReveal } from '@/components/scroll-reveal'
import { ImageIcon, Plus } from 'lucide-react'
import { GaleriaImagenItem } from './galeria-imagen-item'
import type { GaleriaImagen } from '@/lib/api/galeria'

interface GaleriaImagenesSectionProps {
  imagenes: GaleriaImagen[]
  maxImagenes: number
  onUploadClick: () => void
  onDelete: (id: string) => void
}

export function GaleriaImagenesSection({
  imagenes,
  maxImagenes,
  onUploadClick,
  onDelete,
}: GaleriaImagenesSectionProps) {
  return (
    <ScrollReveal>
      <Card className="border-amber-200/50 dark:border-amber-500/20 bg-gradient-to-br from-white to-amber-50/30 dark:from-background dark:to-amber-950/20 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20">
                <ImageIcon className="size-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                Imágenes
              </span>
              <Badge
                variant="outline"
                className="border-amber-300 dark:border-amber-500/50 text-amber-700 dark:text-amber-300"
              >
                {imagenes.length}/{maxImagenes}
              </Badge>
            </CardTitle>
            <CardDescription>
              Sube hasta {maxImagenes} imágenes para mostrar en la galería de la landing
            </CardDescription>
          </div>
          <Button
            onClick={onUploadClick}
            disabled={imagenes.length >= maxImagenes}
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
              <p className="font-medium text-amber-700 dark:text-amber-300">
                No hay imágenes en la galería
              </p>
              <p className="text-sm text-amber-600/70 dark:text-amber-400/70">
                Agrega imágenes para mostrarlas en la landing page
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {imagenes.map(imagen => (
                <GaleriaImagenItem key={imagen.id} imagen={imagen} onDelete={onDelete} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </ScrollReveal>
  )
}




























