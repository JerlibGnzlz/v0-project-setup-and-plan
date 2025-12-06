'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  pastorSchema,
  type PastorFormData,
  tipoPastorLabels,
  type TipoPastor,
} from '@/lib/validations/pastor'
import { toast } from 'sonner'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Search,
  Eye,
  Plus,
  Edit,
  AlertCircle,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Globe,
  Users,
  Crown,
  Star,
} from 'lucide-react'
import Link from 'next/link'
import { ScrollReveal } from '@/components/scroll-reveal'
import { usePastores, useCreatePastor, useUpdatePastor } from '@/lib/hooks/use-pastores'
import { Skeleton } from '@/components/ui/skeleton'
import { ImageUpload } from '@/components/ui/image-upload'
import { uploadApi } from '@/lib/api/upload'
import type { Pastor } from '@/lib/api/pastores'

// Iconos y colores para cada tipo de pastor
const tipoConfig: Record<TipoPastor, { icon: any; color: string; bgColor: string }> = {
  DIRECTIVA: { icon: Crown, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  SUPERVISOR: { icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
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
  // IMPORTANTE: Enviar "todos" explícitamente para que el backend sepa que debe mostrar todos
  const filters = {
    search: debouncedSearchTerm || undefined,
    status: statusFilter, // Enviar "todos", "activos" o "inactivos" explícitamente
    tipo: tipoFilter !== 'todos' ? tipoFilter : undefined,
  }

  const { data: pastoresResponse, isLoading, error } = usePastores(currentPage, pageSize, filters)

  // Debug: Log para ver qué está pasando
  useEffect(() => {
    if (error) {
      console.error('[PastoresPage] Error al cargar pastores:', error)
    }
    if (pastoresResponse) {
      console.log('[PastoresPage] Respuesta recibida:', {
        isArray: Array.isArray(pastoresResponse),
        hasData: !!pastoresResponse?.data,
        dataLength: Array.isArray(pastoresResponse)
          ? pastoresResponse.length
          : pastoresResponse?.data?.length,
        meta: pastoresResponse?.meta,
        filters,
      })
    }
  }, [pastoresResponse, error, filters])

  // Manejar respuesta paginada o array directo (compatibilidad)
  const pastores = Array.isArray(pastoresResponse) ? pastoresResponse : pastoresResponse?.data || []
  const paginationMeta = Array.isArray(pastoresResponse) ? null : pastoresResponse?.meta
  const createPastorMutation = useCreatePastor()
  const updatePastorMutation = useUpdatePastor()

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

  // Manejar cambio de tipo: solo DIRECTIVA puede mostrar en landing
  const handleTipoChange = (value: TipoPastor) => {
    setValue('tipo', value)
    // Si es directiva, activar automáticamente mostrarEnLanding
    if (value === 'DIRECTIVA') {
      setValue('mostrarEnLanding', true)
    } else {
      // Si no es directiva, desactivar mostrarEnLanding
      setValue('mostrarEnLanding', false)
    }
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    const result = await uploadApi.uploadPastorImage(file)
    return result.url
  }

  // Los filtros ahora se hacen en el servidor, así que usamos directamente los datos
  const filteredPastores = pastores

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, tipoFilter, debouncedSearchTerm])

  // Contadores basados en los datos actuales (pueden ser aproximados si hay filtros activos)
  const counts = {
    todos: paginationMeta?.total || pastores.length,
    activos: pastores.filter((p: Pastor) => p.activo).length,
    inactivos: pastores.filter((p: Pastor) => !p.activo).length,
  }

  const onSubmit = async (data: PastorFormData) => {
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

      console.log('Enviando datos:', cleanData)

      if (isEditingPastor && selectedPastor) {
        await updatePastorMutation.mutateAsync({
          id: selectedPastor.id,
          data: cleanData,
        })
        toast.success('Pastor actualizado')
      } else {
        await createPastorMutation.mutateAsync(cleanData as any)
        toast.success('Pastor creado')
      }
      setIsAddingPastor(false)
      setIsEditingPastor(false)
      reset()
      setSelectedPastor(null)
    } catch (error: any) {
      console.error('Error al guardar pastor:', error)
      const message =
        error.response?.data?.message ||
        error.response?.data?.error?.message ||
        JSON.stringify(error.response?.data) ||
        'No se pudo guardar el pastor.'
      toast.error('Error al guardar', { description: message })
    }
  }

  const handleEdit = (pastor: Pastor) => {
    setSelectedPastor(pastor)
    setIsEditingPastor(true)
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
  }

  const handleCloseDialog = () => {
    setIsAddingPastor(false)
    setIsEditingPastor(false)
    reset()
    setSelectedPastor(null)
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
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-sky-50 dark:hover:bg-sky-500/10"
              >
                <ChevronLeft className="size-5 text-sky-600 dark:text-sky-400" />
              </Button>
            </Link>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-sky-500/10 via-emerald-500/10 to-amber-500/10 rounded-xl blur-xl" />
              <div className="relative">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-sky-600 via-emerald-600 to-amber-600 dark:from-sky-400 dark:via-emerald-400 dark:to-amber-400 bg-clip-text text-transparent">
                  Estructura Organizacional
                </h1>
                <p className="text-muted-foreground mt-1">
                  Administra la directiva, supervisores y pastores
                </p>
              </div>
            </div>
          </div>

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
              <Dialog
                open={isAddingPastor || isEditingPastor}
                onOpenChange={open => !open && handleCloseDialog()}
              >
                <DialogTrigger asChild>
                  <Button
                    onClick={() => setIsAddingPastor(true)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                  >
                    <Plus className="size-4 mr-2" />
                    Nuevo Pastor
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{isEditingPastor ? 'Editar Pastor' : 'Nuevo Pastor'}</DialogTitle>
                    <DialogDescription>
                      {isEditingPastor
                        ? 'Modifica los datos del pastor'
                        : 'Completa los datos para registrar un nuevo pastor'}
                    </DialogDescription>
                  </DialogHeader>
                  <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {/* Foto */}
                    <div className="flex justify-center">
                      <div className="space-y-2">
                        <Label>Foto del Pastor</Label>
                        <ImageUpload
                          value={fotoUrl}
                          onChange={url => setValue('fotoUrl', url)}
                          onUpload={handleImageUpload}
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
                                <span className="text-xs text-muted-foreground cursor-help">
                                  ℹ️
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">
                                  Controla el orden en que aparecen los pastores en la landing page.
                                </p>
                                <p className="text-xs mt-1">
                                  Números menores aparecen primero. Si varios tienen el mismo
                                  número, se ordenan alfabéticamente.
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
                          <Input
                            id="region"
                            placeholder="Zona Norte, Cortés..."
                            {...register('region')}
                          />
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
                      <Button type="button" variant="outline" onClick={handleCloseDialog}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting
                          ? 'Guardando...'
                          : isEditingPastor
                            ? 'Actualizar'
                            : 'Crear Pastor'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {/* Filtros */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-6">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, email, sede..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Filtro por tipo */}
                  <Select
                    value={tipoFilter}
                    onValueChange={v => setTipoFilter(v as TipoPastor | 'todos')}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los tipos</SelectItem>
                      {(Object.keys(tipoPastorLabels) as TipoPastor[])
                        .filter(tipo => tipo !== 'PASTOR')
                        .map(tipo => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipoPastorLabels[tipo]}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {/* Filtro por estado */}
                  <Button
                    variant={statusFilter === 'todos' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('todos')}
                  >
                    Todos{' '}
                    <Badge variant="secondary" className="ml-1">
                      {counts.todos}
                    </Badge>
                  </Button>
                  <Button
                    variant={statusFilter === 'activos' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('activos')}
                  >
                    Activos{' '}
                    <Badge variant="secondary" className="ml-1">
                      {counts.activos}
                    </Badge>
                  </Button>
                  <Button
                    variant={statusFilter === 'inactivos' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('inactivos')}
                  >
                    Inactivos{' '}
                    <Badge variant="secondary" className="ml-1">
                      {counts.inactivos}
                    </Badge>
                  </Button>
                </div>
              </div>

              {/* Tabla */}
              <div className="rounded-md border overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 text-left text-sm font-medium">Pastor</th>
                      <th className="p-3 text-left text-sm font-medium">Tipo</th>
                      <th className="p-3 text-left text-sm font-medium">Cargo</th>
                      <th className="p-3 text-left text-sm font-medium">Ubicación</th>
                      <th className="p-3 text-left text-sm font-medium">Landing</th>
                      <th className="p-3 text-left text-sm font-medium">Estado</th>
                      <th className="p-3 text-left text-sm font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPastores.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                          No se encontraron pastores
                        </td>
                      </tr>
                    ) : (
                      filteredPastores.map((pastor: Pastor) => {
                        const config = tipoConfig[pastor.tipo] || tipoConfig.PASTOR
                        const Icon = config.icon
                        return (
                          <tr key={pastor.id} className="border-t hover:bg-muted/50">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                {pastor.fotoUrl ? (
                                  <img
                                    src={pastor.fotoUrl}
                                    alt={`${pastor.nombre} ${pastor.apellido}`}
                                    className="size-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-medium">
                                    {pastor.nombre?.[0]}
                                    {pastor.apellido?.[0]}
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-sm">
                                    {pastor.nombre} {pastor.apellido}
                                  </p>
                                  {pastor.email && (
                                    <p className="text-xs text-muted-foreground">{pastor.email}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline" className={`${config.bgColor} border-0`}>
                                <Icon className={`size-3 mr-1 ${config.color}`} />
                                <span className={config.color}>
                                  {tipoPastorLabels[pastor.tipo] || 'Pastor'}
                                </span>
                              </Badge>
                            </td>
                            <td className="p-3 text-sm">{pastor.cargo || '-'}</td>
                            <td className="p-3 text-sm">
                              {pastor.sede || pastor.region || pastor.pais || '-'}
                            </td>
                            <td className="p-3">
                              {pastor.mostrarEnLanding ? (
                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                  Visible
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Oculto</Badge>
                              )}
                            </td>
                            <td className="p-3">
                              <Badge variant={pastor.activo ? 'default' : 'secondary'}>
                                {pastor.activo ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEdit(pastor)}
                                    >
                                      <Edit className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Editar</TooltipContent>
                                </Tooltip>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      {pastor.activo ? (
                                        <UserX className="size-4" />
                                      ) : (
                                        <UserCheck className="size-4" />
                                      )}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        {pastor.activo ? '¿Desactivar pastor?' : '¿Activar pastor?'}
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {pastor.activo
                                          ? `${pastor.nombre} ${pastor.apellido} quedará inactivo.`
                                          : `${pastor.nombre} ${pastor.apellido} será reactivado.`}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={async () => {
                                          try {
                                            await updatePastorMutation.mutateAsync({
                                              id: pastor.id,
                                              data: { activo: !pastor.activo },
                                            })
                                            toast.success(
                                              pastor.activo
                                                ? 'Pastor desactivado'
                                                : 'Pastor activado'
                                            )
                                          } catch (error: any) {
                                            toast.error('Error', {
                                              description: 'No se pudo actualizar el pastor',
                                            })
                                          }
                                        }}
                                      >
                                        Confirmar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Controles de paginación */}
              {paginationMeta && paginationMeta.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {(currentPage - 1) * pageSize + 1} -{' '}
                    {Math.min(currentPage * pageSize, paginationMeta.total)} de{' '}
                    {paginationMeta.total} pastores
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={!paginationMeta.hasPreviousPage || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      Página {currentPage} de {paginationMeta.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => p + 1)}
                      disabled={!paginationMeta.hasNextPage || isLoading}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollReveal>
    </TooltipProvider>
  )
}
