'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ImageUpload } from '@/components/ui/image-upload'
import { Crown, Globe } from 'lucide-react'
import {
  pastorSchema,
  type PastorFormData,
  tipoPastorLabels,
  type TipoPastor,
} from '@/lib/validations/pastor'
import type { Pastor } from '@/lib/api/pastores'

interface PastoresDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pastor: Pastor | null
  isEditing: boolean
  onSubmit: (data: PastorFormData) => Promise<void>
  onImageUpload: (file: File) => Promise<string>
  tipoConfig: Record<
    TipoPastor,
    { icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string }
  >
}

export function PastoresDialog({
  open,
  onOpenChange,
  pastor,
  isEditing,
  onSubmit,
  onImageUpload,
  tipoConfig,
}: PastoresDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<PastorFormData>({
    resolver: zodResolver(pastorSchema),
    defaultValues: {
      activo: true,
      mostrarEnLanding: false,
      tipo: 'DIRECTIVA',
      orden: 0,
    },
  })

  const fotoUrl = watch('fotoUrl')
  const tipoValue = watch('tipo')

  // Cargar datos del pastor cuando se abre para editar
  useEffect(() => {
    if (pastor && open && isEditing) {
      setValue('nombre', pastor.nombre)
      setValue('apellido', pastor.apellido)
      setValue('email', pastor.email || '')
      setValue('telefono', pastor.telefono || '')
      setValue('tipo', pastor.tipo || 'DIRECTIVA')
      setValue('cargo', pastor.cargo || '')
      setValue('ministerio', pastor.ministerio || '')
      setValue('sede', pastor.sede || '')
      setValue('region', pastor.region || '')
      setValue('pais', pastor.pais || '')
      setValue('fotoUrl', pastor.fotoUrl || '')
      setValue('biografia', pastor.biografia || '')
      setValue('trayectoria', pastor.trayectoria || '')
      setValue('orden', pastor.orden || 0)
      setValue('activo', pastor.activo)
      setValue('mostrarEnLanding', pastor.mostrarEnLanding)
    } else if (!open) {
      reset()
    }
  }, [pastor, open, isEditing, setValue, reset])

  // Manejar cambio de tipo: solo DIRECTIVA puede mostrar en landing
  const handleTipoChange = (value: TipoPastor) => {
    setValue('tipo', value)
    if (value === 'DIRECTIVA') {
      setValue('mostrarEnLanding', true)
    } else {
      setValue('mostrarEnLanding', false)
    }
  }

  const handleFormSubmit = async (data: PastorFormData) => {
    await onSubmit(data)
    if (!isEditing) {
      reset()
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Pastor' : 'Nuevo Pastor'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos del pastor'
              : 'Completa los datos para registrar un nuevo pastor'}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Foto */}
          <div className="flex justify-center">
            <div className="space-y-2">
              <Label>Foto del Pastor</Label>
              <ImageUpload
                value={fotoUrl}
                onChange={url => setValue('fotoUrl', url)}
                onUpload={onImageUpload}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Datos básicos */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input id="nombre" placeholder="Juan" {...register('nombre')} />
              {errors.nombre && (
                <p className="text-xs text-destructive">{errors.nombre.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido *</Label>
              <Input id="apellido" placeholder="Pérez" {...register('apellido')} />
              {errors.apellido && (
                <p className="text-xs text-destructive">{errors.apellido.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (opcional, no se muestra en las cards)</Label>
              <Input
                id="email"
                type="email"
                placeholder="pastor@iglesia.com"
                {...register('email')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">
                Teléfono (opcional, no se muestra en las cards)
              </Label>
              <Input
                id="telefono"
                placeholder="+504 9999-9999"
                {...register('telefono')}
              />
            </div>
          </div>

          {/* Clasificación */}
          <div className="p-4 rounded-lg bg-muted/50 space-y-4">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Crown className="size-4 text-amber-500" />
              Clasificación
            </h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo de Pastor *</Label>
                <Select
                  value={tipoValue}
                  onValueChange={value => handleTipoChange(value as TipoPastor)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(tipoPastorLabels) as TipoPastor[])
                      .filter(tipo => tipo !== 'PASTOR')
                      .map(tipo => {
                        const config = tipoConfig[tipo]
                        const Icon = config.icon
                        return (
                          <SelectItem key={tipo} value={tipo}>
                            <span className="flex items-center gap-2">
                              <Icon className={`size-4 ${config.color}`} />
                              {tipoPastorLabels[tipo]}
                            </span>
                          </SelectItem>
                        )
                      })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  placeholder="Pastor Principal, Secretario..."
                  {...register('cargo')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ministerio">Ministerio</Label>
                <Input
                  id="ministerio"
                  placeholder="Evangelismo, Educación..."
                  {...register('ministerio')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orden" className="flex items-center gap-2">
                  Orden de aparición
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-muted-foreground cursor-help">ℹ️</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">
                        Controla el orden en que aparecen los pastores en la landing page.
                      </p>
                      <p className="text-xs mt-1">
                        Números menores aparecen primero. Si varios tienen el mismo número, se
                        ordenan alfabéticamente.
                      </p>
                      <p className="text-xs mt-1 font-semibold">
                        Ejemplo: 1 = primero, 2 = segundo, etc.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  id="orden"
                  type="number"
                  min={0}
                  defaultValue={0}
                  placeholder="0"
                  {...register('orden')}
                />
                <p className="text-xs text-muted-foreground">
                  Los pastores se ordenan de menor a mayor número en la landing page
                </p>
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="p-4 rounded-lg bg-muted/50 space-y-4">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Globe className="size-4 text-blue-500" />
              Ubicación
            </h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="sede">Sede/Iglesia</Label>
                <Input id="sede" placeholder="Iglesia Central" {...register('sede')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Región/Provincia</Label>
                <Input id="region" placeholder="Zona Norte, Cortés..." {...register('region')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pais">País</Label>
                <Input id="pais" placeholder="Honduras" {...register('pais')} />
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="biografia">Biografía corta</Label>
              <Textarea
                id="biografia"
                placeholder="Breve descripción del pastor (máx. 500 caracteres)..."
                rows={2}
                {...register('biografia')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trayectoria">Trayectoria ministerial</Label>
              <Textarea
                id="trayectoria"
                placeholder="Historia y trayectoria en el ministerio..."
                rows={4}
                {...register('trayectoria')}
              />
            </div>
          </div>

          {/* Control */}
          <div className="p-4 rounded-lg bg-muted/50 space-y-4">
            <h4 className="font-medium text-sm">Control de visualización</h4>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex items-center space-x-3">
                <Switch
                  id="activo"
                  checked={watch('activo')}
                  onCheckedChange={checked => setValue('activo', checked)}
                />
                <Label htmlFor="activo">Pastor activo</Label>
              </div>
              <div className="flex items-center space-x-3">
                <Switch
                  id="mostrarEnLanding"
                  checked={watch('mostrarEnLanding')}
                  disabled={watch('tipo') !== 'DIRECTIVA'}
                  onCheckedChange={checked => setValue('mostrarEnLanding', checked)}
                />
                <Label htmlFor="mostrarEnLanding" className="flex items-center gap-2">
                  Mostrar en Landing Page
                  {watch('tipo') !== 'DIRECTIVA' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="text-xs cursor-help">
                          Solo Directiva
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Este switch solo está disponible para Directiva Pastoral.</p>
                        <p className="text-xs mt-1">
                          Los demás tipos aparecerán en "Ver Todo el Equipo Pastoral".
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {watch('tipo') === 'DIRECTIVA' && (
                    <Badge variant="outline" className="text-xs">
                      {watch('mostrarEnLanding') ? 'Visible' : 'Oculto'}
                    </Badge>
                  )}
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Guardando...'
                : isEditing
                  ? 'Actualizar'
                  : 'Crear Pastor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
























