'use client'

import { useState, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  useInscripciones,
  useCreateInscripcion,
  useCancelarInscripcion,
  useRehabilitarInscripcion,
  useReporteIngresos,
  useEnviarRecordatorios,
  useUpdateInscripcion,
} from '@/lib/hooks/use-inscripciones'
import { useCreatePago, useUpdatePago } from '@/lib/hooks/use-pagos'
import { type Inscripcion } from '@/lib/api/inscripciones'
import { useConvenciones } from '@/lib/hooks/use-convencion'
import { useSmartSync, useSmartPolling } from '@/lib/hooks/use-smart-sync'
import { inscripcionesApi } from '@/lib/api/inscripciones'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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
} from '@/components/ui/alert-dialog'
import {
  UserCheck,
  Mail,
  Bell,
  TrendingUp,
  XCircle,
  BarChart3,
  AlertTriangle,
  Loader2,
  Pencil,
  Save,
  Star,
  DollarSign,
} from 'lucide-react'
import { ScrollReveal } from '@/components/scroll-reveal'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { InscripcionPagoWizard } from '@/components/admin/inscripcion-pago-wizard'
import { EditarInscripcionDialog } from '@/components/admin/editar-inscripcion-dialog'
import { PagoWizard } from '@/components/admin/pago-wizard'
import {
  InscripcionesHeader,
  InscripcionesStats,
  InscripcionesFilters,
  InscripcionesActions,
  InscripcionCard,
  InscripcionesEmptyState,
} from '@/components/admin/inscripciones'
import { getPagosInfo } from '@/lib/hooks/use-inscripcion-utils'
import { useInscripcionesStats } from '@/lib/hooks/use-inscripciones-stats'

export default function InscripcionesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('todos')
  const [convencionFilter, setConvencionFilter] = useState('todos')
  const [pagoCompletoFilter, setPagoCompletoFilter] = useState('todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)

  // Debounce para búsqueda
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const [selectedInscripcion, setSelectedInscripcion] = useState<any>(null)
  const [selectedPago, setSelectedPago] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [inscripcionParaEditar, setInscripcionParaEditar] = useState<any>(null)
  const inscripcionCardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Estados para diálogos
  const [showNuevaInscripcionDialog, setShowNuevaInscripcionDialog] = useState(false)
  const [showEditarInscripcionDialog, setShowEditarInscripcionDialog] = useState(false)
  const [showReporteDialog, setShowReporteDialog] = useState(false)
  const [showRecordatoriosDialog, setShowRecordatoriosDialog] = useState(false)
  const [showCancelarDialog, setShowCancelarDialog] = useState(false)
  const [inscripcionACancelar, setInscripcionACancelar] = useState<any>(null)
  const [motivoCancelacion, setMotivoCancelacion] = useState('')
  const [resultadoRecordatorios, setResultadoRecordatorios] = useState<any>(null)
  const [showEditarDialog, setShowEditarDialog] = useState(false)
  const [inscripcionAEditar, setInscripcionAEditar] = useState<any>(null)
  const [editarForm, setEditarForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    sede: '',
    tipoInscripcion: '',
    notas: '',
  })

  // Sincronización inteligente
  useSmartSync()
  useSmartPolling(['inscripciones', String(currentPage), String(pageSize)], 30000)

  const queryClient = useQueryClient()
  const { data: convenciones = [] } = useConvenciones()

  // Obtener convencionId del filtro de convención
  const convencionSeleccionada = convenciones.find((c: any) => c.titulo === convencionFilter)

  // Construir filtros para el servidor
  const filters: {
    search?: string
    estado?: 'todos' | 'pendiente' | 'confirmado' | 'cancelado'
    origen?: 'todos' | 'web' | 'dashboard' | 'mobile'
    convencionId?: string
  } = {
    search: debouncedSearchTerm || undefined,
    estado:
      estadoFilter !== 'todos'
        ? (estadoFilter as 'pendiente' | 'confirmado' | 'cancelado')
        : undefined,
    convencionId: convencionSeleccionada?.id || undefined,
  }

  const { data: inscripcionesResponse, isLoading } = useInscripciones(
    currentPage,
    pageSize,
    filters
  )

  type InscripcionesResponse = Inscripcion[] | { data: Inscripcion[]; meta?: any } | undefined
  const response = inscripcionesResponse as InscripcionesResponse
  const inscripciones = Array.isArray(response) ? response : response?.data || []

  const { data: reporteIngresos } = useReporteIngresos()
  const createPagoMutation = useCreatePago()
  const updatePagoMutation = useUpdatePago()
  const createInscripcionMutation = useCreateInscripcion()
  const cancelarInscripcionMutation = useCancelarInscripcion()
  const rehabilitarInscripcionMutation = useRehabilitarInscripcion()
  const enviarRecordatoriosMutation = useEnviarRecordatorios()
  const updateInscripcionMutation = useUpdateInscripcion()

  // Obtener lista única de convenciones
  const convencionesUnicas = Array.from(
    new Set(inscripciones.map((insc: any) => insc.convencion?.titulo).filter(Boolean))
  )

  // Filtrar inscripciones por pago completo (filtro en cliente)
  const filteredInscripciones = inscripciones.filter((insc: any) => {
    const pagosInfo = getPagosInfo(insc, convenciones.find((c: any) => c.id === insc.convencionId))
    const matchPagoCompleto =
      pagoCompletoFilter === 'todos' ||
      (pagoCompletoFilter === 'completo' && pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas) ||
      (pagoCompletoFilter === 'pendiente' && pagosInfo.cuotasPagadas < pagosInfo.numeroCuotas)

    return matchPagoCompleto
  })

  // Calcular estadísticas usando hook
  const estadisticas = useInscripcionesStats(inscripciones, convenciones)

  // Funciones de manejo
  const handleOpenDialog = (inscripcion: any, pago?: any) => {
    if (!pago && inscripcion.numeroCuota) {
      const pagosInfo = getPagosInfo(
        inscripcion,
        convenciones.find((c: any) => c.id === inscripcion.convencionId)
      )
      const cuota = pagosInfo.cuotas.find((c: any) => c.numero === inscripcion.numeroCuota)

      if (cuota?.pago && cuota.estado === 'PENDIENTE') {
        toast.warning('Esta cuota ya tiene un pago pendiente', {
          description: 'Espera a que se confirme el pago antes de crear uno nuevo',
        })
        return
      }
    }

    setSelectedInscripcion(inscripcion)
    setSelectedPago(pago)
    setDialogOpen(true)
  }

  const handleQuickPagoUpdate = async (data: {
    metodoPago: string
    referencia?: string
    comprobanteUrl?: string
    notas?: string
    validarAutomaticamente?: boolean
  }) => {
    if (!selectedInscripcion) return

    try {
      if (selectedPago?.id) {
        await updatePagoMutation.mutateAsync({
          id: selectedPago.id,
          data: {
            metodoPago: data.metodoPago,
            referencia: data.referencia,
            comprobanteUrl: data.comprobanteUrl,
            notas: data.notas,
            estado: data.validarAutomaticamente ? 'COMPLETADO' : 'PENDIENTE',
          },
        })

        if (data.validarAutomaticamente) {
          toast.success('✅ Pago actualizado y validado automáticamente')
        } else {
          toast.success('Pago actualizado exitosamente')
        }
      } else {
        const pagosInfo = getPagosInfo(
          selectedInscripcion,
          convenciones.find((c: any) => c.id === selectedInscripcion.convencionId)
        )
        const cuota = pagosInfo.cuotas.find(
          (c: any) => c.numero === selectedInscripcion.numeroCuota
        )

        if (cuota?.pago) {
          toast.error('Esta cuota ya tiene un pago asociado')
          return
        }

        const montoPorCuota = pagosInfo.montoPorCuota
        await createPagoMutation.mutateAsync({
          inscripcionId: selectedInscripcion.id,
          numeroCuota: selectedInscripcion.numeroCuota,
          monto: String(montoPorCuota),
          metodoPago: data.metodoPago,
          referencia: data.referencia,
          comprobanteUrl: data.comprobanteUrl,
          notas: data.notas,
          estado: data.validarAutomaticamente ? 'COMPLETADO' : 'PENDIENTE',
        })

        if (data.validarAutomaticamente) {
          toast.success('✅ Pago creado y validado automáticamente')
        } else {
          toast.success('Pago creado exitosamente')
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['inscripciones'] })
      await queryClient.invalidateQueries({ queryKey: ['pagos'] })
      await queryClient.refetchQueries({
        queryKey: ['inscripciones', currentPage, pageSize, filters],
      })
    } catch (error: any) {
      console.error('Error al actualizar/crear pago:', error)
      throw error
    }
  }

  const abrirEditarInscripcion = async (insc: any) => {
    try {
      const inscripcionCompleta = await inscripcionesApi.getById(insc.id)
      setInscripcionParaEditar(inscripcionCompleta)
      setShowEditarInscripcionDialog(true)
    } catch (error) {
      console.error('Error al cargar inscripción:', error)
      toast.error('Error al cargar los datos de la inscripción')
    }
  }

  const handleCancelarInscripcion = async () => {
    if (!inscripcionACancelar) return

    try {
      await cancelarInscripcionMutation.mutateAsync({
        id: inscripcionACancelar.id,
        motivo: motivoCancelacion || undefined,
      })
      toast.success('Inscripción cancelada exitosamente')
      setShowCancelarDialog(false)
      setInscripcionACancelar(null)
      setMotivoCancelacion('')
    } catch (error: any) {
      toast.error('Error al cancelar inscripción', {
        description: error.response?.data?.message || error.message || 'Error desconocido',
      })
    }
  }

  const handleEnviarRecordatorios = async () => {
    try {
      // Obtener convencionId del filtro si está seleccionado
      const convencionId = convencionSeleccionada?.id || undefined
      
      const resultado = await enviarRecordatoriosMutation.mutateAsync(convencionId)
      setResultadoRecordatorios(resultado)
      
      // El toast ya se muestra en el hook, no duplicar
      // Solo actualizar el estado para mostrar el resultado
    } catch (error: unknown) {
      // El error ya se maneja en el hook, pero asegurarnos de resetear el estado
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.error('[InscripcionesPage] Error al enviar recordatorios:', errorMessage)
      
      // No mostrar toast duplicado, el hook ya lo maneja
      // Pero asegurarnos de que el estado se resetee si hay error
      setResultadoRecordatorios(null)
    }
  }

  const handleExportInscripciones = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const convencionActiva = convenciones.find((c: any) => c.activa) || convenciones[0]
    const fechaExport = format(new Date(), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Lista de Inscripciones - ${convencionActiva?.titulo || 'Convención'}</title>
          <style>
            @media print {
              @page { margin: 1cm; }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #f59e0b;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #f59e0b;
              margin: 0;
              font-size: 24px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f59e0b;
              color: white;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Lista de Inscripciones</h1>
            <p>${convencionActiva?.titulo || 'Convención'}</p>
            <p>Exportado el ${fechaExport}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              ${filteredInscripciones
                .map(
                  (insc: any) => `
                <tr>
                  <td>${insc.nombre} ${insc.apellido}</td>
                  <td>${insc.email}</td>
                  <td>${insc.telefono || '-'}</td>
                  <td>${insc.estado}</td>
                  <td>${format(new Date(insc.fechaInscripcion), 'dd/MM/yyyy', { locale: es })}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.print()
    toast.success('Lista exportada exitosamente')
  }

  const handleGuardarEdicion = async () => {
    if (!inscripcionAEditar) return

    try {
      const dataToUpdate: any = {}
      if (editarForm.nombre?.trim()) dataToUpdate.nombre = editarForm.nombre.trim()
      if (editarForm.apellido?.trim()) dataToUpdate.apellido = editarForm.apellido.trim()
      if (editarForm.email?.trim())
        dataToUpdate.email = editarForm.email.trim().toLowerCase()
      if (editarForm.telefono?.trim().length >= 8) {
        dataToUpdate.telefono = editarForm.telefono.trim()
      } else if (editarForm.telefono === '') {
        dataToUpdate.telefono = null
      }
      if (editarForm.sede !== undefined) dataToUpdate.sede = editarForm.sede.trim() || null
      if (editarForm.tipoInscripcion?.trim())
        dataToUpdate.tipoInscripcion = editarForm.tipoInscripcion.trim()
      if (editarForm.notas !== undefined) dataToUpdate.notas = editarForm.notas.trim() || null

      await updateInscripcionMutation.mutateAsync({
        id: inscripcionAEditar.id,
        data: dataToUpdate,
      })

      toast.success('Inscripción actualizada exitosamente')
      setShowEditarDialog(false)
      setInscripcionAEditar(null)
      setEditarForm({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        sede: '',
        tipoInscripcion: '',
        notas: '',
      })
    } catch (error: any) {
      toast.error('Error al actualizar inscripción', {
        description: error.response?.data?.message || error.message || 'Error desconocido',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <InscripcionesHeader />

      <InscripcionesStats
        total={estadisticas.total}
        nuevas={estadisticas.nuevas}
        hoy={estadisticas.hoy}
        confirmadas={estadisticas.confirmadas}
      />

      <ScrollReveal>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="size-5 text-amber-600 dark:text-amber-400" />
                  Inscripciones
                </CardTitle>
                <CardDescription>
                  {filteredInscripciones.length} inscripción(es) encontrada(s)
                </CardDescription>
              </div>
              <InscripcionesActions
                onNuevaInscripcion={() => setShowNuevaInscripcionDialog(true)}
                onRecordatorios={() => setShowRecordatoriosDialog(true)}
                onReporte={() => setShowReporteDialog(true)}
                onExport={handleExportInscripciones}
              />
            </div>
          </CardHeader>
          <CardContent>
            <InscripcionesFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              estadoFilter={estadoFilter}
              onEstadoFilterChange={setEstadoFilter}
              convencionFilter={convencionFilter}
              onConvencionFilterChange={setConvencionFilter}
              pagoCompletoFilter={pagoCompletoFilter}
              onPagoCompletoFilterChange={setPagoCompletoFilter}
              convencionesUnicas={convencionesUnicas}
            />

            <div className="space-y-4">
              {filteredInscripciones.length === 0 ? (
                <InscripcionesEmptyState hasInscripciones={inscripciones.length > 0} />
              ) : (
                filteredInscripciones.map((insc: any) => (
                  <InscripcionCard
                    key={insc.id}
                    inscripcion={insc}
                    convencion={convenciones.find((c: any) => c.id === insc.convencionId)}
                    onEditar={abrirEditarInscripcion}
                    onCancelar={(inscripcion) => {
                      setInscripcionACancelar(inscripcion)
                      setMotivoCancelacion('')
                      setShowCancelarDialog(true)
                    }}
                    onRehabilitar={async (id) => {
                      try {
                        await rehabilitarInscripcionMutation.mutateAsync(id)
                        toast.success('Inscripción rehabilitada exitosamente', {
                          description: 'La inscripción ha vuelto al estado pendiente',
                        })
                      } catch (error: any) {
                        toast.error('Error al rehabilitar inscripción', {
                          description:
                            error.response?.data?.message ||
                            error.message ||
                            'Error desconocido',
                        })
                      }
                    }}
                    onCrearPago={handleOpenDialog}
                    isRehabilitando={rehabilitarInscripcionMutation.isPending}
                    cardRefs={inscripcionCardRefs}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Dialog rápido para crear/actualizar pago */}
      {selectedInscripcion && (
        <PagoWizard
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          inscripcion={{
            id: selectedInscripcion.id,
            nombre: selectedInscripcion.nombre,
            apellido: selectedInscripcion.apellido,
            numeroCuota: selectedInscripcion.numeroCuota,
            codigoReferencia: selectedInscripcion.codigoReferencia,
            origenRegistro: selectedInscripcion.origenRegistro,
          }}
          monto={getPagosInfo(
            selectedInscripcion,
            convenciones.find((c: any) => c.id === selectedInscripcion.convencionId)
          ).montoPorCuota}
          pagoExistente={selectedPago}
          onUpdate={handleQuickPagoUpdate}
          isUpdating={createPagoMutation.isPending || updatePagoMutation.isPending}
        />
      )}

      {/* Diálogo para editar solo información de inscripción */}
      {inscripcionParaEditar && (
        <EditarInscripcionDialog
          open={showEditarInscripcionDialog}
          onOpenChange={open => {
            setShowEditarInscripcionDialog(open)
            if (!open) {
              setInscripcionParaEditar(null)
            }
          }}
          inscripcion={inscripcionParaEditar}
          onUpdate={async (id, data) => {
            const actualizada = await updateInscripcionMutation.mutateAsync({ id, data })
            await queryClient.invalidateQueries({ queryKey: ['inscripciones'] })
            const inscripcionCompleta = await inscripcionesApi.getById(id)
            setInscripcionParaEditar(inscripcionCompleta)
            return inscripcionCompleta
          }}
          isUpdating={updateInscripcionMutation.isPending}
        />
      )}

      {/* Wizard unificado para crear inscripción + pagos */}
      <InscripcionPagoWizard
        open={showNuevaInscripcionDialog}
        onOpenChange={open => {
          setShowNuevaInscripcionDialog(open)
          if (!open) {
            setInscripcionParaEditar(null)
          }
        }}
        convenciones={convenciones}
        inscripcionExistente={inscripcionParaEditar}
        onCreateInscripcion={async data => {
          const nuevaInscripcion = await createInscripcionMutation.mutateAsync(data)
          await queryClient.invalidateQueries({ queryKey: ['inscripciones'] })
          const inscripcionCompleta = await inscripcionesApi.getById(nuevaInscripcion.id)
          return inscripcionCompleta
        }}
        onUpdateInscripcion={async (id, data) => {
          const actualizada = await updateInscripcionMutation.mutateAsync({ id, data })
          await queryClient.invalidateQueries({ queryKey: ['inscripciones'] })
          const inscripcionCompleta = await inscripcionesApi.getById(id)
          return inscripcionCompleta
        }}
        onCreatePago={async data => {
          const nuevoPago = await createPagoMutation.mutateAsync(data)
          await queryClient.invalidateQueries({ queryKey: ['inscripciones'] })
          await queryClient.invalidateQueries({ queryKey: ['pagos'] })
          if (inscripcionParaEditar?.id) {
            await new Promise(resolve => setTimeout(resolve, 300))
            const inscripcionCompleta = await inscripcionesApi.getById(inscripcionParaEditar.id)
            setInscripcionParaEditar(inscripcionCompleta)
          }
          return nuevoPago
        }}
        onUpdatePago={async (id, data) => {
          const actualizado = await updatePagoMutation.mutateAsync({ id, data })
          await queryClient.invalidateQueries({ queryKey: ['inscripciones'] })
          await queryClient.invalidateQueries({ queryKey: ['pagos'] })
          if (inscripcionParaEditar?.id) {
            await new Promise(resolve => setTimeout(resolve, 300))
            const inscripcionCompleta = await inscripcionesApi.getById(inscripcionParaEditar.id)
            setInscripcionParaEditar(inscripcionCompleta)
          }
          return actualizado
        }}
        isCreating={createInscripcionMutation.isPending || createPagoMutation.isPending}
      />

      {/* Dialog: Reporte de Ingresos */}
      <Dialog open={showReporteDialog} onOpenChange={setShowReporteDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="size-5 text-blue-500" />
              Reporte de Ingresos
            </DialogTitle>
            <DialogDescription>Resumen financiero de inscripciones y pagos</DialogDescription>
          </DialogHeader>

          {reporteIngresos ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center">
                  <TrendingUp className="size-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Recaudado</p>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                    ${reporteIngresos.totalRecaudado.toLocaleString('es-AR')}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center">
                  <DollarSign className="size-8 text-amber-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Pendiente</p>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                    ${reporteIngresos.totalPendiente.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progreso de cobro</span>
                  <span>
                    {Math.round(
                      (reporteIngresos.totalRecaudado /
                        (reporteIngresos.totalRecaudado + reporteIngresos.totalPendiente)) *
                        100
                    ) || 0}
                    %
                  </span>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                    style={{
                      width: `${(reporteIngresos.totalRecaudado / (reporteIngresos.totalRecaudado + reporteIngresos.totalPendiente)) * 100 || 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Detalle por Cuota</h4>
                {reporteIngresos.detallesPorCuota.map((cuota: any) => (
                  <div
                    key={cuota.cuota}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <span className="font-medium">Cuota {cuota.cuota}</span>
                    <div className="text-right text-sm">
                      <p className="text-emerald-600">
                        ${cuota.recaudado.toLocaleString('es-AR')} cobrado
                      </p>
                      <p className="text-amber-600">
                        ${cuota.pendiente.toLocaleString('es-AR')} pendiente
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold">{reporteIngresos.totalInscripciones}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">
                    {reporteIngresos.inscripcionesConfirmadas}
                  </p>
                  <p className="text-xs text-muted-foreground">Confirmadas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">
                    {reporteIngresos.inscripcionesPendientes}
                  </p>
                  <p className="text-xs text-muted-foreground">Pendientes</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReporteDialog(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Recordatorios de Pago */}
      <Dialog
        open={showRecordatoriosDialog}
        onOpenChange={open => {
          setShowRecordatoriosDialog(open)
          if (!open) setResultadoRecordatorios(null)
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="size-5 text-amber-500" />
              Enviar Recordatorios de Pago
            </DialogTitle>
            <DialogDescription>
              Envía un email de recordatorio a todos los inscritos con pagos pendientes
            </DialogDescription>
          </DialogHeader>

          {!resultadoRecordatorios ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="size-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">Importante</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Se enviará un email a todos los inscritos con cuotas pendientes.
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRecordatoriosDialog(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleEnviarRecordatorios}
                  disabled={enviarRecordatoriosMutation.isPending}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  {enviarRecordatoriosMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="size-4 mr-2" />
                      Enviar Recordatorios
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-emerald-600">
                      {resultadoRecordatorios.enviados}
                    </p>
                    <p className="text-sm text-muted-foreground">Enviados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-600">
                      {resultadoRecordatorios.fallidos}
                    </p>
                    <p className="text-sm text-muted-foreground">Fallidos</p>
                  </div>
                </div>
              </div>
              {resultadoRecordatorios.detalles.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {resultadoRecordatorios.detalles.map((det: any, i: number) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg text-sm flex items-center justify-between ${det.exito ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}
                    >
                      <span className="font-medium">{det.nombre}</span>
                      <span className={det.exito ? 'text-emerald-600' : 'text-red-600'}>
                        {det.exito ? '✓ Enviado' : '✗ Error'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <DialogFooter>
                <Button
                  onClick={() => {
                    setShowRecordatoriosDialog(false)
                    setResultadoRecordatorios(null)
                  }}
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Alert Dialog: Cancelar Inscripción */}
      <AlertDialog open={showCancelarDialog} onOpenChange={setShowCancelarDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="size-5" />
              Cancelar Inscripción
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  ¿Estás seguro de que quieres cancelar la inscripción de{' '}
                  <strong>
                    {inscripcionACancelar?.nombre} {inscripcionACancelar?.apellido}
                  </strong>
                  ?
                </p>
                <p className="text-red-600 font-medium">
                  Esta acción cancelará todos los pagos pendientes y notificará al usuario por
                  email.
                </p>
                <div className="pt-2">
                  <Label htmlFor="motivo-cancelacion">Motivo de cancelación (opcional)</Label>
                  <Input
                    id="motivo-cancelacion"
                    placeholder="Ej: Solicitud del usuario..."
                    value={motivoCancelacion}
                    onChange={e => setMotivoCancelacion(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setInscripcionACancelar(null)
                setMotivoCancelacion('')
              }}
            >
              Volver
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelarInscripcion}
              disabled={cancelarInscripcionMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelarInscripcionMutation.isPending ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Cancelando...
                </>
              ) : (
                'Sí, cancelar inscripción'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog: Editar Inscripción (legacy - mantener por compatibilidad) */}
      <Dialog open={showEditarDialog} onOpenChange={setShowEditarDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="size-5 text-blue-500" />
              Editar Inscripción
            </DialogTitle>
            <DialogDescription>Modifica los datos de la inscripción</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nombre">Nombre</Label>
                <Input
                  id="edit-nombre"
                  value={editarForm.nombre}
                  onChange={e => setEditarForm({ ...editarForm, nombre: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-apellido">Apellido</Label>
                <Input
                  id="edit-apellido"
                  value={editarForm.apellido}
                  onChange={e => setEditarForm({ ...editarForm, apellido: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Correo Electrónico</Label>
              <Input
                id="edit-email"
                type="email"
                value={editarForm.email}
                onChange={e => setEditarForm({ ...editarForm, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-telefono">Teléfono</Label>
              <Input
                id="edit-telefono"
                value={editarForm.telefono}
                onChange={e => setEditarForm({ ...editarForm, telefono: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-sede">Iglesia / Sede</Label>
              <Input
                id="edit-sede"
                value={editarForm.sede}
                onChange={e => setEditarForm({ ...editarForm, sede: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Inscripción</Label>
              <Select
                value={editarForm.tipoInscripcion}
                onValueChange={value => setEditarForm({ ...editarForm, tipoInscripcion: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invitado">
                    <div className="flex items-center gap-2">
                      <Star className="size-3 text-yellow-500" />
                      Invitado
                    </div>
                  </SelectItem>
                  <SelectItem value="pastor">Pastor</SelectItem>
                  <SelectItem value="lider">Líder</SelectItem>
                  <SelectItem value="miembro">Miembro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notas">Notas</Label>
              <Input
                id="edit-notas"
                value={editarForm.notas}
                onChange={e => setEditarForm({ ...editarForm, notas: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditarDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleGuardarEdicion}
              disabled={updateInscripcionMutation.isPending}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              {updateInscripcionMutation.isPending ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="size-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

