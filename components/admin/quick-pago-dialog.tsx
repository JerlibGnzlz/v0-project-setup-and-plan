'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    DialogFooter,
} from '@/components/ui/dialog'
import { ComprobanteUpload } from '@/components/ui/comprobante-upload'
import { uploadApi } from '@/lib/api/upload'
import { Loader2, Zap } from 'lucide-react'
import { toast } from 'sonner'

interface QuickPagoDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    inscripcion: {
        id: string
        nombre: string
        apellido: string
        numeroCuota?: number
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

export function QuickPagoDialog({
    open,
    onOpenChange,
    inscripcion,
    monto,
    pagoExistente,
    onUpdate,
    isUpdating = false,
}: QuickPagoDialogProps) {
    const [metodoPago, setMetodoPago] = useState(pagoExistente?.metodoPago || 'transferencia')
    const [referencia, setReferencia] = useState(pagoExistente?.referencia || '')
    const [comprobanteUrl, setComprobanteUrl] = useState(pagoExistente?.comprobanteUrl || '')
    const [notas, setNotas] = useState('')
    const [isUploading, setIsUploading] = useState(false)

    const requiereComprobante = metodoPago === 'transferencia' || metodoPago === 'mercadopago'
    const puedeValidar = referencia.trim() && (requiereComprobante ? comprobanteUrl : true)

    const handleSubmit = async () => {
        // Validaciones básicas
        if (!referencia.trim() && metodoPago !== 'efectivo') {
            toast.error('La referencia es requerida')
            return
        }

        if (requiereComprobante && !comprobanteUrl) {
            toast.error('El comprobante es requerido')
            return
        }

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
            <DialogContent className="max-w-md">
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

                <div className="space-y-4 py-4">
                    {/* Método de Pago */}
                    <div className="space-y-2">
                        <Label>Método de Pago</Label>
                        <Select value={metodoPago} onValueChange={setMetodoPago}>
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

                    {/* Referencia */}
                    <div className="space-y-2">
                        <Label>
                            Referencia {metodoPago !== 'efectivo' && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                            placeholder={
                                metodoPago === 'transferencia'
                                    ? 'CBU/CVU o número de operación'
                                    : metodoPago === 'mercadopago'
                                        ? 'ID de operación o ticket'
                                        : 'Nro. de recibo o voucher'
                            }
                            value={referencia}
                            onChange={(e) => setReferencia(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Comprobante (solo si requiere) */}
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

                    {/* Notas (opcional) */}
                    <div className="space-y-2">
                        <Label>Notas (Opcional)</Label>
                        <Input
                            placeholder="Notas adicionales..."
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                        />
                    </div>

                    {/* Info de validación automática */}
                    {puedeValidar && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                            <p className="text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                                <Zap className="size-3" />
                                <strong>Validación automática:</strong> Este pago se validará automáticamente al guardar
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isUpdating || isUploading || (metodoPago !== 'efectivo' && !referencia.trim()) || (requiereComprobante && !comprobanteUrl)}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
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
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

