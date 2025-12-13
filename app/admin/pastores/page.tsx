'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollReveal } from '@/components/scroll-reveal'
import { Users } from 'lucide-react'
import { usePastores, useCreatePastor, useUpdatePastor } from '@/lib/hooks/use-pastores'
import { uploadApi } from '@/lib/api/upload'
import type { Pastor } from '@/lib/api/pastores'
import type { PastorFormData, TipoPastor } from '@/lib/validations/pastor'
import { Crown, Users as UsersIcon, Globe, Star } from 'lucide-react'
import {
  PastoresHeader,
  PastoresFilters,
  PastoresTable,
  PastoresPagination,
  PastoresDialog,
} from '@/components/admin/pastores'

// Iconos y colores para cada tipo de pastor
const tipoConfig: Record<TipoPastor, { icon: any; color: string; bgColor: string }> = {
  DIRECTIVA: {
    icon: Crown,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  SUPERVISOR: {
    icon: UsersIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  PRESIDENTE: {
    icon: Globe,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  PASTOR: {
    icon: Star,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
}

export default function PastoresPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activos' | 'inactivos'>('todos')
  const [tipoFilter, setTipoFilter] = useState<TipoPastor | 'todos'>('todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [selectedPastor, setSelectedPastor] = useState<Pastor | null>(null)
  const [isAddingPastor, setIsAddingPastor] = useState(false)
  const [isEditingPastor, setIsEditingPastor] = useState(false)

  // Debounce para búsqueda
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1) // Reset a página 1 cuando cambia la búsqueda
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Construir filtros para el servidor
  const filters = {
    search: debouncedSearchTerm || undefined,
    status: statusFilter,
    tipo: tipoFilter !== 'todos' ? tipoFilter : undefined,
  }

  const { data: pastoresResponse, isLoading, error } = usePastores(currentPage, pageSize, filters)
  const createPastorMutation = useCreatePastor()
  const updatePastorMutation = useUpdatePastor()

  // Debug: Log para ver qué está pasando
  useEffect(() => {
    if (error) {
      console.error('[PastoresPage] Error al cargar pastores:', error)
    }
  }, [pastoresResponse, error, filters])

  // Manejar respuesta paginada o array directo (compatibilidad)
  const pastores = Array.isArray(pastoresResponse) ? pastoresResponse : pastoresResponse?.data || []
  const paginationMeta = Array.isArray(pastoresResponse) ? null : pastoresResponse?.meta

  // Los filtros ahora se hacen en el servidor, así que usamos directamente los datos
  const filteredPastores = pastores

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, tipoFilter, debouncedSearchTerm])

  // Contadores basados en los datos actuales
  const counts = {
    todos: paginationMeta?.total || pastores.length,
    activos: pastores.filter((p: Pastor) => p.activo).length,
    inactivos: pastores.filter((p: Pastor) => !p.activo).length,
  }

  const handleSubmit = async (data: PastorFormData) => {
    try {
      // Limpiar campos vacíos y asegurar tipos correctos
      const cleanData = {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email || undefined,
        telefono: data.telefono || undefined,
        tipo: data.tipo || 'DIRECTIVA',
        cargo: data.cargo || undefined,
        ministerio: data.ministerio || undefined,
        sede: data.sede || undefined,
        region: data.region || undefined,
        pais: data.pais || undefined,
        fotoUrl: data.fotoUrl || undefined,
        biografia: data.biografia || undefined,
        trayectoria: data.trayectoria || undefined,
        orden: Number(data.orden) || 0,
        activo: data.activo ?? true,
        mostrarEnLanding: data.mostrarEnLanding ?? false,
      }

      if (isEditingPastor && selectedPastor) {
        await updatePastorMutation.mutateAsync({
          id: selectedPastor.id,
          data: cleanData,
        })
        toast.success('Pastor actualizado')
      } else {
        await createPastorMutation.mutateAsync(cleanData as unknown as Pastor)
        toast.success('Pastor creado')
      }
      setIsAddingPastor(false)
      setIsEditingPastor(false)
      setSelectedPastor(null)
    } catch (error: unknown) {
      console.error('Error al guardar pastor:', error)
      const errorObj = error && typeof error === 'object' && 'response' in error
        ? (error.response as { data?: { message?: string; error?: { message?: string } } })
        : null
      const message =
        errorObj?.data?.message ||
        errorObj?.data?.error?.message ||
        (errorObj?.data ? JSON.stringify(errorObj.data) : null) ||
        'No se pudo guardar el pastor.'
      toast.error('Error al guardar', { description: message })
    }
  }

  const handleEdit = (pastor: Pastor) => {
    setSelectedPastor(pastor)
    setIsEditingPastor(true)
  }

  const handleCloseDialog = () => {
    setIsAddingPastor(false)
    setIsEditingPastor(false)
    setSelectedPastor(null)
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    const result = await uploadApi.uploadPastorImage(file)
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
    <TooltipProvider>
      <ScrollReveal>
        <div className="space-y-6">
          <PastoresHeader onAddClick={() => setIsAddingPastor(true)} />

          <Card className="border-sky-200/50 dark:border-sky-500/20 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500" />
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5 text-sky-600" />
                  Lista de Pastores
                </CardTitle>
                <CardDescription>
                  {counts.activos} activos de {counts.todos} registrados
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <PastoresFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                tipoFilter={tipoFilter}
                onTipoFilterChange={setTipoFilter}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                counts={counts}
              />

              <PastoresTable
                pastores={filteredPastores}
                onEdit={handleEdit}
                tipoConfig={tipoConfig}
              />

              <PastoresPagination
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                paginationMeta={paginationMeta}
                pageSize={pageSize}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          <PastoresDialog
            open={isAddingPastor || isEditingPastor}
            onOpenChange={handleCloseDialog}
            pastor={selectedPastor}
            isEditing={isEditingPastor}
            onSubmit={handleSubmit}
            onImageUpload={handleImageUpload}
            tipoConfig={tipoConfig}
          />
        </div>
      </ScrollReveal>
    </TooltipProvider>
  )
}
