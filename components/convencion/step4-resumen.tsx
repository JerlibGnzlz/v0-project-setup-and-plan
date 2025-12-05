'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle, FileText, Mail, Phone, MapPin, Calendar, CreditCard, Sparkles, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useCreateInscripcion, useCheckInscripcion } from '@/lib/hooks/use-inscripciones'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useUnifiedAuth } from '@/lib/hooks/use-unified-auth'

interface Step4ResumenProps {
  convencion: {
    id: string
    titulo: string
    fechaInicio: string
    fechaFin: string
    ubicacion: string
    costo?: number
  }
  formData: {
    nombre: string
    apellido: string
    email: string
    telefono: string
    pais: string
    provincia?: string
    sede: string
    tipoInscripcion: string
    numeroCuotas: number
    documentoUrl?: string
    notas?: string
  }
  onConfirm: () => void
  onBack: () => void
  isSubmitting?: boolean
}

export function Step4Resumen({ 
  convencion, 
  formData, 
  onConfirm, 
  onBack, 
  isSubmitting: isSubmittingProp = false 
}: Step4ResumenProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const createInscripcionMutation = useCreateInscripcion()
  const { user } = useUnifiedAuth() // Obtener datos del usuario autenticado (pastor o invitado)
  
  // Verificar si ya está inscrito antes de enviar
  const { data: inscripcionExistente } = useCheckInscripcion(convencion?.id, formData?.email)

  const fechaInicio = new Date(convencion.fechaInicio)
  const fechaFin = new Date(convencion.fechaFin)
  const fechaFormateada = format(fechaInicio, "d 'de' MMMM, yyyy", { locale: es })
  const fechaFinFormateada = format(fechaFin, "d 'de' MMMM, yyyy", { locale: es })

  const costo = typeof convencion.costo === 'number' 
    ? convencion.costo 
    : parseFloat(String(convencion.costo || 0))
  const montoPorCuota = costo / formData.numeroCuotas

  const handleConfirm = async () => {
    console.log('[Step4Resumen] handleConfirm llamado')
    console.log('[Step4Resumen] inscripcionExistente:', inscripcionExistente)
    console.log('[Step4Resumen] formData:', formData)
    console.log('[Step4Resumen] convencion:', convencion)
    
    // Verificar si ya está inscrito ANTES de enviar
    if (inscripcionExistente) {
      console.log('[Step4Resumen] Ya está inscrito, bloqueando envío')
      toast.error("❌ Ya estás inscrito", {
        description: `Este correo electrónico (${formData.email}) ya está registrado para esta convención. No puedes inscribirte dos veces.`,
        duration: 6000,
      })
      return
    }
    
    // Verificar nuevamente antes de enviar (por si acaso cambió el estado)
    try {
      const checkResult = await inscripcionesApi.checkInscripcion(convencion.id, formData.email)
      if (checkResult) {
        console.log('[Step4Resumen] Verificación final: Ya está inscrito')
        toast.error("❌ Ya estás inscrito", {
          description: `Este correo electrónico (${formData.email}) ya está registrado para esta convención. No puedes inscribirte dos veces.`,
          duration: 6000,
        })
        return
      }
    } catch (checkError) {
      console.warn('[Step4Resumen] Error al verificar inscripción:', checkError)
      // Continuar con el proceso si hay error en la verificación
    }

    console.log('[Step4Resumen] Iniciando envío de inscripción...')
    console.log('[Step4Resumen] formData completo:', JSON.stringify(formData, null, 2))
    console.log('[Step4Resumen] convencion:', convencion)
    
    setIsSubmitting(true)
    console.log('[Step4Resumen] setIsSubmitting(true) ejecutado')

    try {
      console.log('[Step4Resumen] Entrando al bloque try...')
      
      // Validar que todos los campos requeridos estén presentes
      console.log('[Step4Resumen] Validando campos requeridos...')
      console.log('[Step4Resumen] nombre:', formData.nombre, 'válido:', !!formData.nombre)
      console.log('[Step4Resumen] apellido:', formData.apellido, 'válido:', !!formData.apellido)
      console.log('[Step4Resumen] email:', formData.email, 'válido:', !!formData.email)
      console.log('[Step4Resumen] sede:', formData.sede, 'válido:', !!formData.sede)
      console.log('[Step4Resumen] telefono:', formData.telefono, 'válido:', !!formData.telefono)
      
      // Validar campos requeridos (sede puede venir del usuario, así que verificar si está vacío)
      const camposFaltantes = []
      if (!formData.nombre || formData.nombre.trim().length === 0) camposFaltantes.push('nombre')
      if (!formData.apellido || formData.apellido.trim().length === 0) camposFaltantes.push('apellido')
      if (!formData.email || formData.email.trim().length === 0) camposFaltantes.push('email')
      if (!formData.sede || formData.sede.trim().length === 0) camposFaltantes.push('sede')
      
      if (camposFaltantes.length > 0) {
        console.error('[Step4Resumen] ❌ Datos incompletos detectados:', camposFaltantes)
        toast.error('Datos incompletos', {
          description: `Faltan los siguientes campos: ${camposFaltantes.join(', ')}. Por favor, completa todos los campos requeridos antes de continuar.`,
        })
        setIsSubmitting(false)
        return
      }
      
      console.log('[Step4Resumen] ✅ Validación de campos pasada')

      // Construir teléfono completo: si el usuario tiene teléfono, usarlo. Si no, usar el del formulario.
      let telefonoFinal: string | undefined = undefined
      
      if (user?.telefono && user.telefono.trim().length >= 8 && user.telefono.trim().length <= 20) {
        // Usar teléfono del usuario si es válido
        telefonoFinal = user.telefono.trim()
        console.log('[Step4Resumen] Usando teléfono del usuario:', telefonoFinal)
      } else if (formData.codigoPais && formData.telefono) {
        // Construir teléfono completo desde el formulario
        const telefonoCompleto = `${formData.codigoPais}${formData.telefono.trim()}`
        // Validar que tenga entre 8 y 20 caracteres (sin contar espacios, guiones, etc.)
        const telefonoLimpio = telefonoCompleto.replace(/[\s\-()]/g, '')
        if (telefonoLimpio.length >= 8 && telefonoLimpio.length <= 20) {
          telefonoFinal = telefonoCompleto
          console.log('[Step4Resumen] Usando teléfono del formulario:', telefonoFinal)
        } else {
          console.warn('[Step4Resumen] Teléfono del formulario no cumple validación (8-20 caracteres):', telefonoLimpio.length)
        }
      } else if (formData.telefono) {
        // Solo teléfono sin código de país
        const telefonoLimpio = formData.telefono.trim().replace(/[\s\-()]/g, '')
        if (telefonoLimpio.length >= 8 && telefonoLimpio.length <= 20) {
          telefonoFinal = formData.telefono.trim()
          console.log('[Step4Resumen] Usando teléfono sin código de país:', telefonoFinal)
        } else {
          console.warn('[Step4Resumen] Teléfono no cumple validación (8-20 caracteres):', telefonoLimpio.length)
        }
      }
      
      // Limpiar y validar sede
      const sedeLimpia = formData.sede?.trim()
      if (!sedeLimpia || sedeLimpia.length === 0) {
        console.error('[Step4Resumen] ❌ Sede está vacía o undefined')
        toast.error('Sede requerida', {
          description: 'Por favor, proporciona tu iglesia o sede antes de continuar.',
        })
        setIsSubmitting(false)
        return
      }
      
      console.log('[Step4Resumen] Sede limpia:', sedeLimpia)
      
      // Construir objeto de datos, asegurando que solo se incluyan campos válidos
      const datosInscripcion: any = {
        convencionId: convencion.id,
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim().toLowerCase(),
        tipoInscripcion: formData.tipoInscripcion || 'pastor',
        numeroCuotas: formData.numeroCuotas || 3,
        origenRegistro: 'web',
      }
      
      // Agregar teléfono solo si es válido (8-20 caracteres)
      if (telefonoFinal && telefonoFinal.trim().length >= 8 && telefonoFinal.trim().length <= 20) {
        datosInscripcion.telefono = telefonoFinal.trim()
      } else {
        console.log('[Step4Resumen] Teléfono no incluido (opcional y no válido)')
      }
      
      if (sedeLimpia && sedeLimpia.trim().length > 0) {
        datosInscripcion.sede = sedeLimpia.trim()
      }
      
      // Agregar país y provincia
      if (formData.pais && formData.pais.trim().length > 0) {
        datosInscripcion.pais = formData.pais.trim()
      }
      
      if (formData.provincia && formData.provincia.trim().length > 0) {
        datosInscripcion.provincia = formData.provincia.trim()
      }
      
      if (formData.documentoUrl && formData.documentoUrl.trim().length > 0) {
        datosInscripcion.documentoUrl = formData.documentoUrl.trim()
      }
      
      if (formData.notas && formData.notas.trim().length > 0) {
        datosInscripcion.notas = formData.notas.trim()
      }
      
      console.log('[Step4Resumen] ✅ DatosInscripcion construido correctamente')
      console.log('[Step4Resumen] Datos a enviar:', JSON.stringify(datosInscripcion, null, 2))
      console.log('[Step4Resumen] Validación de tipos:', {
        convencionId: typeof datosInscripcion.convencionId,
        nombre: typeof datosInscripcion.nombre,
        apellido: typeof datosInscripcion.apellido,
        email: typeof datosInscripcion.email,
        numeroCuotas: typeof datosInscripcion.numeroCuotas,
        telefono: typeof datosInscripcion.telefono,
        sede: typeof datosInscripcion.sede,
        pais: typeof datosInscripcion.pais,
        provincia: typeof datosInscripcion.provincia,
      })
      
      // Validación previa de campos críticos
      if (!datosInscripcion.convencionId || typeof datosInscripcion.convencionId !== 'string') {
        console.error('[Step4Resumen] ❌ convencionId inválido')
        toast.error('Error de datos', { description: 'El ID de la convención no es válido.' })
        setIsSubmitting(false)
        return
      }
      
      if (!datosInscripcion.sede || datosInscripcion.sede.trim().length < 2) {
        console.error('[Step4Resumen] ❌ sede inválida:', datosInscripcion.sede)
        toast.error('Error de datos', { description: 'La sede debe tener al menos 2 caracteres.' })
        setIsSubmitting(false)
        return
      }
      
      console.log('[Step4Resumen] ✅ Validación previa pasada, llamando a mutateAsync...')
      
      const resultado = await createInscripcionMutation.mutateAsync(datosInscripcion)
      console.log('[Step4Resumen] ✅ Inscripción creada exitosamente:', resultado)

      // Pequeño delay para asegurar que el toast se muestre
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Redirigir a landing con mensaje de éxito
      console.log('[Step4Resumen] Redirigiendo a landing...')
      router.push('/?inscripcion=exito#convenciones')
    } catch (error: any) {
      console.error('[Step4Resumen] ❌ ERROR CAPTURADO:', error)
      console.error('[Step4Resumen] Error tipo:', typeof error)
      console.error('[Step4Resumen] Error completo:', JSON.stringify(error, null, 2))
      console.error('[Step4Resumen] Error response:', error.response)
      console.error('[Step4Resumen] Error response status:', error.response?.status)
      console.error('[Step4Resumen] Error response data:', error.response?.data)
      console.error('[Step4Resumen] Error response headers:', error.response?.headers)
      console.error('[Step4Resumen] Error message:', error.message)
      console.error('[Step4Resumen] Error code:', error.code)
      console.error('[Step4Resumen] Error stack:', error.stack)
      
      // Determinar el mensaje de error más descriptivo
      let errorMessage = 'Error al enviar la inscripción. Por favor, intenta nuevamente.'
      
      if (!error.response) {
        // Error de red (servidor no responde)
        errorMessage = 'No se pudo conectar con el servidor. Por favor, verifica que el backend esté corriendo en http://localhost:4000'
      } else if (error.response.status === 400) {
        // Error de validación - extraer mensaje del formato del GlobalExceptionFilter
        const responseData = error.response.data
        
        // El GlobalExceptionFilter devuelve: { success: false, error: { message, statusCode, error, details: { validationErrors: [...] } } }
        if (responseData?.error?.details?.validationErrors && Array.isArray(responseData.error.details.validationErrors)) {
          const validationErrors = responseData.error.details.validationErrors.map((err: any) => 
            typeof err === 'string' ? err : `${err.field || 'campo'}: ${err.message || err}`
          ).join(', ')
          errorMessage = `Error de validación: ${validationErrors}`
        } else if (responseData?.error?.message) {
          errorMessage = responseData.error.message
        } else if (responseData?.message) {
          errorMessage = responseData.message
        } else if (typeof responseData === 'object' && Object.keys(responseData).length === 0) {
          // Si responseData está vacío, puede ser un problema de validación silencioso
          errorMessage = 'Error de validación. Por favor, verifica que todos los campos estén completos y sean válidos. Revisa la consola para más detalles.'
        } else {
          errorMessage = 'Error de validación. Por favor, verifica los datos ingresados.'
        }
      } else if (error.response.status === 409) {
        // Conflicto (email duplicado)
        const responseData = error.response.data
        errorMessage = responseData?.error?.message || responseData?.message || `El correo electrónico ${formData.email} ya está inscrito en esta convención.`
        
        // Mostrar toast específico para duplicado (más visible)
        toast.error("❌ Ya estás inscrito", {
          description: errorMessage,
          duration: 6000,
        })
      } else if (error.response.status === 404) {
        // No encontrado
        const responseData = error.response.data
        errorMessage = responseData?.error?.message || responseData?.message || 'La convención no fue encontrada. Por favor, intenta nuevamente.'
      } else if (error.response.status >= 500) {
        // Error del servidor
        const responseData = error.response.data
        errorMessage = responseData?.error?.message || responseData?.message || 'Error del servidor. Por favor, intenta más tarde o contacta al administrador.'
      } else {
        // Otro error
        const responseData = error.response.data
        errorMessage = responseData?.error?.message || responseData?.message || error.message || errorMessage
      }
      
      console.error('[Step4Resumen] Mensaje de error a mostrar:', errorMessage)
      
      toast.error('Error al crear la inscripción', {
        description: errorMessage,
        duration: 8000,
      })
      
      setIsSubmitting(false)
      console.log('[Step4Resumen] setIsSubmitting(false) ejecutado después del error')
    }
  }

  const submitting = isSubmitting || isSubmittingProp || createInscripcionMutation.isPending
  
  // Debug: Log del estado del botón
  console.log('[Step4Resumen] Estado del botón:', {
    isSubmitting,
    isSubmittingProp,
    isPending: createInscripcionMutation.isPending,
    submitting,
    inscripcionExistente: !!inscripcionExistente,
    buttonDisabled: submitting || !!inscripcionExistente
  })

  return (
    <div className="max-w-2xl mx-auto">
      <div 
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden"
        onClick={(e) => {
          // Debug: verificar si hay clicks en el contenedor
          console.log('[Step4Resumen] Click en contenedor:', e.target)
        }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-emerald-500/20 border border-emerald-500/40">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">Revisa tu Inscripción</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Resumen y Confirmación</h2>
          <p className="text-white/70 text-sm sm:text-base">
            Por favor, revisa todos los datos antes de confirmar tu inscripción
          </p>
        </div>

        {/* Elegant divider */}
        <div className="flex items-center justify-center gap-3 my-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-emerald-500/30" />
          <div className="relative">
            <Sparkles className="w-3 h-3 text-emerald-400/60" />
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-emerald-500/50 to-emerald-500/30" />
        </div>

        {/* Información de la Convención */}
        <div className="mb-6 p-4 bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Información de la Convención
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/70">Convención:</span>
              <span className="text-white font-medium">{convencion.titulo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Fechas:</span>
              <span className="text-white font-medium">{fechaFormateada} al {fechaFinFormateada}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Ubicación:</span>
              <span className="text-white font-medium">{convencion.ubicacion}</span>
            </div>
          </div>
        </div>

        {/* Información Personal */}
        <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            Información Personal
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-white/70">Nombre:</span>
              <p className="text-white font-medium">{formData.nombre} {formData.apellido}</p>
            </div>
            <div>
              <span className="text-white/70">Email:</span>
              <p className="text-white font-medium flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {formData.email}
              </p>
            </div>
            <div>
              <span className="text-white/70">Teléfono:</span>
              <p className="text-white font-medium flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {formData.telefono}
              </p>
            </div>
            <div>
              <span className="text-white/70">País:</span>
              <p className="text-white font-medium">{formData.pais}{formData.provincia ? `, ${formData.provincia}` : ''}</p>
            </div>
            <div className="sm:col-span-2">
              <span className="text-white/70">Iglesia / Sede:</span>
              <p className="text-white font-medium flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {formData.sede}
              </p>
            </div>
            <div>
              <span className="text-white/70">Tipo de Inscripción:</span>
              <p className="text-white font-medium capitalize">{formData.tipoInscripcion}</p>
            </div>
          </div>
        </div>

        {/* Información de Pago */}
        <div className="mb-6 p-4 bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-amber-500/10 border border-amber-500/20 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            Información de Pago
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/70">Plan de pago:</span>
              <span className="text-white font-medium">{formData.numeroCuotas} cuota{formData.numeroCuotas > 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Monto por cuota:</span>
              <span className="text-white font-medium">${montoPorCuota.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-amber-500/20">
              <span className="text-white font-semibold">Costo total:</span>
              <span className="text-amber-400 font-bold text-lg">${costo.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Documento subido */}
        {formData.documentoUrl && (
          <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-white/70">Documento/comprobante:</span>
              <span className="text-emerald-400 font-medium">Subido</span>
            </div>
          </div>
        )}

        {/* Notas */}
        {formData.notas && (
          <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-sm text-white/70 mb-1">Notas adicionales:</p>
            <p className="text-sm text-white">{formData.notas}</p>
          </div>
        )}

        {/* Mensaje informativo */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-300 mb-1">¿Qué sigue después?</h4>
              <ul className="text-xs text-white/70 space-y-1 list-disc list-inside">
                <li>Recibirás un email de confirmación con todos los detalles</li>
                <li>Podrás realizar el pago de tus cuotas según el plan seleccionado</li>
                <li>Nuestro equipo validará tus pagos y te notificará por email</li>
                <li>Una vez completados todos los pagos, recibirás la confirmación final</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/10">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={submitting}
            className="flex-1 text-white/70 hover:text-white hover:bg-white/5"
          >
            ← Atrás
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('[Step4Resumen] ===== BOTÓN CLICKEADO =====')
              console.log('[Step4Resumen] Event:', e)
              console.log('[Step4Resumen] Estado actual:', {
                submitting,
                inscripcionExistente: !!inscripcionExistente,
                formData,
                convencion
              })
              
              // Llamar directamente sin await para no bloquear
              handleConfirm().catch((error) => {
                console.error('[Step4Resumen] Error no capturado en handleConfirm:', error)
              })
            }}
            disabled={submitting || !!inscripcionExistente}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            style={{ 
              pointerEvents: submitting || !!inscripcionExistente ? 'none' : 'auto',
              position: 'relative',
              zIndex: 10
            }}
            onMouseEnter={() => console.log('[Step4Resumen] Mouse sobre botón')}
            onMouseLeave={() => console.log('[Step4Resumen] Mouse fuera del botón')}
          >
            {submitting ? (
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
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Confirmar Inscripción
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

