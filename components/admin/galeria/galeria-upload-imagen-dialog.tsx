'use client'

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
import { ImageUpload } from '@/components/ui/image-upload'

interface GaleriaUploadImagenDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { titulo: string; descripcion: string; imagenUrl: string }) => Promise<void>
  isUploading: boolean
  imageUrl: string
  setImageUrl: (url: string) => void
  imageTitulo: string
  setImageTitulo: (titulo: string) => void
  imageDescripcion: string
  setImageDescripcion: (descripcion: string) => void
  onImageFileUpload: (file: File) => Promise<string>
}

export function GaleriaUploadImagenDialog({
  open,
  onOpenChange,
  onSubmit,
  isUploading,
  imageUrl,
  setImageUrl,
  imageTitulo,
  setImageTitulo,
  imageDescripcion,
  setImageDescripcion,
  onImageFileUpload,
}: GaleriaUploadImagenDialogProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await onSubmit({ titulo: imageTitulo, descripcion: imageDescripcion, imagenUrl: imageUrl })
  }

  const handleClose = () => {
    onOpenChange(false)
    setImageUrl('')
    setImageTitulo('')
    setImageDescripcion('')
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Imagen</DialogTitle>
          <DialogDescription>
            Sube una imagen para mostrar en la galería de la landing page
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={imageTitulo}
              onChange={e => setImageTitulo(e.target.value)}
              placeholder="Título de la imagen"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Imagen *</Label>
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              onUpload={onImageFileUpload}
              disabled={isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              value={imageDescripcion}
              onChange={e => setImageDescripcion(e.target.value)}
              placeholder="Descripción de la imagen..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isUploading || !imageUrl}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              {isUploading ? 'Agregando...' : 'Agregar Imagen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}




















