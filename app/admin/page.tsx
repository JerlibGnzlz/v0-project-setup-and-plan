'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Users, CreditCard, ImageIcon, ArrowRight, User, Smartphone, Calendar, Clock, Edit, Trash2, Newspaper } from 'lucide-react'
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
import { useConvenciones, useUpdateConvencion, useCreateConvencion, useDeleteConvencion } from '@/lib/hooks/use-convencion'
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
  const deleteConvencionMutation = useDeleteConvencion()

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

  const handleDeleteConvencion = async (id: string, titulo: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${titulo}"? Esta acción no se puede deshacer.`)) {
      return
    }
    
    try {
      await deleteConvencionMutation.mutateAsync(id)
      toast.success('Convención eliminada', {
        description: `"${titulo}" ha sido eliminada correctamente`
      })
    } catch (error: any) {
      toast.error('Error al eliminar', {
        description: error.response?.data?.message || 'No se pudo eliminar la convención'
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
        {/* Header con gradiente */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-sky-500/10 via-emerald-500/10 to-amber-500/10 rounded-xl blur-xl dark:from-sky-500/5 dark:via-emerald-500/5 dark:to-amber-500/5" />
          <div className="relative">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-sky-600 via-emerald-600 to-amber-600 dark:from-sky-400 dark:via-emerald-400 dark:to-amber-400 bg-clip-text text-transparent">
              Panel Administrativo
            </h1>
            <p className="text-muted-foreground mt-2">
              Bienvenido al panel de administración
            </p>
          </div>
        </div>

        <Card className="border-2 border-dashed border-sky-200 dark:border-sky-500/30 bg-gradient-to-br from-white to-sky-50/30 dark:from-background dark:to-sky-950/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 rounded-full bg-gradient-to-br from-sky-500/10 to-emerald-500/10 dark:from-sky-500/20 dark:to-emerald-500/20 mb-4">
              <Calendar className="h-12 w-12 text-sky-600 dark:text-sky-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-sky-600 to-emerald-600 dark:from-sky-400 dark:to-emerald-400 bg-clip-text text-transparent">No hay convención activa</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Crea una nueva convención para comenzar a gestionar inscripciones, pastores y pagos.
            </p>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">
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
          <Card className="hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 border-sky-200/50 dark:border-sky-500/20 bg-gradient-to-br from-white to-sky-50/30 dark:from-background dark:to-sky-950/20 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-sky-700 dark:text-sky-300">Gestión de Pastores</CardTitle>
              <Users className="h-4 w-4 text-sky-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">{pastores.length}</div>
              <p className="text-xs text-muted-foreground">
                {pastores.filter((p: any) => p.activo).length} activos
              </p>
              <Link href="/admin/pastores">
                <Button variant="ghost" className="mt-4 w-full text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-500/10">
                  Ver Pastores <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 border-amber-200/50 dark:border-amber-500/20 bg-gradient-to-br from-white to-amber-50/30 dark:from-background dark:to-amber-950/20 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">Galería</CardTitle>
              <ImageIcon className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">-</div>
              <p className="text-xs text-muted-foreground">
                Gestiona fotos y videos
              </p>
              <Link href="/admin/galeria">
                <Button variant="ghost" className="mt-4 w-full text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-500/10">
                  Ver Galería <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 border-cyan-200/50 dark:border-cyan-500/20 bg-gradient-to-br from-white to-cyan-50/30 dark:from-background dark:to-cyan-950/20 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Noticias</CardTitle>
              <Newspaper className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-sky-600 dark:from-cyan-400 dark:to-sky-400 bg-clip-text text-transparent">-</div>
              <p className="text-xs text-muted-foreground">
                Blog y comunicados
              </p>
              <Link href="/admin/noticias">
                <Button variant="ghost" className="mt-4 w-full text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-500/10">
                  Ver Noticias <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 border-emerald-200/50 dark:border-emerald-500/20 bg-gradient-to-br from-white to-emerald-50/30 dark:from-background dark:to-emerald-950/20 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Pagos</CardTitle>
              <CreditCard className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">{pagos.length}</div>
              <p className="text-xs text-muted-foreground">
                Gestiona inscripciones y pagos
              </p>
              <Link href="/admin/pagos">
                <Button variant="ghost" className="mt-4 w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10">
                  Ver Pagos <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
      {/* Header con gradiente */}
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-sky-500/10 via-emerald-500/10 to-amber-500/10 rounded-xl blur-xl dark:from-sky-500/5 dark:via-emerald-500/5 dark:to-amber-500/5" />
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-sky-600 via-emerald-600 to-amber-600 dark:from-sky-400 dark:via-emerald-400 dark:to-amber-400 bg-clip-text text-transparent">
            Panel Administrativo
          </h1>
          <p className="text-foreground/80 mt-2 font-medium">
            {convencionActiva?.titulo || 'Sin convención activa'}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
            {convencionActiva?.ubicacion || ''} • {convencionActiva?.fechaInicio ? new Date(convencionActiva.fechaInicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
          </p>
        </div>
      </div>

      <ScrollReveal>
        <Card className="border-2 border-sky-200/50 dark:border-sky-500/20 bg-gradient-to-br from-white to-sky-50/50 dark:from-background dark:to-sky-950/20 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500/10 to-emerald-500/10 dark:from-sky-500/20 dark:to-emerald-500/20">
                    <Calendar className="size-5 text-sky-600 dark:text-sky-400" />
                  </div>
                  <span className="bg-gradient-to-r from-sky-600 to-emerald-600 dark:from-sky-400 dark:to-emerald-400 bg-clip-text text-transparent">
                    Control de Convención
                  </span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Gestiona la visibilidad y activación de la convención en la landing page
                </CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors">
                    <Edit className="size-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-300">Editar Convención</span>
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
            {/* Info de la convención */}
            <div className="p-4 bg-gradient-to-br from-sky-50/50 to-emerald-50/50 dark:from-sky-950/30 dark:to-emerald-950/30 rounded-lg space-y-3 border border-sky-200/50 dark:border-sky-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-sky-700 dark:text-sky-300">Nombre:</span>
                <span className="text-sm font-semibold">{convencionActiva?.titulo || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Fecha:</span>
                <span className="text-sm font-semibold">
                  {convencionActiva?.fechaInicio ? new Date(convencionActiva.fechaInicio).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Lugar:</span>
                <span className="text-sm font-semibold">{convencionActiva?.ubicacion || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-sky-700 dark:text-sky-300">Monto:</span>
                <span className="text-sm font-semibold">
                  ${convencionActiva?.costo ? Number(convencionActiva.costo).toLocaleString('es-AR') : '0'} en {convencion.cuotas} cuota{convencion.cuotas > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Switch de visibilidad */}
            <div className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 ${
              convencionActiva?.activa 
                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-emerald-200 dark:border-emerald-500/30' 
                : 'bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/40 dark:to-gray-950/40 border-slate-200 dark:border-slate-500/30'
            }`}>
              <div className="space-y-1">
                <Label htmlFor="mostrar-landing" className="text-base font-semibold">
                  Mostrar en Landing Page
                </Label>
                <p className={`text-sm ${convencionActiva?.activa ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
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
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-teal-500"
              />
            </div>

            {/* Cuenta regresiva info */}
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-500/20 rounded-lg">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-500/20">
                <Clock className="size-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1 text-amber-800 dark:text-amber-300">Cuenta Regresiva Activa</p>
                <p className="text-sm text-amber-700/80 dark:text-amber-400/80">
                  La cuenta regresiva se mostrará automáticamente cuando la convención esté visible en la landing page.
                  Fecha objetivo: <span className="font-semibold">{convencionActiva?.fechaInicio ? new Date(convencionActiva.fechaInicio).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : '-'}</span>
                </p>
              </div>
            </div>

            {/* Lista de todas las convenciones */}
            {convenciones.length > 1 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground">Otras Convenciones ({convenciones.length - 1})</h4>
                <div className="space-y-2">
                  {convenciones.filter((c: any) => c.id !== convencionActiva?.id).map((conv: any) => (
                    <div key={conv.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border text-sm">
                      <div className="flex-1">
                        <p className="font-medium">{conv.titulo}</p>
                        <p className="text-xs text-muted-foreground">
                          {conv.fechaInicio ? new Date(conv.fechaInicio).toLocaleDateString('es-ES') : 'Sin fecha'} 
                          {conv.activa && <span className="ml-2 text-green-600 dark:text-green-400">• Activa</span>}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteConvencion(conv.id, conv.titulo)}
                        disabled={deleteConvencionMutation.isPending}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Tip: Elimina las convenciones duplicadas o antiguas para mantener el orden.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Stats Cards con colores del mundo */}
      <div className="grid gap-4 md:grid-cols-6">
        <ScrollReveal delay={0}>
          <Card className="border-sky-200/50 dark:border-sky-500/20 bg-gradient-to-br from-white to-sky-50/30 dark:from-background dark:to-sky-950/20 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-sky-600 dark:text-sky-400">
                Total Inscritos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">{stats.totalInscritos}</div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={50}>
          <Card className="border-emerald-200/50 dark:border-emerald-500/20 bg-gradient-to-br from-white to-emerald-50/30 dark:from-background dark:to-emerald-950/20 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Pagos Completos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">{stats.pagosConfirmados}</div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <Card className="border-amber-200/50 dark:border-amber-500/20 bg-gradient-to-br from-white to-amber-50/30 dark:from-background dark:to-amber-950/20 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">
                Pagos Parciales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">{stats.pagosParciales}</div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <Card className="border-rose-200/50 dark:border-rose-500/20 bg-gradient-to-br from-white to-rose-50/30 dark:from-background dark:to-rose-950/20 hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-rose-600 dark:text-rose-400">
                Pagos Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-red-600 dark:from-rose-400 dark:to-red-400 bg-clip-text text-transparent">{stats.pagosPendientes}</div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <Card className="border-emerald-200/50 dark:border-emerald-500/20 bg-gradient-to-br from-white to-emerald-50/30 dark:from-background dark:to-emerald-950/20 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Recaudado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                ${stats.totalRecaudado.toLocaleString('es-AR')}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={250}>
          <Card className="border-sky-200/50 dark:border-sky-500/20 bg-gradient-to-br from-white to-sky-50/30 dark:from-background dark:to-sky-950/20 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-sky-600 dark:text-sky-400">
                Origen Registro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <User className="size-3 text-sky-500" />
                  <span className="font-semibold">{stats.registrosManual}</span>
                </div>
                <span className="text-muted-foreground">|</span>
                <div className="flex items-center gap-1">
                  <Smartphone className="size-3 text-emerald-500" />
                  <span className="font-semibold">{stats.registrosMobile}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>

      {/* Navigation Cards con colores del mundo */}
      <div className="grid gap-6 md:grid-cols-3">
        <ScrollReveal delay={300}>
          <Link href="/admin/pastores">
            <Card className="hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 cursor-pointer group border-sky-200/50 dark:border-sky-500/20 bg-gradient-to-br from-white to-sky-50/30 dark:from-background dark:to-sky-950/20 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-sky-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500/10 to-blue-500/10 dark:from-sky-500/20 dark:to-blue-500/20 group-hover:from-sky-500/20 group-hover:to-blue-500/20 transition-colors">
                    <Users className="size-6 text-sky-600 dark:text-sky-400" />
                  </div>
                  <ArrowRight className="size-5 text-sky-500/50 group-hover:text-sky-500 group-hover:translate-x-1 transition-all" />
                </div>
                <CardTitle className="mt-4 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">Gestión de Pastores</CardTitle>
                <CardDescription>
                  Registrar, editar y ver listado completo de pastores inscritos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-sky-600/70 dark:text-sky-400/70">
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
            <Card className="hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer group border-emerald-200/50 dark:border-emerald-500/20 bg-gradient-to-br from-white to-emerald-50/30 dark:from-background dark:to-emerald-950/20 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 group-hover:from-emerald-500/20 group-hover:to-teal-500/20 transition-colors">
                    <CreditCard className="size-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <ArrowRight className="size-5 text-emerald-500/50 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </div>
                <CardTitle className="mt-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Gestión de Pagos</CardTitle>
                <CardDescription>
                  Verificar pagos, cuotas y vouchers de MercadoPago
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70">
                  ${stats.totalRecaudado.toLocaleString('es-AR')} recaudado
                </p>
              </CardContent>
            </Card>
          </Link>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <Link href="/admin/galeria">
            <Card className="hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer group border-amber-200/50 dark:border-amber-500/20 bg-gradient-to-br from-white to-amber-50/30 dark:from-background dark:to-amber-950/20 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 group-hover:from-amber-500/20 group-hover:to-orange-500/20 transition-colors">
                    <ImageIcon className="size-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <ArrowRight className="size-5 text-amber-500/50 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                </div>
                <CardTitle className="mt-4 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Gestión de Galería</CardTitle>
                <CardDescription>
                  Subir y administrar imágenes y videos de la landing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-600/70 dark:text-amber-400/70">
                  4 imágenes, 2 videos disponibles
                </p>
              </CardContent>
            </Card>
          </Link>
        </ScrollReveal>

        <ScrollReveal delay={500}>
          <Link href="/admin/noticias">
            <Card className="hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 cursor-pointer group border-sky-200/50 dark:border-sky-500/20 bg-gradient-to-br from-white to-sky-50/30 dark:from-background dark:to-sky-950/20 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-sky-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500/10 to-cyan-500/10 dark:from-sky-500/20 dark:to-cyan-500/20 group-hover:from-sky-500/20 group-hover:to-cyan-500/20 transition-colors">
                    <Newspaper className="size-6 text-sky-600 dark:text-sky-400" />
                  </div>
                  <ArrowRight className="size-5 text-sky-500/50 group-hover:text-sky-500 group-hover:translate-x-1 transition-all" />
                </div>
                <CardTitle className="mt-4 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">Gestión de Noticias</CardTitle>
                <CardDescription>
                  Crear y administrar noticias, anuncios y comunicados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-sky-600/70 dark:text-sky-400/70">
                  Blog y comunicación oficial
                </p>
              </CardContent>
            </Card>
          </Link>
        </ScrollReveal>
      </div>
    </div>
  )
}
