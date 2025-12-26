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
import { DatePickerSimple } from '@/components/ui/date-picker-simple'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUpload } from '@/components/ui/image-upload'
import {
  useCreateCredencialCapellania,
  useUpdateCredencialCapellania,
} from '@/lib/hooks/use-credenciales-capellania'
import { CredencialCapellania } from '@/lib/api/credenciales-capellania'
import { uploadApi } from '@/lib/api/upload'
import { toast } from 'sonner'

const credencialSchema = z.object({
  apellido: z.string().min(1, 'El apellido es requerido'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  documento: z.string().min(1, 'El documento es requerido'),
  nacionalidad: z.string().min(1, 'La nacionalidad es requerida'),
  fechaNacimiento: z.string().min(1, 'La fecha de nacimiento es requerida'),
  tipoCapellan: z.string().min(1, 'El tipo de capellán es requerido'),
  fechaVencimiento: z.string().min(1, 'La fecha de vencimiento es requerida'),
  fotoUrl: z.string().optional(),
})

type CredencialFormData = z.infer<typeof credencialSchema>

interface SolicitudCredencialData {
  nombre: string
  apellido: string
  dni: string
  nacionalidad?: string
  fechaNacimiento?: string
  invitadoId?: string
}

interface CredencialCapellaniaEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  credencial?: CredencialCapellania | null
  solicitud?: SolicitudCredencialData | null // Datos de solicitud para pre-llenar
  editMode?: 'frente' | 'dorso' // 'frente' permite editar todo, 'dorso' solo fechaVencimiento
  onCredencialCreated?: (credencial: CredencialCapellania) => void
}

export function CredencialCapellaniaEditorDialog({
  open,
  onOpenChange,
  credencial,
  solicitud,
  editMode = 'frente',
  onCredencialCreated,
}: CredencialCapellaniaEditorDialogProps) {
  const createMutation = useCreateCredencialCapellania()
  const updateMutation = useUpdateCredencialCapellania()

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
      tipoCapellan: 'CAPELLAN',
      fechaVencimiento: '',
      fotoUrl: '',
    },
  })

  const fotoUrl = watch('fotoUrl')
  const tipoCapellan = watch('tipoCapellan')
  const fechaNacimiento = watch('fechaNacimiento')
  const fechaVencimiento = watch('fechaVencimiento')

  useEffect(() => {
    // Función helper para convertir fecha a string yyyy-MM-dd
    const formatDateToString = (date: string | Date | undefined): string => {
      if (!date) return ''
      if (typeof date === 'string') {
        // Si es string ISO, extraer solo la parte de fecha
        return date.split('T')[0]
      }
      if (date instanceof Date) {
        // Si es Date, convertir a string yyyy-MM-dd
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      return ''
    }

    if (credencial && open) {
      reset({
        apellido: credencial.apellido,
        nombre: credencial.nombre,
        documento: credencial.documento,
        nacionalidad: credencial.nacionalidad,
        fechaNacimiento: formatDateToString(credencial.fechaNacimiento as string | Date | undefined),
        tipoCapellan: credencial.tipoCapellan,
        fechaVencimiento: formatDateToString(credencial.fechaVencimiento as string | Date | undefined),
        fotoUrl: credencial.fotoUrl || '',
      })
    } else if (solicitud && open) {
      // Pre-llenar desde solicitud
      reset({
        apellido: solicitud.apellido,
        nombre: solicitud.nombre,
        documento: solicitud.dni,
        nacionalidad: solicitud.nacionalidad || '',
        fechaNacimiento: solicitud.fechaNacimiento || '',
        tipoCapellan: 'CAPELLAN',
        fechaVencimiento: '',
        fotoUrl: '',
      })
    } else if (!open) {
      reset()
    }
  }, [credencial, solicitud, open, reset])

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
              tipoCapellan: data.tipoCapellan,
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
          // Si hay solicitud, incluir invitadoId
          const createData = solicitud?.invitadoId
            ? {
                ...data,
                invitadoId: solicitud.invitadoId,
              }
            : data

          const nuevaCredencial = await createMutation.mutateAsync(createData)

          // Verificar que la credencial se creó correctamente
          if (!nuevaCredencial || !nuevaCredencial.id) {
            console.error('[CredencialEditorDialog] La credencial creada no tiene ID:', nuevaCredencial)
            toast.error('Error: La credencial no se creó correctamente')
            return
          }

          // Cerrar diálogo y resetear formulario
          onOpenChange(false)
          reset()

          // Llamar al callback con la credencial creada para mostrar el diseño visual
          // El callback se ejecutará después de que el diálogo se cierre
          if (onCredencialCreated) {
            // Usar setTimeout para asegurar que el diálogo se cierre completamente
            setTimeout(() => {
              onCredencialCreated(nuevaCredencial)
            }, 200)
          } else {
            console.warn('[CredencialEditorDialog] onCredencialCreated no está definido')
          }
        } catch (error: unknown) {
          console.error('[CredencialCapellaniaEditorDialog] Error al crear credencial:', error)
          const errorMessage =
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            (error as { message?: string })?.message ||
            'Error desconocido al crear la credencial'
          toast.error('Error al crear la credencial de capellanía', {
            description: errorMessage,
          })
          // No cerrar el dialog si hay error para que el usuario pueda corregir
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
              : 'Nueva Credencial de Capellanía'}
          </DialogTitle>
          <DialogDescription>
            {credencial
              ? editMode === 'dorso'
                ? 'Actualiza la fecha de vencimiento de la credencial'
                : 'Actualiza la información del frente de la credencial'
              : 'Crea una nueva credencial de capellanía física'}
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
                  />
                  {errors.nacionalidad && (
                    <p className="text-xs text-destructive">{errors.nacionalidad.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                  <DatePickerSimple
                    id="fechaNacimiento"
                    value={fechaNacimiento || undefined}
                    onChange={(date) => {
                      if (date) {
                        // Formatear fecha usando métodos locales para evitar problemas de zona horaria
                        const year = date.getFullYear()
                        const month = String(date.getMonth() + 1).padStart(2, '0')
                        const day = String(date.getDate()).padStart(2, '0')
                        setValue('fechaNacimiento', `${year}-${month}-${day}`, { shouldValidate: true })
                      } else {
                        setValue('fechaNacimiento', '', { shouldValidate: true })
                      }
                    }}
                    placeholder="Selecciona la fecha de nacimiento"
                  />
                  {errors.fechaNacimiento && (
                    <p className="text-xs text-destructive">
                      {errors.fechaNacimiento.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipoCapellan">Tipo de Capellán *</Label>
                  <Select
                    value={tipoCapellan}
                    onValueChange={value => setValue('tipoCapellan', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CAPELLAN">CAPELLAN / CHAPLAIN</SelectItem>
                      <SelectItem value="CAPELLANA">CAPELLANA / CHAPLAIN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Foto del Capellán</Label>
                <ImageUpload
                  value={fotoUrl}
                  onChange={url => setValue('fotoUrl', url)}
                  onUpload={async file => {
                    const response = await uploadApi.uploadImage(file)
                    return response.url
                  }}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="fechaVencimiento">Fecha de Vencimiento *</Label>
            <DatePickerSimple
              id="fechaVencimiento"
              value={fechaVencimiento || undefined}
              onChange={(date) => {
                if (date) {
                  // Formatear fecha usando métodos locales para evitar problemas de zona horaria
                  const year = date.getFullYear()
                  const month = String(date.getMonth() + 1).padStart(2, '0')
                  const day = String(date.getDate()).padStart(2, '0')
                  setValue('fechaVencimiento', `${year}-${month}-${day}`, { shouldValidate: true })
                } else {
                  setValue('fechaVencimiento', '', { shouldValidate: true })
                }
              }}
              placeholder="Selecciona la fecha de vencimiento"
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
                  : 'Crear Credencial de Capellanía'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

