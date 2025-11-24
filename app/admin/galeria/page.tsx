'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useGaleria, useCreateGaleriaImagen, useUpdateGaleriaImagen, useDeleteGaleriaImagen } from '@/lib/hooks/use-galeria'
import { useForm } from 'react-hook-form'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Upload, Edit, Trash2, ImageIcon, ChevronLeft } from 'lucide-react'
import { ScrollReveal } from '@/components/scroll-reveal'

export default function GaleriaPage() {
  const [isUploadingGallery, setIsUploadingGallery] = useState(false)
  const [tipoContenido, setTipoContenido] = useState<'imagen' | 'video'>('imagen')
  const { data: imagenes = [], isLoading } = useGaleria()
  const createMutation = useCreateGaleriaImagen()
  const updateMutation = useUpdateGaleriaImagen()
  const deleteMutation = useDeleteGaleriaImagen()

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const imagenUrl = formData.get('imagenUrl') as string
    const titulo = formData.get('titulo') as string
    const descripcion = formData.get('descripcion') as string

    if (!imagenUrl || !titulo) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    try {
      await createMutation.mutateAsync({
        titulo,
        descripcion: descripcion || undefined,
        imagenUrl,
        activa: true,
        orden: imagenes.length,
      })
      setIsUploadingGallery(false)
      e.currentTarget.reset()
    } catch (error) {
      // Error manejado por el hook
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar esta imagen?')) {
      try {
        await deleteMutation.mutateAsync(id)
      } catch (error) {
        // Error manejado por el hook
      }
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="size-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestión de Galería</h1>
              <p className="text-muted-foreground mt-1">
                Subir y administrar contenido de la landing page
              </p>
            </div>
          </div>
          <Dialog open={isUploadingGallery} onOpenChange={setIsUploadingGallery}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Upload className="size-4 mr-2" />
                Subir Contenido
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Subir Imagen o Video</DialogTitle>
                <DialogDescription>
                  Seleccione archivos para agregar a la galería de la landing page
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleUpload}>
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título *</Label>
                  <Input id="titulo" name="titulo" placeholder="Título de la imagen" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imagenUrl">URL de la Imagen *</Label>
                  <Input id="imagenUrl" name="imagenUrl" type="url" placeholder="https://..." required />
                  <p className="text-xs text-muted-foreground">
                    Ingresa la URL de la imagen (puede ser una URL externa o una ruta relativa)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea id="descripcion" name="descripcion" placeholder="Descripción del contenido..." />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsUploadingGallery(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Subiendo...' : 'Subir'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <ScrollReveal>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="size-5" />
                Imágenes ({imagenes.length})
              </CardTitle>
              <CardDescription>
                Gestiona las imágenes que aparecen en la galería de la landing page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagenes.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No hay imágenes en la galería. Agrega una imagen para comenzar.
                  </div>
                ) : (
                  imagenes.map((imagen) => (
                    <div key={imagen.id} className="relative aspect-video rounded-lg border bg-muted/20 group overflow-hidden">
                      <img
                        src={imagen.imagenUrl || "/placeholder.svg"}
                        alt={imagen.titulo}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => toast.info('Función de edición próximamente')}
                            >
                              <Edit className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar imagen</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDelete(imagen.id)}
                              disabled={deleteMutation.isPending}
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
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

      </div>
    </TooltipProvider>
  )
}
