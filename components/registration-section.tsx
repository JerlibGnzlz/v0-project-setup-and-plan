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
  CheckCircle2,
  AlertCircle,
  Ticket,
  Sparkles,
  Loader2,
  CheckCircle,
  Edit,
} from 'lucide-react'
import { useConvencionActiva } from '@/lib/hooks/use-convencion'
import { useCreateInscripcion } from '@/lib/hooks/use-inscripciones'

export function RegistrationSection() {
  const { data: convencion, isLoading: loadingConvencion } = useConvencionActiva()
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    codigoPais: '+54', // Código por defecto (Argentina)
    telefono: '',
    pais: 'Argentina', // País por defecto
    provincia: '', // Provincia (solo para Argentina)
    sede: '',
    tipoInscripcion: 'pastor',
    numeroCuotas: 3, // Por defecto 3 cuotas
    notas: '',
  })

  // Lista de países
  const paises = [
    'Argentina',
    'Bolivia',
    'Brasil',
    'Chile',
    'Colombia',
    'Costa Rica',
    'Cuba',
    'Ecuador',
    'El Salvador',
    'España',
    'Estados Unidos',
    'Guatemala',
    'Honduras',
    'México',
    'Nicaragua',
    'Panamá',
    'Paraguay',
    'Perú',
    'República Dominicana',
    'Uruguay',
    'Venezuela',
    'Otro',
  ]

  // Provincias de Argentina
  const provinciasArgentina = [
    'Buenos Aires',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán',
    'Ciudad Autónoma de Buenos Aires',
  ]

  const [paisSearch, setPaisSearch] = useState('')
  const [provinciaSearch, setProvinciaSearch] = useState('')
  const [showPaisDropdown, setShowPaisDropdown] = useState(false)
  const [showProvinciaDropdown, setShowProvinciaDropdown] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Mutation para crear inscripción
  const createInscripcionMutation = useCreateInscripcion()

  // Manejar éxito y error
  useEffect(() => {
    if (createInscripcionMutation.isSuccess) {
      setIsSubmitted(true)
      setShowConfirmation(false)
      // Reset form
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        codigoPais: '+54',
        telefono: '',
        pais: 'Argentina',
        provincia: '',
        sede: '',
        tipoInscripcion: 'pastor',
        numeroCuotas: 3,
        notas: '',
      })
      setPaisSearch('')
      setProvinciaSearch('')
      setTouched({})
      setErrors({})
    }
  }, [createInscripcionMutation.isSuccess])

  useEffect(() => {
    if (createInscripcionMutation.isError) {
      const error = createInscripcionMutation.error as any
      setErrors({
        submit:
          error.response?.data?.message ||
          'Error al enviar la inscripción. Por favor, intenta nuevamente.',
      })
    }
  }, [createInscripcionMutation.isError, createInscripcionMutation.error])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Validación profesional de email con múltiples capas de seguridad
  const validateEmail = (email: string): boolean => {
    if (!email || email.length > 254) return false // RFC 5321

    // Sanitizar: remover caracteres peligrosos
    const sanitized = email.trim().toLowerCase()

    // Validación básica de formato
    const emailRegex =
      /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i

    if (!emailRegex.test(sanitized)) return false

    // Validaciones adicionales de seguridad
    const [localPart, domain] = sanitized.split('@')

    // Validar parte local (antes del @)
    if (localPart.length > 64 || localPart.length === 0) return false // RFC 5321
    if (localPart.startsWith('.') || localPart.endsWith('.')) return false
    if (localPart.includes('..')) return false // No dobles puntos consecutivos

    // Validar dominio
    if (domain.length > 253 || domain.length === 0) return false
    if (domain.startsWith('-') || domain.endsWith('-')) return false
    if (domain.includes('..')) return false

    // Validar que el dominio tenga al menos un punto
    if (!domain.includes('.')) return false

    // Validar TLD (Top Level Domain)
    const tld = domain.split('.').pop()
    if (!tld || tld.length < 2) return false

    // Prevenir dominios sospechosos comunes
    const suspiciousDomains = ['test.com', 'example.com', 'mailinator.com']
    if (suspiciousDomains.includes(domain)) return false

    return true
  }

  // Validación profesional de teléfono con código de país
  const validatePhone = (phone: string, codigoPais: string): boolean => {
    if (!phone) return true // Teléfono es opcional

    // Remover espacios, guiones y paréntesis para validación
    const cleanPhone = phone.replace(/[\s\-()]/g, '')

    // Solo debe contener números
    if (!/^\d+$/.test(cleanPhone)) return false

    // Validar longitud mínima y máxima según el código de país
    const phoneLength = cleanPhone.length

    // Longitudes comunes por región
    const minLengths: Record<string, number> = {
      '+1': 10, // US/CA
      '+54': 8, // Argentina
      '+52': 10, // México
      '+55': 10, // Brasil
      '+57': 10, // Colombia
      '+51': 9, // Perú
      '+56': 9, // Chile
    }

    const maxLengths: Record<string, number> = {
      '+1': 10,
      '+54': 10,
      '+52': 10,
      '+55': 11,
      '+57': 10,
      '+51': 9,
      '+56': 9,
    }

    const minLength = minLengths[codigoPais] || 7
    const maxLength = maxLengths[codigoPais] || 15

    if (phoneLength < minLength || phoneLength > maxLength) {
      return false
    }

    return true
  }

  // Sanitizar input para prevenir XSS
  const sanitizeInput = (input: string): string => {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remover tags HTML
      .replace(/javascript:/gi, '') // Remover javascript:
      .replace(/on\w+=/gi, '') // Remover event handlers
      .slice(0, 255) // Limitar longitud
  }

  const handleChange = (field: string, value: string | number) => {
    // Sanitizar valores de texto
    let sanitizedValue: string | number = value
    if (typeof value === 'string' && field !== 'telefono' && field !== 'notas') {
      sanitizedValue = sanitizeInput(value)
    }

    setFormData(prev => ({ ...prev, [field]: sanitizedValue }))
    setIsSubmitted(false)

    const newErrors = { ...errors }
    delete newErrors.submit

    // Validación de email mejorada
    if (field === 'email') {
      if (value && typeof value === 'string') {
        if (value.length > 254) {
          newErrors.email = 'El correo electrónico es demasiado largo'
        } else if (!validateEmail(value)) {
          newErrors.email = 'Correo electrónico inválido. Verifica el formato.'
        } else {
          delete newErrors.email
        }
      } else if (!value) {
        delete newErrors.email
      }
    }

    // Validación de teléfono mejorada con código de país
    if (field === 'telefono' && value && typeof value === 'string') {
      const codigoPais = field === 'codigoPais' ? value : formData.codigoPais
      if (!validatePhone(value, codigoPais)) {
        newErrors.telefono = 'Número de teléfono inválido. Verifica el formato y la longitud.'
      } else {
        delete newErrors.telefono
      }
    } else if (field === 'telefono' && !value) {
      delete newErrors.telefono
    }

    // Si cambia el código de país, revalidar el teléfono
    if (field === 'codigoPais' && formData.telefono) {
      if (!validatePhone(formData.telefono, value as string)) {
        newErrors.telefono = 'El número no es válido para este código de país'
      } else {
        delete newErrors.telefono
      }
    }

    // Si cambia el país y no es Argentina, limpiar la provincia
    if (field === 'pais' && value !== 'Argentina') {
      setFormData(prev => ({ ...prev, provincia: '' }))
      setProvinciaSearch('')
      delete newErrors.provincia
    }

    // Validación de campos requeridos
    if (
      field !== 'notas' &&
      field !== 'telefono' &&
      field !== 'sede' &&
      field !== 'codigoPais' &&
      !value
    ) {
      if (field === 'nombre' || field === 'apellido' || field === 'email') {
        newErrors[field] = 'Este campo es requerido'
      }
    } else if (
      field !== 'email' &&
      field !== 'telefono' &&
      field !== 'notas' &&
      field !== 'codigoPais'
    ) {
      delete newErrors[field]
    }

    // Validación de longitud para nombre y apellido
    if ((field === 'nombre' || field === 'apellido') && typeof value === 'string') {
      if (value.length > 50) {
        newErrors[field] = 'Este campo no puede exceder 50 caracteres'
      } else if (value.length < 2 && value.length > 0) {
        newErrors[field] = 'Este campo debe tener al menos 2 caracteres'
      } else if (!value) {
        newErrors[field] = 'Este campo es requerido'
      } else {
        delete newErrors[field]
      }
    }

    setErrors(newErrors)
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const isFieldValid = (field: string) => {
    return touched[field] && formData[field as keyof typeof formData] && !errors[field]
  }

  const isFieldInvalid = (field: string) => {
    return touched[field] && errors[field]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!convencion) {
      setErrors({ submit: 'No hay una convención activa disponible' })
      return
    }

    if (!convencion.activa) {
      setErrors({ submit: 'Las inscripciones para esta convención no están abiertas actualmente' })
      return
    }

    // Validar campos requeridos
    const newErrors: Record<string, string> = {}
    if (!formData.nombre) newErrors.nombre = 'Este campo es requerido'
    if (!formData.apellido) newErrors.apellido = 'Este campo es requerido'
    if (!formData.email) newErrors.email = 'Este campo es requerido'
    if (formData.email && !validateEmail(formData.email))
      newErrors.email = 'Correo electrónico inválido'
    if (formData.telefono && !validatePhone(formData.telefono))
      newErrors.telefono = 'Número de teléfono inválido'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      // Marcar todos los campos como touched para mostrar errores
      setTouched({
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        pais: true,
        provincia: formData.pais === 'Argentina',
        sede: true,
        numeroCuotas: true,
      })

      // Scroll al primer campo con error
      const firstErrorField = Object.keys(newErrors)[0]
      const errorElement = document.getElementById(firstErrorField)
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        errorElement.focus()
      }

      return
    }

    // Mostrar resumen de confirmación
    setShowConfirmation(true)
  }

  const handleConfirmSubmit = async () => {
    if (!convencion) return

    // Combinar código de país con teléfono
    const telefonoCompleto = formData.telefono
      ? `${formData.codigoPais} ${formData.telefono}`.trim()
      : undefined

    // Combinar país y provincia en las notas si es necesario, o agregar a sede
    let sedeCompleta = formData.sede || ''
    if (formData.pais) {
      const ubicacion =
        formData.pais === 'Argentina' && formData.provincia
          ? `${formData.pais}, ${formData.provincia}`
          : formData.pais
      sedeCompleta = sedeCompleta ? `${sedeCompleta} - ${ubicacion}` : ubicacion
    }

    // Crear inscripción
    // Detectar origen del registro: siempre es 'web' desde el formulario de la landing page
    // Si se registra desde el dashboard, se manejará desde allí
    // Cuando esté la app móvil, enviará 'mobile'
    const origenRegistro = 'web'

    createInscripcionMutation.mutate({
      convencionId: convencion.id,
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      telefono: telefonoCompleto,
      sede: sedeCompleta || undefined,
      tipoInscripcion: formData.tipoInscripcion,
      numeroCuotas: Number(formData.numeroCuotas),
      origenRegistro: origenRegistro,
      notas: formData.notas || undefined,
    })
  }

  const handleEditForm = () => {
    setShowConfirmation(false)
  }

  // Si no hay convención activa, mostrar mensaje
  if (loadingConvencion) {
    return (
      <section id="inscripcion" className="relative py-24 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-4" />
            <p className="text-white/60">Cargando información...</p>
          </div>
        </div>
      </section>
    )
  }

  if (!convencion) {
    return (
      <section id="inscripcion" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d1f35] to-[#0a1628]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <Ticket className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-white/80 font-medium">Inscripciones</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
                Próximamente
              </span>
            </h2>
            <p className="text-lg text-white/60 max-w-xl mx-auto">
              No hay convenciones activas en este momento. Te notificaremos cuando se abran las
              inscripciones.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="inscripcion" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d1f35] to-[#0a1628]">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background: `
              radial-gradient(ellipse 60% 40% at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
              radial-gradient(ellipse 50% 50% at 80% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)
            `,
          }}
        />
        {/* Animated blob */}
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-sky-500/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm relative overflow-hidden">
              <Ticket className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-white/80 font-medium">Inscripción</span>
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
              Inscríbete a la{' '}
              <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 bg-clip-text text-transparent">
                Convención
              </span>
            </h2>
            <p className="text-lg text-white/60 max-w-xl mx-auto mb-4">
              Completa el formulario para confirmar tu asistencia
            </p>
            {convencion.titulo && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-amber-300 font-medium">{convencion.titulo}</span>
              </div>
            )}
          </div>

          {/* Form Card */}
          <div className="relative group">
            {/* Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500" />

            <div
              className={`relative rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden ${!convencion.activa ? 'opacity-60' : ''}`}
            >
              {/* Header gradient */}
              <div className="h-1 bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500" />

              {!convencion.activa && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                  <div className="text-center p-6 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                    <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-white font-semibold mb-1">Inscripciones Cerradas</p>
                    <p className="text-white/70 text-sm">
                      Las inscripciones para esta convención no están disponibles en este momento.
                    </p>
                  </div>
                </div>
              )}

              <div className="p-6 sm:p-8">
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 mb-6">
                      <CheckCircle className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">¡Inscripción Enviada!</h3>
                    <p className="text-white/70 mb-6">
                      Tu inscripción ha sido registrada exitosamente. Te contactaremos pronto con
                      más información.
                    </p>
                    <Button
                      onClick={() => {
                        setIsSubmitted(false)
                        setShowConfirmation(false)
                        setFormData({
                          nombre: '',
                          apellido: '',
                          email: '',
                          codigoPais: '+54',
                          telefono: '',
                          sede: '',
                          tipoInscripcion: 'pastor',
                          numeroCuotas: 3,
                          notas: '',
                        })
                        setTouched({})
                        setErrors({})
                      }}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Enviar Otra Inscripción
                    </Button>
                  </div>
                ) : showConfirmation ? (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/50 mb-4">
                        <CheckCircle2 className="w-8 h-8 text-amber-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Confirma tu Inscripción
                      </h3>
                      <p className="text-white/60 text-sm">
                        Por favor, revisa la información antes de confirmar
                      </p>
                    </div>

                    {/* Resumen de datos */}
                    <div className="space-y-4 p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="grid gap-3">
                        <div className="flex justify-between items-start pb-2 border-b border-white/10">
                          <span className="text-white/60 text-sm">Nombre completo:</span>
                          <span className="text-white font-medium text-right">
                            {formData.nombre} {formData.apellido}
                          </span>
                        </div>
                        <div className="flex justify-between items-start pb-2 border-b border-white/10">
                          <span className="text-white/60 text-sm">Correo electrónico:</span>
                          <span className="text-white font-medium text-right">
                            {formData.email}
                          </span>
                        </div>
                        {formData.telefono && (
                          <div className="flex justify-between items-start pb-2 border-b border-white/10">
                            <span className="text-white/60 text-sm">Teléfono:</span>
                            <span className="text-white font-medium text-right">
                              {formData.codigoPais} {formData.telefono}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-start pb-2 border-b border-white/10">
                          <span className="text-white/60 text-sm">País:</span>
                          <span className="text-white font-medium text-right">{formData.pais}</span>
                        </div>
                        {formData.pais === 'Argentina' && formData.provincia && (
                          <div className="flex justify-between items-start pb-2 border-b border-white/10">
                            <span className="text-white/60 text-sm">Provincia:</span>
                            <span className="text-white font-medium text-right">
                              {formData.provincia}
                            </span>
                          </div>
                        )}
                        {formData.sede && (
                          <div className="flex justify-between items-start pb-2 border-b border-white/10">
                            <span className="text-white/60 text-sm">Iglesia / Sede:</span>
                            <span className="text-white font-medium text-right">
                              {formData.sede}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-start pb-2 border-b border-white/10">
                          <span className="text-white/60 text-sm">Número de cuotas:</span>
                          <span className="text-white font-medium text-right">
                            {formData.numeroCuotas}{' '}
                            {formData.numeroCuotas === 1 ? 'cuota (Pago único)' : 'cuotas'}
                          </span>
                        </div>
                        {convencion.costo && (
                          <div className="flex justify-between items-start pt-2">
                            <span className="text-white/60 text-sm">Costo por cuota:</span>
                            <span className="text-amber-400 font-bold text-lg">
                              $
                              {(Number(convencion.costo) / Number(formData.numeroCuotas)).toFixed(
                                2
                              )}
                            </span>
                          </div>
                        )}
                        {convencion.costo && (
                          <div className="flex justify-between items-start pt-1">
                            <span className="text-white/60 text-sm">Costo total:</span>
                            <span className="text-emerald-400 font-semibold">
                              ${Number(convencion.costo).toFixed(2)}
                            </span>
                          </div>
                        )}
                        {formData.notas && (
                          <div className="pt-2 border-t border-white/10">
                            <span className="text-white/60 text-sm block mb-1">Notas:</span>
                            <span className="text-white/80 text-sm">{formData.notas}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleEditForm}
                        variant="outline"
                        className="flex-1 border-white/20 text-white hover:bg-white/10"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar Información
                      </Button>
                      <Button
                        onClick={handleConfirmSubmit}
                        disabled={createInscripcionMutation.isPending}
                        className="flex-1 h-12 text-lg bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 hover:from-emerald-400 hover:via-teal-400 hover:to-emerald-400 text-white font-semibold border-0 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {createInscripcionMutation.isPending ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            Confirmar Inscripción
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre" className="text-white/80">
                          Nombre <span className="text-red-400">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="nombre"
                            placeholder="Juan"
                            value={formData.nombre}
                            onChange={e => {
                              // Solo permitir letras, espacios, guiones y apóstrofes
                              let value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]/g, '')
                              if (value.length > 50) value = value.slice(0, 50)
                              handleChange('nombre', value)
                            }}
                            onBlur={() => handleBlur('nombre')}
                            maxLength={50}
                            className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-amber-500/50 ${
                              isFieldInvalid('nombre') ? 'border-red-500/50' : ''
                            }`}
                            required
                          />
                          {isFieldValid('nombre') && (
                            <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-emerald-400" />
                          )}
                        </div>
                        {isFieldInvalid('nombre') && (
                          <p className="text-xs text-red-400 flex items-start gap-1.5 animate-in fade-in slide-in-from-top-1">
                            <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                            <span>{errors.nombre}</span>
                          </p>
                        )}
                        {!isFieldInvalid('nombre') && formData.nombre && (
                          <p className="text-xs text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Nombre válido
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="apellido" className="text-white/80">
                          Apellido <span className="text-red-400">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="apellido"
                            placeholder="Pérez"
                            value={formData.apellido}
                            onChange={e => {
                              // Solo permitir letras, espacios, guiones y apóstrofes
                              let value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]/g, '')
                              if (value.length > 50) value = value.slice(0, 50)
                              handleChange('apellido', value)
                            }}
                            onBlur={() => handleBlur('apellido')}
                            maxLength={50}
                            className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-amber-500/50 ${
                              isFieldInvalid('apellido') ? 'border-red-500/50' : ''
                            }`}
                            required
                          />
                          {isFieldValid('apellido') && (
                            <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-emerald-400" />
                          )}
                        </div>
                        {isFieldInvalid('apellido') && (
                          <p className="text-xs text-red-400 flex items-start gap-1.5 animate-in fade-in slide-in-from-top-1">
                            <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                            <span>{errors.apellido}</span>
                          </p>
                        )}
                        {!isFieldInvalid('apellido') && formData.apellido && (
                          <p className="text-xs text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Apellido válido
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white/80">
                        Correo Electrónico <span className="text-red-400">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          placeholder="juan@ejemplo.com"
                          value={formData.email}
                          onChange={e => handleChange('email', e.target.value)}
                          onBlur={() => handleBlur('email')}
                          className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-amber-500/50 ${
                            isFieldInvalid('email') ? 'border-red-500/50' : ''
                          }`}
                          required
                        />
                        {isFieldValid('email') && (
                          <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-emerald-400" />
                        )}
                      </div>
                      {isFieldInvalid('email') && (
                        <p className="text-xs text-red-400 flex items-start gap-1.5 animate-in fade-in slide-in-from-top-1">
                          <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                      {!isFieldInvalid('email') && formData.email && (
                        <p className="text-xs text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Correo válido
                        </p>
                      )}
                      {!formData.email && !touched.email && (
                        <p className="text-xs text-white/50">Ejemplo: juan.perez@correo.com</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefono" className="text-white/80">
                        Teléfono
                      </Label>
                      <div className="flex gap-2">
                        <Select
                          value={formData.codigoPais}
                          onValueChange={value => handleChange('codigoPais', value)}
                        >
                          <SelectTrigger className="w-36 bg-white/5 border-white/10 text-white focus:border-amber-500/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            <SelectItem value="+54">🇦🇷 +54 (AR)</SelectItem>
                            <SelectItem value="+1">🇺🇸 +1 (US/CA)</SelectItem>
                            <SelectItem value="+52">🇲🇽 +52 (MX)</SelectItem>
                            <SelectItem value="+55">🇧🇷 +55 (BR)</SelectItem>
                            <SelectItem value="+57">🇨🇴 +57 (CO)</SelectItem>
                            <SelectItem value="+51">🇵🇪 +51 (PE)</SelectItem>
                            <SelectItem value="+56">🇨🇱 +56 (CL)</SelectItem>
                            <SelectItem value="+58">🇻🇪 +58 (VE)</SelectItem>
                            <SelectItem value="+593">🇪🇨 +593 (EC)</SelectItem>
                            <SelectItem value="+595">🇵🇾 +595 (PY)</SelectItem>
                            <SelectItem value="+598">🇺🇾 +598 (UY)</SelectItem>
                            <SelectItem value="+591">🇧🇴 +591 (BO)</SelectItem>
                            <SelectItem value="+507">🇵🇦 +507 (PA)</SelectItem>
                            <SelectItem value="+506">🇨🇷 +506 (CR)</SelectItem>
                            <SelectItem value="+505">🇳🇮 +505 (NI)</SelectItem>
                            <SelectItem value="+504">🇭🇳 +504 (HN)</SelectItem>
                            <SelectItem value="+503">🇸🇻 +503 (SV)</SelectItem>
                            <SelectItem value="+502">🇬🇹 +502 (GT)</SelectItem>
                            <SelectItem value="+501">🇧🇿 +501 (BZ)</SelectItem>
                            <SelectItem value="+34">🇪🇸 +34 (ES)</SelectItem>
                            <SelectItem value="+39">🇮🇹 +39 (IT)</SelectItem>
                            <SelectItem value="+33">🇫🇷 +33 (FR)</SelectItem>
                            <SelectItem value="+49">🇩🇪 +49 (DE)</SelectItem>
                            <SelectItem value="+44">🇬🇧 +44 (GB)</SelectItem>
                            <SelectItem value="+86">🇨🇳 +86 (CN)</SelectItem>
                            <SelectItem value="+81">🇯🇵 +81 (JP)</SelectItem>
                            <SelectItem value="+82">🇰🇷 +82 (KR)</SelectItem>
                            <SelectItem value="+91">🇮🇳 +91 (IN)</SelectItem>
                            <SelectItem value="+61">🇦🇺 +61 (AU)</SelectItem>
                            <SelectItem value="+27">🇿🇦 +27 (ZA)</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="relative flex-1">
                          <Input
                            id="telefono"
                            type="tel"
                            placeholder="11 xxxx-xxxx"
                            value={formData.telefono}
                            onChange={e => {
                              // Solo permitir números, espacios, guiones y paréntesis
                              const value = e.target.value.replace(/[^\d\s\-()]/g, '')
                              handleChange('telefono', value)
                            }}
                            onBlur={() => handleBlur('telefono')}
                            className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-amber-500/50 ${
                              isFieldInvalid('telefono') ? 'border-red-500/50' : ''
                            }`}
                          />
                          {isFieldValid('telefono') && (
                            <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-emerald-400" />
                          )}
                        </div>
                      </div>
                      {isFieldInvalid('telefono') && (
                        <p className="text-xs text-red-400 flex items-start gap-1.5 animate-in fade-in slide-in-from-top-1">
                          <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                          <span>{errors.telefono}</span>
                        </p>
                      )}
                      {!isFieldInvalid('telefono') && formData.telefono && (
                        <p className="text-xs text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Teléfono válido
                        </p>
                      )}
                      {formData.telefono && !isFieldInvalid('telefono') && (
                        <p className="text-xs text-white/50">
                          Número completo:{' '}
                          <span className="text-amber-400 font-medium">
                            {formData.codigoPais} {formData.telefono}
                          </span>
                        </p>
                      )}
                      {!formData.telefono && !touched.telefono && (
                        <p className="text-xs text-white/50">Opcional - Ejemplo: 11 1234-5678</p>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pais" className="text-white/80">
                          País <span className="text-red-400">*</span>
                        </Label>
                        <div className="relative">
                          <div className="relative">
                            <Input
                              id="pais"
                              placeholder="Buscar país..."
                              value={paisSearch !== '' ? paisSearch : formData.pais || ''}
                              onChange={e => {
                                const value = e.target.value
                                setPaisSearch(value)
                                setShowPaisDropdown(true)

                                // Si el valor coincide exactamente con un país, seleccionarlo
                                const exactMatch = paises.find(
                                  p => p.toLowerCase() === value.toLowerCase()
                                )
                                if (exactMatch) {
                                  handleChange('pais', exactMatch)
                                  if (exactMatch !== 'Argentina') {
                                    handleChange('provincia', '')
                                  }
                                  setPaisSearch('')
                                  setShowPaisDropdown(false)
                                }
                              }}
                              onFocus={() => {
                                setPaisSearch(formData.pais || '')
                                setShowPaisDropdown(true)
                              }}
                              onBlur={() => {
                                setTimeout(() => {
                                  setShowPaisDropdown(false)
                                  setPaisSearch('')
                                }, 200)
                                handleBlur('pais')
                              }}
                              className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-amber-500/50 ${
                                isFieldInvalid('pais') ? 'border-red-500/50' : ''
                              }`}
                              required
                            />
                            {isFieldValid('pais') && (
                              <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-emerald-400" />
                            )}
                          </div>
                          {showPaisDropdown && (
                            <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-slate-900 border border-white/20 rounded-lg shadow-xl">
                              {paises
                                .filter(pais =>
                                  pais.toLowerCase().includes(paisSearch.toLowerCase())
                                )
                                .map(pais => (
                                  <button
                                    key={pais}
                                    type="button"
                                    onClick={() => {
                                      handleChange('pais', pais)
                                      if (pais !== 'Argentina') {
                                        handleChange('provincia', '')
                                      }
                                      setPaisSearch('')
                                      setShowPaisDropdown(false)
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-white/10 text-white text-sm transition-colors first:rounded-t-lg last:rounded-b-lg"
                                  >
                                    {pais}
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>
                        {isFieldInvalid('pais') && (
                          <p className="text-xs text-red-400 flex items-start gap-1.5 animate-in fade-in slide-in-from-top-1">
                            <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                            <span>{errors.pais}</span>
                          </p>
                        )}
                        {!isFieldInvalid('pais') && formData.pais && (
                          <p className="text-xs text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            País seleccionado
                          </p>
                        )}
                        {!formData.pais && !touched.pais && (
                          <p className="text-xs text-white/50">Escribe para buscar tu país</p>
                        )}
                      </div>

                      {formData.pais === 'Argentina' && (
                        <div className="space-y-2">
                          <Label htmlFor="provincia" className="text-white/80">
                            Provincia <span className="text-red-400">*</span>
                          </Label>
                          <div className="relative">
                            <div className="relative">
                              <Input
                                id="provincia"
                                placeholder="Buscar provincia..."
                                value={
                                  provinciaSearch !== ''
                                    ? provinciaSearch
                                    : formData.provincia || ''
                                }
                                onChange={e => {
                                  const value = e.target.value
                                  setProvinciaSearch(value)
                                  setShowProvinciaDropdown(true)

                                  // Si el valor coincide exactamente con una provincia, seleccionarla
                                  const exactMatch = provinciasArgentina.find(
                                    p => p.toLowerCase() === value.toLowerCase()
                                  )
                                  if (exactMatch) {
                                    handleChange('provincia', exactMatch)
                                    setProvinciaSearch('')
                                    setShowProvinciaDropdown(false)
                                  }
                                }}
                                onFocus={() => {
                                  setProvinciaSearch(formData.provincia || '')
                                  setShowProvinciaDropdown(true)
                                }}
                                onBlur={() => {
                                  setTimeout(() => {
                                    setShowProvinciaDropdown(false)
                                    setProvinciaSearch('')
                                  }, 200)
                                  handleBlur('provincia')
                                }}
                                className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-amber-500/50 ${
                                  isFieldInvalid('provincia') ? 'border-red-500/50' : ''
                                }`}
                                required={formData.pais === 'Argentina'}
                              />
                              {isFieldValid('provincia') && (
                                <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-emerald-400" />
                              )}
                            </div>
                            {showProvinciaDropdown && (
                              <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-slate-900 border border-white/20 rounded-lg shadow-xl">
                                {provinciasArgentina
                                  .filter(provincia =>
                                    provincia.toLowerCase().includes(provinciaSearch.toLowerCase())
                                  )
                                  .map(provincia => (
                                    <button
                                      key={provincia}
                                      type="button"
                                      onClick={() => {
                                        handleChange('provincia', provincia)
                                        setProvinciaSearch('')
                                        setShowProvinciaDropdown(false)
                                      }}
                                      className="w-full text-left px-4 py-2 hover:bg-white/10 text-white text-sm transition-colors first:rounded-t-lg last:rounded-b-lg"
                                    >
                                      {provincia}
                                    </button>
                                  ))}
                              </div>
                            )}
                          </div>
                          {isFieldInvalid('provincia') && (
                            <p className="text-xs text-red-400 flex items-start gap-1.5 animate-in fade-in slide-in-from-top-1">
                              <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                              <span>{errors.provincia}</span>
                            </p>
                          )}
                          {!isFieldInvalid('provincia') && formData.provincia && (
                            <p className="text-xs text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Provincia seleccionada
                            </p>
                          )}
                          {!formData.provincia && !touched.provincia && (
                            <p className="text-xs text-white/50">
                              Escribe para buscar tu provincia
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sede" className="text-white/80">
                        Iglesia / Sede
                      </Label>
                      <div className="relative">
                        <Input
                          id="sede"
                          placeholder="Nombre de su iglesia o sede"
                          value={formData.sede}
                          onChange={e => {
                            let value = e.target.value
                            if (value.length > 200) value = value.slice(0, 200)
                            handleChange('sede', value)
                          }}
                          onBlur={() => handleBlur('sede')}
                          maxLength={200}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-amber-500/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numeroCuotas" className="text-white/80">
                        Número de Cuotas <span className="text-red-400">*</span>
                      </Label>
                      <Select
                        value={formData.numeroCuotas.toString()}
                        onValueChange={value => handleChange('numeroCuotas', value)}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-amber-500/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 cuota (Pago único)</SelectItem>
                          <SelectItem value="2">2 cuotas</SelectItem>
                          <SelectItem value="3">3 cuotas</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-white/50">
                        Selecciona en cuántas cuotas deseas realizar el pago
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notas" className="text-white/80">
                        Notas o Comentarios (Opcional)
                      </Label>
                      <Textarea
                        id="notas"
                        placeholder="Información adicional, preguntas o comentarios..."
                        rows={4}
                        value={formData.notas}
                        onChange={e => handleChange('notas', e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-amber-500/50 resize-none"
                      />
                    </div>

                    {/* Resumen de errores si hay campos inválidos */}
                    {Object.keys(errors).length > 0 &&
                      Object.keys(errors).some(key => key !== 'submit') && (
                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 space-y-2">
                          <p className="text-sm font-semibold text-red-400 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Por favor, corrige los siguientes errores:
                          </p>
                          <ul className="text-xs text-red-300 space-y-1 ml-6 list-disc">
                            {Object.entries(errors)
                              .filter(([key]) => key !== 'submit')
                              .map(([key, message]) => (
                                <li key={key}>{message}</li>
                              ))}
                          </ul>
                        </div>
                      )}

                    {errors.submit && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                        <p className="text-sm text-red-400 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {errors.submit}
                        </p>
                      </div>
                    )}

                    {/* Indicador de progreso del formulario */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-white/60">
                        <span>Progreso del formulario</span>
                        <span>
                          {(() => {
                            const requiredFields = [
                              'nombre',
                              'apellido',
                              'email',
                              'pais',
                              'numeroCuotas',
                            ]
                            const requiredCompleted = requiredFields.filter(field => {
                              return (
                                formData[field as keyof typeof formData] &&
                                String(formData[field as keyof typeof formData]).trim() !== ''
                              )
                            }).length

                            // Si el país es Argentina, también verificar provincia
                            let provinciaCompleted = 0
                            if (formData.pais === 'Argentina') {
                              provinciaCompleted =
                                formData.provincia && formData.provincia.trim() !== '' ? 1 : 0
                            } else {
                              provinciaCompleted = 1 // Si no es Argentina, no se requiere provincia
                            }

                            const totalRequired =
                              formData.pais === 'Argentina'
                                ? requiredFields.length + 1
                                : requiredFields.length
                            const totalCompleted = requiredCompleted + provinciaCompleted

                            return `${totalCompleted}/${totalRequired} campos requeridos completados`
                          })()}
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                          style={{
                            width: `${(() => {
                              const requiredFields = [
                                'nombre',
                                'apellido',
                                'email',
                                'pais',
                                'numeroCuotas',
                              ]
                              const requiredCompleted = requiredFields.filter(field => {
                                return (
                                  formData[field as keyof typeof formData] &&
                                  String(formData[field as keyof typeof formData]).trim() !== ''
                                )
                              }).length

                              // Si el país es Argentina, también verificar provincia
                              let provinciaCompleted = 0
                              if (formData.pais === 'Argentina') {
                                provinciaCompleted =
                                  formData.provincia && formData.provincia.trim() !== '' ? 1 : 0
                              } else {
                                provinciaCompleted = 1 // Si no es Argentina, no se requiere provincia
                              }

                              const totalRequired =
                                formData.pais === 'Argentina'
                                  ? requiredFields.length + 1
                                  : requiredFields.length
                              const totalCompleted = requiredCompleted + provinciaCompleted

                              return totalRequired > 0 ? (totalCompleted / totalRequired) * 100 : 0
                            })()}%`,
                          }}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-14 text-lg bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:via-yellow-400 hover:to-amber-400 text-slate-900 font-semibold border-0 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      disabled={createInscripcionMutation.isPending || !convencion.activa}
                    >
                      {createInscripcionMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Confirmar Inscripción
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative */}
      <div className="absolute top-20 right-8 w-32 h-px bg-gradient-to-l from-amber-500/50 to-transparent" />
      <div className="absolute bottom-20 left-8 w-32 h-px bg-gradient-to-r from-amber-500/50 to-transparent" />
    </section>
  )
}
