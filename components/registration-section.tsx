'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2, AlertCircle, UserPlus, Sparkles } from 'lucide-react'

export function RegistrationSection() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    church: '',
    role: '',
    message: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

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

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validatePhone = (phone: string) => {
    return /^[\d\s\+\-$$$$]+$/.test(phone) && phone.length >= 8
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    const newErrors = { ...errors }

    if (field === 'email' && value && !validateEmail(value)) {
      newErrors.email = 'Correo electrónico inválido'
    } else if (field === 'email') {
      delete newErrors.email
    }

    if (field === 'phone' && value && !validatePhone(value)) {
      newErrors.phone = 'Número de teléfono inválido'
    } else if (field === 'phone') {
      delete newErrors.phone
    }

    if (field !== 'message' && !value) {
      newErrors[field] = 'Este campo es requerido'
    } else if (field !== 'email' && field !== 'phone' && field !== 'message') {
      delete newErrors[field]
    }

    setErrors(newErrors)
  }

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const isFieldValid = (field: string) => {
    return touched[field] && formData[field as keyof typeof formData] && !errors[field]
  }

  const isFieldInvalid = (field: string) => {
    return touched[field] && errors[field]
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
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-white/80 font-medium">Forma Parte</span>
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
              Únete a{' '}
              <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
                Nosotros
              </span>
            </h2>
            <p className="text-lg text-white/60 max-w-xl mx-auto">
              Regístrate para recibir información sobre próximas convenciones y eventos
            </p>
          </div>

          {/* Form Card */}
          <div className="relative group">
            {/* Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500" />

            <div className="relative rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden">
              {/* Header gradient */}
              <div className="h-1 bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500" />

              <div className="p-6 sm:p-8">
                <form className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white/80">
                        Nombre <span className="text-red-400">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="firstName"
                          placeholder="Juan"
                          value={formData.firstName}
                          onChange={(e) => handleChange('firstName', e.target.value)}
                          onBlur={() => handleBlur('firstName')}
                          className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 ${
                            isFieldInvalid('firstName') ? 'border-red-500/50' : ''
                          }`}
                          required
                        />
                        {isFieldValid('firstName') && (
                          <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-emerald-400" />
                        )}
                      </div>
                      {isFieldInvalid('firstName') && (
                        <p className="text-xs text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white/80">
                        Apellido <span className="text-red-400">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="lastName"
                          placeholder="Pérez"
                          value={formData.lastName}
                          onChange={(e) => handleChange('lastName', e.target.value)}
                          onBlur={() => handleBlur('lastName')}
                          className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 ${
                            isFieldInvalid('lastName') ? 'border-red-500/50' : ''
                          }`}
                          required
                        />
                        {isFieldValid('lastName') && (
                          <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-emerald-400" />
                        )}
                      </div>
                      {isFieldInvalid('lastName') && (
                        <p className="text-xs text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.lastName}
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
                        onChange={(e) => handleChange('email', e.target.value)}
                        onBlur={() => handleBlur('email')}
                        className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 ${
                          isFieldInvalid('email') ? 'border-red-500/50' : ''
                        }`}
                        required
                      />
                      {isFieldValid('email') && (
                        <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-emerald-400" />
                      )}
                    </div>
                    {isFieldInvalid('email') && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white/80">
                      Teléfono <span className="text-red-400">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+54 11 xxxx-xxxx"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        onBlur={() => handleBlur('phone')}
                        className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 ${
                          isFieldInvalid('phone') ? 'border-red-500/50' : ''
                        }`}
                        required
                      />
                      {isFieldValid('phone') && (
                        <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-emerald-400" />
                      )}
                    </div>
                    {isFieldInvalid('phone') && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="church" className="text-white/80">
                      Iglesia / Ministerio <span className="text-red-400">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="church"
                        placeholder="Nombre de su iglesia"
                        value={formData.church}
                        onChange={(e) => handleChange('church', e.target.value)}
                        onBlur={() => handleBlur('church')}
                        className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 ${
                          isFieldInvalid('church') ? 'border-red-500/50' : ''
                        }`}
                        required
                      />
                      {isFieldValid('church') && (
                        <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-emerald-400" />
                      )}
                    </div>
                    {isFieldInvalid('church') && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.church}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-white/80">
                      Posición <span className="text-red-400">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="role"
                        placeholder="Pastor, Líder, etc."
                        value={formData.role}
                        onChange={(e) => handleChange('role', e.target.value)}
                        onBlur={() => handleBlur('role')}
                        className={`bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 ${
                          isFieldInvalid('role') ? 'border-red-500/50' : ''
                        }`}
                        required
                      />
                      {isFieldValid('role') && (
                        <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-emerald-400" />
                      )}
                    </div>
                    {isFieldInvalid('role') && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.role}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-white/80">
                      Mensaje (Opcional)
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Cuéntanos sobre tu ministerio o preguntas que tengas..."
                      rows={4}
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 text-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white border-0 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-[1.02]"
                    disabled
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Enviar Inscripción (Próximamente)
                  </Button>
                  <p className="text-sm text-center text-white/50">
                    El formulario estará disponible próximamente. Gracias por tu interés.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative */}
      <div className="absolute top-20 right-8 w-32 h-px bg-gradient-to-l from-sky-500/50 to-transparent" />
      <div className="absolute bottom-20 left-8 w-32 h-px bg-gradient-to-r from-emerald-500/50 to-transparent" />
    </section>
  )
}
