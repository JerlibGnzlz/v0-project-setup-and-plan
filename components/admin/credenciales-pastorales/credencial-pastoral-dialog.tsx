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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  useCreateCredencialPastoral,
  useUpdateCredencialPastoral,
} from '@/lib/hooks/use-credenciales-pastorales'
import { CredencialPastoral } from '@/lib/api/credenciales-pastorales'
import { usePastores } from '@/lib/hooks/use-pastores'

const credencialSchema = z.object({
  pastorId: z.string().min(1, 'Debe seleccionar un pastor'),
  numeroCredencial: z.string().min(1, 'El número de credencial es requerido'),
  fechaEmision: z.string().min(1, 'La fecha de emisión es requerida'),
  fechaVencimiento: z.string().min(1, 'La fecha de vencimiento es requerida'),
  estado: z.enum(['SIN_CREDENCIAL', 'VIGENTE', 'POR_VENCER', 'VENCIDA']).optional(),
  activa: z.boolean().default(true),
  notas: z.string().optional(),
})

type CredencialFormData = z.infer<typeof credencialSchema>

interface CredencialPastoralDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  credencial?: CredencialPastoral | null
}

export function CredencialPastoralDialog({
  open,
  onOpenChange,
  credencial,
}: CredencialPastoralDialogProps) {
  const { data: pastoresResponse } = usePastores(1, 1000) // Obtener todos los pastores
  const pastores = Array.isArray(pastoresResponse)
    ? pastoresResponse
    : pastoresResponse?.data || []

  const createMutation = useCreateCredencialPastoral()
  const updateMutation = useUpdateCredencialPastoral()

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
      pastorId: '',
      numeroCredencial: '',
      fechaEmision: '',
      fechaVencimiento: '',
      estado: 'VIGENTE',
      activa: true,
      notas: '',
    },
  })

  const pastorId = watch('pastorId')
  const estado = watch('estado')
  const activa = watch('activa')

  useEffect(() => {
    if (credencial && open) {
      setValue('pastorId', credencial.pastorId)
      setValue('numeroCredencial', credencial.numeroCredencial)
      setValue('fechaEmision', credencial.fechaEmision.split('T')[0])
      setValue('fechaVencimiento', credencial.fechaVencimiento.split('T')[0])
      setValue('estado', credencial.estado)
      setValue('activa', credencial.activa)
      setValue('notas', credencial.notas || '')
    } else if (!open) {
      reset()
    }
  }, [credencial, open, setValue, reset])

  const onSubmit = async (data: CredencialFormData) => {
    try {
      if (credencial) {
        await updateMutation.mutateAsync({
          id: credencial.id,
          dto: data,
        })
      } else {
        await createMutation.mutateAsync(data)
      }
      onOpenChange(false)
      reset()
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
            {credencial ? 'Editar Credencial' : 'Nueva Credencial Pastoral'}
          </DialogTitle>
          <DialogDescription>
            {credencial
              ? 'Actualiza la información de la credencial pastoral'
              : 'Crea una nueva credencial ministerial para un pastor'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pastorId">Pastor *</Label>
            <Select
              value={pastorId}
              onValueChange={value => setValue('pastorId', value)}
              disabled={!!credencial}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un pastor" />
              </SelectTrigger>
              <SelectContent>
                {pastores.map((pastor) => (
                  <SelectItem key={pastor.id} value={pastor.id}>
                    {pastor.nombre} {pastor.apellido}
                    {pastor.email && ` (${pastor.email})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.pastorId && (
              <p className="text-xs text-destructive">{errors.pastorId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="numeroCredencial">Número de Credencial *</Label>
            <Input
              id="numeroCredencial"
              placeholder="Ej: AMVA-2025-001"
              {...register('numeroCredencial')}
            />
            {errors.numeroCredencial && (
              <p className="text-xs text-destructive">{errors.numeroCredencial.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Número único de identificación de la credencial
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaEmision">Fecha de Emisión *</Label>
              <Input id="fechaEmision" type="date" {...register('fechaEmision')} />
              {errors.fechaEmision && (
                <p className="text-xs text-destructive">{errors.fechaEmision.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaVencimiento">Fecha de Vencimiento *</Label>
              <Input id="fechaVencimiento" type="date" {...register('fechaVencimiento')} />
              {errors.fechaVencimiento && (
                <p className="text-xs text-destructive">{errors.fechaVencimiento.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={estado}
              onValueChange={value =>
                setValue('estado', value as 'SIN_CREDENCIAL' | 'VIGENTE' | 'POR_VENCER' | 'VENCIDA')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIGENTE">Vigente</SelectItem>
                <SelectItem value="POR_VENCER">Por Vencer</SelectItem>
                <SelectItem value="VENCIDA">Vencida</SelectItem>
                <SelectItem value="SIN_CREDENCIAL">Sin Credencial</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              El estado se actualiza automáticamente según la fecha de vencimiento
            </p>
          </div>

          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Credencial Activa</Label>
              <p className="text-xs text-muted-foreground">
                Desactiva la credencial si ya no está en uso
              </p>
            </div>
            <Switch checked={activa} onCheckedChange={value => setValue('activa', value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              placeholder="Notas adicionales sobre la credencial..."
              className="resize-none"
              {...register('notas')}
            />
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
