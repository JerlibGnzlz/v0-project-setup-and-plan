'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  useCredencialesMinisteriales,
  useDeleteCredencialMinisterial,
} from '@/lib/hooks/use-credenciales-ministeriales'
import { CredencialMinisterial } from '@/lib/api/credenciales-ministeriales'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import {
  Shield,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  List,
  Eye,
  FileText,
  ArrowRight,
} from 'lucide-react'
import { CredencialCard } from '@/components/admin/credenciales-ministeriales/credencial-card'
import { CredencialEditorDialog } from '@/components/admin/credenciales-ministeriales/credencial-editor-dialog'
import { toast } from 'sonner'

const ESTADO_COLORS = {
  vigente: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  por_vencer: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  vencida: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
}

const ESTADO_LABELS = {
  vigente: 'Vigente',
  por_vencer: 'Por Vencer',
  vencida: 'Vencida',
}

export default function VisorCredencialesPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [documentoFilter, setDocumentoFilter] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<string>('todos')
  const [selectedCredencial, setSelectedCredencial] =
    useState<CredencialMinisterial | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState<'frente' | 'dorso'>('frente')
  const [viewMode, setViewMode] = useState<'list' | 'view'>('list')
  const [wizardStep, setWizardStep] = useState<'create' | 'preview' | 'list'>('list')
  const [credencialToDelete, setCredencialToDelete] = useState<CredencialMinisterial | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)


  const filters = {
    documento: documentoFilter || undefined,
    estado: estadoFilter !== 'todos' ? (estadoFilter as any) : undefined,
  }

  const { data, isLoading, error } = useCredencialesMinisteriales(page, limit, filters)
  const deleteMutation = useDeleteCredencialMinisterial()

  const handleCreate = () => {
    setSelectedCredencial(null)
    setEditMode('frente')
    setIsDialogOpen(true)
    setWizardStep('create')
  }

  const handleCredencialCreated = (credencial: CredencialMinisterial) => {
    // Verificar que la credencial tenga todos los datos necesarios
    if (!credencial || !credencial.id) {
      console.error('[VisorCredencialesPage] Credencial inválida:', credencial)
      toast.error('Error: La credencial creada no tiene datos válidos')
      return
    }
    
    // Después de crear, mostrar el diseño visual automáticamente
    // Primero cerrar el diálogo
    setIsDialogOpen(false)
    
    // Mostrar mensaje de éxito
    toast.success('✅ Credencial creada exitosamente', {
      description: 'La credencial se ha guardado y está disponible en la lista',
      duration: 3000,
    })
    
    // Luego actualizar el estado para mostrar el flip card (paso 2 del wizard)
    setTimeout(() => {
      setSelectedCredencial(credencial)
      setViewMode('view')
      setWizardStep('preview')
    }, 150)
  }

  const handleViewList = () => {
    setViewMode('list')
    setWizardStep('list')
    setSelectedCredencial(null)
  }

  const handleEditFrente = (credencial: CredencialMinisterial) => {
    setSelectedCredencial(credencial)
    setEditMode('frente')
    setIsDialogOpen(true)
  }

  const handleEditDorso = (credencial: CredencialMinisterial) => {
    setSelectedCredencial(credencial)
    setEditMode('dorso')
    setIsDialogOpen(true)
  }

  const handleView = (credencial: CredencialMinisterial) => {
    setSelectedCredencial(credencial)
    setViewMode('view')
  }

  const handleDelete = (credencial: CredencialMinisterial) => {
    setCredencialToDelete(credencial)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!credencialToDelete) return

    try {
      await deleteMutation.mutateAsync(credencialToDelete.id)
      setShowDeleteDialog(false)
      setCredencialToDelete(null)
    } catch (error) {
      // Error ya manejado en el hook
    }
  }

  const credenciales = data?.data || []
  const total = data?.total || 0
  const totalPages = data?.totalPages || 0

  // Modo de visualización de credencial (Paso 2 del wizard: Preview)
  if (viewMode === 'view' && selectedCredencial) {
    return (
      <div className="w-full px-4 py-6 space-y-6">
        {/* Wizard Steps Indicator */}
        <div className="flex items-center justify-center gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 bg-muted text-muted-foreground border-muted">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Crear
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 bg-primary text-primary-foreground border-primary">
              <Eye className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-primary">
              Previsualizar
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 bg-muted text-muted-foreground border-muted">
              <List className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Ver Lista
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Previsualización de Credencial</h1>
            <p className="text-muted-foreground">
              Revisa la credencial antes de continuar a la lista
            </p>
          </div>
        </div>

        {/* Credencial Card */}
        <CredencialCard
          credencial={selectedCredencial}
          onEdit={() => {
            setViewMode('list')
            setWizardStep('list')
            handleEditFrente(selectedCredencial)
          }}
          onBackToList={handleViewList}
        />

        {/* Action Button to Continue to List */}
        <div className="flex justify-center pt-6">
          <Button
            size="lg"
            onClick={handleViewList}
            className="flex items-center gap-2"
          >
            <List className="w-5 h-5" />
            Ver Todas las Credenciales Creadas
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Wizard Steps Indicator (solo cuando estamos en modo lista) */}
      {wizardStep === 'list' && (
        <div className="flex items-center justify-center gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 bg-muted text-muted-foreground border-muted">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Crear
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 bg-muted text-muted-foreground border-muted">
              <Eye className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Previsualizar
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 bg-primary text-primary-foreground border-primary">
              <List className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-primary">
              Ver Lista
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Credencial de Pastores</h1>
          <p className="text-muted-foreground">
            Gestiona las credenciales ministeriales físicas para impresión
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Credencial
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credenciales</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">Credenciales activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vigentes</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {credenciales.filter((c) => c.estado === 'vigente').length}
            </div>
            <p className="text-xs text-muted-foreground">En buen estado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Vencer</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {credenciales.filter((c) => c.estado === 'por_vencer').length}
            </div>
            <p className="text-xs text-muted-foreground">Próximos 30 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {credenciales.filter((c) => c.estado === 'vencida').length}
            </div>
            <p className="text-xs text-muted-foreground">Requieren renovación</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtra las credenciales por documento o estado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por DNI..."
                  value={documentoFilter}
                  onChange={(e) => {
                    setDocumentoFilter(e.target.value)
                    setPage(1)
                  }}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="vigente">Vigente</SelectItem>
                <SelectItem value="por_vencer">Por Vencer</SelectItem>
                <SelectItem value="vencida">Vencida</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-semibold">Error al cargar credenciales</p>
              <p className="text-sm text-muted-foreground mb-4">
                {error instanceof Error ? error.message : 'Error desconocido'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : credenciales.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No hay credenciales ministeriales
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {total === 0
                  ? 'Crea una nueva credencial para comenzar'
                  : 'No se encontraron credenciales con los filtros aplicados'}
              </p>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Credencial
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 text-left text-sm font-medium">Nombre</th>
                  <th className="p-3 text-left text-sm font-medium">Documento</th>
                  <th className="p-3 text-left text-sm font-medium">Nacionalidad</th>
                  <th className="p-3 text-left text-sm font-medium">Tipo</th>
                  <th className="p-3 text-left text-sm font-medium">Vencimiento</th>
                  <th className="p-3 text-left text-sm font-medium">Estado</th>
                  <th className="p-3 text-left text-sm font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {credenciales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No se encontraron credenciales
                    </td>
                  </tr>
                ) : (
                  credenciales.map((credencial) => {
                    // Parsear fecha correctamente para evitar problemas de timezone
                    const parseDate = (dateString: string): Date => {
                      if (dateString.includes('T')) {
                        const datePart = dateString.split('T')[0]
                        const [year, month, day] = datePart.split('-').map(Number)
                        return new Date(year, month - 1, day)
                      } else {
                        const [year, month, day] = dateString.split('-').map(Number)
                        return new Date(year, month - 1, day)
                      }
                    }

                    const fechaVencimiento = format(
                      parseDate(credencial.fechaVencimiento),
                      'dd/MM/yyyy',
                      { locale: es }
                    )

                    return (
                      <tr key={credencial.id} className="border-b">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">
                              {credencial.nombre} {credencial.apellido}
                            </p>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-mono text-sm">{credencial.documento}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">{credencial.nacionalidad}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">{credencial.tipoPastor}</span>
                        </td>
                        <td className="p-3">
                          <div>
                            <span className="text-sm font-medium">{fechaVencimiento}</span>
                            {credencial.diasRestantes !== undefined && (
                              <>
                                {credencial.diasRestantes > 0 && credencial.diasRestantes <= 30 && (
                                  <p className="text-xs text-amber-600 font-medium">
                                    {credencial.diasRestantes} días restantes
                                  </p>
                                )}
                                {credencial.diasRestantes < 0 && (
                                  <p className="text-xs text-red-600 font-medium">
                                    Vencida hace {Math.abs(credencial.diasRestantes)} días
                                  </p>
                                )}
                                {credencial.diasRestantes > 30 && (
                                  <p className="text-xs text-emerald-600 font-medium">
                                    {credencial.diasRestantes} días restantes
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          {credencial.estado ? (
                            <Badge
                              variant="outline"
                              className={ESTADO_COLORS[credencial.estado]}
                            >
                              {ESTADO_LABELS[credencial.estado]}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-500/10 text-gray-600">
                              Sin estado
                            </Badge>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(credencial)}
                              title="Ver credencial"
                            >
                              Ver
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditFrente(credencial)}
                              title="Editar frente de la credencial"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditDorso(credencial)}
                              title="Editar dorso (fecha de vencimiento)"
                            >
                              Editar Dorso
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(credencial)}
                              disabled={deleteMutation.isPending}
                              title="Eliminar credencial"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} de {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Dialog */}
      <CredencialEditorDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        credencial={selectedCredencial}
        editMode={editMode}
        onCredencialCreated={handleCredencialCreated}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar credencial?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la credencial de{' '}
              <strong>
                {credencialToDelete?.nombre} {credencialToDelete?.apellido}
              </strong>{' '}
              (Documento: {credencialToDelete?.documento}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false)
                setCredencialToDelete(null)
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

