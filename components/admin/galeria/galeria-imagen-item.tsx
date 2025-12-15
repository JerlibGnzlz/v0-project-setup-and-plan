'use client'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Trash2 } from 'lucide-react'
import type { GaleriaImagen } from '@/lib/api/galeria'

interface GaleriaImagenItemProps {
  imagen: GaleriaImagen
  onDelete: (id: string) => void
}

export function GaleriaImagenItem({ imagen, onDelete }: GaleriaImagenItemProps) {
  return (
    <div className="relative aspect-[4/3] rounded-lg border bg-muted/20 group overflow-hidden">
      <img
        src={imagen.imagenUrl || '/placeholder.svg'}
        alt={imagen.titulo}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="destructive" onClick={() => onDelete(imagen.id)}>
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
  )
}









