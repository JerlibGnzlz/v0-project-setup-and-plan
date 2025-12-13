'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUpload } from '@/components/ui/image-upload'
import {
  useCreateCredencialMinisterial,
  useUpdateCredencialMinisterial,
} from '@/lib/hooks/use-credenciales-ministeriales'
import { CredencialMinisterial } from '@/lib/api/credenciales-ministeriales'
import { uploadApi } from '@/lib/api/upload'

const credencialSchema = z.object({
  apellido: z.string().min(1, 'El apellido es requerido'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  documento: z.string().min(1, 'El documento es requerido'),
  nacionalidad: z.string().min(1, 'La nacionalidad es requerida'),
  fechaNacimiento: z.string().min(1, 'La fecha de nacimiento es requerida'),
  tipoPastor: z.string().default('PASTOR'),
  fechaVencimiento: z.string().min(1, 'La fecha de vencimiento es requerida'),
  fotoUrl: z.string().optional(),
})

type CredencialFormData = z.infer<typeof credencialSchema>

interface CredencialEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  credencial?: CredencialMinisterial | null
  editMode?: 'frente' | 'dorso' // 'frente' permite editar todo, 'dorso' solo fechaVencimiento
  onCredencialCreated?: (credencial: CredencialMinisterial) => void
}

export function CredencialEditorDialog({
  open,
  onOpenChange,
  credencial,
  editMode = 'frente',
  onCredencialCreated,
}: CredencialEditorDialogProps) {
  const createMutation = useCreateCredencialMinisterial()
  const updateMutation = useUpdateCredencialMinisterial()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CredencialFormData>({
    resolver: zodResolver(credencialSchema),
    defaultValues: {
      apellido: '',
      nombre: '',
      documento: '',
      nacionalidad: '',
      fechaNacimiento: '',
      tipoPastor: 'PASTOR',
      fechaVencimiento: '',
      fotoUrl: '',
    },
  })

  const fotoUrl = watch('fotoUrl')
  const tipoPastor = watch('tipoPastor')

  useEffect(() => {
    if (credencial && open) {
      reset({
        apellido: credencial.apellido,
        nombre: credencial.nombre,
        documento: credencial.documento,
        nacionalidad: credencial.nacionalidad,
        fechaNacimiento: credencial.fechaNacimiento.split('T')[0],
        tipoPastor: credencial.tipoPastor,
        fechaVencimiento: credencial.fechaVencimiento.split('T')[0],
        fotoUrl: credencial.fotoUrl || '',
      })
    } else if (!open) {
      reset()
    }
  }, [credencial, open, reset])

  const onSubmit = async (data: CredencialFormData) => {
    try {
      if (credencial) {
        // Si es modo dorso, solo actualizar fechaVencimiento
        if (editMode === 'dorso') {
          const updated = await updateMutation.mutateAsync({
            id: credencial.id,
            dto: {
              fechaVencimiento: data.fechaVencimiento,
            },
          })
          onOpenChange(false)
          reset()
          // Si hay callback, llamarlo con la credencial actualizada
          if (onCredencialCreated && updated) {
            onCredencialCreated(updated)
          }
        } else {
          // Modo frente: actualizar todos los campos editables
          const updated = await updateMutation.mutateAsync({
            id: credencial.id,
            dto: {
              apellido: data.apellido,
              nombre: data.nombre,
              documento: data.documento,
              nacionalidad: data.nacionalidad,
              fechaNacimiento: data.fechaNacimiento,
              tipoPastor: data.tipoPastor,
              fotoUrl: data.fotoUrl,
            },
          })
          onOpenChange(false)
          reset()
          // Si hay callback, llamarlo con la credencial actualizada
          if (onCredencialCreated && updated) {
            onCredencialCreated(updated)
          }
        }
      } else {
        // Crear nueva credencial
        try {
          const nuevaCredencial = await createMutation.mutateAsync(data)
          console.log('[CredencialEditorDialog] Credencial creada exitosamente:', nuevaCredencial)
          
          // Cerrar diálogo y resetear formulario primero
          onOpenChange(false)
          reset()
          
          // Llamar al callback con la credencial creada para mostrar el diseño visual
          // Usar setTimeout para asegurar que el estado del diálogo se actualice primero
          if (onCredencialCreated && nuevaCredencial) {
            console.log('[CredencialEditorDialog] Llamando onCredencialCreated con:', nuevaCredencial)
            // Usar setTimeout para asegurar que el diálogo se cierre antes de cambiar el modo
            setTimeout(() => {
              onCredencialCreated(nuevaCredencial)
            }, 100)
          } else {
            console.warn('[CredencialEditorDialog] onCredencialCreated no está definido o nuevaCredencial es null')
          }
        } catch (error) {
          console.error('[CredencialEditorDialog] Error al crear credencial:', error)
          // El error ya se maneja en el hook
        }
      }
    } catch (error) {
      // Error ya manejado en el hook
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    reset()
  }

  const isLoading = createMutation.isPending || updateMutation.isPending || isSubmitting

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {credencial
              ? editMode === 'dorso'
                ? 'Editar Dorso de Credencial'
                : 'Editar Frente de Credencial'
              : 'Nueva Credencial Ministerial'}
          </DialogTitle>
          <DialogDescription>
            {credencial
              ? editMode === 'dorso'
                ? 'Actualiza la fecha de vencimiento de la credencial'
                : 'Actualiza la información del frente de la credencial'
              : 'Crea una nueva credencial ministerial física'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {editMode === 'frente' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido *</Label>
                  <Input
                    id="apellido"
                    placeholder="Apellido"
                    {...register('apellido')}
                    disabled={!!credencial && editMode === 'dorso'}
                  />
                  {errors.apellido && (
                    <p className="text-xs text-destructive">{errors.apellido.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    placeholder="Nombre"
                    {...register('nombre')}
                    disabled={!!credencial && editMode === 'dorso'}
                  />
                  {errors.nombre && (
                    <p className="text-xs text-destructive">{errors.nombre.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="documento">Documento (DNI) *</Label>
                  <Input
                    id="documento"
                    placeholder="Ej: 17.370.966"
                    {...register('documento')}
                    disabled={!!credencial}
                  />
                  {errors.documento && (
                    <p className="text-xs text-destructive">{errors.documento.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nacionalidad">Nacionalidad *</Label>
                  <Input
                    id="nacionalidad"
                    placeholder="Ej: Argentina"
                    {...register('nacionalidad')}
                    disabled={!!credencial && editMode === 'dorso'}
                  />
                  {errors.nacionalidad && (
                    <p className="text-xs text-destructive">{errors.nacionalidad.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    {...register('fechaNacimiento')}
                    disabled={!!credencial && editMode === 'dorso'}
                  />
                  {errors.fechaNacimiento && (
                    <p className="text-xs text-destructive">
                      {errors.fechaNacimiento.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipoPastor">Tipo de Pastor *</Label>
                  <Select
                    value={tipoPastor}
                    onValueChange={value => setValue('tipoPastor', value)}
                    disabled={!!credencial && editMode === 'dorso'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PASTOR">PASTOR / PASTOR</SelectItem>
                      <SelectItem value="PASTORA">PASTORA / SHEPHERD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Foto del Pastor</Label>
                <ImageUpload
                  value={fotoUrl}
                  onChange={url => setValue('fotoUrl', url)}
                  onUpload={async file => {
                    const response = await uploadApi.uploadImage(file)
                    return response.url
                  }}
                  disabled={!!credencial && editMode === 'dorso'}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="fechaVencimiento">Fecha de Vencimiento *</Label>
            <Input
              id="fechaVencimiento"
              type="date"
              {...register('fechaVencimiento')}
            />
            {errors.fechaVencimiento && (
              <p className="text-xs text-destructive">{errors.fechaVencimiento.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {editMode === 'dorso'
                ? 'Esta es la única información editable en el dorso de la credencial'
                : 'Fecha de vencimiento de la credencial (visible en el dorso)'}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? 'Guardando...'
                : credencial
                  ? 'Actualizar'
                  : 'Crear Credencial'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

