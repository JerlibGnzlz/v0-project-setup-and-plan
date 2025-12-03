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
import { Card, CardContent } from '@/components/ui/card'
import { 
  Calendar, 
  MapPin, 
  CreditCard, 
  User, 
  Mail, 
  Phone, 
  CheckCircle2,
  Loader2,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Image from 'next/image'
import { useCreateInscripcion, useCheckInscripcion } from '@/lib/hooks/use-inscripciones'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface UnifiedInscriptionFormProps {
  convencion: {
    id: string
    titulo: string
    descripcion?: string
    fechaInicio: string
    fechaFin: string
    ubicacion: string
    costo?: number
    cupoMaximo?: number
    imagenUrl?: string
  }
  user: {
    id: string
    email: string
    nombre: string
    apellido?: string
    telefono?: string
    sede?: string
    tipo: 'PASTOR' | 'INVITADO' | 'ADMIN'
    fotoUrl?: string
  }
  onBack: () => void
}

export function UnifiedInscriptionForm({ convencion, user, onBack }: UnifiedInscriptionFormProps) {
  const router = useRouter()
  const createInscripcionMutation = useCreateInscripcion()
  const { data: inscripcionExistente } = useCheckInscripcion(convencion?.id, user?.email)

  // Convertir costo a número
  const costo = typeof convencion.costo === 'number' 
    ? convencion.costo 
    : parseFloat(String(convencion.costo || 0))

  const fechaInicio = new Date(convencion.fechaInicio)
  const fechaFin = new Date(convencion.fechaFin)
  const fechaFormateada = format(fechaInicio, "d 'de' MMMM, yyyy", { locale: es })
  const fechaFinFormateada = format(fechaFin, "d 'de' MMMM, yyyy", { locale: es })

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: user.nombre || '',
    apellido: user.apellido || '',
    email: user.email || '',
    telefono: user.telefono || '',
    sede: user.sede || '',
    tipoInscripcion: user.tipo === 'INVITADO' ? 'invitado' : 'pastor',
    numeroCuotas: 3,
    notas: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calcular montos
  const montoPorCuota1 = costo
  const montoPorCuota2 = costo / 2
  const montoPorCuota3 = costo / 3

  // Validación
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es requerido'
    if (!formData.email.trim()) newErrors.email = 'El email es requerido'
    if (!formData.sede.trim()) newErrors.sede = 'La sede es requerida'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (inscripcionExistente) {
      toast.error("Ya estás inscrito", {
        description: "Este correo electrónico ya está registrado para esta convención.",
      })
      return
    }

    if (!validateForm()) {
      toast.error("Por favor completa todos los campos requeridos")
      return
    }

    setIsSubmitting(true)

    try {
      const datosInscripcion: any = {
        convencionId: convencion.id,
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim().toLowerCase(),
        telefono: formData.telefono?.trim() || undefined,
        sede: formData.sede.trim(),
        tipoInscripcion: formData.tipoInscripcion,
        numeroCuotas: formData.numeroCuotas,
        notas: formData.notas?.trim() || undefined,
        origenRegistro: 'web',
      }

      await createInscripcionMutation.mutateAsync(datosInscripcion)

      toast.success('¡Inscripción exitosa!', {
        description: 'Tu inscripción ha sido registrada correctamente',
      })

      // Redirigir después de un breve delay
      setTimeout(() => {
        router.push('/?inscripcion=exito#convenciones')
      }, 1500)
    } catch (error: any) {
      console.error('Error al crear inscripción:', error)
      toast.error('Error al crear inscripción', {
        description: error.response?.data?.message || error.message || 'Intenta nuevamente',
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Principal */}
        <div className="lg:col-span-2">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Completa tu Inscripción</h2>
                  <p className="text-white/70 text-sm">Revisa y confirma tus datos</p>
                </div>

                {/* Información de Convención (Resumida) */}
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="size-5 text-emerald-400" />
                    <h3 className="font-semibold text-white">{convencion.titulo}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4" />
                      <span>{fechaFormateada}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4" />
                      <span>{convencion.ubicacion}</span>
                    </div>
                  </div>
                </div>

                {/* Datos Personales */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <User className="size-5 text-emerald-400" />
                      Datos Personales
                    </h3>
                    {/* Mostrar foto del usuario si viene de Google OAuth */}
                    {user.fotoUrl && (
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500/50 ring-2 ring-emerald-500/20">
                          <Image
                            src={user.fotoUrl}
                            alt={`${user.nombre} ${user.apellido}`}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1">
                          <CheckCircle2 className="size-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white/90">Nombre *</Label>
                      <Input
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="bg-white/5 border-white/20 text-white"
                        placeholder="Tu nombre"
                      />
                      {errors.nombre && (
                        <p className="text-xs text-red-400">{errors.nombre}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/90">Apellido *</Label>
                      <Input
                        value={formData.apellido}
                        onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                        className="bg-white/5 border-white/20 text-white"
                        placeholder="Tu apellido"
                      />
                      {errors.apellido && (
                        <p className="text-xs text-red-400">{errors.apellido}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/90">Correo Electrónico *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-white/5 border-white/20 text-white/70"
                    />
                    <p className="text-xs text-white/50">Este campo no se puede modificar</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white/90">Teléfono</Label>
                      <Input
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        className="bg-white/5 border-white/20 text-white"
                        placeholder="+54 11 1234-5678"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/90">Sede *</Label>
                      <Input
                        value={formData.sede}
                        onChange={(e) => setFormData({ ...formData, sede: e.target.value })}
                        className="bg-white/5 border-white/20 text-white"
                        placeholder="Nombre de tu iglesia"
                      />
                      {errors.sede && (
                        <p className="text-xs text-red-400">{errors.sede}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/90">Tipo de Inscripción</Label>
                    <Select
                      value={formData.tipoInscripcion}
                      onValueChange={(value) => setFormData({ ...formData, tipoInscripcion: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="invitado">Invitado</SelectItem>
                        <SelectItem value="pastor">Pastor</SelectItem>
                        <SelectItem value="lider">Líder</SelectItem>
                        <SelectItem value="miembro">Miembro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/90">Notas (Opcional)</Label>
                    <Textarea
                      value={formData.notas}
                      onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                      placeholder="Notas adicionales..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    Volver
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-4 mr-2" />
                        Confirmar Inscripción
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar con Resumen */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CreditCard className="size-5 text-emerald-400" />
                  Resumen
                </h3>

                {/* Información de Convención */}
                {convencion.imagenUrl && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={convencion.imagenUrl}
                      alt={convencion.titulo}
                      width={400}
                      height={200}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Evento:</span>
                    <span className="text-white font-medium">{convencion.titulo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Fecha:</span>
                    <span className="text-white font-medium">{fechaFormateada}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Ubicación:</span>
                    <span className="text-white font-medium text-right">{convencion.ubicacion}</span>
                  </div>
                </div>

                <div className="my-4 border-t border-white/10"></div>

                {/* Plan de Pago */}
                <div className="space-y-3">
                  <Label className="text-white/90">Plan de Pago</Label>
                  <div className="space-y-2">
                    {[1, 2, 3].map((num) => {
                      const monto = num === 1 ? montoPorCuota1 : num === 2 ? montoPorCuota2 : montoPorCuota3
                      const isSelected = formData.numeroCuotas === num
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setFormData({ ...formData, numeroCuotas: num })}
                          className={cn(
                            "w-full p-3 rounded-lg border-2 transition-all text-left",
                            isSelected
                              ? "border-emerald-500 bg-emerald-500/10"
                              : "border-white/10 bg-white/5 hover:border-white/20"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">{num} {num === 1 ? 'cuota' : 'cuotas'}</p>
                              <p className="text-xs text-white/60">
                                ${monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })} {num > 1 ? 'cada una' : ''}
                              </p>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="size-5 text-emerald-400" />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="my-4 border-t border-white/10"></div>

                {/* Resumen de Costos */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Costo total:</span>
                    <span className="text-white font-semibold">
                      ${costo.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Cuotas:</span>
                    <span className="text-white font-semibold">{formData.numeroCuotas}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Monto por cuota:</span>
                    <span className="text-white font-semibold">
                      ${(costo / formData.numeroCuotas).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Información de Pago */}
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-xs text-amber-300">
                    💡 Los pagos se crearán después desde tu panel. Recibirás un código de referencia único.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

