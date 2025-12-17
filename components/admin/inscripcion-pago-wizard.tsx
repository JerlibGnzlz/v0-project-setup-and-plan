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
import { Badge } from '@/components/ui/badge'
import {
  UserPlus,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Check,
  AlertCircle,
  DollarSign,
  FileText,
  Plus,
  Pencil,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import Link from 'next/link'
import { PagoWizard } from './pago-wizard'
import type { Inscripcion, CreateInscripcionDto } from '@/lib/api/inscripciones'
import type { Convencion } from '@/lib/api/convenciones'
import type { Pago } from '@/lib/api/pagos'

interface CreatePagoDto {
  inscripcionId: string
  monto: number
  metodoPago: string
  numeroCuota: number
  referencia?: string
  comprobanteUrl?: string
  notas?: string
}

interface UpdatePagoDto {
  monto?: number
  metodoPago?: string
  estado?: 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO' | 'REEMBOLSADO'
  referencia?: string
  comprobanteUrl?: string
  notas?: string
}

interface CuotaInfo {
  numero: number
  monto: number
  estado: 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO' | 'REEMBOLSADO'
  pagoId?: string
  fechaVencimiento?: string
}

interface InscripcionPagoWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  convenciones: Convencion[]
  inscripcionExistente?: Inscripcion // Si existe, es modo edición
  onCreateInscripcion: (data: CreateInscripcionDto) => Promise<Inscripcion>
  onUpdateInscripcion?: (id: string, data: Partial<CreateInscripcionDto>) => Promise<Inscripcion>
  onCreatePago: (data: CreatePagoDto) => Promise<Pago>
  onUpdatePago: (id: string, data: UpdatePagoDto) => Promise<Pago>
  isCreating?: boolean
}

export function InscripcionPagoWizard({
  open,
  onOpenChange,
  convenciones,
  inscripcionExistente,
  onCreateInscripcion,
  onUpdateInscripcion,
  onCreatePago,
  onUpdatePago,
  isCreating = false,
}: InscripcionPagoWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 2
  const isEditMode = !!inscripcionExistente

  // Convención activa por defecto
  const convencionActiva = convenciones.find((c: Convencion) => c.activa)

  // Formulario de inscripción
  const [formData, setFormData] = useState({
    convencionId: inscripcionExistente?.convencionId || convencionActiva?.id || '',
    nombre: inscripcionExistente?.nombre || '',
    apellido: inscripcionExistente?.apellido || '',
    email: inscripcionExistente?.email || '',
    telefono: inscripcionExistente?.telefono || '',
    sede: inscripcionExistente?.sede || '',
    pais: inscripcionExistente?.pais || 'Argentina',
    provincia: inscripcionExistente?.provincia || '',
    tipoInscripcion: inscripcionExistente?.tipoInscripcion || 'invitado',
    numeroCuotas: inscripcionExistente?.numeroCuotas || 3,
    notas: inscripcionExistente?.notas || '',
  })

  // Estado de la inscripción creada/actualizada
  const [inscripcionCreada, setInscripcionCreada] = useState<Inscripcion | null>(inscripcionExistente || null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Wizard de pago
  const [pagoWizardOpen, setPagoWizardOpen] = useState(false)
  const [selectedCuota, setSelectedCuota] = useState<CuotaInfo | null>(null)
  const [selectedPago, setSelectedPago] = useState<Pago | null>(null)

  // Calcular montos
  const convencionSeleccionada = convenciones.find((c: Convencion) => c.id === formData.convencionId)
  const costoTotal = convencionSeleccionada?.costo ? Number(convencionSeleccionada.costo) : 0
  const montoPorCuota = formData.numeroCuotas > 0 ? costoTotal / formData.numeroCuotas : costoTotal

  // Resetear cuando se abre/cierra
  useEffect(() => {
    if (open) {
      setCurrentStep(1)
      if (inscripcionExistente) {
        setFormData({
          convencionId: inscripcionExistente.convencionId || '',
          nombre: inscripcionExistente.nombre || '',
          apellido: inscripcionExistente.apellido || '',
          email: inscripcionExistente.email || '',
          telefono: inscripcionExistente.telefono || '',
          sede: inscripcionExistente.sede || '',
          tipoInscripcion: inscripcionExistente.tipoInscripcion || 'invitado',
          numeroCuotas: inscripcionExistente.numeroCuotas || 3,
          notas: inscripcionExistente.notas || '',
        })
        setInscripcionCreada(inscripcionExistente)
        setCurrentStep(2) // Ir directamente al paso 2 si es edición
      } else {
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
        setInscripcionCreada(null)
      }
    }
  }, [open, inscripcionExistente, convencionActiva])

  // Sincronizar inscripcionCreada con inscripcionExistente cuando cambia desde el padre
  useEffect(() => {
    if (inscripcionExistente) {
      setInscripcionCreada(inscripcionExistente)
      // Si es edición y estamos en el paso 1, ir al paso 2
      if (currentStep === 1 && open) {
        setCurrentStep(2)
      }
    } else if (!open && !inscripcionExistente) {
      // Reset cuando se cierra y no hay inscripción existente
      setInscripcionCreada(null)
      setCurrentStep(1)
    }
  }, [inscripcionExistente, open, currentStep])

  // Validaciones
  const isStep1Valid = () => {
    const baseValid = !!(
      formData.convencionId &&
      formData.nombre.trim() &&
      formData.apellido.trim() &&
      formData.email.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      formData.pais
    )
    // Si es Argentina, también debe tener provincia
    if (formData.pais === 'Argentina') {
      return baseValid && !!formData.provincia
    }
    return baseValid
  }

  const handleNext = async () => {
    if (currentStep === 1 && isStep1Valid()) {
      // Si estamos en modo edición, actualizar primero
      if (isEditMode && inscripcionExistente) {
        setIsSubmitting(true)
        try {
          const updated = await onUpdateInscripcion!(inscripcionExistente.id, {
            nombre: formData.nombre.trim(),
            apellido: formData.apellido.trim(),
            email: formData.email.trim().toLowerCase(),
            telefono: formData.telefono.trim() || undefined,
            sede: formData.sede.trim() || undefined,
            pais: formData.pais || undefined,
            provincia: formData.provincia || undefined,
            tipoInscripcion: formData.tipoInscripcion,
            numeroCuotas: formData.numeroCuotas,
            notas: formData.notas.trim() || undefined,
          })
          setInscripcionCreada(updated)
          toast.success('Inscripción actualizada exitosamente')
          setCurrentStep(2)
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
          const axiosError = error as { response?: { data?: { error?: { message?: string } } } }
          toast.error('Error al actualizar inscripción', {
            description: axiosError.response?.data?.error?.message || errorMessage,
          })
        } finally {
          setIsSubmitting(false)
        }
      } else {
        // Crear nueva inscripción
        setIsSubmitting(true)
        try {
          const nuevaInscripcion = await onCreateInscripcion({
            convencionId: formData.convencionId,
            nombre: formData.nombre.trim(),
            apellido: formData.apellido.trim(),
            email: formData.email.trim().toLowerCase(),
            telefono: formData.telefono.trim() || undefined,
            sede: formData.sede.trim() || 'Sin sede especificada',
            pais: formData.pais || undefined,
            provincia: formData.provincia || undefined,
            tipoInscripcion: formData.tipoInscripcion,
            numeroCuotas: formData.numeroCuotas,
            notas: formData.notas.trim() || `Inscripción manual creada desde admin`,
            origenRegistro: 'dashboard',
          })
          // La inscripción ya viene con pagos desde el backend
          setInscripcionCreada(nuevaInscripcion)
          toast.success('Inscripción creada exitosamente')
          setCurrentStep(2)
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
          const axiosError = error as { response?: { data?: { error?: { message?: string } } } }
          toast.error('Error al crear inscripción', {
            description: axiosError.response?.data?.error?.message || errorMessage,
          })
        } finally {
          setIsSubmitting(false)
        }
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleOpenPagoWizard = (cuota: CuotaInfo, pago?: Pago) => {
    setSelectedCuota(cuota)
    setSelectedPago(pago)
    setPagoWizardOpen(true)
  }

  const handlePagoUpdate = async (data: {
    metodoPago: string
    referencia?: string
    comprobanteUrl?: string
    notas?: string
    validarAutomaticamente?: boolean
  }) => {
    try {
      if (selectedPago?.id) {
        // Actualizar pago existente
        await onUpdatePago(selectedPago.id, {
          metodoPago: data.metodoPago,
          referencia: data.referencia,
          comprobanteUrl: data.comprobanteUrl,
          notas: data.notas,
          estado: data.validarAutomaticamente ? 'COMPLETADO' : 'PENDIENTE',
        })
        toast.success(
          data.validarAutomaticamente
            ? '✅ Pago actualizado y validado'
            : 'Pago actualizado exitosamente'
        )
      } else if (selectedCuota && inscripcionCreada) {
        // Crear nuevo pago
        await onCreatePago({
          inscripcionId: inscripcionCreada.id,
          numeroCuota: selectedCuota.numero,
          monto: String(montoPorCuota),
          metodoPago: data.metodoPago,
          referencia: data.referencia,
          comprobanteUrl: data.comprobanteUrl,
          notas: data.notas,
          estado: data.validarAutomaticamente ? 'COMPLETADO' : 'PENDIENTE',
        })
        toast.success(
          data.validarAutomaticamente ? '✅ Pago creado y validado' : 'Pago creado exitosamente'
        )
      }
      setPagoWizardOpen(false)
      setSelectedCuota(null)
      setSelectedPago(null)
      // El componente padre ya recarga la inscripción a través de los callbacks
      // que actualizan inscripcionParaEditar, que se sincroniza con inscripcionCreada
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } }
      toast.error('Error al procesar el pago', {
        description: axiosError.response?.data?.error?.message || errorMessage,
      })
    }
  }

  // Generar información de cuotas
  const getCuotasInfo = () => {
    if (!inscripcionCreada) return { cuotas: [], totalPagado: 0, cuotasPagadas: 0 }

    const numeroCuotas = inscripcionCreada.numeroCuotas || 3
    const pagos = inscripcionCreada.pagos || []
    const cuotas = []

    for (let i = 1; i <= numeroCuotas; i++) {
      const pago = pagos.find((p: Pago) => p.numeroCuota === i)
      cuotas.push({
        numero: i,
        monto: montoPorCuota,
        pago: pago,
        estado: pago?.estado || 'PENDIENTE',
      })
    }

    const totalPagado = pagos
      .filter((p: Pago) => p.estado === 'COMPLETADO')
      .reduce(
        (sum: number, p: Pago) =>
          sum + (typeof p.monto === 'number' ? p.monto : parseFloat(String(p.monto || 0))),
        0
      )

    const cuotasPagadas = pagos.filter((p: Pago) => p.estado === 'COMPLETADO').length

    return { cuotas, totalPagado, cuotasPagadas, numeroCuotas }
  }

  const cuotasInfo = getCuotasInfo()

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                {isEditMode ? (
                  <Pencil className="size-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <UserPlus className="size-5 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <span>{isEditMode ? 'Editar Inscripción y Pagos' : 'Nueva Inscripción y Pagos'}</span>
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Actualiza los datos de la inscripción y gestiona los pagos'
                : 'Completa los datos del participante y gestiona los pagos asociados'}
            </DialogDescription>
          </DialogHeader>

          {/* Indicador de pasos */}
          <div className="flex items-center justify-between mb-6 pt-4">
            {[1, 2].map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                      currentStep === step
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : currentStep > step
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                          : 'bg-muted border-muted-foreground/20 text-muted-foreground'
                    )}
                  >
                    {currentStep > step ? (
                      <Check className="size-5" />
                    ) : (
                      <span className="font-semibold">{step}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-xs mt-2 text-center',
                      currentStep >= step ? 'text-foreground font-medium' : 'text-muted-foreground'
                    )}
                  >
                    {step === 1 && 'Inscripción'}
                    {step === 2 && 'Pagos'}
                  </span>
                </div>
                {index < 1 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 mx-2 transition-colors',
                      currentStep > step ? 'bg-emerald-500' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Contenido de los pasos */}
          <div className="space-y-4 py-4">
            {/* Paso 1: Datos de Inscripción */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold mb-1">
                    📝 Paso 1: Datos de la Inscripción
                  </p>
                  <p className="text-sm text-emerald-900 dark:text-emerald-100">
                    Completa la información del participante
                  </p>
                </div>

                {/* Convención */}
                <div className="space-y-2">
                  <Label>
                    Convención <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.convencionId}
                    onValueChange={value => {
                      const conv = convenciones.find((c: Convencion) => c.id === value)
                      setFormData({
                        ...formData,
                        convencionId: value,
                        numeroCuotas: conv ? 3 : formData.numeroCuotas,
                      })
                    }}
                    disabled={isEditMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una convención" />
                    </SelectTrigger>
                    <SelectContent>
                      {convenciones.map((conv: Convencion) => (
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
                      onChange={e => setFormData({ ...formData, nombre: e.target.value })}
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
                      onChange={e => setFormData({ ...formData, apellido: e.target.value })}
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
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    disabled={isEditMode}
                  />
                </div>

                {/* Teléfono */}
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    placeholder="+54 11 1234-5678"
                    value={formData.telefono}
                    onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>

                {/* País */}
                <div className="space-y-2">
                  <Label>
                    País <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.pais}
                    onValueChange={value => {
                      setFormData({
                        ...formData,
                        pais: value,
                        provincia: value !== 'Argentina' ? '' : formData.provincia,
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un país" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Argentina">Argentina</SelectItem>
                      <SelectItem value="Bolivia">Bolivia</SelectItem>
                      <SelectItem value="Brasil">Brasil</SelectItem>
                      <SelectItem value="Chile">Chile</SelectItem>
                      <SelectItem value="Colombia">Colombia</SelectItem>
                      <SelectItem value="Costa Rica">Costa Rica</SelectItem>
                      <SelectItem value="Cuba">Cuba</SelectItem>
                      <SelectItem value="Ecuador">Ecuador</SelectItem>
                      <SelectItem value="El Salvador">El Salvador</SelectItem>
                      <SelectItem value="España">España</SelectItem>
                      <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                      <SelectItem value="Guatemala">Guatemala</SelectItem>
                      <SelectItem value="Honduras">Honduras</SelectItem>
                      <SelectItem value="México">México</SelectItem>
                      <SelectItem value="Nicaragua">Nicaragua</SelectItem>
                      <SelectItem value="Panamá">Panamá</SelectItem>
                      <SelectItem value="Paraguay">Paraguay</SelectItem>
                      <SelectItem value="Perú">Perú</SelectItem>
                      <SelectItem value="República Dominicana">República Dominicana</SelectItem>
                      <SelectItem value="Uruguay">Uruguay</SelectItem>
                      <SelectItem value="Venezuela">Venezuela</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Provincia (solo para Argentina) */}
                {formData.pais === 'Argentina' && (
                  <div className="space-y-2">
                    <Label>
                      Provincia <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.provincia}
                      onValueChange={value => setFormData({ ...formData, provincia: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una provincia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Buenos Aires">Buenos Aires</SelectItem>
                        <SelectItem value="Catamarca">Catamarca</SelectItem>
                        <SelectItem value="Chaco">Chaco</SelectItem>
                        <SelectItem value="Chubut">Chubut</SelectItem>
                        <SelectItem value="Córdoba">Córdoba</SelectItem>
                        <SelectItem value="Corrientes">Corrientes</SelectItem>
                        <SelectItem value="Entre Ríos">Entre Ríos</SelectItem>
                        <SelectItem value="Formosa">Formosa</SelectItem>
                        <SelectItem value="Jujuy">Jujuy</SelectItem>
                        <SelectItem value="La Pampa">La Pampa</SelectItem>
                        <SelectItem value="La Rioja">La Rioja</SelectItem>
                        <SelectItem value="Mendoza">Mendoza</SelectItem>
                        <SelectItem value="Misiones">Misiones</SelectItem>
                        <SelectItem value="Neuquén">Neuquén</SelectItem>
                        <SelectItem value="Río Negro">Río Negro</SelectItem>
                        <SelectItem value="Salta">Salta</SelectItem>
                        <SelectItem value="San Juan">San Juan</SelectItem>
                        <SelectItem value="San Luis">San Luis</SelectItem>
                        <SelectItem value="Santa Cruz">Santa Cruz</SelectItem>
                        <SelectItem value="Santa Fe">Santa Fe</SelectItem>
                        <SelectItem value="Santiago del Estero">Santiago del Estero</SelectItem>
                        <SelectItem value="Tierra del Fuego">Tierra del Fuego</SelectItem>
                        <SelectItem value="Tucumán">Tucumán</SelectItem>
                        <SelectItem value="Ciudad Autónoma de Buenos Aires">
                          Ciudad Autónoma de Buenos Aires
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Sede / Iglesia */}
                <div className="space-y-2">
                  <Label>Sede / Iglesia</Label>
                  <Input
                    placeholder="Nombre de la sede"
                    value={formData.sede}
                    onChange={e => setFormData({ ...formData, sede: e.target.value })}
                  />
                </div>

                {/* Tipo de Inscripción y Número de Cuotas */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Inscripción</Label>
                    <Select
                      value={formData.tipoInscripcion}
                      onValueChange={value => setFormData({ ...formData, tipoInscripcion: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="invitado">Invitado</SelectItem>
                        <SelectItem value="pastor">Pastor</SelectItem>
                        <SelectItem value="visitante">Visitante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Número de Cuotas</Label>
                    <Select
                      value={String(formData.numeroCuotas)}
                      onValueChange={value =>
                        setFormData({ ...formData, numeroCuotas: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 cuota</SelectItem>
                        <SelectItem value="2">2 cuotas</SelectItem>
                        <SelectItem value="3">3 cuotas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Resumen de costos */}
                {convencionSeleccionada && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                        Costo Total:
                      </span>
                      <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                        ${costoTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700 dark:text-blue-300">
                        Monto por cuota ({formData.numeroCuotas}):
                      </span>
                      <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                        ${montoPorCuota.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Notas */}
                <div className="space-y-2">
                  <Label>Notas (Opcional)</Label>
                  <Textarea
                    placeholder="Notas adicionales sobre esta inscripción..."
                    value={formData.notas}
                    onChange={e => setFormData({ ...formData, notas: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Paso 2: Verificación de Pagos (Solo Lectura) */}
            {currentStep === 2 && inscripcionCreada && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold mb-1">
                    ✅ Paso 2: Verificación de Datos
                  </p>
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    Revisa los datos de la inscripción y los pagos creados. Puedes gestionar los
                    pagos desde la página de pagos.
                  </p>
                </div>

                {/* Resumen de pagos */}
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="size-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-semibold">Resumen de Pagos</span>
                    </div>
                    <Badge
                      variant={
                        cuotasInfo.cuotasPagadas >= cuotasInfo.numeroCuotas ? 'default' : 'outline'
                      }
                    >
                      {cuotasInfo.cuotasPagadas}/{cuotasInfo.numeroCuotas} cuotas pagadas
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <p className="font-semibold">
                        ${costoTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pagado:</span>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                        $
                        {cuotasInfo.totalPagado.toLocaleString('es-AR', {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pendiente:</span>
                      <p className="font-semibold text-amber-600 dark:text-amber-400">
                        $
                        {(costoTotal - cuotasInfo.totalPagado).toLocaleString('es-AR', {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lista de cuotas */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Cuotas ({cuotasInfo.numeroCuotas})</h4>
                  {cuotasInfo.cuotas.map(cuota => (
                    <div
                      key={cuota.numero}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                            cuota.estado === 'COMPLETADO'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                          )}
                        >
                          {cuota.numero}
                        </div>
                        <div>
                          <div className="text-sm font-medium">Cuota {cuota.numero}</div>
                          <div className="text-xs text-muted-foreground">
                            ${cuota.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={cuota.estado === 'COMPLETADO' ? 'default' : 'secondary'}
                          className={cn(
                            cuota.estado === 'COMPLETADO'
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                          )}
                        >
                          {cuota.estado === 'COMPLETADO' ? 'Pagado' : 'Pendiente'}
                        </Badge>
                        {cuota.pago &&
                          cuota.pago.metodoPago &&
                          cuota.pago.metodoPago !== 'pendiente' && (
                            <span className="text-xs text-muted-foreground">
                              {cuota.pago.metodoPago}
                            </span>
                          )}
                      </div>
                    </div>
                  ))}
                </div>

                {inscripcionCreada.codigoReferencia && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="size-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                        Código de Referencia
                      </span>
                    </div>
                    <p className="text-lg font-mono font-bold text-amber-700 dark:text-amber-300">
                      {inscripcionCreada.codigoReferencia}
                    </p>
                  </div>
                )}

                {/* Botón para ir a gestionar pagos */}
                <div className="pt-4 border-t">
                  <Link
                    href={`/admin/pagos?inscripcionId=${inscripcionCreada.id}`}
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => onOpenChange(false)}
                    >
                      <CreditCard className="size-4 mr-2" />
                      Ver y Gestionar Todos los Pagos
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                onClick={currentStep === 1 ? () => onOpenChange(false) : handleBack}
                disabled={isSubmitting}
              >
                <ChevronLeft className="size-4 mr-2" />
                {currentStep === 1 ? 'Cancelar' : 'Atrás'}
              </Button>
              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting || !isStep1Valid()}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      {isEditMode ? 'Actualizando...' : 'Creando...'}
                    </>
                  ) : (
                    <>
                      Continuar
                      <ChevronRight className="size-4 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cerrar
                  </Button>
                  <Link href={`/admin/pagos?inscripcionId=${inscripcionCreada?.id || ''}`}>
                    <Button
                      onClick={() => onOpenChange(false)}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                    >
                      <CreditCard className="size-4 mr-2" />
                      Ver Todos los Pagos
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Wizard de Pago */}
      {inscripcionCreada && (
        <PagoWizard
          open={pagoWizardOpen}
          onOpenChange={setPagoWizardOpen}
          inscripcion={{
            id: inscripcionCreada.id,
            nombre: inscripcionCreada.nombre,
            apellido: inscripcionCreada.apellido,
            numeroCuota: selectedCuota?.numero,
            codigoReferencia: inscripcionCreada.codigoReferencia,
            origenRegistro: inscripcionCreada.origenRegistro,
          }}
          monto={montoPorCuota}
          pagoExistente={selectedPago}
          onUpdate={handlePagoUpdate}
          isUpdating={false}
        />
      )}
    </>
  )
}
