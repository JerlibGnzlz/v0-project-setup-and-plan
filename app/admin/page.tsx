'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Users, CreditCard, ImageIcon, ArrowRight, User, Smartphone, Calendar, Clock, Edit } from 'lucide-react'
import { ScrollReveal } from '@/components/scroll-reveal'
import { useState } from 'react'
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
import { useConvencionActiva, useUpdateConvencion } from '@/lib/hooks/use-convencion'
import { usePagos } from '@/lib/hooks/use-pagos'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminDashboard() {
  const { data: convencionActiva, isLoading: loadingConvencion } = useConvencionActiva()
  const { data: pagos = [], isLoading: loadingPagos } = usePagos()
  const updateConvencionMutation = useUpdateConvencion()
  
  const [dialogOpen, setDialogOpen] = useState(false)

  // Calcular estadísticas desde los datos reales
  const stats = {
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
      
      setDialogOpen(false)
    } catch (error: any) {
      toast.error('Error al actualizar', {
        description: error.response?.data?.message || 'No se pudieron guardar los cambios'
      })
    }
  }

  const handleConvencionToggle = async (checked: boolean) => {
    if (!convencionActiva) {
      toast.error('No hay convención para activar/desactivar')
      return
    }

    try {
      await updateConvencionMutation.mutateAsync({
        id: convencionActiva.id,
        data: { activa: checked }
      })
    } catch (error: any) {
      toast.error('Error al actualizar el estado', {
        description: error.response?.data?.message || 'No se pudo cambiar el estado'
      })
    }
  }

  const handleVisibilidadToggle = async (checked: boolean) => {
    if (!convencionActiva) {
      toast.error('No hay convención para mostrar/ocultar')
      return
    }

    // Por ahora, activa/desactiva es lo mismo que mostrar/ocultar
    await handleConvencionToggle(checked)
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

  if (!convencionActiva) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel Administrativo</h1>
          <p className="text-muted-foreground mt-2">
            No hay convención activa. Crea una convención para comenzar.
          </p>
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

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="convencion-activa" className="text-base font-semibold">
                  Estado de Inscripciones
                </Label>
                <p className="text-sm text-muted-foreground">
                  {convencionActiva?.activa ? 'Las inscripciones están abiertas' : 'Las inscripciones están cerradas'}
                </p>
              </div>
              <Switch
                id="convencion-activa"
                checked={convencionActiva?.activa || false}
                onCheckedChange={handleConvencionToggle}
                disabled={updateConvencionMutation.isPending}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="mostrar-landing" className="text-base font-semibold">
                  Visibilidad en Landing
                </Label>
                <p className="text-sm text-muted-foreground">
                  {convencionActiva?.activa ? 'La convención y cuenta regresiva son visibles' : 'La convención está oculta del público'}
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
                  {stats.totalInscritos} pastores registrados
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
