'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { useConvencionActiva } from '@/lib/hooks/use-convencion'
import { useUnifiedAuth } from '@/lib/hooks/use-unified-auth'
import { useInvitadoAuth } from '@/lib/hooks/use-invitado-auth'
import { useCheckInscripcion } from '@/lib/hooks/use-inscripciones'
import { Step1Auth } from '@/components/convencion/step1-auth'
import { UnifiedInscriptionForm } from '@/components/convencion/unified-inscription-form'
import { InscripcionExistenteCard } from '@/components/convencion/inscripcion-existente-card'
import Image from 'next/image'
import { CheckCircle2, Circle, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { QueryProvider } from '@/lib/providers/query-provider'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

function ConvencionInscripcionPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { data: convencion, isLoading: loadingConvencion } = useConvencionActiva()

  // Hook de React Query para autenticación del invitado (reemplaza useEffect)
  const invitadoAuth = useInvitadoAuth()

  // Fallback a useUnifiedAuth para compatibilidad
  const unifiedAuth = useUnifiedAuth()

  // Usar datos de invitado si está autenticado como invitado, sino usar unifiedAuth
  const user = invitadoAuth.user || unifiedAuth.user
  const isAuthenticated = invitadoAuth.isAuthenticated || unifiedAuth.isAuthenticated
  const isHydrated = invitadoAuth.isHydrated && unifiedAuth.isHydrated

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<any>(null)
  const [pasosCompletados, setPasosCompletados] = useState<number[]>([])

  // Verificar si ya está inscrito - React Query maneja automáticamente el refetch
  const {
    data: inscripcionExistente,
    isLoading: isLoadingInscripcion,
    isFetching: isFetchingInscripcion,
  } = useCheckInscripcion(convencion?.id, user?.email)
  const estaConfirmado = inscripcionExistente?.estado === 'confirmado'

  // React Query maneja automáticamente la sincronización cuando cambia user?.email
  // useCheckInscripcion se refetch automáticamente cuando cambia convencion?.id o user?.email

  // Manejar callback de Google OAuth
  useEffect(() => {
    if (typeof window === 'undefined') return

    const token = searchParams.get('token')
    const refreshToken = searchParams.get('refresh_token')
    const isGoogle = searchParams.get('google') === 'true'
    const error = searchParams.get('error')

    // Manejar error de Google OAuth
    if (error) {
      let errorMessage = 'Error al autenticarse con Google'
      if (error === 'google_auth_email_error') {
        errorMessage = 'No se pudo obtener el email de tu cuenta de Google'
      } else if (error === 'google_auth_token_error') {
        errorMessage = 'Error al generar los tokens de autenticación'
      }
      toast.error('Error de autenticación', {
        description: errorMessage,
      })
      // Limpiar parámetros de error de la URL
      const url = new URL(window.location.href)
      url.searchParams.delete('error')
      router.replace(url.pathname + url.search)
      return
    }

    // Manejar token de Google OAuth
    if (token && isGoogle && typeof window !== 'undefined') {
      // Guardar tokens
      localStorage.setItem('invitado_token', token)
      if (refreshToken) {
        localStorage.setItem('invitado_refresh_token', refreshToken)
      }

      // Invalidar queries para que se refetch el perfil
      queryClient.invalidateQueries({ queryKey: ['invitado', 'profile'] })

      toast.success('¡Autenticación exitosa!', {
        description: 'Has iniciado sesión con Google correctamente',
      })

      // Limpiar parámetros de la URL
      const url = new URL(window.location.href)
      url.searchParams.delete('token')
      url.searchParams.delete('refresh_token')
      url.searchParams.delete('google')
      router.replace(url.pathname + url.search)
    }
  }, [searchParams, queryClient, router])

  // Efecto simplificado: solo actualizar pasos completados y step basado en datos de React Query
  useEffect(() => {
    // Si hay inscripción existente, ambos pasos están completados
    if (inscripcionExistente) {
      setPasosCompletados([1, 2])
      if (currentStep === 1) {
        setCurrentStep(2)
      }
    } else if (
      isAuthenticated &&
      currentStep === 1 &&
      !isLoadingInscripcion &&
      !isFetchingInscripcion
    ) {
      // Usuario autenticado sin inscripción, avanzar al formulario
      setCurrentStep(2)
      setPasosCompletados([1])
    } else if (currentStep >= 2) {
      setPasosCompletados([1, 2])
    } else if (currentStep >= 1) {
      setPasosCompletados([1])
    }
  }, [
    inscripcionExistente,
    isAuthenticated,
    currentStep,
    isLoadingInscripcion,
    isFetchingInscripcion,
  ])

  // Si no hay convención activa, redirigir a landing
  useEffect(() => {
    if (!loadingConvencion && !convencion) {
      router.push('/#convenciones')
    }
  }, [convencion, loadingConvencion, router])

  // Si no hay convención, mostrar loading
  if (loadingConvencion) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70">Cargando información...</p>
        </div>
      </div>
    )
  }

  // Si no hay convención activa, mostrar mensaje y redirigir a landing page
  if (!convencion || !convencion.activa) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center">
              <Calendar className="w-10 h-10 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No hay convención activa</h2>
            <p className="text-white/70 mb-6">
              Las inscripciones estarán disponibles cuando se active la próxima convención anual.
            </p>
          </div>
          <Button
            onClick={() => router.push('/#convenciones')}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg transition-all shadow-lg"
          >
            Volver a la página principal
          </Button>
        </div>
      </div>
    )
  }

  const steps = [
    { number: 1, title: 'Autenticación', description: 'Inicia sesión o crea tu cuenta' },
    { number: 2, title: 'Inscripción', description: 'Completa tus datos y confirma' },
  ]

  const handleStepComplete = async (step: number, data?: any) => {
    console.log('[ConvencionInscripcionPage] handleStepComplete llamado:', {
      step,
      data,
      currentStep,
    })
    if (data) {
      setFormData((prev: any) => ({ ...prev, ...data }))
    }

    // Avanzar al siguiente paso (step 2 = formulario de inscripción o card de inscripción existente)
    if (step === 1) {
      // Si el usuario está autenticado, React Query ya está verificando la inscripción automáticamente
      // Solo necesitamos invalidar las queries para asegurar que se refetch
      if (isAuthenticated && user?.email && convencion?.id) {
        console.log('[ConvencionInscripcionPage] Invalidando queries para refetch automático...')
        // Invalidar ambas queries (perfil y inscripción) para refetch automático
        queryClient.invalidateQueries({ queryKey: ['invitado', 'profile'] })
        queryClient.invalidateQueries({ queryKey: ['checkInscripcion', convencion.id, user.email] })
        // React Query manejará el refetch automáticamente
        // El useEffect anterior actualizará el step basado en inscripcionExistente
      } else {
        // Si no está autenticado, simplemente avanzar
        console.log('[ConvencionInscripcionPage] Usuario no autenticado, avanzando al paso 2')
        setCurrentStep(2)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      router.push('/#convenciones')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      {/* Header con imagen del mundo */}
      <div className="relative bg-gradient-to-br from-[#0d1f35] via-[#0a1628] to-[#0d1f35] border-b border-white/10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-sky-500/30 via-emerald-500/20 to-amber-500/30 rounded-full blur-xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                <Image
                  src="/mundo.png"
                  alt="AMVA"
                  width={48}
                  height={48}
                  className="object-contain drop-shadow-lg"
                />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Inscripción a Convención
              </h1>
              <p className="text-white/70 text-sm sm:text-base">
                Asociación Misionera Vida Abundante
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 max-w-2xl mx-auto">
            {steps.map((step, index) => {
              // Si hay inscripción existente, ambos pasos están completados
              const isCompleted = inscripcionExistente
                ? true
                : pasosCompletados.includes(step.number)
              const isActive = inscripcionExistente
                ? step.number === 2
                : step.number === currentStep

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <button
                      onClick={() => {
                        // Si hay inscripción existente, no permitir cambiar de paso
                        if (inscripcionExistente) return
                        // Solo permitir ir a steps anteriores o al siguiente
                        if (
                          step.number <= currentStep ||
                          (step.number === currentStep + 1 && isAuthenticated)
                        ) {
                          setCurrentStep(step.number)
                        }
                      }}
                      className={cn(
                        'w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300',
                        isCompleted
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                          : isActive
                            ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30 scale-110'
                            : 'bg-white/10 text-white/50 border border-white/20'
                      )}
                      disabled={
                        (step.number > currentStep && !isAuthenticated) || inscripcionExistente
                      }
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                      ) : (
                        <span className="text-sm sm:text-base font-semibold">{step.number}</span>
                      )}
                    </button>
                    <div className="mt-2 text-center hidden sm:block">
                      <p
                        className={cn(
                          'text-xs font-medium',
                          isCompleted || isActive ? 'text-white' : 'text-white/50'
                        )}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {isCompleted ? 'Completado' : step.description}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'h-0.5 flex-1 mx-2 transition-all duration-300',
                        isCompleted ? 'bg-emerald-500' : 'bg-white/10'
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {currentStep === 1 && !inscripcionExistente && (
          <Step1Auth onComplete={userData => handleStepComplete(1, userData)} onBack={handleBack} />
        )}

        {/* Si ya está inscrito, mostrar el wizard completo con información - PRIORIDAD ALTA */}
        {isAuthenticated && convencion && inscripcionExistente && (
          <>
            {/* Actualizar pasos completados para mostrar ambos pasos como completados */}
            {(() => {
              if (pasosCompletados.length < 2) {
                setPasosCompletados([1, 2])
              }
              return null
            })()}
            <InscripcionExistenteCard
              inscripcion={inscripcionExistente}
              convencion={convencion}
              onVolverInicio={() => router.push('/#convenciones')}
            />
          </>
        )}

        {/* Formulario unificado de inscripción - Solo si NO hay inscripción existente */}
        {isAuthenticated && currentStep === 2 && convencion && user && !inscripcionExistente && (
          <UnifiedInscriptionForm convencion={convencion} user={user} />
        )}
      </div>
    </div>
  )
}

export default function ConvencionInscripcionPage() {
  return (
    <QueryProvider>
      <ConvencionInscripcionPageContent />
    </QueryProvider>
  )
}
