'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
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
import { Upload, Edit, Trash2, ImageIcon, Video, ChevronLeft } from 'lucide-react'
import { ScrollReveal } from '@/components/scroll-reveal'

export default function GaleriaPage() {
  const [isUploadingGallery, setIsUploadingGallery] = useState(false)

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Subiendo contenido...',
        success: () => {
          setIsUploadingGallery(false)
          return 'Contenido subido exitosamente'
        },
        error: 'Error al subir el contenido',
      }
    )
  }

  const handleDelete = (type: string, index: number) => {
    if (confirm(`¿Está seguro de eliminar este ${type}?`)) {
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1000)),
        {
          loading: 'Eliminando...',
          success: `${type} eliminado correctamente`,
          error: `Error al eliminar el ${type}`,
        }
      )
    }
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
                  <Label>Tipo de contenido</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="imagen">Imagen</SelectItem>
                      <SelectItem value="video">Video (URL de YouTube)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="size-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Arrastra archivos aquí o haz clic para seleccionar
                  </p>
                  <Input type="file" className="mt-4" accept="image/*" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea id="descripcion" placeholder="Descripción del contenido..." />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsUploadingGallery(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Subir</Button>
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
                Imágenes (4 espacios)
              </CardTitle>
              <CardDescription>
                Gestiona las imágenes que aparecen en la galería de la landing page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="relative aspect-video rounded-lg border bg-muted/20 group overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="size-8 text-muted-foreground" />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => toast.info('Función de edición en desarrollo')}
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
                            onClick={() => handleDelete('imagen', i)}
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
                      <p className="text-xs text-white bg-black/50 rounded px-2 py-1">
                        Espacio {i}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="size-5" />
                Videos (2 espacios)
              </CardTitle>
              <CardDescription>
                Gestiona los videos embebidos (YouTube) que aparecen en la galería
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="relative aspect-video rounded-lg border bg-muted/20 group overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Video className="size-8 text-muted-foreground" />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => toast.info('Función de edición en desarrollo')}
                          >
                            <Edit className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Editar video</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDelete('video', i)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Eliminar video</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-xs text-white bg-black/50 rounded px-2 py-1">
                        Video {i}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </TooltipProvider>
  )
}
