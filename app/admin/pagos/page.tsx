'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import {
  usePagos,
  useUpdatePago,
  useRechazarPago,
  useRehabilitarPago,
  useValidarPagosMasivos,
} from '@/lib/hooks/use-pagos'
import { inscripcionesApi } from '@/lib/api/inscripciones'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ScrollReveal } from '@/components/scroll-reveal'
import { Smartphone, Globe, User, Search } from 'lucide-react'
import {
  PagosHeader,
  PagosFilters,
  PagosTableHeader,
  PagosTable,
  PagoValidarDialog,
  PagoRechazarDialog,
  PagoRehabilitarDialog,
} from '@/components/admin/pagos'

export default function PagosPage() {
  const searchParams = useSearchParams()
  const inscripcionIdFromUrl = searchParams.get('inscripcionId')

  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('todos')
  const [metodoPagoFilter, setMetodoPagoFilter] = useState('todos')
  const [origenFilter, setOrigenFilter] = useState('todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [inscripcionFiltrada, setInscripcionFiltrada] = useState<any>(null)

  // Debounce para búsqueda
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [estadoFilter, metodoPagoFilter, origenFilter, debouncedSearchTerm])

  // Cargar datos de la inscripción cuando se filtra por inscripciónId
  useEffect(() => {
    if (inscripcionIdFromUrl) {
      inscripcionesApi
        .getById(inscripcionIdFromUrl)
        .then(inscripcion => {
          setInscripcionFiltrada(inscripcion)
        })
        .catch(error => {
          console.error('Error cargando inscripción:', error)
          setInscripcionFiltrada(null)
        })
    } else {
      setInscripcionFiltrada(null)
    }
  }, [inscripcionIdFromUrl])

  // Construir filtros para el servidor
  const filters = {
    search: debouncedSearchTerm || undefined,
    estado: estadoFilter !== 'todos' ? (estadoFilter as any) : undefined,
    metodoPago: metodoPagoFilter !== 'todos' ? (metodoPagoFilter as any) : undefined,
    origen: origenFilter !== 'todos' ? (origenFilter as any) : undefined,
    inscripcionId: inscripcionIdFromUrl || undefined,
  }

  const { data: pagosResponse, isLoading, error } = usePagos(currentPage, pageSize, filters)

  // Debug: Log para ver qué está pasando
  useEffect(() => {
    if (error) {
      console.error('[PagosPage] Error al cargar pagos:', error)
    }
    if (pagosResponse) {
      console.log('[PagosPage] Respuesta recibida:', {
        isArray: Array.isArray(pagosResponse),
        hasData: !!pagosResponse?.data,
        dataLength: Array.isArray(pagosResponse)
          ? pagosResponse.length
          : pagosResponse?.data?.length,
        meta: pagosResponse?.meta,
        filters,
      })
    }
  }, [pagosResponse, error, filters])

  // Manejar respuesta paginada o array directo (compatibilidad)
  const pagos = Array.isArray(pagosResponse) ? pagosResponse : pagosResponse?.data || []
  const paginationMeta = Array.isArray(pagosResponse) ? null : pagosResponse?.meta
  const updatePagoMutation = useUpdatePago()
  const rechazarPagoMutation = useRechazarPago()
  const rehabilitarPagoMutation = useRehabilitarPago()
  const validarMasivosMutation = useValidarPagosMasivos()

  // Estado para selección masiva
  const [pagosSeleccionados, setPagosSeleccionados] = useState<Set<string>>(new Set())
  const [mostrarAdvertenciaMonto, setMostrarAdvertenciaMonto] = useState<string | null>(null)

  // Estado para diálogo de confirmación de validación
  const [pagoAValidar, setPagoAValidar] = useState<any>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Estado para diálogo de rechazo
  const [pagoARechazar, setPagoARechazar] = useState<any>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [motivoRechazo, setMotivoRechazo] = useState('')

  // Estado para diálogo de rehabilitación
  const [pagoAReabilitar, setPagoAReabilitar] = useState<any>(null)
  const [showRehabilitarDialog, setShowRehabilitarDialog] = useState(false)

  // Los filtros ahora se hacen en el servidor, así que usamos directamente los datos
  const filteredPagos = pagos

  // Funciones para selección masiva
  const toggleSeleccionarPago = (pagoId: string, pago: any) => {
    // Solo permitir seleccionar pagos en estado PENDIENTE
    if (pago.estado !== 'PENDIENTE') {
      if (pago.estado === 'CANCELADO') {
        toast.warning('Este pago está cancelado y no se puede validar')
      } else if (pago.estado === 'REEMBOLSADO') {
        toast.warning('Este pago está reembolsado y no se puede validar')
      } else if (pago.estado === 'COMPLETADO') {
        toast.info('Este pago ya está completado')
      }
      return
    }

    const nuevosSeleccionados = new Set(pagosSeleccionados)
    if (nuevosSeleccionados.has(pagoId)) {
      nuevosSeleccionados.delete(pagoId)
    } else {
      nuevosSeleccionados.add(pagoId)
    }
    setPagosSeleccionados(nuevosSeleccionados)
  }

  const toggleSeleccionarTodos = () => {
    // Solo seleccionar pagos en estado PENDIENTE
    const pagosSeleccionables = filteredPagos.filter((p: any) => p.estado === 'PENDIENTE')
    const todosLosIds = pagosSeleccionables.map((p: any) => p.id)

    // Verificar si todos los seleccionables ya están seleccionados
    const todosSeleccionados =
      todosLosIds.length > 0 && todosLosIds.every((id: string) => pagosSeleccionados.has(id))

    if (todosSeleccionados) {
      // Deseleccionar todos
      setPagosSeleccionados(new Set())
    } else {
      // Seleccionar solo los seleccionables
      setPagosSeleccionados(new Set(todosLosIds))
    }
  }

  const validarPagosSeleccionados = async () => {
    if (pagosSeleccionados.size === 0) {
      toast.warning('Por favor selecciona al menos un pago para validar')
      return
    }

    const ids = Array.from(pagosSeleccionados)
    const pagosAValidar = filteredPagos.filter((p: any) => ids.includes(p.id))

    // Verificar si hay pagos rechazados
    const pagosRechazados = pagosAValidar.filter((p: any) => p.estado === 'CANCELADO')
    if (pagosRechazados.length > 0) {
      toast.error(`⚠️ No puedes validar pagos rechazados`, {
        description: `Tienes ${pagosRechazados.length} pago(s) rechazado(s) seleccionado(s). Debes rehabilitarlos primero usando el botón "Rehabilitar" antes de poder validarlos.`,
        duration: 10000,
      })
      return
    }

    // Verificar si hay pagos que no estén pendientes
    const pagosNoPendientes = pagosAValidar.filter((p: any) => p.estado !== 'PENDIENTE')
    if (pagosNoPendientes.length > 0) {
      const estados = pagosNoPendientes.map((p: any) => p.estado).join(', ')
      toast.warning(
        `Solo se pueden validar pagos pendientes. Hay ${pagosNoPendientes.length} pago(s) con estado: ${estados}`
      )
      return
    }

    // Verificar que todos tengan comprobante si es requerido
    const pagosSinComprobante = pagosAValidar.filter((p: any) => {
      const requiereComprobante = p.metodoPago === 'transferencia' || p.metodoPago === 'mercadopago'
      return requiereComprobante && !p.comprobanteUrl
    })

    if (pagosSinComprobante.length > 0) {
      toast.warning(
        `Hay ${pagosSinComprobante.length} pago(s) que requieren comprobante. Por favor, agrega los comprobantes antes de validar.`
      )
      return
    }

    try {
      const resultado = await validarMasivosMutation.mutateAsync(ids)
      setPagosSeleccionados(new Set()) // Limpiar selección

      // Mostrar advertencias si las hay
      if (resultado.detalles && Array.isArray(resultado.detalles)) {
        const advertencias = resultado.detalles.filter((d: any) => d.advertencia)
        if (advertencias.length > 0) {
          setTimeout(() => {
            toast.info(`⚠️ ${advertencias.length} pago(s) tienen advertencias de monto`, {
              description: 'Revisa los detalles en la lista de pagos',
              duration: 8000,
            })
          }, 1000)
        }
      }
    } catch (error: any) {
      console.error('Error al validar pagos masivamente:', error)
      toast.error('Error al validar pagos masivamente', {
        description: error.response?.data?.message || error.message || 'Error desconocido',
      })
    }
  }

  // Función para exportar pagos a CSV
  const exportarPagosCSV = () => {
    const headers = [
      'Nombre',
      'Email',
      'Teléfono',
      'Código',
      'Cuota',
      'Monto',
      'Método',
      'Estado',
      'Origen',
      'Fecha',
    ]
    const rows = filteredPagos.map((pago: any) => {
      const inscripcion = pago.inscripcion
      const monto =
        typeof pago.monto === 'number' ? pago.monto : parseFloat(String(pago.monto || 0))
      return [
        `${inscripcion?.nombre || ''} ${inscripcion?.apellido || ''}`,
        inscripcion?.email || '',
        inscripcion?.telefono || '',
        inscripcion?.codigoReferencia || '',
        `${pago.numeroCuota}/${inscripcion?.numeroCuotas || 3}`,
        monto.toFixed(2),
        pago.metodoPago || '',
        pago.estado || '',
        inscripcion?.origenRegistro || 'web',
        pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString('es-AR') : '',
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pagos-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('📊 Exportación exitosa', {
      description: `${filteredPagos.length} pagos exportados a CSV`,
    })
  }

  // Abrir diálogo de confirmación antes de validar
  const abrirConfirmacionValidar = (pago: any) => {
    // Verificar si tiene comprobante cuando es requerido
    const requiereComprobante =
      pago.metodoPago === 'transferencia' || pago.metodoPago === 'mercadopago'
    if (requiereComprobante && !pago.comprobanteUrl) {
      toast.warning(
        'Este pago requiere un comprobante. Por favor, agrega el comprobante antes de validar.'
      )
      return
    }

    setPagoAValidar(pago)
    setShowConfirmDialog(true)
  }

  const confirmarPago = async () => {
    if (!pagoAValidar) return

    try {
      const pago = pagoAValidar
      const monto = typeof pago.monto === 'number' ? pago.monto : parseFloat(pago.monto || 0)
      const convencion = pago.inscripcion?.convencion
      const costoTotal = convencion?.costo ? Number(convencion.costo) : 0
      const numeroCuotas = pago.inscripcion?.numeroCuotas || 3
      const montoPorCuota = numeroCuotas > 0 ? costoTotal / numeroCuotas : costoTotal

      // Verificar si el monto coincide (con tolerancia del 5%)
      const diferencia = Math.abs(monto - montoPorCuota)
      const tolerancia = montoPorCuota * 0.05

      if (diferencia > tolerancia) {
        const mensaje = `⚠️ Advertencia: El monto del pago ($${monto.toLocaleString('es-AR')}) no coincide con el monto esperado ($${montoPorCuota.toLocaleString('es-AR')}). Diferencia: $${diferencia.toLocaleString('es-AR')}`
        setMostrarAdvertenciaMonto(mensaje)
      }

      await updatePagoMutation.mutateAsync({
        id: pago.id,
        data: {
          estado: 'COMPLETADO',
        },
      })

      setShowConfirmDialog(false)
      setPagoAValidar(null)
      setMostrarAdvertenciaMonto(null)
    } catch (error: any) {
      console.error('Error al validar pago:', error)
      if (error?.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`)
      }
    }
  }

  // Abrir diálogo de rechazo
  const abrirRechazo = (pago: any) => {
    setPagoARechazar(pago)
    setMotivoRechazo('')
    setShowRejectDialog(true)
  }

  // Confirmar rechazo de pago
  const rechazarPago = async () => {
    if (!pagoARechazar) return

    try {
      await rechazarPagoMutation.mutateAsync({
        id: pagoARechazar.id,
        motivo: motivoRechazo || 'Pago rechazado por el administrador',
      })

      setShowRejectDialog(false)
      setPagoARechazar(null)
      setMotivoRechazo('')
    } catch (error: any) {
      console.error('Error al rechazar pago:', error)
    }
  }

  // Abrir diálogo de rehabilitación
  const abrirRehabilitacion = (pago: any) => {
    setPagoAReabilitar(pago)
    setShowRehabilitarDialog(true)
  }

  // Confirmar rehabilitación de pago
  const rehabilitarPago = async () => {
    if (!pagoAReabilitar) return

    try {
      await rehabilitarPagoMutation.mutateAsync(pagoAReabilitar.id)

      setShowRehabilitarDialog(false)
      setPagoAReabilitar(null)
    } catch (error: any) {
      console.error('Error al rehabilitar pago:', error)
    }
  }

  // Obtener icono de origen
  const getOrigenIcon = (origen: string) => {
    switch (origen) {
      case 'mobile':
        return <Smartphone className="size-3 text-purple-500" />
      case 'web':
        return <Globe className="size-3 text-blue-500" />
      case 'dashboard':
        return <User className="size-3 text-amber-500" />
      default:
        return <Globe className="size-3 text-gray-500" />
    }
  }

  const getOrigenLabel = (origen: string) => {
    switch (origen) {
      case 'mobile':
        return 'App'
      case 'web':
        return 'Web'
      case 'dashboard':
        return 'Admin'
      default:
        return origen
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

  const mostrarBotonValidar =
    pagosSeleccionados.size > 0 &&
    filteredPagos.some((p: any) => pagosSeleccionados.has(p.id) && p.estado !== 'COMPLETADO')

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <PagosHeader inscripcionFiltrada={inscripcionFiltrada} />

        <ScrollReveal>
          <Card className="border-emerald-200/50 dark:border-emerald-500/20 bg-gradient-to-br from-white to-emerald-50/30 dark:from-background dark:to-emerald-950/20 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20">
                  <Search className="size-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  Filtros y Búsqueda
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <PagosFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              estadoFilter={estadoFilter}
              onEstadoFilterChange={setEstadoFilter}
              metodoPagoFilter={metodoPagoFilter}
              onMetodoPagoFilterChange={setMetodoPagoFilter}
              origenFilter={origenFilter}
              onOrigenFilterChange={setOrigenFilter}
              onExport={exportarPagosCSV}
            />
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <Card className="border-emerald-200/50 dark:border-emerald-500/20 bg-gradient-to-br from-white to-emerald-50/30 dark:from-background dark:to-emerald-950/20 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />
            <CardHeader>
              <PagosTableHeader
                totalPagos={paginationMeta?.total ?? filteredPagos.length}
                pagosSeleccionados={pagosSeleccionados.size}
                onValidarSeleccionados={validarPagosSeleccionados}
                isValidando={validarMasivosMutation.isPending}
                mostrarBotonValidar={mostrarBotonValidar}
              />
            </CardHeader>
            <PagosTable
              pagos={filteredPagos}
              pagosSeleccionados={pagosSeleccionados}
              onToggleSeleccion={toggleSeleccionarPago}
              onToggleSeleccionarTodos={toggleSeleccionarTodos}
              onValidar={abrirConfirmacionValidar}
              onRechazar={abrirRechazo}
              onRehabilitar={abrirRehabilitacion}
              isValidando={updatePagoMutation.isPending}
              isRechazando={rechazarPagoMutation.isPending}
              isRehabilitando={rehabilitarPagoMutation.isPending}
              mostrarAdvertenciaMonto={mostrarAdvertenciaMonto}
              onCerrarAdvertencia={() => setMostrarAdvertenciaMonto(null)}
              getOrigenIcon={getOrigenIcon}
              getOrigenLabel={getOrigenLabel}
              paginationMeta={paginationMeta}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              isLoading={isLoading}
            />
          </Card>
        </ScrollReveal>

        {/* Diálogos */}
        <PagoValidarDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          pago={pagoAValidar}
          onConfirm={confirmarPago}
          isValidando={updatePagoMutation.isPending}
        />

        <PagoRechazarDialog
          open={showRejectDialog}
          onOpenChange={setShowRejectDialog}
          pago={pagoARechazar}
          motivoRechazo={motivoRechazo}
          onMotivoChange={setMotivoRechazo}
          onConfirm={rechazarPago}
          isRechazando={rechazarPagoMutation.isPending}
        />

        <PagoRehabilitarDialog
          open={showRehabilitarDialog}
          onOpenChange={setShowRehabilitarDialog}
          pago={pagoAReabilitar}
          onConfirm={rehabilitarPago}
          isRehabilitando={rehabilitarPagoMutation.isPending}
        />
      </div>
    </TooltipProvider>
  )
}

