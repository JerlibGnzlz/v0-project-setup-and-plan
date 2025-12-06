'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
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
import { Badge } from '@/components/ui/badge'
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
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Search,
  UserCheck,
  ChevronLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  CreditCard,
  Plus,
  DollarSign,
  CheckCircle2,
  Image as ImageIcon,
  X,
  Printer,
  Download,
  Sparkles,
  Smartphone,
  Globe,
  User,
  UserPlus,
  Star,
  Bell,
  TrendingUp,
  XCircle,
  BarChart3,
  AlertTriangle,
  Loader2,
  Pencil,
  Save,
  RefreshCw,
} from 'lucide-react'
import Image from 'next/image'
import { ComprobanteUpload } from '@/components/ui/comprobante-upload'
import { uploadApi } from '@/lib/api/upload'
import { ScrollReveal } from '@/components/scroll-reveal'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { InscripcionWizard } from '@/components/admin/inscripcion-wizard'
import { InscripcionPagoWizard } from '@/components/admin/inscripcion-pago-wizard'
import { EditarInscripcionDialog } from '@/components/admin/editar-inscripcion-dialog'
import { PagoWizard } from '@/components/admin/pago-wizard'
import { InscripcionSuccessModal } from '@/components/admin/inscripcion-success-modal'

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
      setCurrentPage(1) // Reset a página 1 cuando cambia la búsqueda
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])
  const [selectedInscripcion, setSelectedInscripcion] = useState<any>(null)
  const [selectedPago, setSelectedPago] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [inscripcionParaEditar, setInscripcionParaEditar] = useState<any>(null)
  const [pagoForm, setPagoForm] = useState({
    metodoPago: 'transferencia',
    referencia: '',
    comprobanteUrl: '',
    notas: '',
  })
  const [isUploadingComprobante, setIsUploadingComprobante] = useState(false)

  // Estado para diálogo de nueva inscripción manual
  const [showNuevaInscripcionDialog, setShowNuevaInscripcionDialog] = useState(false)
  const [showEditarInscripcionDialog, setShowEditarInscripcionDialog] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [inscripcionCreada, setInscripcionCreada] = useState<any>(null)
  const [pagoCreado, setPagoCreado] = useState(false)
  const [pagoValidado, setPagoValidado] = useState(false)
  const inscripcionCardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [nuevaInscripcionForm, setNuevaInscripcionForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    sede: '',
    tipoInscripcion: 'invitado',
    numeroCuotas: 3,
    notas: '',
  })

  // Sincronización inteligente para actualización automática
  useSmartSync()

  // Polling inteligente cada 30 segundos (solo cuando la pestaña está visible)
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
  // Manejar respuesta paginada o array directo (compatibilidad)
  type InscripcionesResponse = Inscripcion[] | { data: Inscripcion[]; meta?: any } | undefined
  const response = inscripcionesResponse as InscripcionesResponse
  const inscripciones = Array.isArray(response) ? response : response?.data || []
  const paginationMeta = Array.isArray(response)
    ? null
    : (response as { data: Inscripcion[]; meta?: any })?.meta
  const { data: reporteIngresos } = useReporteIngresos()
  const createPagoMutation = useCreatePago()
  const updatePagoMutation = useUpdatePago()
  const createInscripcionMutation = useCreateInscripcion()
  const cancelarInscripcionMutation = useCancelarInscripcion()
  const rehabilitarInscripcionMutation = useRehabilitarInscripcion()
  const enviarRecordatoriosMutation = useEnviarRecordatorios()
  const updateInscripcionMutation = useUpdateInscripcion()

  // Estados para diálogos
  const [showReporteDialog, setShowReporteDialog] = useState(false)
  const [showRecordatoriosDialog, setShowRecordatoriosDialog] = useState(false)
  const [showCancelarDialog, setShowCancelarDialog] = useState(false)
  const [inscripcionACancelar, setInscripcionACancelar] = useState<any>(null)
  const [motivoCancelacion, setMotivoCancelacion] = useState('')
  const [resultadoRecordatorios, setResultadoRecordatorios] = useState<any>(null)

  // Estados para editar inscripción
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

  // Obtener lista única de convenciones
  const convencionesUnicas = Array.from(
    new Set(inscripciones.map((insc: any) => insc.convencion?.titulo).filter(Boolean))
  )

  // Calcular información de pagos para una inscripción
  const getPagosInfo = (inscripcion: any) => {
    const pagos = inscripcion.pagos || []
    const convencion = convenciones.find((c: any) => c.id === inscripcion.convencionId)
    const costoTotal = convencion?.costo ? Number(convencion.costo) : 0
    const numeroCuotas = inscripcion.numeroCuotas || 3 // Flexibilidad: 1, 2 o 3 cuotas
    const montoPorCuota = numeroCuotas > 0 ? costoTotal / numeroCuotas : costoTotal

    const cuotas = Array.from({ length: numeroCuotas }, (_, i) => i + 1).map(numero => {
      const pago = pagos.find((p: any) => p.numeroCuota === numero)
      return {
        numero,
        pago,
        monto: montoPorCuota,
        estado: pago?.estado || 'PENDIENTE',
      }
    })

    const totalPagado = pagos
      .filter((p: any) => p.estado === 'COMPLETADO')
      .reduce(
        (sum: number, p: any) =>
          sum + (typeof p.monto === 'number' ? p.monto : parseFloat(p.monto || 0)),
        0
      )

    const cuotasPagadas = pagos.filter((p: any) => p.estado === 'COMPLETADO').length
    const cuotasPendientes = numeroCuotas - cuotasPagadas

    return {
      cuotas,
      costoTotal,
      montoPorCuota,
      totalPagado,
      cuotasPagadas,
      cuotasPendientes,
      numeroCuotas,
      porcentajePagado: costoTotal > 0 ? (totalPagado / costoTotal) * 100 : 0,
    }
  }

  // Los filtros de búsqueda, estado y convención ahora se hacen en el servidor
  // Solo aplicamos el filtro de pago completo en el cliente (requiere cálculos complejos)
  const filteredInscripciones = inscripciones.filter((insc: any) => {
    // Filtro de pago completo (solo este se mantiene en cliente)
    const pagosInfo = getPagosInfo(insc)
    const matchPagoCompleto =
      pagoCompletoFilter === 'todos' ||
      (pagoCompletoFilter === 'completo' && pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas) ||
      (pagoCompletoFilter === 'pendiente' && pagosInfo.cuotasPagadas < pagosInfo.numeroCuotas)

    return matchPagoCompleto
  })

  // Calcular estadísticas
  const ahora = new Date()
  const hace24Horas = new Date(ahora.getTime() - 24 * 60 * 60 * 1000)
  const hoy = new Date(ahora.setHours(0, 0, 0, 0))

  const estadisticas = {
    total: inscripciones.length,
    nuevas: inscripciones.filter((insc: any) => {
      const fechaInsc = new Date(insc.fechaInscripcion)
      return fechaInsc >= hace24Horas
    }).length,
    hoy: inscripciones.filter((insc: any) => {
      const fechaInsc = new Date(insc.fechaInscripcion)
      return fechaInsc >= hoy
    }).length,
    pendientes: inscripciones.filter((insc: any) => insc.estado === 'pendiente').length,
    confirmadas: inscripciones.filter((insc: any) => insc.estado === 'confirmado').length,
    conPagoCompleto: inscripciones.filter((insc: any) => {
      const pagosInfo = getPagosInfo(insc)
      return pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas
    }).length,
  }

  // Función para verificar si una inscripción es nueva (últimas 24 horas)
  const esNueva = (inscripcion: any) => {
    const fechaInsc = new Date(inscripcion.fechaInscripcion)
    return fechaInsc >= hace24Horas
  }

  const handleUploadComprobante = async (file: File): Promise<string> => {
    setIsUploadingComprobante(true)
    try {
      const response = await uploadApi.uploadComprobantePago(file)
      return response.url
    } finally {
      setIsUploadingComprobante(false)
    }
  }

  const handleCreatePago = async () => {
    if (!selectedInscripcion) return

    // Validar campos requeridos según método de pago
    const requiereComprobante =
      pagoForm.metodoPago === 'transferencia' || pagoForm.metodoPago === 'mercadopago'

    if (requiereComprobante) {
      if (!pagoForm.referencia || !pagoForm.referencia.trim()) {
        toast.error('La referencia es requerida para transferencias y pagos de MercadoPago')
        return
      }
      if (!pagoForm.comprobanteUrl || !pagoForm.comprobanteUrl.trim()) {
        toast.error('El comprobante es requerido para transferencias y pagos de MercadoPago')
        return
      }
    }

    const convencion = convenciones.find((c: any) => c.id === selectedInscripcion.convencionId)
    const costoTotal = convencion?.costo ? Number(convencion.costo) : 0
    const numeroCuotas = selectedInscripcion.numeroCuotas || 3
    const montoPorCuota = numeroCuotas > 0 ? costoTotal / numeroCuotas : costoTotal

    try {
      await createPagoMutation.mutateAsync({
        inscripcionId: selectedInscripcion.id,
        monto: montoPorCuota.toFixed(2),
        metodoPago: pagoForm.metodoPago,
        numeroCuota: selectedInscripcion.numeroCuota,
        estado: 'PENDIENTE',
        referencia: pagoForm.referencia || undefined,
        comprobanteUrl: pagoForm.comprobanteUrl || undefined,
        notas: pagoForm.notas || undefined,
      })
      setDialogOpen(false)
      setPagoForm({ metodoPago: 'transferencia', referencia: '', comprobanteUrl: '', notas: '' })
      toast.success('Pago creado exitosamente')
    } catch (error) {
      console.error('Error al crear pago:', error)
    }
  }

  const handleOpenDialog = (inscripcion: any, pago?: any) => {
    // Validar que no se intente crear un pago si ya existe uno pendiente
    if (!pago && inscripcion.numeroCuota) {
      const pagosInfo = getPagosInfo(inscripcion)
      const cuota = pagosInfo.cuotas.find((c: any) => c.numero === inscripcion.numeroCuota)

      // Si la cuota ya tiene un pago pendiente, no permitir crear otro
      if (cuota?.pago && cuota.estado === 'PENDIENTE') {
        toast.warning('Esta cuota ya tiene un pago pendiente', {
          description: 'Espera a que se confirme el pago antes de crear uno nuevo',
        })
        return
      }
    }

    setSelectedInscripcion(inscripcion)
    setSelectedPago(pago)
    setPagoForm({ metodoPago: 'transferencia', referencia: '', comprobanteUrl: '', notas: '' })
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
        // Actualizar pago existente
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
        // Validar que no exista ya un pago para esta cuota
        const pagosInfo = getPagosInfo(selectedInscripcion)
        const cuota = pagosInfo.cuotas.find(
          (c: any) => c.numero === selectedInscripcion.numeroCuota
        )

        if (cuota?.pago) {
          toast.error('Esta cuota ya tiene un pago asociado', {
            description: 'Si necesitas actualizarlo, usa el botón "Editar" cuando esté completado',
          })
          return
        }

        // Crear nuevo pago
        const montoPorCuota = getPagosInfo(selectedInscripcion).montoPorCuota
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

      // Refresh inmediato y forzar recarga
      await queryClient.invalidateQueries({ queryKey: ['inscripciones'] })
      await queryClient.invalidateQueries({ queryKey: ['pagos'] })

      // Refrescar la query actual para que se actualice inmediatamente
      await queryClient.refetchQueries({
        queryKey: ['inscripciones', currentPage, pageSize, filters],
      })
    } catch (error: any) {
      console.error('Error al actualizar/crear pago:', error)
      throw error
    }
  }

  // Función para crear inscripción desde wizard
  const handleCrearInscripcionDesdeWizard = async (wizardData: any) => {
    try {
      // Crear inscripción
      const nuevaInscripcion = await createInscripcionMutation.mutateAsync({
        convencionId: wizardData.convencionId,
        nombre: wizardData.nombre.trim(),
        apellido: wizardData.apellido.trim(),
        email: wizardData.email.trim().toLowerCase(),
        telefono: wizardData.telefono?.trim() || undefined,
        sede: wizardData.sede?.trim() || 'Sin sede especificada',
        tipoInscripcion: wizardData.tipoInscripcion,
        numeroCuotas: wizardData.numeroCuotas,
        origenRegistro: 'dashboard',
        notas: wizardData.notas?.trim() || `Inscripción manual creada desde admin`,
      })

      // Si se debe crear pago inmediato, actualizar y validar automáticamente si tiene todos los datos
      if (wizardData.crearPagoInmediato && nuevaInscripcion?.id) {
        try {
          // Esperar un momento para que la inscripción se actualice con los pagos
          await new Promise(resolve => setTimeout(resolve, 500))

          // Refrescar datos para obtener la inscripción con pagos
          await queryClient.invalidateQueries({ queryKey: ['inscripciones'] })

          // Obtener la inscripción actualizada desde la API
          let inscripcionCompleta = nuevaInscripcion
          try {
            inscripcionCompleta = await inscripcionesApi.getById(nuevaInscripcion.id)
          } catch (error) {
            console.warn('No se pudo obtener la inscripción actualizada, usando datos locales')
          }

          // Buscar el primer pago pendiente (los pagos se crean automáticamente por el backend)
          const primerPago =
            inscripcionCompleta?.pagos?.find(
              (p: any) => p.estado === 'PENDIENTE' && p.numeroCuota === 1
            ) || inscripcionCompleta?.pagos?.[0]

          if (primerPago?.id) {
            // Verificar si tiene todos los datos requeridos para validación automática
            const tieneReferencia = wizardData.referencia?.trim()
            const tieneComprobante = wizardData.comprobanteUrl
            const requiereComprobante =
              wizardData.metodoPago === 'transferencia' || wizardData.metodoPago === 'mercadopago'
            const puedeValidar = tieneReferencia && (requiereComprobante ? tieneComprobante : true)

            // Actualizar el pago existente con los datos del wizard
            await updatePagoMutation.mutateAsync({
              id: primerPago.id,
              data: {
                metodoPago: wizardData.metodoPago,
                referencia: wizardData.referencia?.trim() || undefined,
                comprobanteUrl: wizardData.comprobanteUrl || undefined,
                notas: wizardData.notasPago?.trim() || undefined,
                // Si tiene todos los datos, validar automáticamente
                estado: puedeValidar ? 'COMPLETADO' : 'PENDIENTE',
              },
            })

            // Si se validó automáticamente, mostrar mensaje especial
            if (puedeValidar) {
              toast.success('✅ Pago registrado y validado automáticamente', {
                description: 'El pago se reflejará inmediatamente en los pagos completados',
              })
            }
          } else {
            // Si no hay pagos aún, crear uno nuevo
            const puedeValidar =
              wizardData.referencia?.trim() &&
              (wizardData.metodoPago === 'efectivo' || wizardData.comprobanteUrl)

            await createPagoMutation.mutateAsync({
              inscripcionId: nuevaInscripcion.id,
              monto: String(
                wizardData.montoPorCuota ||
                  (convencionSeleccionada?.costo
                    ? Number(convencionSeleccionada.costo) / wizardData.numeroCuotas
                    : 0)
              ),
              metodoPago: wizardData.metodoPago,
              referencia: wizardData.referencia?.trim() || undefined,
              comprobanteUrl: wizardData.comprobanteUrl || undefined,
              notas: wizardData.notasPago?.trim() || undefined,
              estado: puedeValidar ? 'COMPLETADO' : 'PENDIENTE',
            })

            if (puedeValidar) {
              toast.success('✅ Pago creado y validado automáticamente', {
                description: 'El pago se reflejará inmediatamente en los pagos completados',
              })
            }
          }

          // Forzar refresh inmediato de la lista
          queryClient.invalidateQueries({ queryKey: ['inscripciones'] })
          queryClient.invalidateQueries({ queryKey: ['pagos'] })
        } catch (pagoError: any) {
          console.error('Error al actualizar pago:', pagoError)
          toast.warning('Inscripción creada, pero hubo un error al registrar el pago', {
            description: 'Puedes actualizar el pago manualmente desde la lista',
          })
        }
      }

      // Obtener la inscripción completa con pagos para el modal
      let inscripcionCompleta = nuevaInscripcion
      try {
        // Esperar un momento para que el backend procese todo
        await new Promise(resolve => setTimeout(resolve, 300))
        inscripcionCompleta = await inscripcionesApi.getById(nuevaInscripcion.id)
      } catch (error) {
        console.warn(
          'No se pudo obtener la inscripción completa para el modal, usando datos básicos'
        )
        // Usar datos básicos de la respuesta
        inscripcionCompleta = {
          ...nuevaInscripcion,
          convencion: convenciones.find((c: any) => c.id === wizardData.convencionId),
          pagos: nuevaInscripcion.pagos || [],
        }
      }

      // Determinar estado del pago
      const pagoFueCreado = wizardData.crearPagoInmediato
      const pagoFueValidado =
        wizardData.crearPagoInmediato &&
        wizardData.referencia?.trim() &&
        (wizardData.metodoPago === 'efectivo' || wizardData.comprobanteUrl)

      // Asegurar que la inscripción tenga todos los campos necesarios
      const inscripcionParaModal = {
        id: inscripcionCompleta.id || nuevaInscripcion.id,
        nombre: inscripcionCompleta.nombre || wizardData.nombre,
        apellido: inscripcionCompleta.apellido || wizardData.apellido,
        email: inscripcionCompleta.email || wizardData.email,
        convencion:
          inscripcionCompleta.convencion ||
          convenciones.find((c: any) => c.id === wizardData.convencionId),
        numeroCuotas: inscripcionCompleta.numeroCuotas || wizardData.numeroCuotas,
        pagos: inscripcionCompleta.pagos || [],
      }

      // Guardar datos para el modal
      setInscripcionCreada(inscripcionParaModal)
      setPagoCreado(pagoFueCreado)
      setPagoValidado(pagoFueValidado)

      // Cerrar wizard
      setShowNuevaInscripcionDialog(false)

      // Navegación automática después de un breve delay (sin modal)
      setTimeout(() => {
        handleNavegarAInscripcion(nuevaInscripcion.id)
      }, 500)
    } catch (error: any) {
      console.error('Error al crear inscripción:', error)
      throw error // Re-lanzar para que el wizard maneje el error
    }
  }

  // Función para navegar automáticamente a la inscripción creada
  const handleNavegarAInscripcion = (inscripcionId: string) => {
    // Filtrar por la inscripción creada (buscar por nombre)
    const inscripcion = inscripciones.find((insc: any) => insc.id === inscripcionId)
    if (inscripcion) {
      // Buscar por nombre y apellido para filtrar
      const nombreCompleto = `${inscripcion.nombre} ${inscripcion.apellido}`
      setSearchTerm(nombreCompleto)

      // Scroll a la card después de que se actualice la lista
      setTimeout(() => {
        const cardElement = inscripcionCardRefs.current[inscripcionId]
        if (cardElement) {
          cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Resaltar visualmente
          cardElement.classList.add('ring-4', 'ring-emerald-500', 'animate-pulse')
          setTimeout(() => {
            cardElement.classList.remove('ring-4', 'ring-emerald-500', 'animate-pulse')
          }, 3000)
        }
      }, 800)
    }
  }

  // Función para ver la inscripción (desde el modal)
  const handleVerInscripcion = () => {
    if (inscripcionCreada?.id) {
      handleNavegarAInscripcion(inscripcionCreada.id)
    }
  }

  // Función para crear siguiente pago (desde el modal)
  const handleCrearSiguientePago = () => {
    if (inscripcionCreada) {
      const pagosInfo = getPagosInfo(inscripcionCreada)
      // Solo buscar cuotas que NO tienen pago (no crear duplicados)
      const siguienteCuota = pagosInfo.cuotas.find((c: any) => !c.pago)
      if (siguienteCuota) {
        handleOpenDialog({ ...inscripcionCreada, numeroCuota: siguienteCuota.numero }, null)
      } else {
        toast.info('Todas las cuotas ya tienen pagos creados', {
          description: 'Revisa los pagos pendientes o completa los existentes',
        })
      }
    }
  }

  // Función para cancelar inscripción
  const handleCancelarInscripcion = async () => {
    if (!inscripcionACancelar) return

    try {
      await cancelarInscripcionMutation.mutateAsync({
        id: inscripcionACancelar.id,
        motivo: motivoCancelacion || undefined,
      })

      setShowCancelarDialog(false)
      setInscripcionACancelar(null)
      setMotivoCancelacion('')
    } catch (error) {
      console.error('Error al cancelar inscripción:', error)
    }
  }

  // Función para enviar recordatorios
  const handleEnviarRecordatorios = async () => {
    try {
      const convencionIdParaRecordatorios = convencionSeleccionada?.id || undefined
      const resultado = await enviarRecordatoriosMutation.mutateAsync(convencionIdParaRecordatorios)
      setResultadoRecordatorios(resultado)
    } catch (error) {
      console.error('Error al enviar recordatorios:', error)
    }
  }

  // Función para abrir editar inscripción (solo datos del invitado, no pagos)
  const abrirEditarInscripcion = async (insc: any) => {
    // Cargar la inscripción completa
    try {
      const inscripcionCompleta = await inscripcionesApi.getById(insc.id)
      setInscripcionParaEditar(inscripcionCompleta)
      setShowEditarInscripcionDialog(true)
    } catch (error) {
      console.error('Error al cargar inscripción:', error)
      toast.error('Error al cargar los datos de la inscripción')
    }
  }

  // Función para guardar cambios de inscripción
  const handleGuardarEdicion = async () => {
    if (!inscripcionAEditar) return

    try {
      // Filtrar campos vacíos y convertir a undefined para que el validador los ignore
      const dataToUpdate: any = {}

      if (editarForm.nombre && editarForm.nombre.trim()) {
        dataToUpdate.nombre = editarForm.nombre.trim()
      }
      if (editarForm.apellido && editarForm.apellido.trim()) {
        dataToUpdate.apellido = editarForm.apellido.trim()
      }
      if (editarForm.email && editarForm.email.trim()) {
        dataToUpdate.email = editarForm.email.trim().toLowerCase()
      }
      // Solo incluir teléfono si tiene valor y cumple con el mínimo de caracteres
      if (editarForm.telefono && editarForm.telefono.trim().length >= 8) {
        dataToUpdate.telefono = editarForm.telefono.trim()
      } else if (editarForm.telefono === '') {
        // Si está vacío, enviar null para limpiar el campo
        dataToUpdate.telefono = null
      }
      // Sede puede estar vacía
      if (editarForm.sede !== undefined) {
        dataToUpdate.sede = editarForm.sede.trim() || null
      }
      if (editarForm.tipoInscripcion && editarForm.tipoInscripcion.trim()) {
        dataToUpdate.tipoInscripcion = editarForm.tipoInscripcion.trim()
      }
      // Notas puede estar vacía
      if (editarForm.notas !== undefined) {
        dataToUpdate.notas = editarForm.notas.trim() || null
      }

      await updateInscripcionMutation.mutateAsync({
        id: inscripcionAEditar.id,
        data: dataToUpdate,
      })
      setShowEditarDialog(false)
      setInscripcionAEditar(null)
    } catch (error: any) {
      console.error('Error al actualizar inscripción:', error)
      // El hook ya maneja el toast de error, pero podemos agregar más detalles si es necesario
      const errorMessage =
        error.response?.data?.message || error.message || 'Error al actualizar la inscripción'
      if (error.response?.data?.message) {
        toast.error('Error de validación', {
          description: errorMessage,
        })
      }
    }
  }

  // Función para exportar/imprimir lista de inscripciones
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
            .header p {
              color: #666;
              margin: 5px 0;
            }
            .info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              padding: 15px;
              background: #fef3c7;
              border-radius: 8px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background: #f59e0b;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: bold;
            }
            td {
              padding: 10px;
              border-bottom: 1px solid #e5e7eb;
            }
            tr:nth-child(even) {
              background: #f9fafb;
            }
            .badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
            }
            .badge-completo {
              background: #10b981;
              color: white;
            }
            .badge-pendiente {
              background: #f59e0b;
              color: white;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #666;
              font-size: 12px;
              border-top: 1px solid #e5e7eb;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Lista de Inscripciones</h1>
            <p><strong>${convencionActiva?.titulo || 'Convención'}</strong></p>
            <p>Exportado el ${fechaExport}</p>
          </div>
          
          <div class="info">
            <div>
              <strong>Total de Inscripciones:</strong> ${filteredInscripciones.length}
            </div>
            <div>
              <strong>Convención:</strong> ${convencionActiva?.titulo || 'N/A'}
            </div>
            <div>
              <strong>Fecha:</strong> ${convencionActiva?.fechaInicio ? format(new Date(convencionActiva.fechaInicio), "d 'de' MMMM, yyyy", { locale: es }) : 'N/A'}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre Completo</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Sede</th>
                <th>País</th>
                <th>Provincia</th>
                <th>Código Referencia</th>
                <th>Cuotas</th>
                <th>Estado Pago</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${filteredInscripciones
                .map((insc: any, index: number) => {
                  const pagosInfo = getPagosInfo(insc)
                  const pagoCompleto = pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas

                  // Usar campos directos de país y provincia
                  const pais = insc.pais || '-'
                  const provincia = insc.provincia || ''
                  const paisCompleto = provincia ? `${pais}, ${provincia}` : pais
                  const sedeNombre = insc.sede || '-'

                  return `
                  <tr>
                    <td>${index + 1}</td>
                    <td><strong>${insc.nombre} ${insc.apellido}</strong></td>
                    <td>${insc.email}</td>
                    <td>${insc.telefono || '-'}</td>
                    <td>${sedeNombre}</td>
                    <td>${pais}</td>
                    <td>${provincia || '-'}</td>
                    <td><strong style="font-family: monospace;">${insc.codigoReferencia || '-'}</strong></td>
                    <td>${pagosInfo.cuotasPagadas}/${pagosInfo.numeroCuotas}</td>
                    <td>
                      <span class="badge ${pagoCompleto ? 'badge-completo' : 'badge-pendiente'}">
                        ${pagoCompleto ? 'Completo' : 'Pendiente'}
                      </span>
                    </td>
                    <td>${insc.estado}</td>
                  </tr>
                `
                })
                .join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Asociación Misionera Vida Abundante - AMVA Digital</p>
            <p>Documento generado el ${fechaExport}</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  // Función para exportar a CSV
  const handleExportInscripcionesCSV = () => {
    const convencionActiva = convenciones.find((c: any) => c.activa) || convenciones[0]

    const headers = [
      'Nombre',
      'Apellido',
      'Email',
      'Teléfono',
      'Sede',
      'País',
      'Convención',
      'Código de Referencia',
      'Cuotas Pagadas',
      'Total Cuotas',
      'Estado Pago',
      'Estado Inscripción',
      'Fecha Inscripción',
    ]

    const rows = filteredInscripciones.map((insc: any) => {
      const pagosInfo = getPagosInfo(insc)
      const pagoCompleto = pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas

      // Usar campos directos de país y provincia
      const pais = insc.pais || ''
      const provincia = insc.provincia || ''
      const paisCompleto = provincia ? `${pais}, ${provincia}` : pais
      const sedeNombre = insc.sede || ''

      return [
        insc.nombre,
        insc.apellido,
        insc.email,
        insc.telefono || '',
        sedeNombre,
        insc.pais || '',
        insc.provincia || '',
        insc.convencion?.titulo || '',
        insc.codigoReferencia || '',
        pagosInfo.cuotasPagadas,
        pagosInfo.numeroCuotas,
        pagoCompleto ? 'Completo' : 'Pendiente',
        insc.estado,
        format(new Date(insc.fechaInscripcion), 'dd/MM/yyyy HH:mm', { locale: es }),
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `inscripciones_${convencionActiva?.titulo?.replace(/\s+/g, '_') || 'convencion'}_${format(new Date(), 'yyyy-MM-dd', { locale: es })}.csv`
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Lista exportada exitosamente')
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-amber-50 dark:hover:bg-amber-500/10"
          >
            <ChevronLeft className="size-5 text-amber-600 dark:text-amber-400" />
          </Button>
        </Link>
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 rounded-xl blur-xl dark:from-amber-500/5 dark:via-yellow-500/5 dark:to-orange-500/5" />
          <div className="relative">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 dark:from-amber-400 dark:via-yellow-400 dark:to-orange-400 bg-clip-text text-transparent">
              Gestión de Inscripciones
            </h1>
            <p className="text-muted-foreground mt-1">
              Ver y gestionar todas las inscripciones a convenciones
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{estadisticas.total}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <UserCheck className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nuevas (24h)</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {estadisticas.nuevas}
                </p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <Sparkles className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hoy</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {estadisticas.hoy}
                </p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <Calendar className="size-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confirmadas</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {estadisticas.confirmadas}
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  onClick={() => setShowNuevaInscripcionDialog(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md"
                >
                  <UserPlus className="size-4 mr-2" />
                  Agregar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowRecordatoriosDialog(true)}
                  className="border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                >
                  <Bell className="size-4 mr-2" />
                  Recordatorios
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowReporteDialog(true)}
                  className="border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                >
                  <BarChart3 className="size-4 mr-2" />
                  Reporte
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportInscripciones}
                  className="border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                >
                  <Printer className="size-4 mr-2" />
                  Imprimir
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  placeholder="Buscar por nombre, email, código de referencia o teléfono..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              {convencionesUnicas.length > 0 && (
                <Select value={convencionFilter} onValueChange={setConvencionFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Convención" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas las convenciones</SelectItem>
                    {convencionesUnicas.map((titulo: string) => (
                      <SelectItem key={titulo} value={titulo}>
                        {titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select value={pagoCompletoFilter} onValueChange={setPagoCompletoFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Estado de Pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los pagos</SelectItem>
                  <SelectItem value="completo">Pago Completo (3/3)</SelectItem>
                  <SelectItem value="pendiente">Pago Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tabla de inscripciones */}
            <div className="space-y-4">
              {filteredInscripciones.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  {inscripciones.length === 0
                    ? 'No hay inscripciones registradas'
                    : 'No se encontraron inscripciones con los filtros aplicados'}
                </div>
              ) : (
                filteredInscripciones.map((insc: any) => {
                  const pagosInfo = getPagosInfo(insc)

                  return (
                    <Card
                      key={insc.id}
                      ref={el => {
                        if (el) inscripcionCardRefs.current[insc.id] = el
                      }}
                      data-inscripcion-id={insc.id}
                      className="border-amber-200/50 dark:border-amber-500/20 transition-all"
                    >
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          {/* Información del inscrito */}
                          <div className="lg:col-span-5 space-y-4">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-lg">
                                  {insc.nombre} {insc.apellido}
                                </h3>
                                {/* Badge de origen de inscripción */}
                                {insc.origenRegistro === 'mobile' ? (
                                  <Badge
                                    variant="outline"
                                    className="bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 text-xs"
                                    title="Pastor registrado - Inscrito desde la app móvil (requiere cuenta)"
                                  >
                                    <Smartphone className="size-3 mr-1" />
                                    Pastor App
                                  </Badge>
                                ) : insc.origenRegistro === 'dashboard' ? (
                                  <Badge
                                    variant="outline"
                                    className="bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-xs"
                                    title="Inscrito manualmente desde el dashboard de administración"
                                  >
                                    <User className="size-3 mr-1" />
                                    Admin
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-xs"
                                    title="Inscrito desde el formulario web"
                                  >
                                    <Globe className="size-3 mr-1" />
                                    Web
                                  </Badge>
                                )}
                                {/* Badge de tipo de inscripción para invitados */}
                                {insc.tipoInscripcion === 'invitado' && (
                                  <Badge
                                    variant="outline"
                                    className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300 text-xs"
                                    title="Invitado especial"
                                  >
                                    <Star className="size-3 mr-1" />
                                    Invitado
                                  </Badge>
                                )}
                                {esNueva(insc) && (
                                  <Badge className="bg-emerald-500 text-white animate-pulse">
                                    ✨ Nueva
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {insc.convencion?.titulo || 'Sin convención'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Inscrito:{' '}
                                {format(
                                  new Date(insc.fechaInscripcion),
                                  "d 'de' MMMM, yyyy 'a las' HH:mm",
                                  { locale: es }
                                )}
                              </p>
                              {insc.codigoReferencia && (
                                <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                                  <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold mb-1">
                                    🔖 Código de Referencia:
                                  </p>
                                  <p className="text-sm font-mono font-bold text-emerald-900 dark:text-emerald-100">
                                    {insc.codigoReferencia}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Mail className="size-4 text-muted-foreground" />
                                <span>{insc.email}</span>
                              </div>
                              {insc.telefono && (
                                <div className="flex items-center gap-2">
                                  <Phone className="size-4 text-muted-foreground" />
                                  <span>{insc.telefono}</span>
                                </div>
                              )}
                              {insc.sede && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="size-4 text-muted-foreground" />
                                  <span>{insc.sede}</span>
                                </div>
                              )}
                              {(insc.pais || insc.provincia) && (
                                <div className="flex items-center gap-2">
                                  <Globe className="size-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">
                                    <span className="text-amber-600 dark:text-amber-400">
                                      {insc.pais || ''}
                                    </span>
                                    {insc.provincia && (
                                      <span className="text-muted-foreground">
                                        , {insc.provincia}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Calendar className="size-4 text-muted-foreground" />
                                <span>
                                  {format(new Date(insc.fechaInscripcion), "d 'de' MMMM, yyyy", {
                                    locale: es,
                                  })}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  insc.estado === 'confirmado'
                                    ? 'default'
                                    : insc.estado === 'cancelado'
                                      ? 'destructive'
                                      : 'secondary'
                                }
                                className={
                                  insc.estado === 'confirmado'
                                    ? 'bg-emerald-500 hover:bg-emerald-600'
                                    : ''
                                }
                              >
                                {insc.estado}
                              </Badge>
                              {pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas && (
                                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                                  <CheckCircle2 className="size-3 mr-1" />
                                  Pago Completo
                                </Badge>
                              )}
                              {/* Botón editar - Deshabilitado si todos los pagos están completados */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => abrirEditarInscripcion(insc)}
                                disabled={pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas}
                                className="h-6 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                title={
                                  pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas
                                    ? 'No se puede editar una inscripción con todos los pagos completados'
                                    : 'Editar información de la inscripción'
                                }
                              >
                                <Pencil className="size-3 mr-1" />
                                Editar
                              </Button>
                              {/* Botón cancelar (solo si no está cancelada ni confirmada) */}
                              {insc.estado !== 'cancelado' && insc.estado !== 'confirmado' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setInscripcionACancelar(insc)
                                    setMotivoCancelacion('')
                                    setShowCancelarDialog(true)
                                  }}
                                  className="h-6 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                                >
                                  <XCircle className="size-3 mr-1" />
                                  Cancelar
                                </Button>
                              )}
                              {/* Botón rehabilitar (solo si está cancelada) */}
                              {insc.estado === 'cancelado' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      await rehabilitarInscripcionMutation.mutateAsync(insc.id)
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
                                  disabled={rehabilitarInscripcionMutation.isPending}
                                  className="h-6 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                >
                                  {rehabilitarInscripcionMutation.isPending ? (
                                    <Loader2 className="size-3 mr-1 animate-spin" />
                                  ) : (
                                    <RefreshCw className="size-3 mr-1" />
                                  )}
                                  Rehabilitar
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Gestión de cuotas */}
                          <div className="lg:col-span-7">
                            <div className="space-y-4">
                              {/* Resumen de pagos */}
                              <div
                                className={`p-4 rounded-lg border ${
                                  pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas
                                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/50'
                                    : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/50'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <DollarSign
                                      className={`size-4 ${
                                        pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas
                                          ? 'text-emerald-600 dark:text-emerald-400'
                                          : 'text-amber-600 dark:text-amber-400'
                                      }`}
                                    />
                                    <span className="font-semibold text-sm">Estado de Pagos</span>
                                  </div>
                                  <Badge
                                    variant={
                                      pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas
                                        ? 'default'
                                        : 'outline'
                                    }
                                    className={
                                      pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas
                                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                        : 'bg-white dark:bg-background'
                                    }
                                  >
                                    {pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas ? (
                                      <>
                                        <CheckCircle2 className="size-3 mr-1" />
                                        {pagosInfo.cuotasPagadas}/{pagosInfo.numeroCuotas} cuotas
                                      </>
                                    ) : (
                                      `${pagosInfo.cuotasPagadas}/${pagosInfo.numeroCuotas} cuotas`
                                    )}
                                  </Badge>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Total:</span>
                                    <span className="font-semibold">
                                      ${pagosInfo.costoTotal.toLocaleString('es-AR')}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Pagado:</span>
                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                      ${pagosInfo.totalPagado.toLocaleString('es-AR')}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Pendiente:</span>
                                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                                      $
                                      {(
                                        pagosInfo.costoTotal - pagosInfo.totalPagado
                                      ).toLocaleString('es-AR')}
                                    </span>
                                  </div>
                                  <div className="mt-2 h-2 bg-amber-200/50 dark:bg-amber-900/30 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                                      style={{ width: `${pagosInfo.porcentajePagado}%` }}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Lista de cuotas */}
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">
                                  Cuotas ({pagosInfo.numeroCuotas}{' '}
                                  {pagosInfo.numeroCuotas === 1 ? 'pago' : 'pagos'})
                                </h4>
                                {pagosInfo.cuotas.map(cuota => (
                                  <div
                                    key={cuota.numero}
                                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                          cuota.estado === 'COMPLETADO'
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                        }`}
                                      >
                                        {cuota.numero}
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium">
                                          Cuota {cuota.numero}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          ${cuota.monto.toLocaleString('es-AR')}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {cuota.pago ? (
                                        <>
                                          {/* Badge de estado */}
                                          <Badge
                                            variant={
                                              cuota.estado === 'COMPLETADO'
                                                ? 'default'
                                                : 'secondary'
                                            }
                                            className={
                                              cuota.estado === 'COMPLETADO'
                                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                                            }
                                          >
                                            {cuota.estado === 'COMPLETADO' ? 'Pagado' : 'Pendiente'}
                                          </Badge>

                                          {/* Referencia si existe */}
                                          {cuota.pago.referencia && (
                                            <span className="text-xs text-muted-foreground">
                                              {cuota.pago.referencia}
                                            </span>
                                          )}

                                          {/* Ver comprobante si existe */}
                                          {cuota.pago.comprobanteUrl && (
                                            <Dialog>
                                              <DialogTrigger asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-6 text-xs hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                                >
                                                  <ImageIcon className="size-3 mr-1" />
                                                  Ver
                                                </Button>
                                              </DialogTrigger>
                                              <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                  <DialogTitle>Comprobante de Pago</DialogTitle>
                                                  <DialogDescription>
                                                    Cuota {cuota.numero} - {insc.nombre}{' '}
                                                    {insc.apellido}
                                                    {cuota.pago.referencia &&
                                                      ` - ${cuota.pago.referencia}`}
                                                  </DialogDescription>
                                                </DialogHeader>
                                                <div className="relative w-full h-[500px] rounded-lg overflow-hidden border bg-muted/30">
                                                  <Image
                                                    src={cuota.pago.comprobanteUrl}
                                                    alt="Comprobante de pago"
                                                    fill
                                                    className="object-contain"
                                                  />
                                                </div>
                                              </DialogContent>
                                            </Dialog>
                                          )}

                                          {/* Si está PENDIENTE, mostrar mensaje informativo */}
                                          {cuota.estado === 'PENDIENTE' && (
                                            <span className="text-xs text-muted-foreground italic">
                                              En proceso de confirmación
                                            </span>
                                          )}

                                          {/* Si está COMPLETADO, no permitir editar (pago ya confirmado) */}
                                          {cuota.estado === 'COMPLETADO' && (
                                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                              ✓ Confirmado
                                            </span>
                                          )}
                                        </>
                                      ) : (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            handleOpenDialog(
                                              { ...insc, numeroCuota: cuota.numero },
                                              cuota.pago
                                            )
                                          }
                                          className="text-xs"
                                        >
                                          <Plus className="size-3 mr-1" />
                                          Crear
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Botón para ver en pagos */}
                              <Link href={`/admin/pagos?inscripcionId=${insc.id}`}>
                                <Button variant="outline" size="sm" className="w-full">
                                  <CreditCard className="size-4 mr-2" />
                                  Ver todos los pagos
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
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
          monto={getPagosInfo(selectedInscripcion).montoPorCuota}
          pagoExistente={selectedPago}
          onUpdate={handleQuickPagoUpdate}
          isUpdating={createPagoMutation.isPending || updatePagoMutation.isPending}
        />
      )}

      {/* Diálogo para editar solo información de inscripción (sin pagos) */}
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
          // Recargar la inscripción con pagos
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
          // Recargar la inscripción para obtener los pagos actualizados
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
          // Recargar la inscripción para obtener los pagos actualizados
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

      {/* Dialog: Editar Inscripción */}
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
