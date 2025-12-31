'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useInscripciones, useCreateInscripcion, useCancelarInscripcion, useRehabilitarInscripcion, useReporteIngresos, useEnviarRecordatorios, useUpdateInscripcion } from '@/lib/hooks/use-inscripciones'
import { useCreatePago, useUpdatePago } from '@/lib/hooks/use-pagos'
import { useConvenciones } from '@/lib/hooks/use-convencion'
import { useSmartSync, useSmartPolling } from '@/lib/hooks/use-smart-sync'
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
} from "@/components/ui/alert-dialog"
import { Textarea } from '@/components/ui/textarea'
import { Search, UserCheck, ChevronLeft, Mail, Phone, MapPin, Calendar, FileText, CreditCard, Plus, DollarSign, CheckCircle2, Image as ImageIcon, X, Printer, Download, Sparkles, Smartphone, Globe, User, UserPlus, Star, Bell, TrendingUp, XCircle, BarChart3, AlertTriangle, Loader2, Pencil, Save, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import { ComprobanteUpload } from '@/components/ui/comprobante-upload'
import { uploadApi } from '@/lib/api/upload'
import { ScrollReveal } from '@/components/scroll-reveal'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

export default function InscripcionesPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [estadoFilter, setEstadoFilter] = useState('todos')
    const [convencionFilter, setConvencionFilter] = useState('todos')
    const [pagoCompletoFilter, setPagoCompletoFilter] = useState('todos')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(20)

    // Debounce para búsqueda
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm)
            setCurrentPage(1) // Reset a página 1 cuando cambia la búsqueda
        }, 300)
        return () => clearTimeout(timer)
    }, [searchTerm])
    const [selectedInscripcion, setSelectedInscripcion] = useState<any>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [pagoForm, setPagoForm] = useState({
        metodoPago: 'transferencia',
        referencia: '',
        comprobanteUrl: '',
        notas: '',
    })
    const [isUploadingComprobante, setIsUploadingComprobante] = useState(false)
    
    // Estado para diálogo de nueva inscripción manual
    const [showNuevaInscripcionDialog, setShowNuevaInscripcionDialog] = useState(false)
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
    useSmartPolling(["inscripciones", currentPage, pageSize], 30000)

    const { data: convenciones = [] } = useConvenciones()

    // Obtener convencionId del filtro de convención
    const convencionSeleccionada = convenciones.find((c: any) => c.titulo === convencionFilter)

    // Construir filtros para el servidor
    const filters = {
        search: debouncedSearchTerm || undefined,
        estado: estadoFilter !== 'todos' ? estadoFilter : undefined,
        convencionId: convencionSeleccionada?.id || undefined,
    }

    const { data: inscripcionesResponse, isLoading } = useInscripciones(currentPage, pageSize, filters)
    // Manejar respuesta paginada o array directo (compatibilidad)
    const inscripciones = Array.isArray(inscripcionesResponse) 
      ? inscripcionesResponse 
      : inscripcionesResponse?.data || []
    const paginationMeta = Array.isArray(inscripcionesResponse) 
      ? null 
      : inscripcionesResponse?.meta
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
            .reduce((sum: number, p: any) => sum + (typeof p.monto === 'number' ? p.monto : parseFloat(p.monto || 0)), 0)

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
        const matchPagoCompleto = pagoCompletoFilter === 'todos' ||
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
        const requiereComprobante = pagoForm.metodoPago === 'transferencia' || pagoForm.metodoPago === 'mercadopago'

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

    const handleOpenDialog = (inscripcion: any) => {
        setSelectedInscripcion(inscripcion)
        setPagoForm({ metodoPago: 'transferencia', referencia: '', comprobanteUrl: '', notas: '' })
        setDialogOpen(true)
    }

    // Función para crear inscripción manual
    const handleCrearInscripcionManual = async () => {
        // Validaciones básicas
        if (!nuevaInscripcionForm.nombre.trim()) {
            toast.error('El nombre es requerido')
            return
        }
        if (!nuevaInscripcionForm.apellido.trim()) {
            toast.error('El apellido es requerido')
            return
        }
        if (!nuevaInscripcionForm.email.trim()) {
            toast.error('El email es requerido')
            return
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(nuevaInscripcionForm.email)) {
            toast.error('El formato del email no es válido')
            return
        }

        // Obtener convención activa
        const convencionActiva = convenciones.find((c: any) => c.activa)
        if (!convencionActiva) {
            toast.error('No hay convención activa para inscribir')
            return
        }

        try {
            await createInscripcionMutation.mutateAsync({
                convencionId: convencionActiva.id,
                nombre: nuevaInscripcionForm.nombre.trim(),
                apellido: nuevaInscripcionForm.apellido.trim(),
                email: nuevaInscripcionForm.email.trim().toLowerCase(),
                telefono: nuevaInscripcionForm.telefono.trim() || undefined,
                sede: nuevaInscripcionForm.sede.trim() || 'Sin sede especificada',
                tipoInscripcion: nuevaInscripcionForm.tipoInscripcion,
                numeroCuotas: nuevaInscripcionForm.numeroCuotas,
                origenRegistro: 'dashboard',
                notas: nuevaInscripcionForm.notas.trim() || `Inscripción manual creada desde admin`,
            })

            // Limpiar formulario y cerrar diálogo
            setShowNuevaInscripcionDialog(false)
            setNuevaInscripcionForm({
                nombre: '',
                apellido: '',
                email: '',
                telefono: '',
                sede: '',
                tipoInscripcion: 'invitado',
                numeroCuotas: 3,
                notas: '',
            })
            
            toast.success('Inscripción creada exitosamente', {
                description: `${nuevaInscripcionForm.nombre} ${nuevaInscripcionForm.apellido} ha sido inscrito a la convención`,
            })
        } catch (error: any) {
            console.error('Error al crear inscripción:', error)
            // El hook ya maneja el toast de error
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

    const handleRehabilitarInscripcion = async (inscripcionId: string) => {
        try {
            await rehabilitarInscripcionMutation.mutateAsync(inscripcionId)
        } catch (error) {
            console.error('Error al rehabilitar inscripción:', error)
        }
    }

    // Función para enviar recordatorios
    const handleEnviarRecordatorios = async () => {
        try {
            // Limpiar resultado anterior
            setResultadoRecordatorios(null)
            
            // Mostrar toast de inicio
            toast.info('📧 Enviando recordatorios...', {
                description: 'Esto puede tardar unos segundos',
                duration: 3000,
            })
            
            const resultado = await enviarRecordatoriosMutation.mutateAsync()
            setResultadoRecordatorios(resultado)
            
            // El toast de éxito/error ya se maneja en el hook useEnviarRecordatorios
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            console.error('Error al enviar recordatorios:', error)
            
            // El toast de error ya se maneja en el hook, pero agregamos uno adicional si es necesario
            toast.error('Error al enviar recordatorios', {
                description: errorMessage,
                duration: 6000,
            })
            
            // Establecer resultado con error para mostrar en el diálogo
            setResultadoRecordatorios({
                enviados: 0,
                fallidos: 0,
                detalles: [],
            })
        }
    }

    // Función para abrir editar inscripción
    const abrirEditarInscripcion = (insc: any) => {
        setInscripcionAEditar(insc)
        setEditarForm({
            nombre: insc.nombre || '',
            apellido: insc.apellido || '',
            email: insc.email || '',
            telefono: insc.telefono || '',
            sede: insc.sede || '',
            tipoInscripcion: insc.tipoInscripcion || 'pastor',
            notas: insc.notas || '',
        })
        setShowEditarDialog(true)
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
            const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar la inscripción'
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
                <th>Código Referencia</th>
                <th>Cuotas</th>
                <th>Estado Pago</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${filteredInscripciones.map((insc: any, index: number) => {
            const pagosInfo = getPagosInfo(insc)
            const pagoCompleto = pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas

            // Extraer país y provincia de la sede
            let pais = '-'
            let sedeNombre = insc.sede || '-'

            if (insc.sede && insc.sede.includes(' - ')) {
                const partes = insc.sede.split(' - ')
                sedeNombre = partes[0] || '-'
                const ubicacion = partes[partes.length - 1] || ''

                // Extraer país (antes de la coma si hay provincia)
                if (ubicacion.includes(',')) {
                    pais = ubicacion.split(',')[0].trim()
                } else {
                    pais = ubicacion.trim() || '-'
                }
            }

            return `
                  <tr>
                    <td>${index + 1}</td>
                    <td><strong>${insc.nombre} ${insc.apellido}</strong></td>
                    <td>${insc.email}</td>
                    <td>${insc.telefono || '-'}</td>
                    <td>${sedeNombre}</td>
                    <td>${pais}</td>
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
        }).join('')}
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
            'Fecha Inscripción'
        ]

        const rows = filteredInscripciones.map((insc: any) => {
            const pagosInfo = getPagosInfo(insc)
            const pagoCompleto = pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas

            // Extraer país de la sede
            let pais = ''
            let sedeNombre = insc.sede || ''

            if (insc.sede && insc.sede.includes(' - ')) {
                const partes = insc.sede.split(' - ')
                sedeNombre = partes[0] || ''
                const ubicacion = partes[partes.length - 1] || ''

                // Extraer país (antes de la coma si hay provincia)
                if (ubicacion.includes(',')) {
                    pais = ubicacion.split(',')[0].trim()
                } else {
                    pais = ubicacion.trim()
                }
            }

            return [
                insc.nombre,
                insc.apellido,
                insc.email,
                insc.telefono || '',
                sedeNombre,
                pais,
                insc.convencion?.titulo || '',
                insc.codigoReferencia || '',
                pagosInfo.cuotasPagadas,
                pagosInfo.numeroCuotas,
                pagoCompleto ? 'Completo' : 'Pendiente',
                insc.estado,
                format(new Date(insc.fechaInscripcion), "dd/MM/yyyy HH:mm", { locale: es })
            ]
        })

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `inscripciones_${convencionActiva?.titulo?.replace(/\s+/g, '_') || 'convencion'}_${format(new Date(), 'yyyy-MM-dd', { locale: es })}.csv`)
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
                    <Button variant="ghost" size="icon" className="hover:bg-amber-50 dark:hover:bg-amber-500/10">
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
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{estadisticas.nuevas}</p>
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
                                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{estadisticas.hoy}</p>
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
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{estadisticas.confirmadas}</p>
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
                                    onChange={(e) => setSearchTerm(e.target.value)}
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
                                                                Inscrito: {format(new Date(insc.fechaInscripcion), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                                                            </p>
                                                            {insc.codigoReferencia && (
                                                                <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                                                                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold mb-1">🔖 Código de Referencia:</p>
                                                                    <p className="text-sm font-mono font-bold text-emerald-900 dark:text-emerald-100">{insc.codigoReferencia}</p>
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
                                                                <>
                                                                    {/* Mostrar sede (iglesia) si existe y no contiene " - " */}
                                                                    {!insc.sede.includes(' - ') && (
                                                                        <div className="flex items-center gap-2">
                                                                            <MapPin className="size-4 text-muted-foreground" />
                                                                            <span>{insc.sede}</span>
                                                                        </div>
                                                                    )}
                                                                    {/* Si sede contiene " - ", separar sede, país y provincia */}
                                                                    {insc.sede.includes(' - ') && (
                                                                        <>
                                                                            {insc.sede.split(' - ')[0] && (
                                                                                <div className="flex items-center gap-2">
                                                                                    <MapPin className="size-4 text-muted-foreground" />
                                                                                    <span className="text-sm">{insc.sede.split(' - ')[0]}</span>
                                                                                </div>
                                                                            )}
                                                                            <div className="flex items-center gap-2">
                                                                                <MapPin className="size-4 text-muted-foreground" />
                                                                                <span className="text-sm font-medium">
                                                                                    {(() => {
                                                                                        const ubicacion = insc.sede.split(' - ').slice(-1)[0]
                                                                                        if (ubicacion.includes(',')) {
                                                                                            // Si tiene coma, separar país y provincia
                                                                                            const [pais, provincia] = ubicacion.split(',').map((s: string) => s.trim())
                                                                                            return (
                                                                                                <span>
                                                                                                    <span className="text-amber-600 dark:text-amber-400">{pais}</span>
                                                                                                    {provincia && <span className="text-muted-foreground">, {provincia}</span>}
                                                                                                </span>
                                                                                            )
                                                                                        }
                                                                                        return <span className="text-amber-600 dark:text-amber-400">{ubicacion}</span>
                                                                                    })()}
                                                                                </span>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </>
                                                            )}
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="size-4 text-muted-foreground" />
                                                                <span>
                                                                    {format(new Date(insc.fechaInscripcion), "d 'de' MMMM, yyyy", { locale: es })}
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
                                                            {/* Botón editar - Deshabilitado si todos los pagos están completados o inscripción confirmada */}
                                                            {(() => {
                                                                const pagosInfo = getPagosInfo(insc)
                                                                const todosPagosCompletados = pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas
                                                                const estaConfirmada = insc.estado === 'confirmado'
                                                                const deshabilitado = todosPagosCompletados || estaConfirmada
                                                                
                                                                return (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => abrirEditarInscripcion(insc)}
                                                                        disabled={deshabilitado}
                                                                        className="h-6 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        title={
                                                                            deshabilitado
                                                                                ? estaConfirmada
                                                                                    ? 'No se puede editar una inscripción confirmada'
                                                                                    : 'No se puede editar una inscripción con todos los pagos completados'
                                                                                : 'Editar información de la inscripción'
                                                                        }
                                                                    >
                                                                        <Pencil className="size-3 mr-1" />
                                                                        Editar
                                                                    </Button>
                                                                )
                                                            })()}
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
                                                                    onClick={() => handleRehabilitarInscripcion(insc.id)}
                                                                    disabled={rehabilitarInscripcionMutation.isPending}
                                                                    className="h-6 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                                                    title="Rehabilitar inscripción y pagos cancelados"
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
                                                            <div className={`p-4 rounded-lg border ${pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas
                                                                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/50'
                                                                : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/50'
                                                                }`}>
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <DollarSign className={`size-4 ${pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas
                                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                                            : 'text-amber-600 dark:text-amber-400'
                                                                            }`} />
                                                                        <span className="font-semibold text-sm">Estado de Pagos</span>
                                                                    </div>
                                                                    <Badge
                                                                        variant={pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas ? 'default' : 'outline'}
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
                                                                            ${(pagosInfo.costoTotal - pagosInfo.totalPagado).toLocaleString('es-AR')}
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
                                                                <h4 className="text-sm font-semibold">Cuotas ({pagosInfo.numeroCuotas} {pagosInfo.numeroCuotas === 1 ? 'pago' : 'pagos'})</h4>
                                                                {pagosInfo.cuotas.map((cuota) => (
                                                                    <div
                                                                        key={cuota.numero}
                                                                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${cuota.estado === 'COMPLETADO'
                                                                                ? 'bg-emerald-500 text-white'
                                                                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                                                                }`}>
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
                                                                                    <Badge
                                                                                        variant={cuota.estado === 'COMPLETADO' ? 'default' : 'secondary'}
                                                                                        className={cuota.estado === 'COMPLETADO' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                                                                                    >
                                                                                        {cuota.estado === 'COMPLETADO' ? 'Pagado' : cuota.estado}
                                                                                    </Badge>
                                                                                    {cuota.pago.referencia && (
                                                                                        <span className="text-xs text-muted-foreground">
                                                                                            {cuota.pago.referencia}
                                                                                        </span>
                                                                                    )}
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
                                                                                                        Cuota {cuota.numero} - {insc.nombre} {insc.apellido}
                                                                                                        {cuota.pago.referencia && ` - ${cuota.pago.referencia}`}
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
                                                                                </>
                                                                            ) : (
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    onClick={() => handleOpenDialog({ ...insc, numeroCuota: cuota.numero })}
                                                                                    className="text-xs"
                                                                                >
                                                                                    <Plus className="size-3 mr-1" />
                                                                                    Crear Pago
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Botón para ver en pagos */}
                                                            <Link href="/admin/pagos">
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

            {/* Dialog para crear pago */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crear Pago</DialogTitle>
                        <DialogDescription>
                            Crear un nuevo pago para {selectedInscripcion?.nombre} {selectedInscripcion?.apellido}
                            {selectedInscripcion?.numeroCuota && ` - Cuota ${selectedInscripcion.numeroCuota}`}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedInscripcion && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Número de Cuota</Label>
                                <Input
                                    value={selectedInscripcion.numeroCuota || ''}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Monto</Label>
                                <Input
                                    value={getPagosInfo(selectedInscripcion).montoPorCuota.toFixed(2)}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Método de Pago</Label>
                                <Select
                                    value={pagoForm.metodoPago}
                                    onValueChange={(value) => setPagoForm({ ...pagoForm, metodoPago: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="transferencia">Transferencia</SelectItem>
                                        <SelectItem value="mercadopago">MercadoPago</SelectItem>
                                        <SelectItem value="efectivo">Efectivo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>
                                    Referencia / Número de Comprobante
                                    {(pagoForm.metodoPago === 'transferencia' || pagoForm.metodoPago === 'mercadopago') && (
                                        <span className="text-red-400 ml-1">*</span>
                                    )}
                                </Label>
                                <Input
                                    placeholder={
                                        pagoForm.metodoPago === 'transferencia'
                                            ? 'Ej: CBU-1234567890123456789012, CVU-0000123456789012345678, Nro. de operación: 12345678'
                                            : pagoForm.metodoPago === 'mercadopago'
                                                ? 'Ej: ID de operación: 1234567890, Nro. de ticket: 1234567890123456'
                                                : 'Ej: Nro. de recibo: 001-2025, Voucher: 12345, Nro. de comprobante en efectivo'
                                    }
                                    value={pagoForm.referencia}
                                    onChange={(e) => setPagoForm({ ...pagoForm, referencia: e.target.value })}
                                    required={pagoForm.metodoPago === 'transferencia' || pagoForm.metodoPago === 'mercadopago'}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {pagoForm.metodoPago === 'transferencia'
                                        ? 'Ingresa el CBU/CVU o número de operación de la transferencia bancaria'
                                        : pagoForm.metodoPago === 'mercadopago'
                                            ? 'Ingresa el ID de operación o número de ticket de MercadoPago'
                                            : 'Ingresa el número de recibo, voucher o comprobante del pago en efectivo'}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label>
                                    Comprobante / Captura de Transferencia
                                    {(pagoForm.metodoPago === 'transferencia' || pagoForm.metodoPago === 'mercadopago') && (
                                        <span className="text-red-400 ml-1">*</span>
                                    )}
                                </Label>
                                <ComprobanteUpload
                                    value={pagoForm.comprobanteUrl}
                                    onChange={(url) => setPagoForm({ ...pagoForm, comprobanteUrl: url })}
                                    onUpload={handleUploadComprobante}
                                    disabled={
                                        isUploadingComprobante ||
                                        createPagoMutation.isPending ||
                                        pagoForm.metodoPago === 'efectivo'
                                    }
                                />
                                {pagoForm.metodoPago === 'efectivo' ? (
                                    <p className="text-xs text-amber-600 dark:text-amber-400">
                                        ℹ️ El comprobante no es necesario para pagos en efectivo
                                    </p>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        💡 <strong>Requerido:</strong> Sube una captura del comprobante de transferencia o pago de MercadoPago
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Notas (Opcional)</Label>
                                <Textarea
                                    placeholder="Notas adicionales sobre el pago..."
                                    rows={3}
                                    value={pagoForm.notas}
                                    onChange={(e) => setPagoForm({ ...pagoForm, notas: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreatePago}
                            disabled={createPagoMutation.isPending}
                        >
                            {createPagoMutation.isPending ? 'Creando...' : 'Crear Pago'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Diálogo para crear inscripción manual */}
            <Dialog open={showNuevaInscripcionDialog} onOpenChange={setShowNuevaInscripcionDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                                <UserPlus className="size-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span>Agregar Inscripción Manual</span>
                        </DialogTitle>
                        <DialogDescription>
                            Inscribe manualmente a un invitado, pastor o miembro a la convención activa.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        {/* Convención activa info */}
                        {convenciones.find((c: any) => c.activa) && (
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold mb-1">
                                    📅 Inscribiendo a:
                                </p>
                                <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                                    {convenciones.find((c: any) => c.activa)?.titulo}
                                </p>
                            </div>
                        )}
                        
                        {/* Nombre y Apellido */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nombre">
                                    Nombre <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="nombre"
                                    placeholder="Nombre"
                                    value={nuevaInscripcionForm.nombre}
                                    onChange={(e) => setNuevaInscripcionForm({ ...nuevaInscripcionForm, nombre: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="apellido">
                                    Apellido <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="apellido"
                                    placeholder="Apellido"
                                    value={nuevaInscripcionForm.apellido}
                                    onChange={(e) => setNuevaInscripcionForm({ ...nuevaInscripcionForm, apellido: e.target.value })}
                                />
                            </div>
                        </div>
                        
                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Correo Electrónico <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="correo@ejemplo.com"
                                value={nuevaInscripcionForm.email}
                                onChange={(e) => setNuevaInscripcionForm({ ...nuevaInscripcionForm, email: e.target.value })}
                            />
                        </div>
                        
                        {/* Teléfono */}
                        <div className="space-y-2">
                            <Label htmlFor="telefono">Teléfono (Opcional)</Label>
                            <Input
                                id="telefono"
                                placeholder="+54 11 1234-5678"
                                value={nuevaInscripcionForm.telefono}
                                onChange={(e) => setNuevaInscripcionForm({ ...nuevaInscripcionForm, telefono: e.target.value })}
                            />
                        </div>
                        
                        {/* Sede */}
                        <div className="space-y-2">
                            <Label htmlFor="sede">Iglesia / Sede (Opcional)</Label>
                            <Input
                                id="sede"
                                placeholder="Nombre de la iglesia o sede"
                                value={nuevaInscripcionForm.sede}
                                onChange={(e) => setNuevaInscripcionForm({ ...nuevaInscripcionForm, sede: e.target.value })}
                            />
                        </div>
                        
                        {/* Tipo de Inscripción */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo de Inscripción</Label>
                                <Select
                                    value={nuevaInscripcionForm.tipoInscripcion}
                                    onValueChange={(value) => setNuevaInscripcionForm({ ...nuevaInscripcionForm, tipoInscripcion: value })}
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
                                <Label>Número de Cuotas</Label>
                                <Select
                                    value={String(nuevaInscripcionForm.numeroCuotas)}
                                    onValueChange={(value) => setNuevaInscripcionForm({ ...nuevaInscripcionForm, numeroCuotas: parseInt(value) })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 cuota (pago único)</SelectItem>
                                        <SelectItem value="2">2 cuotas</SelectItem>
                                        <SelectItem value="3">3 cuotas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        
                        {/* Notas */}
                        <div className="space-y-2">
                            <Label htmlFor="notas">Notas (Opcional)</Label>
                            <Textarea
                                id="notas"
                                placeholder="Notas adicionales sobre esta inscripción..."
                                rows={2}
                                value={nuevaInscripcionForm.notas}
                                onChange={(e) => setNuevaInscripcionForm({ ...nuevaInscripcionForm, notas: e.target.value })}
                            />
                        </div>
                        
                        {/* Info */}
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                ℹ️ Esta inscripción será marcada como <strong>origen: Dashboard</strong> y se le asignará un código de referencia automáticamente.
                            </p>
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNuevaInscripcionDialog(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCrearInscripcionManual}
                            disabled={createInscripcionMutation.isPending}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                        >
                            {createInscripcionMutation.isPending ? 'Creando...' : 'Crear Inscripción'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: Reporte de Ingresos */}
            <Dialog open={showReporteDialog} onOpenChange={setShowReporteDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <BarChart3 className="size-5 text-blue-500" />
                            Reporte de Ingresos
                        </DialogTitle>
                        <DialogDescription>
                            Resumen financiero de inscripciones y pagos
                        </DialogDescription>
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
                                        {Math.round((reporteIngresos.totalRecaudado / (reporteIngresos.totalRecaudado + reporteIngresos.totalPendiente)) * 100) || 0}%
                                    </span>
                                </div>
                                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                                        style={{ width: `${(reporteIngresos.totalRecaudado / (reporteIngresos.totalRecaudado + reporteIngresos.totalPendiente)) * 100 || 0}%` }} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-medium text-sm">Detalle por Cuota</h4>
                                {reporteIngresos.detallesPorCuota.map((cuota: any) => (
                                    <div key={cuota.cuota} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                        <span className="font-medium">Cuota {cuota.cuota}</span>
                                        <div className="text-right text-sm">
                                            <p className="text-emerald-600">${cuota.recaudado.toLocaleString('es-AR')} cobrado</p>
                                            <p className="text-amber-600">${cuota.pendiente.toLocaleString('es-AR')} pendiente</p>
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
                                    <p className="text-2xl font-bold text-emerald-600">{reporteIngresos.inscripcionesConfirmadas}</p>
                                    <p className="text-xs text-muted-foreground">Confirmadas</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-amber-600">{reporteIngresos.inscripcionesPendientes}</p>
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
                        <Button variant="outline" onClick={() => setShowReporteDialog(false)}>Cerrar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog: Recordatorios de Pago */}
            <Dialog open={showRecordatoriosDialog} onOpenChange={(open) => { setShowRecordatoriosDialog(open); if (!open) setResultadoRecordatorios(null) }}>
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
                                <Button variant="outline" onClick={() => setShowRecordatoriosDialog(false)}>Cancelar</Button>
                                <Button onClick={handleEnviarRecordatorios} disabled={enviarRecordatoriosMutation.isPending}
                                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                                    {enviarRecordatoriosMutation.isPending ? (<><Loader2 className="size-4 mr-2 animate-spin" />Enviando...</>) : (<><Mail className="size-4 mr-2" />Enviar Recordatorios</>)}
                                </Button>
                            </DialogFooter>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                                <div className="flex items-center justify-center gap-6">
                                    <div className="text-center"><p className="text-3xl font-bold text-emerald-600">{resultadoRecordatorios.enviados}</p><p className="text-sm text-muted-foreground">Enviados</p></div>
                                    <div className="text-center"><p className="text-3xl font-bold text-red-600">{resultadoRecordatorios.fallidos}</p><p className="text-sm text-muted-foreground">Fallidos</p></div>
                                </div>
                            </div>
                            {resultadoRecordatorios.detalles.length > 0 && (
                                <div className="max-h-48 overflow-y-auto space-y-2">
                                    {resultadoRecordatorios.detalles.map((det: any, i: number) => (
                                        <div key={i} className={`p-2 rounded-lg text-sm flex items-center justify-between ${det.exito ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
                                            <span className="font-medium">{det.nombre}</span>
                                            <span className={det.exito ? 'text-emerald-600' : 'text-red-600'}>{det.exito ? '✓ Enviado' : '✗ Error'}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <DialogFooter><Button onClick={() => { setShowRecordatoriosDialog(false); setResultadoRecordatorios(null) }}>Cerrar</Button></DialogFooter>
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
                                <p>¿Estás seguro de que quieres cancelar la inscripción de <strong>{inscripcionACancelar?.nombre} {inscripcionACancelar?.apellido}</strong>?</p>
                                <p className="text-red-600 font-medium">Esta acción cancelará todos los pagos pendientes y notificará al usuario por email.</p>
                                <div className="pt-2">
                                    <Label htmlFor="motivo-cancelacion">Motivo de cancelación (opcional)</Label>
                                    <Input id="motivo-cancelacion" placeholder="Ej: Solicitud del usuario..." value={motivoCancelacion}
                                        onChange={(e) => setMotivoCancelacion(e.target.value)} className="mt-2" />
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => { setInscripcionACancelar(null); setMotivoCancelacion('') }}>Volver</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelarInscripcion} disabled={cancelarInscripcionMutation.isPending} className="bg-red-600 hover:bg-red-700">
                            {cancelarInscripcionMutation.isPending ? (<><Loader2 className="size-4 mr-2 animate-spin" />Cancelando...</>) : 'Sí, cancelar inscripción'}
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
                        <DialogDescription>
                            Modifica los datos de la inscripción
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-nombre">Nombre</Label>
                                <Input id="edit-nombre" value={editarForm.nombre}
                                    onChange={(e) => setEditarForm({ ...editarForm, nombre: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-apellido">Apellido</Label>
                                <Input id="edit-apellido" value={editarForm.apellido}
                                    onChange={(e) => setEditarForm({ ...editarForm, apellido: e.target.value })} />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Correo Electrónico</Label>
                            <Input id="edit-email" type="email" value={editarForm.email}
                                onChange={(e) => setEditarForm({ ...editarForm, email: e.target.value })} />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="edit-telefono">Teléfono</Label>
                            <Input id="edit-telefono" value={editarForm.telefono}
                                onChange={(e) => setEditarForm({ ...editarForm, telefono: e.target.value })} />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="edit-sede">Iglesia / Sede</Label>
                            <Input id="edit-sede" value={editarForm.sede}
                                onChange={(e) => setEditarForm({ ...editarForm, sede: e.target.value })} />
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Tipo de Inscripción</Label>
                            <Select value={editarForm.tipoInscripcion}
                                onValueChange={(value) => setEditarForm({ ...editarForm, tipoInscripcion: value })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="invitado"><div className="flex items-center gap-2"><Star className="size-3 text-yellow-500" />Invitado</div></SelectItem>
                                    <SelectItem value="pastor">Pastor</SelectItem>
                                    <SelectItem value="lider">Líder</SelectItem>
                                    <SelectItem value="miembro">Miembro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-notas">Notas</Label>
                            <Input id="edit-notas" value={editarForm.notas}
                                onChange={(e) => setEditarForm({ ...editarForm, notas: e.target.value })} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditarDialog(false)}>Cancelar</Button>
                        <Button onClick={handleGuardarEdicion} disabled={updateInscripcionMutation.isPending}
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                            {updateInscripcionMutation.isPending ? (<><Loader2 className="size-4 mr-2 animate-spin" />Guardando...</>) : (<><Save className="size-4 mr-2" />Guardar Cambios</>)}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
