'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { usePagos, useUpdatePago, useRechazarPago, useRehabilitarPago, useValidarPagosMasivos } from '@/lib/hooks/use-pagos'
import { inscripcionesApi } from '@/lib/api/inscripciones'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
} from "@/components/ui/alert-dialog"
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Search, CheckCircle, CreditCard, FileText, ChevronLeft, ChevronRight, Image as ImageIcon, XCircle, AlertTriangle, Smartphone, Globe, User, RefreshCw, Download, CheckSquare, Square, History } from 'lucide-react'
import Image from 'next/image'
import { ScrollReveal } from '@/components/scroll-reveal'

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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1) // Reset a página 1 cuando cambia la búsqueda
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
      inscripcionesApi.getById(inscripcionIdFromUrl)
        .then((inscripcion) => {
          setInscripcionFiltrada(inscripcion)
        })
        .catch((error) => {
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
    estado: estadoFilter !== 'todos' ? estadoFilter as any : undefined,
    metodoPago: metodoPagoFilter !== 'todos' ? metodoPagoFilter as any : undefined,
    origen: origenFilter !== 'todos' ? origenFilter as any : undefined,
    inscripcionId: inscripcionIdFromUrl || undefined, // Filtrar por inscripción si viene de la URL
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
        dataLength: Array.isArray(pagosResponse) ? pagosResponse.length : pagosResponse?.data?.length,
        meta: pagosResponse?.meta,
        filters,
      })
    }
  }, [pagosResponse, error, filters])
  
  // Manejar respuesta paginada o array directo (compatibilidad)
  const pagos = Array.isArray(pagosResponse) 
    ? pagosResponse 
    : pagosResponse?.data || []
  const paginationMeta = Array.isArray(pagosResponse) 
    ? null 
    : pagosResponse?.meta
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
    const todosSeleccionados = todosLosIds.length > 0 && todosLosIds.every((id: string) => pagosSeleccionados.has(id))
    
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
      toast.error(
        `⚠️ No puedes validar pagos rechazados`,
        {
          description: `Tienes ${pagosRechazados.length} pago(s) rechazado(s) seleccionado(s). Debes rehabilitarlos primero usando el botón "Rehabilitar" antes de poder validarlos.`,
          duration: 10000,
        }
      )
      return
    }

    // Verificar si hay pagos que no estén pendientes
    const pagosNoPendientes = pagosAValidar.filter((p: any) => p.estado !== 'PENDIENTE')
    if (pagosNoPendientes.length > 0) {
      const estados = pagosNoPendientes.map((p: any) => p.estado).join(', ')
      toast.warning(`Solo se pueden validar pagos pendientes. Hay ${pagosNoPendientes.length} pago(s) con estado: ${estados}`)
      return
    }
    
    // Verificar que todos tengan comprobante si es requerido
    const pagosSinComprobante = pagosAValidar.filter((p: any) => {
      const requiereComprobante = (p.metodoPago === 'transferencia' || p.metodoPago === 'mercadopago')
      return requiereComprobante && !p.comprobanteUrl
    })

    if (pagosSinComprobante.length > 0) {
      toast.warning(`Hay ${pagosSinComprobante.length} pago(s) que requieren comprobante. Por favor, agrega los comprobantes antes de validar.`)
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
    const headers = ['Nombre', 'Email', 'Teléfono', 'Código', 'Cuota', 'Monto', 'Método', 'Estado', 'Origen', 'Fecha']
    const rows = filteredPagos.map((pago: any) => {
      const inscripcion = pago.inscripcion
      const monto = typeof pago.monto === 'number' ? pago.monto : parseFloat(String(pago.monto || 0))
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
        pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString('es-AR') : ''
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pagos-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('📊 Exportación exitosa', { description: `${filteredPagos.length} pagos exportados a CSV` })
  }

  // Abrir diálogo de confirmación antes de validar
  const abrirConfirmacionValidar = (pago: any) => {
    // Verificar si tiene comprobante cuando es requerido
    const requiereComprobante = (pago.metodoPago === 'transferencia' || pago.metodoPago === 'mercadopago')
    if (requiereComprobante && !pago.comprobanteUrl) {
      toast.warning('Este pago requiere un comprobante. Por favor, agrega el comprobante antes de validar.')
      return
    }
    
    setPagoAValidar(pago)
    setShowConfirmDialog(true)
  }

  const confirmarPago = async () => {
    if (!pagoAValidar) return
    
    try {
      const pago = pagoAValidar
      const numeroCuota = pago?.numeroCuota
      const inscripcion = pago.inscripcion
      const numeroCuotasTotal = inscripcion?.numeroCuotas || 3

      const resultado = await updatePagoMutation.mutateAsync({
        id: pago.id,
        data: {
          estado: 'COMPLETADO' as const
        }
      })
      
      setShowConfirmDialog(false)
      setPagoAValidar(null)
      
      // Mostrar advertencia de monto si existe
      if ((resultado as any)?.advertenciaMonto) {
        setMostrarAdvertenciaMonto((resultado as any).advertenciaMonto)
        setTimeout(() => setMostrarAdvertenciaMonto(null), 10000) // Ocultar después de 10 segundos
      }
      
      // Mostrar mensaje informativo
      if (numeroCuota) {
        toast.success(`Cuota ${numeroCuota}/${numeroCuotasTotal} validada exitosamente. Si es la última cuota, la inscripción será confirmada automáticamente.`)
      } else {
        toast.success('Pago validado exitosamente')
      }
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
        motivo: motivoRechazo || 'Pago rechazado por el administrador'
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

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header con gradiente */}
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="hover:bg-emerald-50 dark:hover:bg-emerald-500/10">
              <ChevronLeft className="size-5 text-emerald-600 dark:text-emerald-400" />
            </Button>
          </Link>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 rounded-xl blur-xl dark:from-emerald-500/5 dark:via-teal-500/5 dark:to-sky-500/5" />
            <div className="relative">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 dark:from-emerald-400 dark:via-teal-400 dark:to-sky-400 bg-clip-text text-transparent">
                Gestión de Pagos
              </h1>
              <p className="text-muted-foreground mt-1">
                Verificar pagos, cuotas de MercadoPago y vouchers
              </p>
            </div>
          </div>
          {/* Indicador de filtro por inscripción */}
          {inscripcionIdFromUrl && inscripcionFiltrada && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Filtrando pagos de: <strong>{inscripcionFiltrada.nombre} {inscripcionFiltrada.apellido}</strong>
              </span>
              <Link href="/admin/pagos">
                <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50">
                  <XCircle className="size-3 mr-1" />
                  Limpiar filtro
                </Button>
              </Link>
            </div>
          )}
        </div>

        <ScrollReveal>
          <Card className="border-emerald-200/50 dark:border-emerald-500/20 bg-gradient-to-br from-white to-emerald-50/30 dark:from-background dark:to-emerald-950/20 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20">
                  <Search className="size-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">Filtros y Búsqueda</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, código de referencia o referencia..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="COMPLETADO">Completado</SelectItem>
                    <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                    <SelectItem value="CANCELADO">Cancelado</SelectItem>
                    <SelectItem value="REEMBOLSADO">Reembolsado</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={metodoPagoFilter} onValueChange={setMetodoPagoFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Método de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los métodos</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="mercadopago">MercadoPago</SelectItem>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={origenFilter} onValueChange={setOrigenFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Origen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los orígenes</SelectItem>
                    <SelectItem value="web">
                      <div className="flex items-center gap-2">
                        <Globe className="size-3 text-blue-500" />
                        Web
                      </div>
                    </SelectItem>
                    <SelectItem value="mobile">
                      <div className="flex items-center gap-2">
                        <Smartphone className="size-3 text-purple-500" />
                        App Móvil
                      </div>
                    </SelectItem>
                    <SelectItem value="dashboard">
                      <div className="flex items-center gap-2">
                        <User className="size-3 text-amber-500" />
                        Dashboard
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={exportarPagosCSV}
                  className="border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                >
                  <Download className="size-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <Card className="border-emerald-200/50 dark:border-emerald-500/20 bg-gradient-to-br from-white to-emerald-50/30 dark:from-background dark:to-emerald-950/20 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500/10 to-sky-500/10 dark:from-teal-500/20 dark:to-sky-500/20">
                      <CreditCard className="size-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <span className="bg-gradient-to-r from-teal-600 to-sky-600 dark:from-teal-400 dark:to-sky-400 bg-clip-text text-transparent">Listado de Pagos</span>
                  </CardTitle>
                  <CardDescription>
                    {paginationMeta?.total ?? filteredPagos.length} pago(s) encontrado(s)
                    {pagosSeleccionados.size > 0 && (
                      <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-medium">
                        • {pagosSeleccionados.size} seleccionado(s)
                      </span>
                    )}
                  </CardDescription>
                </div>
                {pagosSeleccionados.size > 0 && filteredPagos.some((p: any) => pagosSeleccionados.has(p.id) && p.estado !== 'COMPLETADO') && (
                  <Button
                    onClick={validarPagosSeleccionados}
                    disabled={validarMasivosMutation.isPending}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                  >
                    {validarMasivosMutation.isPending ? (
                      <>
                        <RefreshCw className="size-4 mr-2 animate-spin" />
                        Validando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="size-4 mr-2" />
                        Validar {pagosSeleccionados.size} pago(s)
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            {mostrarAdvertenciaMonto && (
              <div className="px-6 pb-4">
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="size-5 text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-amber-800 dark:text-amber-200">Advertencia de Monto</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">{mostrarAdvertenciaMonto}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMostrarAdvertenciaMonto(null)}
                      className="ml-auto"
                    >
                      <XCircle className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/30">
                    <tr className="text-left">
                      <th className="p-3 text-sm font-medium w-12">
                        <button
                          onClick={toggleSeleccionarTodos}
                          className="flex items-center justify-center hover:opacity-70 transition-opacity"
                          title="Seleccionar todos los pagos pendientes"
                          disabled={filteredPagos.filter((p: any) => p.estado === 'PENDIENTE').length === 0}
                        >
                          {filteredPagos.filter((p: any) => p.estado === 'PENDIENTE').length > 0 &&
                            filteredPagos.filter((p: any) => p.estado === 'PENDIENTE').every((p: any) => pagosSeleccionados.has(p.id)) ? (
                            <CheckSquare className="size-5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Square className="size-5 text-muted-foreground" />
                          )}
                        </button>
                      </th>
                      <th className="p-3 text-sm font-medium">Inscrito</th>
                      <th className="p-3 text-sm font-medium">Origen</th>
                      <th className="p-3 text-sm font-medium">Tipo</th>
                      <th className="p-3 text-sm font-medium">Fecha</th>
                      <th className="p-3 text-sm font-medium">Monto</th>
                      <th className="p-3 text-sm font-medium">Método</th>
                      <th className="p-3 text-sm font-medium">Estado</th>
                      <th className="p-3 text-sm font-medium">Comprobante</th>
                      <th className="p-3 text-sm font-medium">Notas</th>
                      <th className="p-3 text-sm font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPagos.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="p-8 text-center text-muted-foreground">
                          No se encontraron pagos
                        </td>
                      </tr>
                    ) : (
                      filteredPagos.map((pago: any) => {
                        const inscripcion = pago.inscripcion
                        const nombreCompleto = inscripcion
                          ? `${inscripcion.nombre} ${inscripcion.apellido}`
                          : 'N/A'
                        const monto = typeof pago.monto === 'number' ? pago.monto : parseFloat(pago.monto || 0)
                        const estadoEsCompletado = pago.estado === 'COMPLETADO'
                        const estadoEsPendiente = pago.estado === 'PENDIENTE'
                        const estadoEsCancelado = pago.estado === 'CANCELADO'
                        const origenInscripcion = inscripcion?.origenRegistro || 'web'
                        const estaSeleccionado = pagosSeleccionados.has(pago.id)

                        return (
                          <tr key={pago.id} className={`border-b last:border-0 hover:bg-muted/50 ${estaSeleccionado ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''}`}>
                            <td className="p-3">
                              <button
                                onClick={() => toggleSeleccionarPago(pago.id, pago)}
                                disabled={pago.estado !== 'PENDIENTE'}
                                className={`flex items-center justify-center transition-opacity ${
                                  pago.estado !== 'PENDIENTE'
                                    ? 'opacity-40 cursor-not-allowed' 
                                    : 'hover:opacity-70 cursor-pointer'
                                }`}
                                title={
                                  pago.estado !== 'PENDIENTE'
                                    ? pago.estado === 'CANCELADO'
                                      ? 'Pago rechazado - Debes rehabilitarlo primero'
                                      : pago.estado === 'COMPLETADO'
                                        ? 'Pago completado - No se puede seleccionar'
                                        : `Pago ${pago.estado.toLowerCase()} - Solo se pueden validar pagos pendientes`
                                    : estaSeleccionado 
                                      ? 'Deseleccionar' 
                                      : 'Seleccionar para validar'
                                }
                              >
                                {estaSeleccionado ? (
                                  <CheckSquare className="size-5 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <Square className={`size-5 ${pago.estado !== 'PENDIENTE' ? 'text-muted-foreground/40' : 'text-muted-foreground'}`} />
                                )}
                              </button>
                            </td>
                            <td className="p-3">
                              <p className="font-medium text-sm">{nombreCompleto}</p>
                              {inscripcion?.codigoReferencia && (
                                <p className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                                  🔖 {inscripcion.codigoReferencia}
                                </p>
                              )}
                              {pago.referencia && pago.referencia !== inscripcion?.codigoReferencia && (
                                <p className="text-xs text-muted-foreground mt-1">{pago.referencia}</p>
                              )}
                            </td>
                            <td className="p-3">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs cursor-help ${
                                      origenInscripcion === 'mobile' 
                                        ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                                        : origenInscripcion === 'dashboard'
                                        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                                        : 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                                    }`}
                                  >
                                    {getOrigenIcon(origenInscripcion)}
                                    <span className="ml-1">{getOrigenLabel(origenInscripcion)}</span>
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Inscrito desde: {origenInscripcion === 'mobile' ? 'Aplicación móvil' : origenInscripcion === 'dashboard' ? 'Dashboard admin' : 'Sitio web'}</p>
                                </TooltipContent>
                              </Tooltip>
                            </td>
                            <td className="p-3">
                              {pago.numeroCuota ? (
                                <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700">
                                  Cuota {pago.numeroCuota}
                                  {pago.inscripcion?.numeroCuotas && `/${pago.inscripcion.numeroCuotas}`}
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  Pago único
                                </Badge>
                              )}
                            </td>
                            <td className="p-3 text-sm">
                              {pago.fechaPago
                                ? new Date(pago.fechaPago).toLocaleDateString('es-ES')
                                : new Date(pago.createdAt).toLocaleDateString('es-ES')
                              }
                            </td>
                            <td className="p-3 text-sm font-semibold">
                              ${monto.toLocaleString('es-AR')}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <CreditCard className="size-4 text-muted-foreground" />
                                <span className="text-sm capitalize">{pago.metodoPago}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge
                                variant={estadoEsCompletado ? 'default' : estadoEsCancelado ? 'destructive' : 'secondary'}
                                className={estadoEsCompletado ? 'bg-emerald-500' : ''}
                              >
                                {pago.estado === 'COMPLETADO' ? 'Confirmado' :
                                  pago.estado === 'PENDIENTE' ? 'Pendiente' :
                                  pago.estado === 'CANCELADO' ? 'Rechazado' :
                                    pago.estado}
                              </Badge>
                            </td>
                            <td className="p-3">
                              {pago.comprobanteUrl ? (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 text-xs hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                    >
                                      <ImageIcon className="size-3 mr-1" />
                                      Ver
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Comprobante de Pago</DialogTitle>
                                      <DialogDescription>
                                        {nombreCompleto} - {pago.referencia || 'Sin referencia'}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="relative w-full h-[500px] rounded-lg overflow-hidden border">
                                      <Image
                                        src={pago.comprobanteUrl}
                                        alt="Comprobante de pago"
                                        fill
                                        className="object-contain"
                                      />
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              ) : (
                                <span className="text-xs text-muted-foreground">Sin comprobante</span>
                              )}
                            </td>
                            <td className="p-3">
                              {pago.notas ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-xs text-muted-foreground cursor-help truncate max-w-[100px] block">
                                      {pago.notas.substring(0, 30)}...
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>{pago.notas}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="p-3">
                              {estadoEsPendiente && !estadoEsCompletado && (
                                <div className="flex items-center gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        onClick={() => abrirConfirmacionValidar(pago)}
                                        disabled={updatePagoMutation.isPending}
                                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
                                      >
                                        <CheckCircle className="size-4 mr-1" />
                                        Validar
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Confirmar y validar este pago</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => abrirRechazo(pago)}
                                        disabled={updatePagoMutation.isPending || rechazarPagoMutation.isPending}
                                        className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                                      >
                                        <XCircle className="size-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Rechazar pago</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              )}
                              {estadoEsCancelado && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => abrirRehabilitacion(pago)}
                                      disabled={rehabilitarPagoMutation.isPending}
                                      className="border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                    >
                                      <RefreshCw className="size-4 mr-1" />
                                      Rehabilitar
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Permitir que el usuario vuelva a enviar su pago</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
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
                    Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, paginationMeta.total)} de {paginationMeta.total} pagos
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
        </ScrollReveal>
        
        {/* Diálogo de confirmación para validar pago */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <CheckCircle className="size-5 text-emerald-500" />
                Confirmar Validación de Pago
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4">
                  <p>¿Estás seguro de que deseas validar este pago?</p>
                  
                  {pagoAValidar && (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Inscrito:</span>
                        <span className="font-medium text-foreground">
                          {pagoAValidar.inscripcion?.nombre} {pagoAValidar.inscripcion?.apellido}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cuota:</span>
                        <span className="font-medium text-foreground">
                          {pagoAValidar.numeroCuota || 1} / {pagoAValidar.inscripcion?.numeroCuotas || 3}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monto:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          ${(typeof pagoAValidar.monto === 'number' ? pagoAValidar.monto : parseFloat(pagoAValidar.monto || 0)).toLocaleString('es-AR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Método:</span>
                        <span className="font-medium text-foreground capitalize">{pagoAValidar.metodoPago}</span>
                      </div>
                      {pagoAValidar.inscripcion?.codigoReferencia && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Código:</span>
                          <span className="font-mono font-medium text-amber-600 dark:text-amber-400">
                            {pagoAValidar.inscripcion.codigoReferencia}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    Al validar este pago, se enviará una notificación al usuario. Si es la última cuota, la inscripción será confirmada automáticamente.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmarPago}
                disabled={updatePagoMutation.isPending}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                {updatePagoMutation.isPending ? 'Validando...' : 'Confirmar Validación'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Diálogo de rechazo de pago */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="size-5" />
                Rechazar Pago
              </DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas rechazar este pago? Se notificará al usuario.
              </DialogDescription>
            </DialogHeader>
            
            {pagoARechazar && (
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4 space-y-2 text-sm border border-red-200 dark:border-red-800">
                  <div className="flex justify-between">
                    <span className="text-red-700 dark:text-red-300">Inscrito:</span>
                    <span className="font-medium text-red-900 dark:text-red-100">
                      {pagoARechazar.inscripcion?.nombre} {pagoARechazar.inscripcion?.apellido}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700 dark:text-red-300">Cuota:</span>
                    <span className="font-medium text-red-900 dark:text-red-100">
                      {pagoARechazar.numeroCuota || 1} / {pagoARechazar.inscripcion?.numeroCuotas || 3}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700 dark:text-red-300">Monto:</span>
                    <span className="font-bold text-red-900 dark:text-red-100">
                      ${(typeof pagoARechazar.monto === 'number' ? pagoARechazar.monto : parseFloat(pagoARechazar.monto || 0)).toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="motivo" className="text-sm font-medium">
                    Motivo del rechazo
                  </Label>
                  <Select value={motivoRechazo} onValueChange={setMotivoRechazo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un motivo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Comprobante ilegible o no válido">Comprobante ilegible o no válido</SelectItem>
                      <SelectItem value="Monto incorrecto">Monto incorrecto</SelectItem>
                      <SelectItem value="Código de referencia no coincide">Código de referencia no coincide</SelectItem>
                      <SelectItem value="Pago duplicado">Pago duplicado</SelectItem>
                      <SelectItem value="Datos bancarios incorrectos">Datos bancarios incorrectos</SelectItem>
                      <SelectItem value="otro">Otro motivo...</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {motivoRechazo === 'otro' && (
                    <Textarea
                      placeholder="Describe el motivo del rechazo..."
                      value={motivoRechazo === 'otro' ? '' : motivoRechazo}
                      onChange={(e) => setMotivoRechazo(e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={rechazarPago}
                disabled={rechazarPagoMutation.isPending || !motivoRechazo || motivoRechazo === 'otro'}
              >
                {rechazarPagoMutation.isPending ? 'Rechazando...' : 'Confirmar Rechazo'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Diálogo de confirmación para rehabilitar pago */}
        <AlertDialog open={showRehabilitarDialog} onOpenChange={setShowRehabilitarDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <RefreshCw className="size-5 text-blue-500" />
                Rehabilitar Pago
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4">
                  <p>¿Estás seguro de que deseas rehabilitar este pago? Esto permitirá al usuario volver a enviar su comprobante.</p>
                  
                  {pagoAReabilitar && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 space-y-2 text-sm border border-blue-200 dark:border-blue-800">
                      <div className="flex justify-between">
                        <span className="text-blue-700 dark:text-blue-300">Inscrito:</span>
                        <span className="font-medium text-blue-900 dark:text-blue-100">
                          {pagoAReabilitar.inscripcion?.nombre} {pagoAReabilitar.inscripcion?.apellido}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700 dark:text-blue-300">Cuota:</span>
                        <span className="font-medium text-blue-900 dark:text-blue-100">
                          {pagoAReabilitar.numeroCuota || 1} / {pagoAReabilitar.inscripcion?.numeroCuotas || 3}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700 dark:text-blue-300">Monto:</span>
                        <span className="font-bold text-blue-900 dark:text-blue-100">
                          ${(typeof pagoAReabilitar.monto === 'number' ? pagoAReabilitar.monto : parseFloat(pagoAReabilitar.monto || 0)).toLocaleString('es-AR')}
                        </span>
                      </div>
                      {pagoAReabilitar.notas && (
                        <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                          <span className="text-blue-700 dark:text-blue-300 text-xs">Motivo del rechazo anterior:</span>
                          <p className="font-medium text-blue-900 dark:text-blue-100 text-xs mt-1">
                            {pagoAReabilitar.notas}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    Se enviará un email al usuario notificándole que puede volver a enviar su comprobante de pago.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={rehabilitarPago}
                disabled={rehabilitarPagoMutation.isPending}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
              >
                {rehabilitarPagoMutation.isPending ? 'Rehabilitando...' : 'Confirmar Rehabilitación'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}
