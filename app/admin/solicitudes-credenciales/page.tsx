'use client'

import { useState } from 'react'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  useSolicitudesCredenciales,
  useUpdateSolicitudCredencial,
} from '@/lib/hooks/use-solicitudes-credenciales'
import {
  SolicitudCredencial,
  EstadoSolicitud,
  TipoCredencial,
} from '@/lib/api/solicitudes-credenciales'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  MessageSquare,
  User,
  CreditCard,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'
import { CredencialEditorDialog } from '@/components/admin/credenciales-ministeriales/credencial-editor-dialog'
import { CredencialCapellaniaEditorDialog } from '@/components/admin/credenciales-capellania/credencial-capellania-editor-dialog'
import { CredencialMinisterial } from '@/lib/api/credenciales-ministeriales'
import { CredencialCapellania } from '@/lib/api/credenciales-capellania'

const ESTADO_COLORS = {
  pendiente: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  aprobada: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  rechazada: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  completada: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
}

const ESTADO_LABELS = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  completada: 'Completada',
}

const TIPO_LABELS = {
  ministerial: 'Ministerial',
  capellania: 'Capellanía',
}

export default function SolicitudesCredencialesPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<EstadoSolicitud | 'todos'>('todos')
  const [tipoFilter, setTipoFilter] = useState<TipoCredencial | 'todos'>('todos')
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudCredencial | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showAprobarDialog, setShowAprobarDialog] = useState(false)
  const [showRechazarDialog, setShowRechazarDialog] = useState(false)
  const [showCrearCredencialDialog, setShowCrearCredencialDialog] = useState(false)
  const [credencialFromSolicitud, setCredencialFromSolicitud] =
    useState<SolicitudCredencial | null>(null)
  const [observaciones, setObservaciones] = useState('')

  const { data, isLoading, error } = useSolicitudesCredenciales(
    page,
    limit,
    estadoFilter !== 'todos' ? estadoFilter : undefined,
    tipoFilter !== 'todos' ? tipoFilter : undefined
  )
  const updateMutation = useUpdateSolicitudCredencial()

  const solicitudes = data?.data || []
  const paginationMeta = data?.meta

  // Filtrar por término de búsqueda en el cliente (nombre, apellido, DNI, email)
  const filteredSolicitudes = solicitudes.filter((solicitud) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      solicitud.nombre.toLowerCase().includes(search) ||
      solicitud.apellido.toLowerCase().includes(search) ||
      solicitud.dni.toLowerCase().includes(search) ||
      solicitud.invitado.email.toLowerCase().includes(search)
    )
  })

  // Estadísticas
  const stats = {
    total: paginationMeta?.total || solicitudes.length,
    pendientes: solicitudes.filter((s) => s.estado === EstadoSolicitud.PENDIENTE).length,
    aprobadas: solicitudes.filter((s) => s.estado === EstadoSolicitud.APROBADA).length,
    rechazadas: solicitudes.filter((s) => s.estado === EstadoSolicitud.RECHAZADA).length,
    completadas: solicitudes.filter((s) => s.estado === EstadoSolicitud.COMPLETADA).length,
  }

  const handleAprobar = async () => {
    if (!selectedSolicitud) return

    try {
      await updateMutation.mutateAsync({
        id: selectedSolicitud.id,
        dto: {
          estado: EstadoSolicitud.APROBADA,
          observaciones: observaciones || undefined,
        },
      })
      setShowAprobarDialog(false)
      setSelectedSolicitud(null)
      setObservaciones('')
      toast.success('Solicitud aprobada', {
        description: 'La solicitud ha sido aprobada exitosamente',
      })
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error al aprobar la solicitud'
      toast.error('Error al aprobar la solicitud', {
        description: errorMessage,
      })
    }
  }

  const handleRechazar = async () => {
    if (!selectedSolicitud) return

    if (!observaciones.trim()) {
      toast.error('Observaciones requeridas', {
        description: 'Debes proporcionar un motivo para rechazar la solicitud',
      })
      return
    }

    try {
      await updateMutation.mutateAsync({
        id: selectedSolicitud.id,
        dto: {
          estado: EstadoSolicitud.RECHAZADA,
          observaciones: observaciones.trim(),
        },
      })
      setShowRechazarDialog(false)
      setSelectedSolicitud(null)
      setObservaciones('')
      toast.success('Solicitud rechazada', {
        description: 'La solicitud ha sido rechazada exitosamente',
      })
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error al rechazar la solicitud'
      toast.error('Error al rechazar la solicitud', {
        description: errorMessage,
      })
    }
  }

  const handleVerDetalles = (solicitud: SolicitudCredencial) => {
    setSelectedSolicitud(solicitud)
    setObservaciones(solicitud.observaciones || '')
    setShowDetailDialog(true)
  }

  const handleAbrirAprobar = (solicitud: SolicitudCredencial) => {
    setSelectedSolicitud(solicitud)
    setObservaciones('')
    setShowAprobarDialog(true)
  }

  const handleAbrirRechazar = (solicitud: SolicitudCredencial) => {
    setSelectedSolicitud(solicitud)
    setObservaciones('')
    setShowRechazarDialog(true)
  }

  const handleCrearCredencialDesdeSolicitud = (solicitud: SolicitudCredencial) => {
    setCredencialFromSolicitud(solicitud)
    setShowCrearCredencialDialog(true)
  }

  const handleCredencialCreated = async (
    credencial: CredencialMinisterial | CredencialCapellania
  ) => {
    if (!credencialFromSolicitud) return

    try {
      // Asociar credencial a la solicitud y completarla
      const credencialId =
        credencialFromSolicitud.tipo === TipoCredencial.MINISTERIAL
          ? (credencial as CredencialMinisterial).id
          : (credencial as CredencialCapellania).id

      await updateMutation.mutateAsync({
        id: credencialFromSolicitud.id,
        dto: {
          estado: EstadoSolicitud.COMPLETADA,
          ...(credencialFromSolicitud.tipo === TipoCredencial.MINISTERIAL
            ? { credencialMinisterialId: credencialId }
            : { credencialCapellaniaId: credencialId }),
        },
      })

      setShowCrearCredencialDialog(false)
      setCredencialFromSolicitud(null)
      toast.success('Credencial creada y asociada', {
        description: 'La credencial ha sido creada y la solicitud completada',
      })
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error al asociar la credencial'
      toast.error('Error al asociar la credencial', {
        description: errorMessage,
      })
    }
  }

  const getEstadoIcon = (estado: EstadoSolicitud) => {
    switch (estado) {
      case EstadoSolicitud.PENDIENTE:
        return Clock
      case EstadoSolicitud.APROBADA:
        return CheckCircle2
      case EstadoSolicitud.RECHAZADA:
        return XCircle
      case EstadoSolicitud.COMPLETADA:
        return CheckCircle2
      default:
        return AlertCircle
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Solicitudes de Credenciales</h1>
          <p className="text-muted-foreground">
            Gestiona las solicitudes de credenciales ministeriales y de capellanía
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pendientes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.aprobadas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rechazadas</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rechazadas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.completadas}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, apellido, DNI o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={estadoFilter} onValueChange={(value) => setEstadoFilter(value as EstadoSolicitud | 'todos')}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value={EstadoSolicitud.PENDIENTE}>Pendiente</SelectItem>
                <SelectItem value={EstadoSolicitud.APROBADA}>Aprobada</SelectItem>
                <SelectItem value={EstadoSolicitud.RECHAZADA}>Rechazada</SelectItem>
                <SelectItem value={EstadoSolicitud.COMPLETADA}>Completada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tipoFilter} onValueChange={(value) => setTipoFilter(value as TipoCredencial | 'todos')}>
              <SelectTrigger className="w-[180px]">
                <CreditCard className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value={TipoCredencial.MINISTERIAL}>Ministerial</SelectItem>
                <SelectItem value={TipoCredencial.CAPELLANIA}>Capellanía</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes</CardTitle>
          <CardDescription>
            {filteredSolicitudes.length} solicitud(es) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              Error al cargar las solicitudes. Por favor, intenta nuevamente.
            </div>
          ) : filteredSolicitudes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron solicitudes
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSolicitudes.map((solicitud) => {
                const EstadoIcon = getEstadoIcon(solicitud.estado)
                return (
                  <Card key={solicitud.id} data-solicitud-id={solicitud.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className={ESTADO_COLORS[solicitud.estado]}
                            >
                              <EstadoIcon className="mr-1 h-3 w-3" />
                              {ESTADO_LABELS[solicitud.estado]}
                            </Badge>
                            <Badge variant="outline">
                              {TIPO_LABELS[solicitud.tipo]}
                            </Badge>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {solicitud.nombre} {solicitud.apellido}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              DNI: {solicitud.dni} | Email: {solicitud.invitado.email}
                            </p>
                            {solicitud.nacionalidad && (
                              <p className="text-sm text-muted-foreground">
                                Nacionalidad: {solicitud.nacionalidad}
                              </p>
                            )}
                            {solicitud.motivo && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Motivo: {solicitud.motivo}
                              </p>
                            )}
                            {solicitud.observaciones && (
                              <div className="mt-2 p-2 bg-muted rounded-md">
                                <p className="text-sm font-medium">Observaciones:</p>
                                <p className="text-sm text-muted-foreground">
                                  {solicitud.observaciones}
                                </p>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Solicitada el:{' '}
                              {format(new Date(solicitud.createdAt), 'PPp', { locale: es })}
                            </p>
                            {solicitud.credencialMinisterial && (
                              <p className="text-xs text-emerald-600 mt-1">
                                ✓ Credencial ministerial creada
                              </p>
                            )}
                            {solicitud.credencialCapellania && (
                              <p className="text-xs text-emerald-600 mt-1">
                                ✓ Credencial de capellanía creada
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerDetalles(solicitud)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </Button>
                          {solicitud.estado === EstadoSolicitud.PENDIENTE && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleAbrirAprobar(solicitud)}
                                className="bg-emerald-600 hover:bg-emerald-700"
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Aprobar
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleAbrirRechazar(solicitud)}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Rechazar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCrearCredencialDesdeSolicitud(solicitud)}
                                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Crear Credencial
                              </Button>
                            </>
                          )}
                          {solicitud.estado === EstadoSolicitud.APROBADA && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCrearCredencialDesdeSolicitud(solicitud)}
                              className="border-blue-500 text-blue-600 hover:bg-blue-50"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Crear Credencial
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {paginationMeta && paginationMeta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Página {page} de {paginationMeta.totalPages} ({paginationMeta.total} total)
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
                  onClick={() => setPage((p) => Math.min(paginationMeta.totalPages, p + 1))}
                  disabled={page === paginationMeta.totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Solicitud</DialogTitle>
            <DialogDescription>
              Información completa de la solicitud de credencial
            </DialogDescription>
          </DialogHeader>
          {selectedSolicitud && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Estado</Label>
                  <Badge
                    variant="outline"
                    className={ESTADO_COLORS[selectedSolicitud.estado]}
                  >
                    {ESTADO_LABELS[selectedSolicitud.estado]}
                  </Badge>
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Badge variant="outline">{TIPO_LABELS[selectedSolicitud.tipo]}</Badge>
                </div>
                <div>
                  <Label>Nombre</Label>
                  <p className="text-sm">{selectedSolicitud.nombre}</p>
                </div>
                <div>
                  <Label>Apellido</Label>
                  <p className="text-sm">{selectedSolicitud.apellido}</p>
                </div>
                <div>
                  <Label>DNI</Label>
                  <p className="text-sm">{selectedSolicitud.dni}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm">{selectedSolicitud.invitado.email}</p>
                </div>
                {selectedSolicitud.nacionalidad && (
                  <div>
                    <Label>Nacionalidad</Label>
                    <p className="text-sm">{selectedSolicitud.nacionalidad}</p>
                  </div>
                )}
                {selectedSolicitud.fechaNacimiento && (
                  <div>
                    <Label>Fecha de Nacimiento</Label>
                    <p className="text-sm">
                      {format(new Date(selectedSolicitud.fechaNacimiento), 'PP', { locale: es })}
                    </p>
                  </div>
                )}
                <div className="col-span-2">
                  <Label>Motivo</Label>
                  <p className="text-sm">{selectedSolicitud.motivo || 'No especificado'}</p>
                </div>
                {selectedSolicitud.observaciones && (
                  <div className="col-span-2">
                    <Label>Observaciones</Label>
                    <p className="text-sm">{selectedSolicitud.observaciones}</p>
                  </div>
                )}
                <div>
                  <Label>Fecha de Solicitud</Label>
                  <p className="text-sm">
                    {format(new Date(selectedSolicitud.createdAt), 'PPp', { locale: es })}
                  </p>
                </div>
                {selectedSolicitud.aprobadaAt && (
                  <div>
                    <Label>Fecha de Aprobación</Label>
                    <p className="text-sm">
                      {format(new Date(selectedSolicitud.aprobadaAt), 'PPp', { locale: es })}
                    </p>
                  </div>
                )}
                {selectedSolicitud.completadaAt && (
                  <div>
                    <Label>Fecha de Completación</Label>
                    <p className="text-sm">
                      {format(new Date(selectedSolicitud.completadaAt), 'PPp', { locale: es })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Aprobar Dialog */}
      <AlertDialog open={showAprobarDialog} onOpenChange={setShowAprobarDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Aprobar esta solicitud?</AlertDialogTitle>
            <AlertDialogDescription>
              La solicitud será marcada como aprobada. Puedes agregar observaciones opcionales.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="observaciones-aprobar">Observaciones (opcional)</Label>
              <Textarea
                id="observaciones-aprobar"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Agrega observaciones sobre la aprobación..."
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setObservaciones('')}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAprobar}
              disabled={updateMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {updateMutation.isPending ? 'Aprobando...' : 'Aprobar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rechazar Dialog */}
      <AlertDialog open={showRechazarDialog} onOpenChange={setShowRechazarDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Rechazar esta solicitud?</AlertDialogTitle>
            <AlertDialogDescription>
              La solicitud será marcada como rechazada. Debes proporcionar un motivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="observaciones-rechazar">Motivo del rechazo *</Label>
              <Textarea
                id="observaciones-rechazar"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Explica el motivo del rechazo..."
                rows={3}
                required
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setObservaciones('')}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRechazar}
              disabled={updateMutation.isPending || !observaciones.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {updateMutation.isPending ? 'Rechazando...' : 'Rechazar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Crear Credencial Dialog - Ministerial */}
      {credencialFromSolicitud?.tipo === TipoCredencial.MINISTERIAL && (
        <CredencialEditorDialog
          open={showCrearCredencialDialog}
          onOpenChange={(open) => {
            setShowCrearCredencialDialog(open)
            if (!open) {
              setCredencialFromSolicitud(null)
            }
          }}
          credencial={null}
          solicitud={
            credencialFromSolicitud
              ? {
                  nombre: credencialFromSolicitud.nombre,
                  apellido: credencialFromSolicitud.apellido,
                  dni: credencialFromSolicitud.dni,
                  nacionalidad: credencialFromSolicitud.nacionalidad || undefined,
                  fechaNacimiento: credencialFromSolicitud.fechaNacimiento || undefined,
                  invitadoId: credencialFromSolicitud.invitadoId,
                }
              : null
          }
          editMode="frente"
          onCredencialCreated={async (credencial) => {
            await handleCredencialCreated(credencial)
          }}
        />
      )}

      {/* Crear Credencial Dialog - Capellanía */}
      {credencialFromSolicitud?.tipo === TipoCredencial.CAPELLANIA && (
        <CredencialCapellaniaEditorDialog
          open={showCrearCredencialDialog}
          onOpenChange={(open) => {
            setShowCrearCredencialDialog(open)
            if (!open) {
              setCredencialFromSolicitud(null)
            }
          }}
          credencial={null}
          solicitud={
            credencialFromSolicitud
              ? {
                  nombre: credencialFromSolicitud.nombre,
                  apellido: credencialFromSolicitud.apellido,
                  dni: credencialFromSolicitud.dni,
                  nacionalidad: credencialFromSolicitud.nacionalidad || undefined,
                  fechaNacimiento: credencialFromSolicitud.fechaNacimiento || undefined,
                  invitadoId: credencialFromSolicitud.invitadoId,
                }
              : null
          }
          editMode="frente"
          onCredencialCreated={async (credencial) => {
            await handleCredencialCreated(credencial)
          }}
        />
      )}
    </div>
  )
}

