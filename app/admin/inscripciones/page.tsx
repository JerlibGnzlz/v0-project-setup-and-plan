'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useInscripciones } from '@/lib/hooks/use-inscripciones'
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
import { Textarea } from '@/components/ui/textarea'
import { Search, UserCheck, ChevronLeft, Mail, Phone, MapPin, Calendar, FileText, CreditCard, Plus, DollarSign, CheckCircle2, Image as ImageIcon, X, Printer, Download, Sparkles } from 'lucide-react'
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
    const [selectedInscripcion, setSelectedInscripcion] = useState<any>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [pagoForm, setPagoForm] = useState({
        metodoPago: 'transferencia',
        referencia: '',
        comprobanteUrl: '',
        notas: '',
    })
    const [isUploadingComprobante, setIsUploadingComprobante] = useState(false)

    // Sincronización inteligente para actualización automática
    useSmartSync()

    // Polling inteligente cada 30 segundos (solo cuando la pestaña está visible)
    useSmartPolling(["inscripciones"], 30000)

    const { data: inscripciones = [], isLoading } = useInscripciones()
    const { data: convenciones = [] } = useConvenciones()
    const createPagoMutation = useCreatePago()
    const updatePagoMutation = useUpdatePago()

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

    const filteredInscripciones = inscripciones.filter((insc: any) => {
        const nombreCompleto = `${insc.nombre} ${insc.apellido}`.toLowerCase()
        const email = (insc.email || '').toLowerCase()
        const sede = (insc.sede || '').toLowerCase()
        const codigoRef = (insc.codigoReferencia || '').toLowerCase()
        const matchSearch = nombreCompleto.includes(searchTerm.toLowerCase()) ||
            email.includes(searchTerm.toLowerCase()) ||
            (insc.telefono && insc.telefono.includes(searchTerm)) ||
            sede.includes(searchTerm.toLowerCase()) ||
            codigoRef.includes(searchTerm.toLowerCase())

        const matchEstado = estadoFilter === 'todos' || insc.estado === estadoFilter

        const matchConvencion = convencionFilter === 'todos' ||
            (insc.convencion?.titulo === convencionFilter)

        // Filtro de pago completo
        const pagosInfo = getPagosInfo(insc)
        const matchPagoCompleto = pagoCompletoFilter === 'todos' ||
            (pagoCompletoFilter === 'completo' && pagosInfo.cuotasPagadas >= pagosInfo.numeroCuotas) ||
            (pagoCompletoFilter === 'pendiente' && pagosInfo.cuotasPagadas < pagosInfo.numeroCuotas)

        return matchSearch && matchEstado && matchConvencion && matchPagoCompleto
    })
        .sort((a: any, b: any) => {
            // Ordenar por fecha de inscripción descendente (más recientes primero)
            const fechaA = new Date(a.fechaInscripcion).getTime()
            const fechaB = new Date(b.fechaInscripcion).getTime()
            return fechaB - fechaA
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
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExportInscripciones}
                                    className="border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                >
                                    <Printer className="size-4 mr-2" />
                                    Imprimir Lista
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
        </div>
    )
}
