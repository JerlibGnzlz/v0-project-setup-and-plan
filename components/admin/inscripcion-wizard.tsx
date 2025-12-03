'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { ComprobanteUpload } from '@/components/ui/comprobante-upload'
import { uploadApi } from '@/lib/api/upload'
import {
    UserPlus,
    CreditCard,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Star,
    Loader2,
    Check,
    AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface InscripcionWizardProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    convenciones: any[]
    onCreateInscripcion: (data: any) => Promise<void>
    onCreatePago?: (data: any) => Promise<void>
    isCreating?: boolean
}

export function InscripcionWizard({
    open,
    onOpenChange,
    convenciones,
    onCreateInscripcion,
    onCreatePago,
    isCreating = false,
}: InscripcionWizardProps) {
    const [currentStep, setCurrentStep] = useState(1)
    const totalSteps = 1

    // Convención activa por defecto
    const convencionActiva = convenciones.find((c: any) => c.activa)

    // Formulario completo
    const [formData, setFormData] = useState({
        // Paso 1: Datos personales
        convencionId: convencionActiva?.id || '',
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        sede: '',
        tipoInscripcion: 'invitado',
        numeroCuotas: convencionActiva ? 3 : 1,
        notas: '',

    })

    // Calcular monto por cuota
    const convencionSeleccionada = convenciones.find((c: any) => c.id === formData.convencionId)
    const costoTotal = convencionSeleccionada?.costo ? Number(convencionSeleccionada.costo) : 0
    const montoPorCuota = formData.numeroCuotas > 0 ? costoTotal / formData.numeroCuotas : costoTotal

    // Resetear cuando se abre/cierra
    useEffect(() => {
        if (open) {
            setCurrentStep(1)
            setFormData({
                convencionId: convencionActiva?.id || '',
                nombre: '',
                apellido: '',
                email: '',
                telefono: '',
                sede: '',
                tipoInscripcion: 'invitado',
                numeroCuotas: convencionActiva ? 3 : 1,
                notas: '',
            })
        }
    }, [open, convencionActiva])

    // Validaciones por paso
    const isStep1Valid = () => {
        return !!(
            formData.convencionId &&
            formData.nombre.trim() &&
            formData.apellido.trim() &&
            formData.email.trim() &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        )
    }

    const canGoNext = () => {
        return isStep1Valid()
    }

    const handleNext = () => {
        if (canGoNext() && currentStep < totalSteps) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleSubmit = async () => {
        try {
            // Preparar datos para crear inscripción
            const inscripcionData = {
                convencionId: formData.convencionId,
                nombre: formData.nombre.trim(),
                apellido: formData.apellido.trim(),
                email: formData.email.trim().toLowerCase(),
                telefono: formData.telefono.trim() || undefined,
                sede: formData.sede.trim() || 'Sin sede especificada',
                tipoInscripcion: formData.tipoInscripcion,
                numeroCuotas: formData.numeroCuotas,
                notas: formData.notas.trim() || `Inscripción manual creada desde admin`,
            }

            // Crear inscripción (y pago si está marcado)
            await onCreateInscripcion(inscripcionData)
        } catch (error: any) {
            // El error ya se maneja en el componente padre
            // Solo re-lanzar para que el wizard muestre el estado de error
            console.error('[InscripcionWizard] Error al crear inscripción:', error)
            throw error
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                            <UserPlus className="size-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span>Nueva Inscripción</span>
                    </DialogTitle>
                    <DialogDescription>
                        Completa los datos del participante para crear la inscripción
                    </DialogDescription>
                </DialogHeader>


                {/* Contenido del paso */}
                <div className="space-y-4 py-4">
                    {/* Paso 1: Datos Personales */}
                    {currentStep === 1 && (
                        <div className="space-y-4">

                            {/* Convención */}
                            <div className="space-y-2">
                                <Label>
                                    Convención <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.convencionId}
                                    onValueChange={(value) => {
                                        const conv = convenciones.find((c: any) => c.id === value)
                                        setFormData({
                                            ...formData,
                                            convencionId: value,
                                            numeroCuotas: conv ? 3 : formData.numeroCuotas,
                                        })
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una convención" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {convenciones.map((conv: any) => (
                                            <SelectItem key={conv.id} value={conv.id}>
                                                <div className="flex items-center gap-2">
                                                    {conv.activa && (
                                                        <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded">
                                                            Activa
                                                        </span>
                                                    )}
                                                    <span>{conv.titulo}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Nombre y Apellido */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>
                                        Nombre <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        placeholder="Nombre"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>
                                        Apellido <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        placeholder="Apellido"
                                        value={formData.apellido}
                                        onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label>
                                    Correo Electrónico <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            {/* Teléfono y Sede */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Teléfono (Opcional)</Label>
                                    <Input
                                        placeholder="+54 11 1234-5678"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Sede (Opcional)</Label>
                                    <Input
                                        placeholder="Nombre de la iglesia"
                                        value={formData.sede}
                                        onChange={(e) => setFormData({ ...formData, sede: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Tipo y Cuotas */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tipo de Inscripción</Label>
                                    <Select
                                        value={formData.tipoInscripcion}
                                        onValueChange={(value) => setFormData({ ...formData, tipoInscripcion: value })}
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
                                        value={String(formData.numeroCuotas)}
                                        onValueChange={(value) => setFormData({ ...formData, numeroCuotas: parseInt(value) })}
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
                                <Label>Notas (Opcional)</Label>
                                <Textarea
                                    placeholder="Notas adicionales..."
                                    rows={2}
                                    value={formData.notas}
                                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                                />
                            </div>

                            {/* Resumen de costos */}
                            {convencionSeleccionada && (
                                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CreditCard className="size-4 text-blue-600 dark:text-blue-400" />
                                        <h4 className="font-semibold text-blue-900 dark:text-blue-100">Resumen de Costos</h4>
                                    </div>
                                    <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                                        <p>Costo total: <strong>${costoTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong></p>
                                        <p>Cuotas: <strong>{formData.numeroCuotas}</strong></p>
                                        <p>Monto por cuota: <strong>${montoPorCuota.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong></p>
                                    </div>
                                </div>
                            )}

                            {/* Resumen de datos ingresados */}
                            {formData.nombre && formData.apellido && formData.email && (
                                <div className="mt-4 p-4 border rounded-lg bg-muted/30">
                                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                                        <CheckCircle2 className="size-4 text-emerald-600" />
                                        Resumen de Datos
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div>
                                            <span className="text-muted-foreground">Nombre:</span>
                                            <p className="font-medium">{formData.nombre} {formData.apellido}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Email:</span>
                                            <p className="font-medium">{formData.email}</p>
                                        </div>
                                        {formData.telefono && (
                                            <div>
                                                <span className="text-muted-foreground">Teléfono:</span>
                                                <p className="font-medium">{formData.telefono}</p>
                                            </div>
                                        )}
                                        {formData.sede && (
                                            <div>
                                                <span className="text-muted-foreground">Sede:</span>
                                                <p className="font-medium">{formData.sede}</p>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-muted-foreground">Tipo:</span>
                                            <p className="font-medium capitalize">{formData.tipoInscripcion}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Convención:</span>
                                            <p className="font-medium">{convencionSeleccionada?.titulo || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}


                </div>

                {/* Footer con botones de navegación */}
                <DialogFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!canGoNext() || isCreating}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="size-4 mr-2 animate-spin" />
                                Creando...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="size-4 mr-2" />
                                Confirmar y Crear
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

