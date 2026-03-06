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
import { DateInputCredencial } from '@/components/ui/date-input-credencial'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUpload } from '@/components/ui/image-upload'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  useCreateCredencialMinisterial,
  useUpdateCredencialMinisterial,
} from '@/lib/hooks/use-credenciales-ministeriales'
import { CredencialMinisterial } from '@/lib/api/credenciales-ministeriales'
import { uploadApi } from '@/lib/api/upload'
import { toast } from 'sonner'

const credencialSchema = z.object({
  apellido: z.string().min(1, 'El apellido es requerido'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  documento: z.string().min(1, 'El documento es requerido'),
  nacionalidad: z.string().min(1, 'La nacionalidad es requerida'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  fechaNacimiento: z.string().min(1, 'La fecha de nacimiento es requerida'),
  tipoPastor: z.string().min(1, 'El tipo de pastor es requerido'),
  fechaVencimiento: z.string().min(1, 'La fecha de vencimiento es requerida'),
  fotoUrl: z.string().optional(),
})

type CredencialFormData = z.infer<typeof credencialSchema>

interface SolicitudCredencialData {
  nombre: string
  apellido: string
  dni: string
  tipoPastor?: string
  nacionalidad?: string
  fechaNacimiento?: string
  invitadoId?: string
  email?: string
}

interface CredencialEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  credencial?: CredencialMinisterial | null
  solicitud?: SolicitudCredencialData | null // Datos de solicitud para pre-llenar
  editMode?: 'frente' | 'dorso' // 'frente' permite editar todo, 'dorso' solo fechaVencimiento
  onCredencialCreated?: (credencial: CredencialMinisterial) => void
}

export function CredencialEditorDialog({
  open,
  onOpenChange,
  credencial,
  solicitud,
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
      email: '',
      fechaNacimiento: '',
      tipoPastor: 'PASTOR',
      fechaVencimiento: '',
      fotoUrl: '',
    },
  })

  const fotoUrl = watch('fotoUrl')
  const tipoPastor = watch('tipoPastor')
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
      // Si la credencial no tiene email pero sí tiene invitado vinculado, usar el email del invitado para que se vea en la app
      const emailParaForm =
        credencial.email?.trim() ||
        credencial.invitado?.email?.trim() ||
        ''
      reset({
        apellido: credencial.apellido,
        nombre: credencial.nombre,
        documento: credencial.documento,
        nacionalidad: credencial.nacionalidad,
        email: emailParaForm,
        fechaNacimiento: formatDateToString(credencial.fechaNacimiento as string | Date | undefined),
        tipoPastor: credencial.tipoPastor,
        fechaVencimiento: formatDateToString(credencial.fechaVencimiento as string | Date | undefined),
        fotoUrl: credencial.fotoUrl || '',
      })
    } else if (solicitud && open) {
      // Pre-llenar desde solicitud (incluye tipo de pastor y email del invitado para app móvil)
      reset({
        apellido: solicitud.apellido,
        nombre: solicitud.nombre,
        documento: solicitud.dni,
        nacionalidad: solicitud.nacionalidad || '',
        email: solicitud.email || '',
        fechaNacimiento: solicitud.fechaNacimiento || '',
        tipoPastor: solicitud.tipoPastor || 'PASTOR',
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
          // Modo dorso: solo actualizar fecha de vencimiento
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
          // Modo frente: actualizar todos los campos editables incluyendo fecha de vencimiento (dorso)
          const updated = await updateMutation.mutateAsync({
            id: credencial.id,
            dto: {
              apellido: data.apellido,
              nombre: data.nombre,
              documento: data.documento,
              nacionalidad: data.nacionalidad,
              email: data.email?.trim() || undefined,
              fechaNacimiento: data.fechaNacimiento,
              tipoPastor: data.tipoPastor,
              fotoUrl: data.fotoUrl,
              fechaVencimiento: data.fechaVencimiento,
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
          // Incluir siempre tipoPastor para que REVERENDO/OBISPO/etc. se guarden y se vean en la app móvil
          const createPayload = {
            ...data,
            tipoPastor: data.tipoPastor?.trim() || 'PASTOR',
            ...(solicitud
              ? {
                  invitadoId: solicitud.invitadoId,
                  solicitudCredencialId: undefined as string | undefined,
                }
              : {}),
          }

          const nuevaCredencial = await createMutation.mutateAsync(createPayload)

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
        } catch (error) {
          console.error('[CredencialEditorDialog] Error al crear credencial:', error)
          // El error ya se maneja en el hook con toast
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
                : 'Editar Credencial (Frente y Dorso)'
              : 'Nueva Credencial Ministerial'}
          </DialogTitle>
          <DialogDescription>
            {credencial
              ? editMode === 'dorso'
                ? 'Actualiza la fecha de vencimiento de la credencial'
                : 'Actualiza la información del frente y la fecha de vencimiento del dorso'
              : 'Crea una nueva credencial ministerial física'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {solicitud && !credencial && (
            <Alert variant="default" className="border-blue-500/50 bg-blue-500/10">
              <AlertDescription>
                Datos pre-llenados desde la solicitud de la app. Puedes <strong>editar cualquier campo</strong> (nombre, apellido, DNI, tipo de pastor, etc.) si el pastor envió algo erróneo antes de crear la credencial.
              </AlertDescription>
            </Alert>
          )}
          {editMode === 'frente' && credencial && !credencial.email?.trim() && !credencial.invitado?.email?.trim() && (
            <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
              <AlertDescription>
                Para que esta credencial se vea en la app móvil al iniciar sesión con Google, completa el campo <strong>Email</strong> debajo con el mismo correo que usa la persona en la app.
              </AlertDescription>
            </Alert>
          )}
          {editMode === 'frente' && credencial && !credencial.email?.trim() && credencial.invitado?.email?.trim() && (
            <Alert variant="default" className="border-emerald-500/50 bg-emerald-500/10">
              <AlertDescription>
                Esta credencial está vinculada a un invitado. Se ha rellenado el email para que se vea en la app. Revisa que sea correcto y guarda los cambios.
              </AlertDescription>
            </Alert>
          )}
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

              <div className="space-y-2">
                <Label htmlFor="email">Email (para ver credencial en app móvil)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ejemplo@gmail.com"
                  {...register('email')}
                />
                <p className="text-xs text-muted-foreground">
                  Si la persona inicia sesión con Google en la app, se mostrará esta credencial si el email coincide.
                </p>
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                  <DateInputCredencial
                    id="fechaNacimiento"
                    value={fechaNacimiento || undefined}
                    onChange={(date) => {
                      if (date) {
                        const year = date.getFullYear()
                        const month = String(date.getMonth() + 1).padStart(2, '0')
                        const day = String(date.getDate()).padStart(2, '0')
                        setValue('fechaNacimiento', `${year}-${month}-${day}`, { shouldValidate: true })
                      } else {
                        setValue('fechaNacimiento', '', { shouldValidate: true })
                      }
                    }}
                    placeholder="dd/mm/aaaa"
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
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PASTOR">PASTOR / PASTOR</SelectItem>
                      <SelectItem value="PASTORA">PASTORA / PASTOR</SelectItem>
                      <SelectItem value="REVERENDO">REVERENDO / REVEREND</SelectItem>
                      <SelectItem value="REVERENDA">REVERENDA / REVEREND</SelectItem>
                      <SelectItem value="OBISPO">OBISPO / BISHOP</SelectItem>
                      <SelectItem value="OBISPA">OBISPA / BISHOP</SelectItem>
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
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="fechaVencimiento">Fecha de Vencimiento *</Label>
            <DateInputCredencial
              id="fechaVencimiento"
              value={fechaVencimiento || undefined}
              onChange={(date) => {
                if (date) {
                  const year = date.getFullYear()
                  const month = String(date.getMonth() + 1).padStart(2, '0')
                  const day = String(date.getDate()).padStart(2, '0')
                  setValue('fechaVencimiento', `${year}-${month}-${day}`, { shouldValidate: true })
                } else {
                  setValue('fechaVencimiento', '', { shouldValidate: true })
                }
              }}
              placeholder="dd/mm/aaaa"
            />
            {errors.fechaVencimiento && (
              <p className="text-xs text-destructive">{errors.fechaVencimiento.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {editMode === 'dorso'
                ? 'Esta es la única información editable en el dorso de la credencial'
                : 'Fecha de vencimiento de la credencial (visible en el dorso). Puedes editar tanto el frente como esta fecha de vencimiento.'}
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

