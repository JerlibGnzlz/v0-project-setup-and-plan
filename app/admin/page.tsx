'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { useConvenciones, useUpdateConvencion, useCreateConvencion, useDeleteConvencion, useArchivarConvencion, useDesarchivarConvencion } from '@/lib/hooks/use-convencion'
import { useDashboardStats } from '@/lib/hooks/use-dashboard-stats'
import type { ConvencionFormData } from '@/lib/validations/convencion'
import {
  DashboardHeader,
  DashboardEmptyState,
  DashboardConvencionControl,
  DashboardStats,
  DashboardConvencionesList,
  DashboardQuickActions,
} from '@/components/admin/dashboard'

export default function AdminDashboard() {
  const { data: convenciones = [], isLoading: loadingConvencion } = useConvenciones()
  // Tomar la primera convención (la más reciente) - siempre visible en admin sin importar si está activa
  const convencionActiva = convenciones[0] || null
  const { stats, isLoading: loadingStats } = useDashboardStats()

  const updateConvencionMutation = useUpdateConvencion()
  const createConvencionMutation = useCreateConvencion()
  const deleteConvencionMutation = useDeleteConvencion()
  const archivarConvencionMutation = useArchivarConvencion()
  const desarchivarConvencionMutation = useDesarchivarConvencion()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [mostrarArchivadas, setMostrarArchivadas] = useState(false)
  const [filtroAno, setFiltroAno] = useState<string>('todos')

  const convencionCuotas = 3 // Por defecto

  // Handlers
  const handleUpdateConvencion = async (data: ConvencionFormData) => {
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
        },
      })

      toast.success('Convención actualizada', {
        description: 'Los cambios se han guardado correctamente',
      })
      setDialogOpen(false)
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error.response as { data?: { message?: string } })?.data?.message
          : 'No se pudieron guardar los cambios'
      toast.error('Error al actualizar', {
        description: errorMessage || 'No se pudieron guardar los cambios',
      })
    }
  }

  const handleToggleVisibility = async (checked: boolean) => {
    if (!convencionActiva) {
      toast.error('No hay convención para mostrar/ocultar')
      return
    }

    try {
      await updateConvencionMutation.mutateAsync({
        id: convencionActiva.id,
        data: { activa: checked },
      })
      toast.success(checked ? 'Convención activada' : 'Convención desactivada', {
        description: checked
          ? 'La convención, cuenta regresiva e inscripciones son visibles en la landing'
          : 'La convención está oculta de la landing page',
      })
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error.response as { data?: { message?: string } })?.data?.message
          : 'No se pudo cambiar la visibilidad'
      toast.error('Error al cambiar visibilidad', {
        description: errorMessage || 'No se pudo cambiar la visibilidad',
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
        description: `"${titulo}" ha sido eliminada correctamente`,
      })
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error.response as { data?: { message?: string } })?.data?.message
          : 'No se pudo eliminar la convención'
      toast.error('Error al eliminar', {
        description: errorMessage || 'No se pudo eliminar la convención',
      })
    }
  }

  const handleCreateConvencion = async (data: ConvencionFormData) => {
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
      })

      toast.success('Convención creada', {
        description: 'La convención ha sido creada exitosamente',
      })
      setCreateDialogOpen(false)
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error.response as { data?: { message?: string } })?.data?.message
          : 'No se pudo crear la convención'
      toast.error('Error al crear', {
        description: errorMessage || 'No se pudo crear la convención',
      })
    }
  }

  const handleArchivarConvencion = (id: string) => {
    archivarConvencionMutation.mutate(id)
  }

  const handleDesarchivarConvencion = (id: string) => {
    desarchivarConvencionMutation.mutate(id)
  }

  // Loading state
  if (loadingConvencion || loadingStats) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  // Empty state - no hay convención activa
  if (!convencionActiva) {
    return (
      <DashboardEmptyState
        onCreateConvencion={handleCreateConvencion}
        createDialogOpen={createDialogOpen}
        setCreateDialogOpen={setCreateDialogOpen}
        isPending={createConvencionMutation.isPending}
      />
    )
  }

  // Main dashboard
  return (
    <div className="space-y-6">
      <DashboardHeader convencionActiva={convencionActiva} />

      <DashboardConvencionControl
        convencionActiva={convencionActiva}
        convencionCuotas={convencionCuotas}
        onUpdate={handleUpdateConvencion}
        onToggleVisibility={handleToggleVisibility}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        isPending={updateConvencionMutation.isPending}
      />

      <DashboardConvencionesList
        convenciones={convenciones}
        convencionActiva={convencionActiva}
        mostrarArchivadas={mostrarArchivadas}
        setMostrarArchivadas={setMostrarArchivadas}
        filtroAno={filtroAno}
        setFiltroAno={setFiltroAno}
        onArchivar={handleArchivarConvencion}
        onDesarchivar={handleDesarchivarConvencion}
        onDelete={handleDeleteConvencion}
        isArchivarPending={archivarConvencionMutation.isPending}
        isDesarchivarPending={desarchivarConvencionMutation.isPending}
        isDeletePending={deleteConvencionMutation.isPending}
      />

      <DashboardStats stats={stats} />

      <DashboardQuickActions
        stats={stats}
        loadingPastores={false}
        loadingInscripciones={false}
      />
    </div>
  )
}
