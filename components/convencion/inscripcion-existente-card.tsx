'use client'

import { CheckCircle2, Clock, CreditCard, Mail, Phone, MapPin, Calendar, Copy, ExternalLink, AlertCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

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
    // Calcular estado de pagos
    const pagos = inscripcion.pagos || []
    const numeroCuotas = inscripcion.numeroCuotas || 3
    const cuotasPagadas = pagos.filter(p => p.estado === 'COMPLETADO').length
    const cuotasPendientes = numeroCuotas - cuotasPagadas
    const porcentajePagado = numeroCuotas > 0 ? (cuotasPagadas / numeroCuotas) * 100 : 0

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

    // Formatear fechas
    const fechaInscripcion = format(
        new Date(inscripcion.fechaInscripcion),
        "d 'de' MMMM, yyyy 'a las' HH:mm",
        { locale: es }
    )

    return (
        <div className="max-w-2xl mx-auto">
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
                    <div className="mb-6 p-4 bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-amber-500/20 border-2 border-amber-500/40 rounded-xl">
                        <div className="text-center">
                            <p className="text-xs text-amber-300/80 mb-1 uppercase tracking-wider font-medium">
                                🔖 Código de Referencia para Pagos
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-400 tracking-widest">
                                    {inscripcion.codigoReferencia}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={copiarCodigo}
                                    className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/20"
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-amber-300/60 mt-2">
                                Incluye este código en el concepto de tu transferencia
                            </p>
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

                    {/* Lista de cuotas */}
                    <div className="mt-4 space-y-2">
                        {Array.from({ length: numeroCuotas }, (_, i) => i + 1).map(numero => {
                            const pago = pagos.find(p => p.numeroCuota === numero)
                            const estaPagada = pago?.estado === 'COMPLETADO'

                            return (
                                <div
                                    key={numero}
                                    className={cn(
                                        "flex items-center justify-between p-2 rounded-lg border",
                                        estaPagada
                                            ? "bg-emerald-500/10 border-emerald-500/30"
                                            : "bg-white/5 border-white/10"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                            estaPagada
                                                ? "bg-emerald-500 text-white"
                                                : "bg-white/10 text-white/50"
                                        )}>
                                            {estaPagada ? <CheckCircle2 className="w-3 h-3" /> : numero}
                                        </div>
                                        <span className={cn(
                                            "text-sm",
                                            estaPagada ? "text-emerald-300" : "text-white/70"
                                        )}>
                                            Cuota {numero}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-white/50">
                                            ${montoPorCuota.toLocaleString('es-AR')}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "text-xs",
                                                estaPagada
                                                    ? "border-emerald-500/50 text-emerald-400"
                                                    : "border-amber-500/50 text-amber-400"
                                            )}
                                        >
                                            {estaPagada ? 'Pagada' : 'Pendiente'}
                                        </Badge>
                                    </div>
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
                {cuotasPendientes > 0 && (
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

