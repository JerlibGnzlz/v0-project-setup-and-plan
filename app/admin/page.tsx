'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Users, CreditCard, ImageIcon, ArrowRight, User, Smartphone, Calendar, Clock, Edit } from 'lucide-react'
import { ScrollReveal } from '@/components/scroll-reveal'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { convencionSchema, type ConvencionFormData } from '@/lib/validations/convencion'
import { useConvenciones, useUpdateConvencion, useCreateConvencion } from '@/lib/hooks/use-convencion'
import { usePagos } from '@/lib/hooks/use-pagos'
import { usePastores } from '@/lib/hooks/use-pastores'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminDashboard() {
  const { data: convenciones = [], isLoading: loadingConvencion } = useConvenciones()
  // Tomar la primera convención (la más reciente) - siempre visible en admin sin importar si está activa
  const convencionActiva = convenciones[0] || null
  const { data: pagos = [], isLoading: loadingPagos } = usePagos()
  const { data: pastores = [], isLoading: loadingPastores } = usePastores()
  const updateConvencionMutation = useUpdateConvencion()
  const createConvencionMutation = useCreateConvencion()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Calcular estadísticas desde los datos reales
  const stats = {
    totalPastores: pastores.length,
    pastoresActivos: pastores.filter((p: any) => p.activo).length,
    totalInscritos: pagos.length,
    pagosConfirmados: pagos.filter((p: any) => p.estado === 'COMPLETADO').length,
    pagosParciales: 0, // Se puede calcular basado en monto parcial
    pagosPendientes: pagos.filter((p: any) => p.estado === 'PENDIENTE').length,
    totalRecaudado: pagos
      .filter((p: any) => p.estado === 'COMPLETADO')
      .reduce((sum: number, p: any) => sum + (typeof p.monto === 'number' ? p.monto : parseFloat(p.monto || 0)), 0),
    registrosManual: 0, // No disponible en el modelo actual
    registrosMobile: 0, // No disponible en el modelo actual
  }

  const convencion = convencionActiva ? {
    nombre: convencionActiva.titulo || '',
    fecha: convencionActiva.fechaInicio ? convencionActiva.fechaInicio.split('T')[0] : '',
    lugar: convencionActiva.ubicacion || '',
    monto: convencionActiva.costo ? Number(convencionActiva.costo) : 0,
    cuotas: 3, // Por defecto
  } : {
    nombre: '',
    fecha: '',
    lugar: '',
    monto: 0,
    cuotas: 3,
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ConvencionFormData>({
    resolver: zodResolver(convencionSchema),
    defaultValues: convencion,
  })

  // Resetear formulario cuando cambia la convención
  useEffect(() => {
    if (convencionActiva) {
      reset({
        nombre: convencionActiva.titulo || '',
        fecha: convencionActiva.fechaInicio ? convencionActiva.fechaInicio.split('T')[0] : '',
        lugar: convencionActiva.ubicacion || '',
        monto: convencionActiva.costo ? Number(convencionActiva.costo) : 0,
        cuotas: 3,
      })
    }
  }, [convencionActiva, reset])

  const onSubmit = async (data: ConvencionFormData) => {
    if (!convencionActiva) {
      toast.error('No hay convención activa para actualizar')
      return
    }

    try {
      // Convertir el formato del formulario al formato del backend
      const fechaInicio = new Date(data.fecha)
      const fechaFin = new Date(data.fecha)
      fechaFin.setDate(fechaFin.getDate() + 2) // Asumir 3 días de duración

      await updateConvencionMutation.mutateAsync({
        id: convencionActiva.id,
        data: {
          titulo: data.nombre,
          ubicacion: data.lugar,
          costo: data.monto,
          fechaInicio: fechaInicio.toISOString(),
          fechaFin: fechaFin.toISOString(),
        }
      })

      toast.success('Convención actualizada', {
        description: 'Los cambios se han guardado correctamente'
      })
      setDialogOpen(false)
    } catch (error: any) {
      toast.error('Error al actualizar', {
        description: error.response?.data?.message || 'No se pudieron guardar los cambios'
      })
    }
  }

  const handleVisibilidadToggle = async (checked: boolean) => {
    if (!convencionActiva) {
      toast.error('No hay convención para mostrar/ocultar')
      return
    }

    try {
      await updateConvencionMutation.mutateAsync({
        id: convencionActiva.id,
        data: { activa: checked }
      })
      toast.success(checked ? 'Convención activada' : 'Convención desactivada', {
        description: checked
          ? 'La convención, cuenta regresiva e inscripciones son visibles en la landing'
          : 'La convención está oculta de la landing page'
      })
    } catch (error: any) {
      toast.error('Error al cambiar visibilidad', {
        description: error.response?.data?.message || 'No se pudo cambiar la visibilidad'
      })
    }
  }

  if (loadingConvencion || loadingPagos) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  const onCreateSubmit = async (data: ConvencionFormData) => {
    try {
      const fechaInicio = new Date(data.fecha)
      const fechaFin = new Date(data.fecha)
      fechaFin.setDate(fechaFin.getDate() + 2)

      await createConvencionMutation.mutateAsync({
        titulo: data.nombre,
        ubicacion: data.lugar,
        costo: data.monto,
        cupoMaximo: data.cuotas * 100,
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString(),
        activa: true,
      } as any)

      toast.success('Convención creada', {
        description: 'La convención ha sido creada exitosamente'
      })
      setCreateDialogOpen(false)
      reset()
    } catch (error: any) {
      toast.error('Error al crear', {
        description: error.response?.data?.message || 'No se pudo crear la convención'
      })
    }
  }

  if (!convencionActiva) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel Administrativo</h1>
          <p className="text-muted-foreground mt-2">
            Bienvenido al panel de administración
          </p>
        </div>

        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay convención activa</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Crea una nueva convención para comenzar a gestionar inscripciones, pastores y pagos.
            </p>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Calendar className="mr-2 h-4 w-4" />
                  Crear Nueva Convención
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nueva Convención</DialogTitle>
                  <DialogDescription>
                    Completa los datos para crear una nueva convención
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-nombre">Nombre de la Convención</Label>
                    <Input
                      id="create-nombre"
                      {...register('nombre')}
                      placeholder="Ej: Convención Nacional 2025"
                    />
                    {errors.nombre && (
                      <p className="text-sm text-red-500">{errors.nombre.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-fecha">Fecha de Inicio</Label>
                    <Input
                      id="create-fecha"
                      type="date"
                      {...register('fecha')}
                    />
                    {errors.fecha && (
                      <p className="text-sm text-red-500">{errors.fecha.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-lugar">Ubicación</Label>
                    <Input
                      id="create-lugar"
                      {...register('lugar')}
                      placeholder="Ej: Centro de Convenciones"
                    />
                    {errors.lugar && (
                      <p className="text-sm text-red-500">{errors.lugar.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-monto">Costo de Inscripción</Label>
                      <Input
                        id="create-monto"
                        type="number"
                        {...register('monto', { valueAsNumber: true })}
                        placeholder="0"
                      />
                      {errors.monto && (
                        <p className="text-sm text-red-500">{errors.monto.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-cuotas">Número de Cuotas</Label>
                      <Input
                        id="create-cuotas"
                        type="number"
                        {...register('cuotas', { valueAsNumber: true })}
                        placeholder="1"
                      />
                      {errors.cuotas && (
                        <p className="text-sm text-red-500">{errors.cuotas.message}</p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createConvencionMutation.isPending}>
                      {createConvencionMutation.isPending ? 'Creando...' : 'Crear Convención'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Mostrar cards de gestión aunque no haya convención */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gestión de Pastores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pastores.length}</div>
              <p className="text-xs text-muted-foreground">
                {pastores.filter((p: any) => p.activo).length} activos
              </p>
              <Link href="/admin/pastores">
                <Button variant="ghost" className="mt-4 w-full">
                  Ver Pastores <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Galería</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Gestiona fotos y videos
              </p>
              <Link href="/admin/galeria">
                <Button variant="ghost" className="mt-4 w-full">
                  Ver Galería <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagos</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagos.length}</div>
              <p className="text-xs text-muted-foreground">
                Gestiona inscripciones y pagos
              </p>
              <Link href="/admin/pagos">
                <Button variant="ghost" className="mt-4 w-full">
                  Ver Pagos <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel Administrativo</h1>
        <p className="text-muted-foreground mt-2">
          {convencionActiva?.titulo || 'Sin convención activa'}
        </p>
        <p className="text-sm text-muted-foreground">
          {convencionActiva?.ubicacion || ''} • {convencionActiva?.fechaInicio ? new Date(convencionActiva.fechaInicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
        </p>
      </div>

      <ScrollReveal>
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="size-5" />
                  Control de Convención
                </CardTitle>
                <CardDescription>
                  Gestiona la visibilidad y activación de la convención en la landing page
                </CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="size-4 mr-2" />
                    Editar Convención
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Editar Convención</DialogTitle>
                    <DialogDescription>
                      Modifica el nombre, fecha, lugar y detalles de pago de la convención
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre de la Convención</Label>
                      <Input
                        id="nombre"
                        placeholder="Ej: Convención Nacional Argentina 2025"
                        {...register('nombre')}
                      />
                      {errors.nombre && (
                        <p className="text-sm text-destructive">{errors.nombre.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fecha">Fecha</Label>
                        <Input
                          id="fecha"
                          type="date"
                          {...register('fecha')}
                        />
                        {errors.fecha && (
                          <p className="text-sm text-destructive">{errors.fecha.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lugar">Lugar</Label>
                        <Input
                          id="lugar"
                          placeholder="Ej: Buenos Aires, Argentina"
                          {...register('lugar')}
                        />
                        {errors.lugar && (
                          <p className="text-sm text-destructive">{errors.lugar.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="monto">Monto Total (ARS)</Label>
                        <Input
                          id="monto"
                          type="number"
                          placeholder="15000"
                          {...register('monto', { valueAsNumber: true })}
                        />
                        {errors.monto && (
                          <p className="text-sm text-destructive">{errors.monto.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cuotas">Número de Cuotas</Label>
                        <Input
                          id="cuotas"
                          type="number"
                          min="1"
                          max="12"
                          placeholder="3"
                          {...register('cuotas', { valueAsNumber: true })}
                        />
                        {errors.cuotas && (
                          <p className="text-sm text-destructive">{errors.cuotas.message}</p>
                        )}
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted/30 rounded-lg space-y-2 border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Nombre:</span>
                <span className="text-sm text-muted-foreground">{convencionActiva?.titulo || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Fecha:</span>
                <span className="text-sm text-muted-foreground">
                  {convencionActiva?.fechaInicio ? new Date(convencionActiva.fechaInicio).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Lugar:</span>
                <span className="text-sm text-muted-foreground">{convencionActiva?.ubicacion || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Monto:</span>
                <span className="text-sm text-muted-foreground">
                  ${convencionActiva?.costo ? Number(convencionActiva.costo).toLocaleString('es-AR') : '0'} en {convencion.cuotas} cuota{convencion.cuotas > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
              <div className="space-y-1">
                <Label htmlFor="mostrar-landing" className="text-base font-semibold">
                  Mostrar en Landing Page
                </Label>
                <p className="text-sm text-muted-foreground">
                  {convencionActiva?.activa
                    ? '✓ La convención, cuenta regresiva e inscripciones son visibles en la página principal'
                    : '✗ La convención está oculta del público'}
                </p>
              </div>
              <Switch
                id="mostrar-landing"
                checked={convencionActiva?.activa || false}
                onCheckedChange={handleVisibilidadToggle}
                disabled={updateConvencionMutation.isPending}
              />
            </div>

            <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <Clock className="size-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-sm mb-1">Cuenta Regresiva Activa</p>
                <p className="text-sm text-muted-foreground">
                  La cuenta regresiva se mostrará automáticamente cuando la convención esté visible en la landing page.
                  Fecha objetivo: {convencionActiva?.fechaInicio ? new Date(convencionActiva.fechaInicio).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      <div className="grid gap-4 md:grid-cols-6">
        <ScrollReveal delay={0}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Inscritos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInscritos}</div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={50}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pagos Completos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.pagosConfirmados}</div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pagos Parciales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pagosParciales}</div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pagos Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.pagosPendientes}</div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Recaudado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ${stats.totalRecaudado.toLocaleString('es-AR')}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={250}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Origen Registro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <User className="size-3" />
                  <span className="font-semibold">{stats.registrosManual}</span>
                </div>
                <span className="text-muted-foreground">|</span>
                <div className="flex items-center gap-1">
                  <Smartphone className="size-3" />
                  <span className="font-semibold">{stats.registrosMobile}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <ScrollReveal delay={300}>
          <Link href="/admin/pastores">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Users className="size-6 text-primary" />
                  </div>
                  <ArrowRight className="size-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <CardTitle className="mt-4">Gestión de Pastores</CardTitle>
                <CardDescription>
                  Registrar, editar y ver listado completo de pastores inscritos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {loadingPastores ? '...' : stats.totalPastores} pastores registrados
                  {stats.pastoresActivos > 0 && stats.pastoresActivos !== stats.totalPastores && (
                    <span className="text-xs ml-1">({stats.pastoresActivos} activos)</span>
                  )}
                </p>
              </CardContent>
            </Card>
          </Link>
        </ScrollReveal>

        <ScrollReveal delay={350}>
          <Link href="/admin/pagos">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <CreditCard className="size-6 text-accent" />
                  </div>
                  <ArrowRight className="size-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <CardTitle className="mt-4">Gestión de Pagos</CardTitle>
                <CardDescription>
                  Verificar pagos, cuotas y vouchers de MercadoPago
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  ${stats.totalRecaudado.toLocaleString('es-AR')} recaudado
                </p>
              </CardContent>
            </Card>
          </Link>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <Link href="/admin/galeria">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-lg bg-secondary/10">
                    <ImageIcon className="size-6 text-secondary" />
                  </div>
                  <ArrowRight className="size-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <CardTitle className="mt-4">Gestión de Galería</CardTitle>
                <CardDescription>
                  Subir y administrar imágenes y videos de la landing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  4 imágenes, 2 videos disponibles
                </p>
              </CardContent>
            </Card>
          </Link>
        </ScrollReveal>
      </div>
    </div>
  )
}
