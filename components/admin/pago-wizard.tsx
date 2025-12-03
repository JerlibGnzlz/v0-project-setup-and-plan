'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { ComprobanteUpload } from '@/components/ui/comprobante-upload'
import { uploadApi } from '@/lib/api/upload'
import { 
    Loader2, 
    Zap, 
    CreditCard, 
    Smartphone, 
    Banknote, 
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    AlertCircle,
    FileText,
    Check
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PagoWizardProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    inscripcion: {
        id: string
        nombre: string
        apellido: string
        numeroCuota?: number
        codigoReferencia?: string
        origenRegistro?: 'web' | 'dashboard' | 'mobile'
    }
    monto: number
    pagoExistente?: {
        id: string
        metodoPago?: string
        referencia?: string
        comprobanteUrl?: string
        estado?: string
    }
    onUpdate: (data: {
        metodoPago: string
        referencia?: string
        comprobanteUrl?: string
        notas?: string
        validarAutomaticamente?: boolean
    }) => Promise<void>
    isUpdating?: boolean
}

const METODOS_PAGO_WEB = [
    {
        value: 'transferencia',
        label: 'Transferencia Bancaria',
        icon: Banknote,
        description: 'Transferencia desde tu banco',
        colorClasses: {
            border: 'border-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-950/30',
            iconBg: 'bg-blue-500',
            text: 'text-blue-500',
        },
        requiereComprobante: true,
        placeholder: 'CBU/CVU o número de operación',
    },
    {
        value: 'mercadopago',
        label: 'MercadoPago',
        icon: Smartphone,
        description: 'Pago con MercadoPago',
        colorClasses: {
            border: 'border-emerald-500',
            bg: 'bg-emerald-50 dark:bg-emerald-950/30',
            iconBg: 'bg-emerald-500',
            text: 'text-emerald-500',
        },
        requiereComprobante: true,
        placeholder: 'ID de operación o ticket',
    },
]

const METODOS_PAGO_MANUAL = [
    {
        value: 'efectivo',
        label: 'Efectivo',
        icon: CreditCard,
        description: 'Pago en efectivo con código de referencia',
        colorClasses: {
            border: 'border-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-950/30',
            iconBg: 'bg-amber-500',
            text: 'text-amber-500',
        },
        requiereComprobante: false,
        placeholder: 'Nro. de recibo o voucher',
    },
]

export function PagoWizard({
    open,
    onOpenChange,
    inscripcion,
    monto,
    pagoExistente,
    onUpdate,
    isUpdating = false,
}: PagoWizardProps) {
    const [currentStep, setCurrentStep] = useState(1)
    const [metodoPago, setMetodoPago] = useState(pagoExistente?.metodoPago || '')
    const [referencia, setReferencia] = useState(pagoExistente?.referencia || '')
    const [comprobanteUrl, setComprobanteUrl] = useState(pagoExistente?.comprobanteUrl || '')
    const [notas, setNotas] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [isNavigatingBack, setIsNavigatingBack] = useState(false)

    // Determinar métodos disponibles según origen de inscripción
    const esInscripcionManual = inscripcion.origenRegistro === 'dashboard' || !inscripcion.origenRegistro
    const metodosDisponibles = esInscripcionManual ? METODOS_PAGO_MANUAL : [...METODOS_PAGO_WEB, ...METODOS_PAGO_MANUAL]
    
    const metodoSeleccionado = metodosDisponibles.find(m => m.value === metodoPago)
    const requiereComprobante = metodoSeleccionado?.requiereComprobante || false
    const totalSteps = requiereComprobante ? 3 : 2
    
    // Si es manual y no hay método seleccionado, seleccionar efectivo por defecto
    useEffect(() => {
        if (esInscripcionManual && !metodoPago && !isNavigatingBack) {
            setMetodoPago('efectivo')
        }
    }, [esInscripcionManual, metodoPago, isNavigatingBack])

    // Reset cuando se abre/cierra
    useEffect(() => {
        if (open) {
            setCurrentStep(1)
            setMetodoPago(pagoExistente?.metodoPago || '')
            setReferencia(pagoExistente?.referencia || '')
            setComprobanteUrl(pagoExistente?.comprobanteUrl || '')
            setNotas('')
            setIsNavigatingBack(false)
        }
    }, [open, pagoExistente])

    // Establecer automáticamente el código de referencia si existe y es efectivo
    useEffect(() => {
        if (metodoPago === 'efectivo' && inscripcion.codigoReferencia && !pagoExistente?.referencia) {
            setReferencia(inscripcion.codigoReferencia)
        }
    }, [metodoPago, inscripcion.codigoReferencia, pagoExistente?.referencia])

    // Avanzar automáticamente al paso 2 cuando se selecciona método (solo si no está navegando hacia atrás)
    useEffect(() => {
        if (metodoPago && currentStep === 1 && !isNavigatingBack) {
            const timer = setTimeout(() => {
                setCurrentStep(2)
            }, 300)
            return () => clearTimeout(timer)
        }
        // Reset el flag después de un momento
        if (isNavigatingBack) {
            const timer = setTimeout(() => {
                setIsNavigatingBack(false)
            }, 500)
            return () => clearTimeout(timer)
        }
    }, [metodoPago, currentStep, isNavigatingBack])

    // Para efectivo, la referencia es opcional si no hay código de referencia
    const referenciaEsOpcional = metodoPago === 'efectivo' && !inscripcion.codigoReferencia
    const puedeContinuarPaso1 = !!metodoPago
    const puedeContinuarPaso2 = referenciaEsOpcional 
        ? (!requiereComprobante || comprobanteUrl) // Solo requiere comprobante si aplica
        : referencia.trim() && (!requiereComprobante || comprobanteUrl) // Requiere referencia y comprobante si aplica
    const puedeValidar = referenciaEsOpcional
        ? (requiereComprobante ? comprobanteUrl : true) // Solo requiere comprobante si aplica
        : referencia.trim() && (requiereComprobante ? comprobanteUrl : true) // Requiere referencia y comprobante si aplica

    const handleNext = () => {
        if (currentStep === 1 && puedeContinuarPaso1) {
            setCurrentStep(2)
        } else if (currentStep === 2 && puedeContinuarPaso2) {
            if (requiereComprobante && !comprobanteUrl) {
                setCurrentStep(3)
            } else {
                handleSubmit()
            }
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setIsNavigatingBack(true)
            setCurrentStep(currentStep - 1)
        }
    }

    const handleSubmit = async () => {
        try {
            await onUpdate({
                metodoPago,
                referencia: referencia.trim() || undefined,
                comprobanteUrl: comprobanteUrl || undefined,
                notas: notas.trim() || undefined,
                validarAutomaticamente: puedeValidar,
            })

            // Reset form
            setReferencia('')
            setComprobanteUrl('')
            setNotas('')
            setCurrentStep(1)
            onOpenChange(false)
        } catch (error) {
            // Error ya manejado en el componente padre
        }
    }

    const handleUpload = async (file: File) => {
        setIsUploading(true)
        try {
            const result = await uploadApi.uploadComprobantePago(file)
            setComprobanteUrl(result.url)
            toast.success('Comprobante subido exitosamente')
            // Avanzar al paso 3 automáticamente
            if (currentStep === 2) {
                setTimeout(() => setCurrentStep(3), 500)
            }
        } catch (error: any) {
            console.error('Error al subir comprobante:', error)
            const errorMessage = error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || 'Error al subir el comprobante'
            toast.error('Error al subir el comprobante', {
                description: errorMessage,
            })
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Zap className="size-5 text-emerald-500" />
                        {pagoExistente ? 'Actualizar Pago' : 'Crear Pago'}
                    </DialogTitle>
                    <DialogDescription>
                        {inscripcion.nombre} {inscripcion.apellido}
                        {inscripcion.numeroCuota && ` - Cuota ${inscripcion.numeroCuota}`}
                        <span className="block mt-1 font-semibold text-foreground">
                            Monto: ${monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                {/* Indicador de pasos */}
                <div className="flex items-center justify-between mb-6 pt-4">
                    {[1, 2, 3].slice(0, totalSteps).map((step, index) => (
                        <div key={step} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                                        currentStep === step
                                            ? "bg-emerald-500 border-emerald-500 text-white"
                                            : currentStep > step
                                                ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                                                : "bg-muted border-muted-foreground/20 text-muted-foreground"
                                    )}
                                >
                                    {currentStep > step ? (
                                        <Check className="size-5" />
                                    ) : (
                                        <span className="font-semibold">{step}</span>
                                    )}
                                </div>
                                <span className={cn(
                                    "text-xs mt-2 text-center",
                                    currentStep >= step ? "text-foreground font-medium" : "text-muted-foreground"
                                )}>
                                    {step === 1 && "Método"}
                                    {step === 2 && "Datos"}
                                    {step === 3 && "Comprobante"}
                                </span>
                            </div>
                            {index < totalSteps - 1 && (
                                <div className={cn(
                                    "h-0.5 flex-1 mx-2 transition-colors",
                                    currentStep > step ? "bg-emerald-500" : "bg-muted"
                                )} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Contenido de los pasos */}
                <div className="space-y-4 py-4">
                    {/* Paso 1: Selección de Método */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold mb-1">
                                    💳 Paso 1: Selecciona el Método de Pago
                                </p>
                                <p className="text-sm text-emerald-900 dark:text-emerald-100">
                                    Elige cómo se realizó el pago
                                </p>
                            </div>

                            {/* Mostrar código de referencia si es inscripción manual */}
                            {esInscripcionManual && inscripcion.codigoReferencia && (
                                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="size-4 text-amber-600 dark:text-amber-400" />
                                        <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                                            Código de Referencia
                                        </span>
                                    </div>
                                    <p className="text-lg font-mono font-bold text-amber-700 dark:text-amber-300">
                                        {inscripcion.codigoReferencia}
                                    </p>
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                        Usa este código para identificar el pago en efectivo
                                    </p>
                                </div>
                            )}
                            
                            {/* Mensaje informativo si no hay código de referencia */}
                            {esInscripcionManual && !inscripcion.codigoReferencia && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                                        <AlertCircle className="size-3" />
                                        <span>Esta inscripción no tiene código de referencia. Puedes crear el pago sin referencia o agregar un número de recibo opcional.</span>
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-3">
                                {metodosDisponibles.map((metodo) => {
                                    const Icon = metodo.icon
                                    const isSelected = metodoPago === metodo.value
                                    return (
                                        <button
                                            key={metodo.value}
                                            type="button"
                                            onClick={() => setMetodoPago(metodo.value)}
                                            className={cn(
                                                "p-4 rounded-lg border-2 transition-all text-left",
                                                isSelected
                                                    ? `${metodo.colorClasses.border} ${metodo.colorClasses.bg}`
                                                    : "border-muted hover:border-muted-foreground/50 bg-card"
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "p-2 rounded-lg",
                                                        isSelected 
                                                            ? `${metodo.colorClasses.iconBg} text-white`
                                                            : "bg-muted"
                                                    )}>
                                                        <Icon className="size-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">{metodo.label}</p>
                                                        <p className="text-xs text-muted-foreground">{metodo.description}</p>
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <CheckCircle2 className={cn(
                                                        "size-5",
                                                        metodo.colorClasses.text
                                                    )} />
                                                )}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Paso 2: Datos del Pago */}
                    {currentStep === 2 && metodoSeleccionado && (
                        <div className="space-y-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold mb-1">
                                    📝 Paso 2: Completa los Datos del Pago
                                </p>
                                <p className="text-sm text-blue-900 dark:text-blue-100">
                                    {metodoSeleccionado.label}
                                </p>
                            </div>

                            {/* Referencia */}
                            <div className="space-y-2">
                                <Label>
                                    Referencia {!referenciaEsOpcional && <span className="text-red-500">*</span>}
                                    {referenciaEsOpcional && (
                                        <span className="text-xs text-muted-foreground ml-2">(Opcional)</span>
                                    )}
                                    {metodoPago === 'efectivo' && inscripcion.codigoReferencia && (
                                        <span className="text-xs text-muted-foreground ml-2">(Automático)</span>
                                    )}
                                </Label>
                                <Input
                                    placeholder={metodoSeleccionado.placeholder}
                                    value={referencia}
                                    onChange={(e) => setReferencia(e.target.value)}
                                    readOnly={metodoPago === 'efectivo' && !!inscripcion.codigoReferencia && !pagoExistente?.referencia}
                                    disabled={metodoPago === 'efectivo' && !!inscripcion.codigoReferencia && !pagoExistente?.referencia}
                                    autoFocus={metodoPago !== 'efectivo' || !inscripcion.codigoReferencia}
                                    className={cn(
                                        "text-lg",
                                        metodoPago === 'efectivo' && inscripcion.codigoReferencia && !pagoExistente?.referencia && "bg-muted cursor-not-allowed"
                                    )}
                                />
                                {metodoPago === 'efectivo' && inscripcion.codigoReferencia && (
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                        ✓ Código de referencia asignado automáticamente
                                    </p>
                                )}
                                {metodoPago === 'efectivo' && !inscripcion.codigoReferencia && (
                                    <p className="text-xs text-muted-foreground">
                                        Puedes dejar este campo vacío si no tienes un número de recibo o voucher
                                    </p>
                                )}
                                {metodoPago === 'transferencia' && (
                                    <p className="text-xs text-muted-foreground">
                                        Ejemplo: CBU-1234567890123456789012 o número de operación bancaria
                                    </p>
                                )}
                                {metodoPago === 'mercadopago' && (
                                    <p className="text-xs text-muted-foreground">
                                        Ejemplo: ID de operación: 1234567890 o número de ticket
                                    </p>
                                )}
                            </div>

                            {/* Comprobante (si requiere) */}
                            {requiereComprobante && (
                                <div className="space-y-2">
                                    <Label>
                                        Comprobante <span className="text-red-500">*</span>
                                    </Label>
                                    <ComprobanteUpload
                                        value={comprobanteUrl}
                                        onChange={setComprobanteUrl}
                                        onUpload={handleUpload}
                                        disabled={isUploading || isUpdating}
                                    />
                                </div>
                            )}

                            {/* Notas */}
                            <div className="space-y-2">
                                <Label>Notas (Opcional)</Label>
                                <Textarea
                                    placeholder="Notas adicionales sobre este pago..."
                                    value={notas}
                                    onChange={(e) => setNotas(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    {/* Paso 3: Resumen y Confirmación */}
                    {currentStep === 3 && metodoSeleccionado && (
                        <div className="space-y-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold mb-1">
                                    ✅ Paso 3: Resumen y Confirmación
                                </p>
                                <p className="text-sm text-emerald-900 dark:text-emerald-100">
                                    Revisa los datos antes de confirmar
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <FileText className="size-4" />
                                        Resumen del Pago
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Método:</span>
                                            <span className="font-medium capitalize">{metodoSeleccionado.label}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Referencia:</span>
                                            <span className="font-medium">{referencia || 'N/A'}</span>
                                        </div>
                                        {comprobanteUrl && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Comprobante:</span>
                                                <span className="font-medium text-emerald-600 dark:text-emerald-400">✓ Adjuntado</span>
                                            </div>
                                        )}
                                        {notas && (
                                            <div>
                                                <span className="text-muted-foreground">Notas:</span>
                                                <p className="font-medium mt-1">{notas}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {puedeValidar && (
                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                                        <p className="text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                                            <Zap className="size-3" />
                                            <strong>Validación automática:</strong> Este pago se validará automáticamente al guardar
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer con botones */}
                <DialogFooter className="flex justify-between">
                    <div>
                        {/* Solo mostrar botón Anterior si hay múltiples métodos disponibles o si es necesario volver */}
                        {currentStep > 1 && metodosDisponibles.length > 1 && (
                            <Button variant="outline" onClick={handleBack} disabled={isUpdating || isUploading}>
                                <ChevronLeft className="size-4 mr-2" />
                                Anterior
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating || isUploading}>
                            Cancelar
                        </Button>
                        {currentStep < totalSteps ? (
                            <Button
                                onClick={handleNext}
                                disabled={
                                    isUpdating || 
                                    isUploading || 
                                    (currentStep === 1 && !puedeContinuarPaso1) ||
                                    (currentStep === 2 && !puedeContinuarPaso2)
                                }
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                            >
                                Siguiente
                                <ChevronRight className="size-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={isUpdating || isUploading || !puedeContinuarPaso2}
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="size-4 mr-2 animate-spin" />
                                        Guardando...
                                    </>
                                ) : puedeValidar ? (
                                    <>
                                        <Zap className="size-4 mr-2" />
                                        Guardar y Validar
                                    </>
                                ) : (
                                    'Guardar'
                                )}
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

