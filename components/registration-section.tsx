'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export function RegistrationSection() {
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

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validatePhone = (phone: string) => {
    return /^[\d\s\+\-$$$$]+$/.test(phone) && phone.length >= 8
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Real-time validation
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
    <section id="inscripcion" className="py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              Únete a Nosotros
            </h2>
            <p className="text-xl opacity-90 text-pretty leading-relaxed">
              Regístrate para recibir información sobre próximas convenciones y eventos
            </p>
          </div>
          
          <Card className="border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl">Formulario de Inscripción</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      Nombre <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="firstName"
                        placeholder="Juan"
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        onBlur={() => handleBlur('firstName')}
                        className={isFieldInvalid('firstName') ? 'border-destructive' : ''}
                        required
                      />
                      {isFieldValid('firstName') && (
                        <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-600" />
                      )}
                    </div>
                    {isFieldInvalid('firstName') && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Apellido <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="lastName"
                        placeholder="Pérez"
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        onBlur={() => handleBlur('lastName')}
                        className={isFieldInvalid('lastName') ? 'border-destructive' : ''}
                        required
                      />
                      {isFieldValid('lastName') && (
                        <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-600" />
                      )}
                    </div>
                    {isFieldInvalid('lastName') && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Correo Electrónico <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="juan@ejemplo.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      className={isFieldInvalid('email') ? 'border-destructive' : ''}
                      required
                    />
                    {isFieldValid('email') && (
                      <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-600" />
                    )}
                  </div>
                  {isFieldInvalid('email') && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Teléfono <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+52 123 456 7890"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      onBlur={() => handleBlur('phone')}
                      className={isFieldInvalid('phone') ? 'border-destructive' : ''}
                      required
                    />
                    {isFieldValid('phone') && (
                      <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-600" />
                    )}
                  </div>
                  {isFieldInvalid('phone') && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="church">
                    Iglesia / Ministerio <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="church"
                      placeholder="Nombre de su iglesia"
                      value={formData.church}
                      onChange={(e) => handleChange('church', e.target.value)}
                      onBlur={() => handleBlur('church')}
                      className={isFieldInvalid('church') ? 'border-destructive' : ''}
                      required
                    />
                    {isFieldValid('church') && (
                      <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-600" />
                    )}
                  </div>
                  {isFieldInvalid('church') && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.church}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">
                    Posición <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="role"
                      placeholder="Pastor, Líder, etc."
                      value={formData.role}
                      onChange={(e) => handleChange('role', e.target.value)}
                      onBlur={() => handleBlur('role')}
                      className={isFieldInvalid('role') ? 'border-destructive' : ''}
                      required
                    />
                    {isFieldValid('role') && (
                      <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-600" />
                    )}
                  </div>
                  {isFieldInvalid('role') && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.role}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje (Opcional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Cuéntanos sobre tu ministerio o preguntas que tengas..."
                    rows={4}
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                  />
                </div>
                
                <Button type="submit" className="w-full" size="lg" disabled>
                  Enviar Inscripción (Próximamente)
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  El formulario estará disponible próximamente. Gracias por tu interés.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
