'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Clock, CreditCard, Mail, Phone, MapPin, Calendar, Copy, ExternalLink, AlertCircle, Sparkles, LogOut, User, ChevronDown, ChevronUp, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useInvitadoAuth } from '@/lib/hooks/use-invitado-auth'
import { useUpdatePago } from '@/lib/hooks/use-pagos'
import { pagosApi } from '@/lib/api/pagos'
import { useQueryClient } from '@tanstack/react-query'
import { uploadApi } from '@/lib/api/upload'
import { ComprobanteUpload } from '@/components/ui/comprobante-upload'
import Image from 'next/image'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

interface InscripcionExistenteCardProps {
    inscripcion: {
        id: string
        nombre: string
        apellido: string
        email: string
        telefono?: string
        sede?: string
        estado: string
        fechaInscripcion: string
        codigoReferencia?: string
        numeroCuotas?: number
        pagos?: Array<{
            id: string
            estado: string
            numeroCuota?: number
            monto: number | string
            comprobanteUrl?: string
        }>
        convencion?: {
            id: string
            titulo: string
            fechaInicio?: string
            fechaFin?: string
            ubicacion?: string
            costo?: number
        }
    }
    convencion: {
        id: string
        titulo: string
        fechaInicio?: string
        fechaFin?: string
        ubicacion?: string
        costo?: number
    }
    onVolverInicio?: () => void
}

export function InscripcionExistenteCard({
    inscripcion,
    convencion,
    onVolverInicio
}: InscripcionExistenteCardProps) {
    const router = useRouter()
    const invitadoAuth = useInvitadoAuth()
    const user = invitadoAuth.user
    const updatePagoMutation = useUpdatePago()
    const queryClient = useQueryClient()
    const [pagosExpandidos, setPagosExpandidos] = useState<Record<string, boolean>>({})
    const [comprobantesTemporales, setComprobantesTemporales] = useState<Record<string, string>>({})

    // Normalizar URL de imagen de Google para obtener tamaño más grande
    const normalizeGoogleImageUrl = (url: string | undefined): string | undefined => {
        if (!url) return undefined
        // Si es una URL de Google, cambiar el tamaño a 200x200
        if (url.includes('googleusercontent.com')) {
            return url.replace(/=s\d+-c$/, '=s200-c').replace(/=s\d+$/, '=s200')
        }
        return url
    }

    // Función para cerrar sesión
    const handleLogout = async () => {
        try {
            await invitadoAuth.logout()
            toast.success('Sesión cerrada', {
                description: 'Has cerrado sesión correctamente',
            })
            // Redirigir a la página principal
            router.push('/')
        } catch (error) {
            console.error('Error al cerrar sesión:', error)
            toast.error('Error al cerrar sesión', {
                description: 'No se pudo cerrar sesión correctamente',
            })
        }
    }

    // Calcular estado de pagos
    const pagos = inscripcion.pagos || []
    const numeroCuotas = inscripcion.numeroCuotas || 3
    const cuotasPagadas = pagos.filter(p => p.estado === 'COMPLETADO').length
    const cuotasPendientes = numeroCuotas - cuotasPagadas
    const porcentajePagado = numeroCuotas > 0 ? (cuotasPagadas / numeroCuotas) * 100 : 0

    // Detectar pagos cancelados
    const pagosCancelados = pagos.filter(p => p.estado === 'CANCELADO')
    const tienePagosCancelados = pagosCancelados.length > 0

    // Obtener costo total
    const costo = typeof convencion.costo === 'number'
        ? convencion.costo
        : parseFloat(String(convencion.costo || 0))
    const montoPorCuota = numeroCuotas > 0 ? costo / numeroCuotas : costo

    // Calcular total pagado
    const totalPagado = pagos
        .filter(p => p.estado === 'COMPLETADO')
        .reduce((sum, p) => sum + (typeof p.monto === 'number' ? p.monto : parseFloat(String(p.monto || 0))), 0)
    const totalPendiente = costo - totalPagado

    // Estado de inscripción
    const estaConfirmada = inscripcion.estado === 'confirmado'
    const estaCancelada = inscripcion.estado === 'cancelado'
    const estaPendiente = inscripcion.estado === 'pendiente'

    // Copiar código de referencia
    const copiarCodigo = () => {
        if (inscripcion.codigoReferencia) {
            navigator.clipboard.writeText(inscripcion.codigoReferencia)
            toast.success('Código copiado', {
                description: 'El código de referencia se copió al portapapeles'
            })
        }
    }

    // Toggle expandir/colapsar pago
    const togglePagoExpandido = (pagoId: string) => {
        setPagosExpandidos(prev => ({
            ...prev,
            [pagoId]: !prev[pagoId]
        }))
    }

    // Enviar comprobante (actualizar el pago con el comprobante)
    const handleEnviarComprobante = async (pagoId: string) => {
        const comprobanteUrl = comprobantesTemporales[pagoId] || pagos.find(p => p.id === pagoId)?.comprobanteUrl

        if (!comprobanteUrl) {
            toast.error('No hay comprobante para enviar', {
                description: 'Por favor, sube un comprobante primero',
            })
            return
        }

        // Si el pago ya tiene comprobante enviado, no permitir enviar de nuevo
        const pago = pagos.find(p => p.id === pagoId)
        if (pago?.comprobanteUrl && !comprobantesTemporales[pagoId]) {
            toast.info('Comprobante ya enviado', {
                description: 'Este comprobante ya fue enviado anteriormente.',
            })
            return
        }

        try {
            // Usar el endpoint específico para invitados si estamos en contexto de invitado
            const isInvitadoContext = typeof window !== 'undefined' && window.location.pathname.startsWith('/convencion')
            
            if (isInvitadoContext) {
                // Usar endpoint específico para invitados
                await pagosApi.updateComprobanteInvitado(pagoId, comprobanteUrl)
                // Invalidar queries para refrescar datos
                await queryClient.invalidateQueries({ queryKey: ['inscripciones'] })
                await queryClient.invalidateQueries({ queryKey: ['checkInscripcion'] })
            } else {
                // Usar endpoint normal para admins
                await updatePagoMutation.mutateAsync({
                    id: pagoId,
                    data: { comprobanteUrl }
                })
            }

            toast.success('Comprobante enviado exitosamente', {
                description: 'Tu comprobante ha sido enviado. El equipo lo validará pronto.',
            })

            // Limpiar el comprobante temporal
            setComprobantesTemporales(prev => {
                const nuevo = { ...prev }
                delete nuevo[pagoId]
                return nuevo
            })

            // Cerrar el área expandida después de enviar
            setPagosExpandidos(prev => ({
                ...prev,
                [pagoId]: false
            }))
        } catch (error) {
            console.error('Error al enviar comprobante:', error)
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            toast.error('Error al enviar el comprobante', {
                description: errorMessage || 'Por favor, intenta nuevamente',
            })
        }
    }

    // Formatear fechas
    const fechaInscripcion = format(
        new Date(inscripcion.fechaInscripcion),
        "d 'de' MMMM, yyyy 'a las' HH:mm",
        { locale: es }
    )

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header con avatar y cerrar sesión */}
            {user && (
                <div className="flex items-center justify-end mb-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-10 px-2 gap-2 text-white/70 hover:text-white hover:bg-white/10"
                            >
                                {user.fotoUrl ? (
                                    <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-500/50">
                                        <Image
                                            src={normalizeGoogleImageUrl(user.fotoUrl) || user.fotoUrl}
                                            alt={`${user.nombre} ${user.apellido}`}
                                            fill
                                            className="object-cover"
                                            onError={(e) => {
                                                // Si falla la imagen, mostrar placeholder
                                                const target = e.target as HTMLImageElement
                                                target.src = '/placeholder.svg'
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
                                        <User className="w-4 h-4 text-emerald-400" />
                                    </div>
                                )}
                                <span className="text-sm font-medium hidden sm:inline">
                                    {user.nombre} {user.apellido}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <div className="px-2 py-1.5">
                                <p className="text-sm font-medium">{user.nombre} {user.apellido}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                                <LogOut className="mr-2 h-4 w-4" />
                                Cerrar sesión
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
                {/* Header con estado */}
                <div className="text-center mb-6">
                    <div className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full border",
                        estaConfirmada
                            ? "bg-emerald-500/20 border-emerald-500/40"
                            : estaCancelada
                                ? "bg-red-500/20 border-red-500/40"
                                : "bg-amber-500/20 border-amber-500/40"
                    )}>
                        {estaConfirmada ? (
                            <>
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm font-medium text-emerald-300">Inscripción Confirmada</span>
                            </>
                        ) : estaCancelada ? (
                            <>
                                <AlertCircle className="w-4 h-4 text-red-400" />
                                <span className="text-sm font-medium text-red-300">Inscripción Cancelada</span>
                            </>
                        ) : (
                            <>
                                <Clock className="w-4 h-4 text-amber-400" />
                                <span className="text-sm font-medium text-amber-300">Inscripción Pendiente de Pago</span>
                            </>
                        )}
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        ¡Hola {inscripcion.nombre}!
                    </h2>
                    <p className="text-white/70 text-sm sm:text-base">
                        Ya tienes una inscripción activa para esta convención
                    </p>
                </div>

                {/* Elegant divider */}
                <div className="flex items-center justify-center gap-3 my-6">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-emerald-500/30" />
                    <div className="relative">
                        <Sparkles className="w-3 h-3 text-emerald-400/60" />
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-emerald-500/50 to-emerald-500/30" />
                </div>

                {/* Código de referencia destacado */}
                {inscripcion.codigoReferencia && (
                    <div
                        className="mb-6 p-4 bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-amber-500/20 border-2 border-amber-500/40 rounded-xl"
                        role="region"
                        aria-labelledby="codigo-referencia-heading"
                    >
                        <div className="text-center">
                            <h3
                                id="codigo-referencia-heading"
                                className="text-xs text-amber-300/90 mb-1 uppercase tracking-wider font-semibold"
                            >
                                🔖 Código de Referencia para Pagos
                            </h3>
                            <div className="flex items-center justify-center gap-3" role="group" aria-label="Código de referencia y botón de copiar">
                                <span
                                    className="text-2xl sm:text-3xl font-mono font-bold text-amber-400 tracking-widest"
                                    aria-label={`Código de referencia: ${inscripcion.codigoReferencia}`}
                                >
                                    {inscripcion.codigoReferencia}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={copiarCodigo}
                                    className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all"
                                    aria-label={`Copiar código de referencia ${inscripcion.codigoReferencia} al portapapeles`}
                                    title="Copiar código de referencia"
                                >
                                    <Copy className="w-4 h-4" aria-hidden="true" />
                                </Button>
                            </div>
                            {/* Instrucciones mejoradas según principios WCAG */}
                            <div className="mt-3 space-y-1.5" role="group" aria-label="Instrucciones para el pago">
                                <p className="text-sm text-amber-200/90 font-medium leading-relaxed">
                                    📝 Instrucciones para realizar el pago:
                                </p>
                                <ol className="text-xs text-amber-300/80 space-y-1 text-left max-w-md mx-auto list-decimal list-inside" aria-label="Pasos para incluir el código en la transferencia">
                                    <li className="leading-relaxed">
                                        <strong className="text-amber-200/90">Copia el código de referencia</strong> usando el botón de copiar
                                    </li>
                                    <li className="leading-relaxed">
                                        <strong className="text-amber-200/90">Incluye este código</strong> en el concepto o descripción de tu transferencia bancaria
                                    </li>
                                    <li className="leading-relaxed">
                                        <strong className="text-amber-200/90">Realiza la transferencia</strong> por el monto correspondiente a tu cuota
                                    </li>
                                    <li className="leading-relaxed">
                                        <strong className="text-amber-200/90">Sube el comprobante</strong> de pago para que nuestro equipo pueda validarlo
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                )}

                {/* Estado de pagos */}
                <div className={cn(
                    "mb-6 p-4 rounded-lg border",
                    cuotasPagadas >= numeroCuotas
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-amber-500/10 border-amber-500/30"
                )}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <CreditCard className={cn(
                                "w-5 h-5",
                                cuotasPagadas >= numeroCuotas ? "text-emerald-400" : "text-amber-400"
                            )} />
                            <span className="font-semibold text-white">Estado de Pagos</span>
                        </div>
                        <Badge
                            variant={cuotasPagadas >= numeroCuotas ? "default" : "outline"}
                            className={cn(
                                cuotasPagadas >= numeroCuotas
                                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                    : "bg-white/10 border-amber-500/50 text-amber-300"
                            )}
                        >
                            {cuotasPagadas >= numeroCuotas ? (
                                <>
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Completo
                                </>
                            ) : (
                                `${cuotasPagadas}/${numeroCuotas} cuotas`
                            )}
                        </Badge>
                    </div>

                    {/* Barra de progreso */}
                    <div className="mb-3">
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full"
                                style={{ width: `${porcentajePagado}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                            <span className="text-white/50">{Math.round(porcentajePagado)}% completado</span>
                            <span className="text-emerald-400">{cuotasPagadas} de {numeroCuotas}</span>
                        </div>
                    </div>

                    {/* Resumen de montos */}
                    <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="text-center p-2 bg-white/5 rounded-lg">
                            <p className="text-white/50 text-xs">Total</p>
                            <p className="text-white font-semibold">${costo.toLocaleString('es-AR')}</p>
                        </div>
                        <div className="text-center p-2 bg-emerald-500/10 rounded-lg">
                            <p className="text-emerald-400/70 text-xs">Pagado</p>
                            <p className="text-emerald-400 font-semibold">${totalPagado.toLocaleString('es-AR')}</p>
                        </div>
                        <div className="text-center p-2 bg-amber-500/10 rounded-lg">
                            <p className="text-amber-400/70 text-xs">Pendiente</p>
                            <p className="text-amber-400 font-semibold">${totalPendiente.toLocaleString('es-AR')}</p>
                        </div>
                    </div>

                    {/* Lista de pagos - solo se puede subir comprobante de la siguiente cuota en orden */}
                    <div className="mt-4 space-y-2">
                        {Array.from({ length: numeroCuotas }, (_, i) => i + 1).map(numero => {
                            const pago = pagos.find(p => p.numeroCuota === numero)
                            const estaPagada = pago?.estado === 'COMPLETADO'
                            const estaCancelada = pago?.estado === 'CANCELADO'
                            const estaPendiente = !estaPagada && !estaCancelada
                            const pagoId = pago?.id || `pago-${numero}`
                            const estaExpandido = pagosExpandidos[pagoId] || false
                            const tieneComprobante = !!pago?.comprobanteUrl
                            const cuotasAnterioresPagadas =
                                numero <= 1 ||
                                Array.from({ length: numero - 1 }, (_, i) => i + 1).every(
                                    n => pagos.find(p => p.numeroCuota === n)?.estado === 'COMPLETADO'
                                )
                            const puedeSubirComprobante = estaPendiente && cuotasAnterioresPagadas
                            const primeraCuotaPendiente =
                                numero > 1 &&
                                !cuotasAnterioresPagadas &&
                                Array.from({ length: numero - 1 }, (_, i) => i + 1).find(
                                    n => pagos.find(p => p.numeroCuota === n)?.estado !== 'COMPLETADO'
                                )

                            return (
                                <div
                                    key={numero}
                                    className={cn(
                                        "rounded-lg border transition-all",
                                        estaPagada
                                            ? "bg-emerald-500/10 border-emerald-500/30"
                                            : estaCancelada
                                                ? "bg-red-500/10 border-red-500/30"
                                                : "bg-white/5 border-white/10"
                                    )}
                                >
                                    {/* Header del pago */}
                                    <div
                                        className={cn(
                                            "flex items-center justify-between p-3",
                                            estaPendiente && "cursor-pointer hover:bg-white/5"
                                        )}
                                        onClick={() => estaPendiente && togglePagoExpandido(pagoId)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                                estaPagada
                                                    ? "bg-emerald-500 text-white"
                                                    : estaCancelada
                                                        ? "bg-red-500 text-white"
                                                        : "bg-white/10 text-white/50"
                                            )}>
                                                {estaPagada ? <CheckCircle2 className="w-3 h-3" /> : numero}
                                            </div>
                                            <span className={cn(
                                                "text-sm font-medium",
                                                estaPagada
                                                    ? "text-emerald-300"
                                                    : estaCancelada
                                                        ? "text-red-300"
                                                        : "text-white/70"
                                            )}>
                                                Pago {numero}
                                            </span>
                                            {estaPendiente && tieneComprobante && (
                                                <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                                                    <Upload className="w-3 h-3 mr-1" />
                                                    Comprobante cargado
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-white/50">
                                                ${montoPorCuota.toLocaleString('es-AR', { minimumFractionDigits: 2 })} (pesos argentinos)
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "text-xs",
                                                    estaPagada
                                                        ? "border-emerald-500/50 text-emerald-400"
                                                        : estaCancelada
                                                            ? "border-red-500/50 text-red-400"
                                                            : "border-amber-500/50 text-amber-400"
                                                )}
                                            >
                                                {estaPagada ? 'Pagada' : estaCancelada ? 'Cancelada' : 'Pendiente'}
                                            </Badge>
                                            {estaPendiente && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 text-white/50 hover:text-white"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        togglePagoExpandido(pagoId)
                                                    }}
                                                >
                                                    {estaExpandido ? (
                                                        <ChevronUp className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Área expandible para subir comprobante (solo para pagos pendientes) */}
                                    {estaPendiente && estaExpandido && (
                                        <div className="px-3 pb-3 border-t border-white/10 pt-3">
                                            <div className="space-y-3">
                                                {!puedeSubirComprobante && primeraCuotaPendiente && (
                                                    <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-lg">
                                                        <p className="text-sm text-amber-200 flex items-center gap-2">
                                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                                            Para subir el comprobante de la cuota {numero} primero debe estar pagada y validada la cuota {primeraCuotaPendiente}.
                                                        </p>
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                                                        <Upload className="w-4 h-4 text-amber-400" />
                                                        Subir Comprobante de Transferencia
                                                    </h4>
                                                    <p className="text-xs text-white/60 mb-3">
                                                        Arrastra o selecciona una foto o captura de tu comprobante de transferencia bancaria para el Pago {numero}.
                                                    </p>
                                                </div>
                                                <ComprobanteUpload
                                                    value={comprobantesTemporales[pagoId] || pago?.comprobanteUrl || ''}
                                                    onChange={(url) => {
                                                        // Solo actualizar el estado local, no el pago todavía
                                                        if (url) {
                                                            setComprobantesTemporales(prev => ({
                                                                ...prev,
                                                                [pagoId]: url
                                                            }))
                                                        } else {
                                                            setComprobantesTemporales(prev => {
                                                                const nuevo = { ...prev }
                                                                delete nuevo[pagoId]
                                                                return nuevo
                                                            })
                                                        }
                                                    }}
                                                    onUpload={async (file) => {
                                                        if (!pago?.id) {
                                                            throw new Error('No se encontró el ID del pago')
                                                        }
                                                        try {
                                                            const response = await uploadApi.uploadInscripcionDocumento(file)
                                                            toast.success('Comprobante subido exitosamente', {
                                                                description: 'Tu comprobante de transferencia ha sido cargado correctamente',
                                                            })
                                                            // Guardar temporalmente la URL
                                                            setComprobantesTemporales(prev => ({
                                                                ...prev,
                                                                [pagoId]: response.url
                                                            }))
                                                            return response.url
                                                        } catch (error) {
                                                            toast.error('Error al subir el comprobante', {
                                                                description: 'Por favor, intenta nuevamente',
                                                            })
                                                            throw error
                                                        }
                                                    }}
                                                    className="bg-white/5"
                                                    disabled={estaPagada || !!pago?.comprobanteUrl || !puedeSubirComprobante}
                                                />

                                                {/* Botón de Enviar */}
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        onClick={() => handleEnviarComprobante(pagoId)}
                                                        disabled={
                                                            !puedeSubirComprobante ||
                                                            (!comprobantesTemporales[pagoId] && !pago?.comprobanteUrl) ||
                                                            updatePagoMutation.isPending ||
                                                            estaPagada ||
                                                            !!pago?.comprobanteUrl // Deshabilitar si ya fue enviado
                                                        }
                                                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {updatePagoMutation.isPending ? (
                                                            <>
                                                                <Clock className="w-4 h-4 mr-2 animate-spin" />
                                                                Enviando...
                                                            </>
                                                        ) : pago?.comprobanteUrl ? (
                                                            <>
                                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                                Comprobante Enviado
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                                Enviar Comprobante
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>

                                                {/* Mensaje de confirmación */}
                                                {(comprobantesTemporales[pagoId] || pago?.comprobanteUrl) && !estaPagada && (
                                                    <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                                        <p className="text-xs text-amber-300 flex items-center gap-2">
                                                            <AlertCircle className="w-3 h-3" />
                                                            {pago?.comprobanteUrl && !comprobantesTemporales[pagoId]
                                                                ? 'Comprobante ya enviado. El equipo lo validará pronto.'
                                                                : 'Comprobante cargado. Haz clic en "Enviar" para confirmar.'}
                                                        </p>
                                                    </div>
                                                )}

                                                {estaPagada && (
                                                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                                        <p className="text-xs text-emerald-300 flex items-center gap-2">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Este pago ya ha sido completado.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Información de la convención */}
                <div className="mb-6 p-4 bg-gradient-to-br from-sky-500/10 via-sky-600/5 to-sky-500/10 border border-sky-500/20 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-sky-400" />
                        Convención
                    </h3>
                    <div className="space-y-2 text-sm">
                        <p className="text-white font-medium">{convencion.titulo}</p>
                        {convencion.ubicacion && (
                            <div className="flex items-center gap-2 text-white/70">
                                <MapPin className="w-4 h-4" />
                                {convencion.ubicacion}
                            </div>
                        )}
                    </div>
                </div>

                {/* Información personal */}
                <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg">
                    <h3 className="text-sm font-semibold text-white/70 mb-3">Tu información</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-white/70">
                            <Mail className="w-4 h-4" />
                            <span>{inscripcion.email}</span>
                        </div>
                        {inscripcion.telefono && (
                            <div className="flex items-center gap-2 text-white/70">
                                <Phone className="w-4 h-4" />
                                <span>{inscripcion.telefono}</span>
                            </div>
                        )}
                        {inscripcion.sede && (
                            <div className="flex items-center gap-2 text-white/70 sm:col-span-2">
                                <MapPin className="w-4 h-4" />
                                <span>{inscripcion.sede}</span>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-white/40 mt-3">
                        Inscrito el {fechaInscripcion}
                    </p>
                </div>

                {/* Mensaje informativo según estado */}
                {tienePagosCancelados && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-red-300 mb-1">Pagos Cancelados</h4>
                                <p className="text-xs text-white/70 mb-2">
                                    Tienes {pagosCancelados.length} pago(s) cancelado(s).
                                </p>
                                <p className="text-xs text-white/50">
                                    Para rehabilitar tu pago, por favor contacta al administrador desde el panel de AMVA Digital.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                {cuotasPendientes > 0 && !tienePagosCancelados && (
                    <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-blue-300 mb-1">Próximos pasos</h4>
                                <ul className="text-xs text-white/70 space-y-1 list-disc list-inside">
                                    <li>Realiza el pago de las cuotas pendientes</li>
                                    <li>Incluye el código <strong className="text-amber-400">{inscripcion.codigoReferencia}</strong> en la transferencia</li>
                                    <li>Nuestro equipo validará tu pago y te notificará por email</li>
                                    <li>Una vez completados los pagos, tu inscripción será confirmada</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {cuotasPagadas >= numeroCuotas && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-emerald-300 mb-1">¡Pagos completados!</h4>
                                <p className="text-xs text-white/70">
                                    Todos tus pagos han sido validados. Tu inscripción está confirmada.
                                    Te esperamos en la convención.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botón de acción */}
                <div className="pt-4 border-t border-white/10">
                    <Button
                        onClick={onVolverInicio}
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/30"
                    >
                        Volver a la página principal
                    </Button>
                </div>
            </div>
        </div>
    )
}



