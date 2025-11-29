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
import { CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react'
import { useCreateInscripcion, useCheckInscripcion } from '@/lib/hooks/use-inscripciones'
import { ComprobanteUpload } from '@/components/ui/comprobante-upload'
import { uploadApi } from '@/lib/api/upload'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Step3FormularioProps {
  convencion: {
    id: string
    titulo: string
    costo?: number
  }
  pastor: {
    id: string
    email: string
    nombre: string
    apellido?: string
  }
  initialData?: any
  onComplete: () => void
  onBack: () => void
}

export function Step3Formulario({ convencion, pastor, initialData, onComplete, onBack }: Step3FormularioProps) {
  // Pre-llenar con datos del pastor
  const nombreDefault = pastor.nombre || ''
  const apellidoDefault = pastor.apellido || ''

  // Convertir costo a número de forma segura (puede venir como Decimal de Prisma)
  const costo = typeof convencion.costo === 'number' 
    ? convencion.costo 
    : parseFloat(String(convencion.costo || 0))

  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || nombreDefault,
    apellido: initialData?.apellido || apellidoDefault,
    email: initialData?.email || pastor.email,
    codigoPais: initialData?.codigoPais || '+54',
    telefono: initialData?.telefono || '',
    pais: initialData?.pais || 'Argentina',
    provincia: initialData?.provincia || '',
    sede: initialData?.sede || '',
    tipoInscripcion: initialData?.tipoInscripcion || 'pastor',
    numeroCuotas: initialData?.numeroCuotas || 3,
    documentoUrl: initialData?.documentoUrl || '',
    notas: initialData?.notas || '',
  })

  // Lista de países
  const paises = [
    'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba',
    'Ecuador', 'El Salvador', 'España', 'Estados Unidos', 'Guatemala', 'Honduras',
    'México', 'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'República Dominicana',
    'Uruguay', 'Venezuela', 'Otro'
  ]

  // Provincias de Argentina
  const provinciasArgentina = [
    'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
    'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza',
    'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis',
    'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego',
    'Tucumán', 'Ciudad Autónoma de Buenos Aires'
  ]

  const [paisSearch, setPaisSearch] = useState('')
  const [provinciaSearch, setProvinciaSearch] = useState('')
  const [showPaisDropdown, setShowPaisDropdown] = useState(false)
  const [showProvinciaDropdown, setShowProvinciaDropdown] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createInscripcionMutation = useCreateInscripcion()
  
  // Verificar si ya está inscrito antes de enviar
  const { data: inscripcionExistente } = useCheckInscripcion(convencion?.id, pastor?.email)

  // Códigos de país comunes
  const countryCodes = [
    { code: '+54', country: '🇦🇷 Argentina' },
    { code: '+1', country: '🇺🇸 USA/Canadá' },
    { code: '+52', country: '🇲🇽 México' },
    { code: '+55', country: '🇧🇷 Brasil' },
    { code: '+57', country: '🇨🇴 Colombia' },
    { code: '+51', country: '🇵🇪 Perú' },
    { code: '+56', country: '🇨🇱 Chile' },
    { code: '+58', country: '🇻🇪 Venezuela' },
    { code: '+34', country: '🇪🇸 España' },
    { code: '+591', country: '🇧🇴 Bolivia' },
    { code: '+593', country: '🇪🇨 Ecuador' },
    { code: '+595', country: '🇵🇾 Paraguay' },
    { code: '+598', country: '🇺🇾 Uruguay' },
    { code: '+506', country: '🇨🇷 Costa Rica' },
    { code: '+502', country: '🇬🇹 Guatemala' },
    { code: '+504', country: '🇭🇳 Honduras' },
    { code: '+505', country: '🇳🇮 Nicaragua' },
    { code: '+507', country: '🇵🇦 Panamá' },
    { code: '+503', country: '🇸🇻 El Salvador' },
  ]

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (touched[field]) {
      validateField(field, value)
    }
    // Si cambia el país, limpiar provincia si no es Argentina
    if (field === 'pais' && value !== 'Argentina') {
      setFormData(prev => ({ ...prev, provincia: '' }))
      setProvinciaSearch('')
    }
  }

  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors }
    
    switch (field) {
      case 'nombre':
        if (!value || value.trim().length < 2) {
          newErrors.nombre = 'El nombre debe tener al menos 2 caracteres'
        } else {
          delete newErrors.nombre
        }
        break
      case 'apellido':
        if (!value || value.trim().length < 2) {
          newErrors.apellido = 'El apellido debe tener al menos 2 caracteres'
        } else {
          delete newErrors.apellido
        }
        break
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!value || !emailRegex.test(value)) {
          newErrors.email = 'Correo electrónico inválido'
        } else {
          delete newErrors.email
        }
        break
      case 'telefono':
        if (!value || value.trim().length < 8) {
          newErrors.telefono = 'El teléfono debe tener al menos 8 dígitos'
        } else {
          delete newErrors.telefono
        }
        break
      case 'sede':
        if (!value || value.trim().length < 2) {
          newErrors.sede = 'La sede debe tener al menos 2 caracteres'
        } else {
          delete newErrors.sede
        }
        break
      case 'provincia':
        if (formData.pais === 'Argentina' && (!value || value.trim().length < 2)) {
          newErrors.provincia = 'La provincia es requerida para Argentina'
        } else {
          delete newErrors.provincia
        }
        break
    }
    
    setErrors(newErrors)
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    validateField(field, formData[field as keyof typeof formData])
  }

  const validateForm = () => {
    const requiredFields = ['nombre', 'apellido', 'email', 'telefono', 'sede', 'pais']
    const newErrors: Record<string, string> = {}
    
    requiredFields.forEach(field => {
      const value = formData[field as keyof typeof formData]
      if (!value || (typeof value === 'string' && value.trim().length === 0)) {
        newErrors[field] = 'Este campo es requerido'
      }
    })

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Correo electrónico inválido'
    }

    // Validar provincia si es Argentina
    if (formData.pais === 'Argentina' && !formData.provincia) {
      newErrors.provincia = 'La provincia es requerida para Argentina'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verificar si ya está inscrito antes de continuar
    if (inscripcionExistente) {
      toast.error("Ya estás inscrito", {
        description: "Este correo electrónico ya está registrado para esta convención. No puedes inscribirte dos veces.",
      })
      return
    }

    // Marcar todos los campos como touched
    const allFields = ['nombre', 'apellido', 'email', 'telefono', 'sede', 'pais', 'provincia']
    const newTouched: Record<string, boolean> = {}
    allFields.forEach(field => {
      newTouched[field] = true
    })
    setTouched(newTouched)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Construir telefono completo
    const telefonoCompleto = `${formData.codigoPais}${formData.telefono}`

    // Construir sede completa
    let sedeCompleta = formData.sede
    if (formData.pais === 'Argentina' && formData.provincia) {
      sedeCompleta = `${formData.sede} - ${formData.pais}, ${formData.provincia}`
    } else {
      sedeCompleta = `${formData.sede} - ${formData.pais}`
    }

    try {
      await createInscripcionMutation.mutateAsync({
        convencionId: convencion.id,
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
        telefono: telefonoCompleto,
        sede: sedeCompleta,
        tipoInscripcion: formData.tipoInscripcion,
        numeroCuotas: formData.numeroCuotas,
        origenRegistro: 'web',
        documentoUrl: formData.documentoUrl || undefined,
        notas: formData.notas.trim() || undefined,
      })

      onComplete()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al enviar la inscripción. Por favor, intenta nuevamente.'
      
      // El toast ya se muestra en el hook, pero agregamos el error al estado para mostrarlo en el formulario también
      setErrors({
        submit: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredPaises = paises.filter(pais =>
    pais.toLowerCase().includes(paisSearch.toLowerCase())
  )

  const filteredProvincias = provinciasArgentina.filter(provincia =>
    provincia.toLowerCase().includes(provinciaSearch.toLowerCase())
  )

  const requiredFields = ['nombre', 'apellido', 'email', 'pais', 'numeroCuotas']
  const requiredCompleted = requiredFields.filter(field => {
    if (field === 'provincia') {
      return formData.pais !== 'Argentina' || formData.provincia
    }
    return formData[field as keyof typeof formData]
  }).length
  const totalRequired = formData.pais === 'Argentina' ? requiredFields.length + 1 : requiredFields.length
  const progress = (requiredCompleted / totalRequired) * 100

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Completa tu Inscripción</h2>
          <p className="text-white/70 text-sm sm:text-base">
            Por favor, completa los siguientes datos para finalizar tu inscripción
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/70">
              {requiredCompleted}/{totalRequired} campos requeridos completados
            </span>
            <span className="text-sm font-semibold text-emerald-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre" className="text-white/90 mb-2 block">
                Nombre <span className="text-red-400">*</span>
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                onBlur={() => handleBlur('nombre')}
                className={cn(
                  'bg-white/5 border-white/20 text-white placeholder:text-white/40',
                  errors.nombre && 'border-red-500'
                )}
                placeholder="Tu nombre"
              />
              {touched.nombre && errors.nombre && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.nombre}
                </p>
              )}
              {touched.nombre && !errors.nombre && formData.nombre && (
                <p className="mt-1 text-sm text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Nombre válido
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="apellido" className="text-white/90 mb-2 block">
                Apellido <span className="text-red-400">*</span>
              </Label>
              <Input
                id="apellido"
                value={formData.apellido}
                onChange={(e) => handleChange('apellido', e.target.value)}
                onBlur={() => handleBlur('apellido')}
                className={cn(
                  'bg-white/5 border-white/20 text-white placeholder:text-white/40',
                  errors.apellido && 'border-red-500'
                )}
                placeholder="Tu apellido"
              />
              {touched.apellido && errors.apellido && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.apellido}
                </p>
              )}
              {touched.apellido && !errors.apellido && formData.apellido && (
                <p className="mt-1 text-sm text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Apellido válido
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-white/90 mb-2 block">
              Correo electrónico <span className="text-red-400">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={cn(
                'bg-white/5 border-white/20 text-white placeholder:text-white/40',
                errors.email && 'border-red-500'
              )}
              placeholder="tu@email.com"
            />
            {touched.email && errors.email && (
              <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.email}
              </p>
            )}
            {touched.email && !errors.email && formData.email && (
              <p className="mt-1 text-sm text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Correo válido
              </p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <Label htmlFor="telefono" className="text-white/90 mb-2 block">
              Teléfono <span className="text-red-400">*</span>
            </Label>
            <div className="flex gap-2">
              <Select
                value={formData.codigoPais}
                onValueChange={(value) => handleChange('codigoPais', value)}
              >
                <SelectTrigger className="w-32 bg-white/5 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1628] border-white/20">
                  {countryCodes.map(({ code, country }) => (
                    <SelectItem key={code} value={code} className="text-white">
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="telefono"
                type="tel"
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value.replace(/\D/g, ''))}
                onBlur={() => handleBlur('telefono')}
                className={cn(
                  'flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/40',
                  errors.telefono && 'border-red-500'
                )}
                placeholder="1234567890"
              />
            </div>
            {touched.telefono && errors.telefono && (
              <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.telefono}
              </p>
            )}
          </div>

          {/* País */}
          <div>
            <Label htmlFor="pais" className="text-white/90 mb-2 block">
              País <span className="text-red-400">*</span>
            </Label>
            <div className="relative">
              <Input
                id="pais"
                value={paisSearch || formData.pais}
                onChange={(e) => {
                  setPaisSearch(e.target.value)
                  setShowPaisDropdown(true)
                }}
                onFocus={() => setShowPaisDropdown(true)}
                onBlur={() => setTimeout(() => setShowPaisDropdown(false), 200)}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                placeholder="Buscar país..."
              />
              {showPaisDropdown && filteredPaises.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-[#0a1628] border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredPaises.map((pais) => (
                    <button
                      key={pais}
                      type="button"
                      onClick={() => {
                        handleChange('pais', pais)
                        setPaisSearch('')
                        setShowPaisDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
                    >
                      {pais}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Provincia (solo para Argentina) */}
          {formData.pais === 'Argentina' && (
            <div>
              <Label htmlFor="provincia" className="text-white/90 mb-2 block">
                Provincia <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="provincia"
                  value={provinciaSearch || formData.provincia}
                  onChange={(e) => {
                    setProvinciaSearch(e.target.value)
                    setShowProvinciaDropdown(true)
                  }}
                  onFocus={() => setShowProvinciaDropdown(true)}
                  onBlur={() => setTimeout(() => setShowProvinciaDropdown(false), 200)}
                  className={cn(
                    'bg-white/5 border-white/20 text-white placeholder:text-white/40',
                    errors.provincia && 'border-red-500'
                  )}
                  placeholder="Buscar provincia..."
                />
                {showProvinciaDropdown && filteredProvincias.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-[#0a1628] border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredProvincias.map((provincia) => (
                      <button
                        key={provincia}
                        type="button"
                        onClick={() => {
                          handleChange('provincia', provincia)
                          setProvinciaSearch('')
                          setShowProvinciaDropdown(false)
                        }}
                        className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
                      >
                        {provincia}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {touched.provincia && errors.provincia && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.provincia}
                </p>
              )}
            </div>
          )}

          {/* Sede */}
          <div>
            <Label htmlFor="sede" className="text-white/90 mb-2 block">
              Iglesia / Sede <span className="text-red-400">*</span>
            </Label>
            <Input
              id="sede"
              value={formData.sede}
              onChange={(e) => handleChange('sede', e.target.value)}
              onBlur={() => handleBlur('sede')}
              className={cn(
                'bg-white/5 border-white/20 text-white placeholder:text-white/40',
                errors.sede && 'border-red-500'
              )}
              placeholder="Nombre de tu iglesia o sede"
            />
            {touched.sede && errors.sede && (
              <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.sede}
              </p>
            )}
          </div>

          {/* Tipo de Inscripción y Número de Cuotas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipoInscripcion" className="text-white/90 mb-2 block">
                Tipo de Inscripción
              </Label>
              <Select
                value={formData.tipoInscripcion}
                onValueChange={(value) => handleChange('tipoInscripcion', value)}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1628] border-white/20">
                  <SelectItem value="pastor" className="text-white">Pastor</SelectItem>
                  <SelectItem value="lider" className="text-white">Líder</SelectItem>
                  <SelectItem value="miembro" className="text-white">Miembro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="numeroCuotas" className="text-white/90 mb-2 block">
                Número de Cuotas <span className="text-red-400">*</span>
              </Label>
              <Select
                value={String(formData.numeroCuotas)}
                onValueChange={(value) => handleChange('numeroCuotas', parseInt(value))}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1628] border-white/20">
                  <SelectItem value="1" className="text-white">1 Cuota (${costo.toFixed(2)})</SelectItem>
                  <SelectItem value="2" className="text-white">2 Cuotas (${(costo / 2).toFixed(2)} c/u)</SelectItem>
                  <SelectItem value="3" className="text-white">3 Cuotas (${(costo / 3).toFixed(2)} c/u)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Documento/Comprobante (Opcional) */}
          <div>
            <Label className="text-white/90 mb-2 block">
              Documento o Comprobante (Opcional)
            </Label>
            <p className="text-sm text-white/60 mb-3">
              Puedes subir un documento o comprobante relacionado con tu inscripción. Esto será enviado directamente a Sede Digital.
            </p>
            <ComprobanteUpload
              value={formData.documentoUrl}
              onChange={(url) => handleChange('documentoUrl', url)}
              onUpload={async (file) => {
                const response = await uploadApi.uploadInscripcionDocumento(file)
                return response.url
              }}
              className="bg-white/5"
            />
          </div>

          {/* Notas */}
          <div>
            <Label htmlFor="notas" className="text-white/90 mb-2 block">
              Notas adicionales (opcional)
            </Label>
            <Textarea
              id="notas"
              value={formData.notas}
              onChange={(e) => handleChange('notas', e.target.value)}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40 min-h-[100px]"
              placeholder="Información adicional que quieras compartir..."
            />
          </div>

          {/* Error de submit */}
          {errors.submit && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.submit}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="flex-1 text-white/70 hover:text-white hover:bg-white/5"
            >
              ← Atrás
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createInscripcionMutation.isPending || !!inscripcionExistente}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || createInscripcionMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : inscripcionExistente ? (
                <>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Ya estás inscrito
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Confirmar Inscripción
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

