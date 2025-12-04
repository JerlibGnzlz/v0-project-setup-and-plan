'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Clock, CreditCard, Mail, Phone, MapPin, Calendar, Copy, ExternalLink, AlertCircle, Sparkles, LogOut, User, FileText, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useUnifiedAuth } from '@/lib/hooks/use-unified-auth'
import { useRouter } from 'next/navigation'

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
    const { logout, user } = useUnifiedAuth()
    const router = useRouter()
    const [imageError, setImageError] = useState(false) // Estado para manejar errores de imagen
    
    // Función helper para normalizar URLs de Google
    const normalizeGoogleImageUrl = (url: string | undefined): string | undefined => {
        if (!url) return undefined
        // Si es una URL de Google con parámetros de tamaño, intentar obtener una versión más grande
        if (url.includes('googleusercontent.com')) {
            // Remover parámetros de tamaño existentes y agregar uno más grande
            const baseUrl = url.split('=')[0]
            // Usar tamaño más grande para mejor calidad
            return `${baseUrl}=s200-c`
        }
        return url
    }

    // Resetear el estado de error de imagen cuando cambia el usuario o la foto
    useEffect(() => {
        if (user?.fotoUrl) {
            setImageError(false)
        }
    }, [user?.fotoUrl])

    const handleLogout = () => {
        // Cerrar sesión en el hook de autenticación primero (limpia el estado de Zustand)
        logout()
        
        // Limpiar todos los tokens y datos de usuario inmediatamente
        if (typeof window !== 'undefined') {
            // Limpiar localStorage
            localStorage.removeItem('invitado_token')
            localStorage.removeItem('invitado_refresh_token')
            localStorage.removeItem('invitado_user')
            localStorage.removeItem('pastor_auth_token')
            localStorage.removeItem('pastor_refresh_token')
            localStorage.removeItem('pastor_auth_user')
            localStorage.removeItem('auth_token')
            localStorage.removeItem('auth_user')
            
            // Limpiar sessionStorage
            sessionStorage.removeItem('invitado_token')
            sessionStorage.removeItem('invitado_refresh_token')
            sessionStorage.removeItem('invitado_user')
            sessionStorage.removeItem('pastor_auth_token')
            sessionStorage.removeItem('pastor_refresh_token')
            sessionStorage.removeItem('pastor_auth_user')
            sessionStorage.removeItem('auth_token')
            sessionStorage.removeItem('auth_user')
            
            // Limpiar también cualquier parámetro de URL que pueda tener tokens
            const url = new URL(window.location.href)
            url.searchParams.delete('token')
            url.searchParams.delete('refresh_token')
            url.searchParams.delete('google')
            window.history.replaceState({}, '', url.pathname)
        }
        
        // Mostrar toast de éxito
        toast.success('Sesión cerrada', {
            description: 'Has cerrado sesión correctamente',
        })
        
        // Redirigir inmediatamente a la landing page (página principal)
        // Usar window.location.href para forzar una navegación completa y limpiar todo el estado
        window.location.href = '/'
    }
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
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Contenedor principal tipo wizard */}
            <div className="bg-gradient-to-br from-white/10 via-white/5 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden relative">
                {/* Efecto de brillo animado */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-teal-500/10 animate-pulse pointer-events-none" />
                
                <div className="relative z-10">
                    {/* Header con estado y logout */}
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                            <div className={cn(
                                "inline-flex items-center gap-2 px-4 py-2 mb-3 rounded-full border shadow-lg",
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
                            
                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                                ¡Hola, {inscripcion.nombre}!
                            </h2>
                            <p className="text-white/70 text-base">
                                Ya tienes una inscripción activa para esta convención
                            </p>
                        </div>
                        
                        {/* Avatar y menú de usuario en el header (patrón profesional) */}
                        {user && (
                            <div className="flex flex-col items-end gap-2">
                                <div className="relative group">
                                    {/* Avatar con dropdown trigger */}
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500/50 ring-2 ring-emerald-500/20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center cursor-pointer hover:ring-emerald-500/40 transition-all">
                                            {user.fotoUrl && !imageError ? (
                                                <img
                                                    src={normalizeGoogleImageUrl(user.fotoUrl)}
                                                    alt={`${user.nombre} ${user.apellido}`}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        if (process.env.NODE_ENV === 'development') {
                                                            console.warn('[InscripcionExistenteCard] Error cargando foto, mostrando iniciales:', user.fotoUrl)
                                                        }
                                                        setImageError(true)
                                                    }}
                                                    onLoad={() => {
                                                        if (process.env.NODE_ENV === 'development') {
                                                            console.log('[InscripcionExistenteCard] Foto cargada exitosamente')
                                                        }
                                                        setImageError(false)
                                                    }}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-emerald-400 text-lg font-bold">
                                                    {user.nombre?.[0]?.toUpperCase() || 'U'}
                                                    {user.apellido?.[0]?.toUpperCase() || ''}
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1">
                                            <CheckCircle2 className="size-3 text-white" />
                                        </div>
                                    </div>
                                    
                                    {/* Dropdown menu (aparece al hover) */}
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                        <div className="p-2">
                                            <div className="px-3 py-2 text-xs text-white/70 border-b border-white/10 mb-1">
                                                <p className="font-semibold text-white">{user.nombre} {user.apellido}</p>
                                                <p className="text-xs truncate">{user.email}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleLogout}
                                                className="w-full justify-start text-white/90 hover:text-white hover:bg-white/10 text-xs"
                                            >
                                                <LogOut className="w-3 h-3 mr-2" />
                                                Cerrar sesión
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Grid de secciones tipo wizard */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Sección 1: Código de Referencia */}
                        {inscripcion.codigoReferencia && (
                            <div className="lg:col-span-1">
                                <div className="h-full p-5 bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-amber-500/20 border-2 border-amber-500/40 rounded-xl shadow-lg">
                                    <div className="flex items-center gap-2 mb-3">
                                        <FileText className="w-5 h-5 text-amber-400" />
                                        <h3 className="text-sm font-semibold text-amber-300 uppercase tracking-wider">
                                            Código de Referencia
                                        </h3>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-2 mb-3 flex-wrap lg:flex-nowrap">
                                            <span className="text-lg sm:text-xl lg:text-base font-mono font-bold text-amber-400 tracking-widest break-all break-words lg:break-normal max-w-full overflow-hidden text-ellipsis px-2 whitespace-nowrap lg:whitespace-normal">
                                                {inscripcion.codigoReferencia}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={copiarCodigo}
                                                className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 h-8 w-8 p-0 flex-shrink-0"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-amber-300/70 px-2">
                                            Incluye este código en el concepto de tu transferencia
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Sección 2: Estado de Pagos */}
                        <div className={cn(
                            "lg:col-span-2 p-5 rounded-xl border shadow-lg",
                            cuotasPagadas >= numeroCuotas
                                ? "bg-emerald-500/10 border-emerald-500/30"
                                : "bg-amber-500/10 border-amber-500/30"
                        )}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Receipt className={cn(
                                        "w-5 h-5",
                                        cuotasPagadas >= numeroCuotas ? "text-emerald-400" : "text-amber-400"
                                    )} />
                                    <h3 className="text-lg font-semibold text-white">Estado de Pagos</h3>
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
                            <div className="mb-4">
                                <div className="h-3 bg-white/10 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 transition-all duration-500 rounded-full shadow-lg"
                                        style={{ width: `${porcentajePagado}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs mt-2">
                                    <span className="text-white/50">{Math.round(porcentajePagado)}% completado</span>
                                    <span className="text-emerald-400 font-semibold">{cuotasPagadas} de {numeroCuotas}</span>
                                </div>
                            </div>

                            {/* Resumen de montos */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                                    <p className="text-white/50 text-xs mb-1">Total</p>
                                    <p className="text-white font-bold text-lg">${costo.toLocaleString('es-AR')}</p>
                                </div>
                                <div className="text-center p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                                    <p className="text-emerald-400/70 text-xs mb-1">Pagado</p>
                                    <p className="text-emerald-400 font-bold text-lg">${totalPagado.toLocaleString('es-AR')}</p>
                                </div>
                                <div className="text-center p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                                    <p className="text-amber-400/70 text-xs mb-1">Pendiente</p>
                                    <p className="text-amber-400 font-bold text-lg">${totalPendiente.toLocaleString('es-AR')}</p>
                                </div>
                            </div>

                            {/* Lista de cuotas */}
                            <div className="space-y-2">
                                {Array.from({ length: numeroCuotas }, (_, i) => i + 1).map(numero => {
                                    const pago = pagos.find(p => p.numeroCuota === numero)
                                    const estaPagada = pago?.estado === 'COMPLETADO'

                                    return (
                                        <div
                                            key={numero}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-lg border transition-all",
                                                estaPagada
                                                    ? "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15"
                                                    : "bg-white/5 border-white/10 hover:bg-white/10"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg",
                                                    estaPagada
                                                        ? "bg-emerald-500 text-white"
                                                        : "bg-white/10 text-white/50"
                                                )}>
                                                    {estaPagada ? <CheckCircle2 className="w-4 h-4" /> : numero}
                                                </div>
                                                <span className={cn(
                                                    "text-sm font-medium",
                                                    estaPagada ? "text-emerald-300" : "text-white/70"
                                                )}>
                                                    Cuota {numero}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-semibold text-white/70">
                                                    ${montoPorCuota.toLocaleString('es-AR')}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "text-xs font-semibold",
                                                        estaPagada
                                                            ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                                                            : "border-amber-500/50 text-amber-400 bg-amber-500/10"
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
                    </div>

                    {/* Sección 3: Información de Convención y Personal */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {/* Información de la convención */}
                        <div className="p-5 bg-gradient-to-br from-sky-500/10 via-sky-600/5 to-sky-500/10 border border-sky-500/20 rounded-xl shadow-lg">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-sky-400" />
                                Convención
                            </h3>
                            <div className="space-y-3">
                                <p className="text-white font-semibold text-lg">{convencion.titulo}</p>
                                {convencion.ubicacion && (
                                    <div className="flex items-center gap-2 text-white/70">
                                        <MapPin className="w-4 h-4 text-sky-400" />
                                        <span>{convencion.ubicacion}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Información personal */}
                        <div className="p-5 bg-white/5 border border-white/10 rounded-xl shadow-lg">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-emerald-400" />
                                Tu información
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2 text-white/70">
                                    <Mail className="w-4 h-4 text-emerald-400" />
                                    <span className="truncate">{inscripcion.email}</span>
                                </div>
                                {inscripcion.telefono && (
                                    <div className="flex items-center gap-2 text-white/70">
                                        <Phone className="w-4 h-4 text-emerald-400" />
                                        <span>{inscripcion.telefono}</span>
                                    </div>
                                )}
                                {inscripcion.sede && (
                                    <div className="flex items-center gap-2 text-white/70">
                                        <MapPin className="w-4 h-4 text-emerald-400" />
                                        <span className="truncate">{inscripcion.sede}</span>
                                    </div>
                                )}
                                <div className="pt-3 border-t border-white/10">
                                    <p className="text-xs text-white/40">
                                        Inscrito el {fechaInscripcion}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mensaje informativo según estado */}
                    <div className="mt-6">
                        {cuotasPendientes > 0 && (
                            <div className="p-5 bg-blue-500/10 border border-blue-500/30 rounded-xl shadow-lg">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-blue-300 mb-2">Próximos pasos</h4>
                                        <ul className="text-xs text-white/70 space-y-1.5 list-disc list-inside">
                                            <li>Realiza el pago de las cuotas pendientes</li>
                                            {inscripcion.codigoReferencia && (
                                                <li>Incluye el código <strong className="text-amber-400">{inscripcion.codigoReferencia}</strong> en la transferencia</li>
                                            )}
                                            <li>Nuestro equipo validará tu pago y te notificará por email</li>
                                            <li>Una vez completados los pagos, tu inscripción será confirmada</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {cuotasPagadas >= numeroCuotas && (
                            <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl shadow-lg">
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
                    </div>

                    {/* Botón de acción principal */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <Button
                            onClick={onVolverInicio}
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 py-6 text-base font-semibold"
                        >
                            Volver a la página principal
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}



