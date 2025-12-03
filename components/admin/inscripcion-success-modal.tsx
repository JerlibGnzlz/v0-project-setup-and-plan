'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { CheckCircle2, UserPlus, CreditCard, ArrowRight, Zap, Eye } from 'lucide-react'

interface InscripcionSuccessModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    inscripcion: {
        id: string
        nombre: string
        apellido: string
        email: string
        convencion?: {
            titulo: string
        }
        numeroCuotas?: number
        pagos?: Array<{
            estado: string
            numeroCuota?: number
        }>
    }
    pagoCreado?: boolean
    pagoValidado?: boolean
    onVerInscripcion: () => void
    onCreateSiguientePago?: () => void
    onCreateOtraInscripcion?: () => void
}

export function InscripcionSuccessModal({
    open,
    onOpenChange,
    inscripcion,
    pagoCreado = false,
    pagoValidado = false,
    onVerInscripcion,
    onCreateSiguientePago,
    onCreateOtraInscripcion,
}: InscripcionSuccessModalProps) {
    // Validaciones defensivas
    if (!inscripcion) {
        return null
    }

    const pagosCompletados = inscripcion.pagos?.filter((p: any) => p?.estado === 'COMPLETADO').length || 0
    const numeroCuotas = inscripcion.numeroCuotas || 0
    const pagosPendientes = numeroCuotas - pagosCompletados
    const tieneMasCuotas = pagosPendientes > 0

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader className="text-center pb-4">
                    <div className="flex justify-center mb-3">
                        <div className="p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                            <CheckCircle2 className="size-10 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <DialogTitle className="text-xl">¡Inscripción Creada!</DialogTitle>
                    <DialogDescription className="text-sm mt-2">
                        {inscripcion?.nombre || ''} {inscripcion?.apellido || ''} ha sido inscrito exitosamente
                    </DialogDescription>
                </DialogHeader>

                {/* Estado de pago simplificado */}
                <div className="py-3 border-y border-border">
                    {pagoValidado ? (
                        <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <Zap className="size-4" />
                            <span className="text-sm font-medium">Pago validado automáticamente</span>
                        </div>
                    ) : pagoCreado ? (
                        <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                            <CreditCard className="size-4" />
                            <span className="text-sm">Pago creado (pendiente)</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <span className="text-sm">{numeroCuotas} cuota(s) pendiente(s)</span>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col gap-2 pt-4">
                    <div className="flex gap-2 w-full">
                        {tieneMasCuotas && onCreateSiguientePago && (
                            <Button
                                onClick={() => {
                                    onCreateSiguientePago()
                                    onOpenChange(false)
                                }}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                            >
                                <CreditCard className="size-4 mr-2" />
                                Siguiente Pago
                            </Button>
                        )}
                        <Button
                            onClick={() => {
                                onVerInscripcion()
                                onOpenChange(false)
                            }}
                            className="flex-1"
                        >
                            <Eye className="size-4 mr-2" />
                            Ver
                        </Button>
                    </div>
                    <div className="flex gap-2 w-full">
                        {onCreateOtraInscripcion && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    onCreateOtraInscripcion()
                                    onOpenChange(false)
                                }}
                                className="flex-1"
                            >
                                <UserPlus className="size-4 mr-2" />
                                Crear Otra
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1"
                        >
                            Cerrar
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

