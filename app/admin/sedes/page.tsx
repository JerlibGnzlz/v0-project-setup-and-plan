'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, MapPin, Globe } from 'lucide-react'
import { useSedes, useCreateSede, useUpdateSede, useDeleteSede } from '@/lib/hooks/use-sedes'
import { uploadApi } from '@/lib/api/upload'
import type { Sede } from '@/lib/api/sedes'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ImageUpload } from '@/components/ui/image-upload'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface SedeFormData {
  pais: string
  ciudad: string
  descripcion: string
  imagenUrl: string
  bandera: string
  activa: boolean
  orden: number
}

export default function SedesPage() {
  const [selectedSede, setSelectedSede] = useState<Sede | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formData, setFormData] = useState<SedeFormData>({
    pais: '',
    ciudad: '',
    descripcion: '',
    imagenUrl: '',
    bandera: '',
    activa: true,
    orden: 0,
  })

  const { data: sedes = [], isLoading } = useSedes()
  const createMutation = useCreateSede()
  const updateMutation = useUpdateSede()
  const deleteMutation = useDeleteSede()

  const handleOpenDialog = (sede?: Sede) => {
    if (sede) {
      setSelectedSede(sede)
      setFormData({
        pais: sede.pais,
        ciudad: sede.ciudad,
        descripcion: sede.descripcion,
        imagenUrl: sede.imagenUrl,
        bandera: sede.bandera,
        activa: sede.activa,
        orden: sede.orden,
      })
    } else {
      setSelectedSede(null)
      setFormData({
        pais: '',
        ciudad: '',
        descripcion: '',
        imagenUrl: '',
        bandera: '',
        activa: true,
        orden: sedes.length,
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedSede(null)
    setFormData({
      pais: '',
      ciudad: '',
      descripcion: '',
      imagenUrl: '',
      bandera: '',
      activa: true,
      orden: 0,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (selectedSede) {
        await updateMutation.mutateAsync({ id: selectedSede.id, data: formData })
      } else {
        await createMutation.mutateAsync(formData)
      }
      handleCloseDialog()
    } catch (error) {
      // Error ya manejado por el hook
    }
  }

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteMutation.mutateAsync(deleteId)
        setDeleteId(null)
      } catch (error) {
        // Error ya manejado por el hook
      }
    }
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    const result = await uploadApi.uploadGaleriaImage(file)
    return result.url
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Sedes</h1>
          <p className="text-muted-foreground">
            Administra las sedes que se muestran en la landing page
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Sede
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedSede ? 'Editar Sede' : 'Nueva Sede'}</DialogTitle>
              <DialogDescription>
                {selectedSede
                  ? 'Modifica la información de la sede'
                  : 'Completa la información para agregar una nueva sede'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pais">País *</Label>
                  <Input
                    id="pais"
                    value={formData.pais}
                    onChange={e => setFormData({ ...formData, pais: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ciudad">Ciudad *</Label>
                  <Input
                    id="ciudad"
                    value={formData.ciudad}
                    onChange={e => setFormData({ ...formData, ciudad: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bandera">Bandera (Emoji) *</Label>
                <Input
                  id="bandera"
                  value={formData.bandera}
                  onChange={e => setFormData({ ...formData, bandera: e.target.value })}
                  placeholder="🇨🇴"
                  required
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground">
                  Ingresa el emoji de la bandera (ej: 🇨🇴, 🇪🇸, 🇦🇷)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Imagen *</Label>
                <ImageUpload
                  value={formData.imagenUrl}
                  onChange={url => setFormData({ ...formData, imagenUrl: url })}
                  onUpload={handleImageUpload}
                  label="Subir imagen de la ciudad"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orden">Orden</Label>
                  <Input
                    id="orden"
                    type="number"
                    min="0"
                    value={formData.orden}
                    onChange={e =>
                      setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Define el orden de aparición (menor número = primero)
                  </p>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="activa"
                    checked={formData.activa}
                    onCheckedChange={checked => setFormData({ ...formData, activa: checked })}
                  />
                  <Label htmlFor="activa">Sede activa</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {selectedSede ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sedes</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sedes.length}</div>
            <p className="text-xs text-muted-foreground">Sedes registradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sedes Activas</CardTitle>
            <MapPin className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {sedes.filter(s => s.activa).length}
            </div>
            <p className="text-xs text-muted-foreground">Visibles en la landing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sedes Inactivas</CardTitle>
            <MapPin className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400">
              {sedes.filter(s => !s.activa).length}
            </div>
            <p className="text-xs text-muted-foreground">Ocultas en la landing</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Sedes</CardTitle>
          <CardDescription>Gestiona las sedes que aparecen en la sección de sedes</CardDescription>
        </CardHeader>
        <CardContent>
          {sedes.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay sedes registradas</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Comienza agregando tu primera sede
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Primera Sede
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium">Bandera</th>
                    <th className="p-3 text-left text-sm font-medium">País</th>
                    <th className="p-3 text-left text-sm font-medium">Ciudad</th>
                    <th className="p-3 text-left text-sm font-medium">Descripción</th>
                    <th className="p-3 text-left text-sm font-medium">Orden</th>
                    <th className="p-3 text-left text-sm font-medium">Estado</th>
                    <th className="p-3 text-left text-sm font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sedes.map((sede, index) => (
                    <tr key={sede.id} className="border-b">
                      <td className="p-3">
                        <span className="text-2xl">{sede.bandera}</span>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{sede.pais}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">{sede.ciudad}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                          {sede.descripcion}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">{sede.orden}</div>
                      </td>
                      <td className="p-3">
                        <Badge variant={sede.activa ? 'default' : 'secondary'}>
                          {sede.activa ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(sede)}
                            title="Editar sede"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(sede.id)}
                            title="Eliminar sede"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La sede será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

