'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useConvencionActiva } from '@/lib/hooks/use-convencion'
import { useUnifiedAuth } from '@/lib/hooks/use-unified-auth'
import { useCheckInscripcion } from '@/lib/hooks/use-inscripciones'
import { Step1Auth } from '@/components/convencion/step1-auth'
import { UnifiedInscriptionForm } from '@/components/convencion/unified-inscription-form'
import { InscripcionExistenteCard } from '@/components/convencion/inscripcion-existente-card'
import Image from 'next/image'
import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { QueryProvider } from '@/lib/providers/query-provider'
import { Button } from '@/components/ui/button'

function ConvencionInscripcionPageContent() {
  const router = useRouter()
  const { data: convencion, isLoading: loadingConvencion } = useConvencionActiva()
  const { user, isAuthenticated, isHydrated, checkAuth } = useUnifiedAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<any>(null)
  const [pasosCompletados, setPasosCompletados] = useState<number[]>([])
  
  // Verificar si ya está inscrito y si está confirmado
  const { data: inscripcionExistente } = useCheckInscripcion(
    convencion?.id,
    user?.email
  )
  const estaConfirmado = inscripcionExistente?.estado === 'confirmado'
  
  // Marcar pasos completados
  useEffect(() => {
    if (currentStep >= 2) {
      setPasosCompletados([1, 2])
    } else if (currentStep >= 1) {
      setPasosCompletados([1])
    }
  }, [currentStep])

  // El hook useUnifiedAuth ya verifica la autenticación al montar
  // No necesitamos llamar checkAuth manualmente aquí

  // Si no hay convención activa, redirigir a landing
  useEffect(() => {
    if (!loadingConvencion && !convencion) {
      router.push('/#convenciones')
    }
  }, [convencion, loadingConvencion, router])

  // Si ya está autenticado, saltar al step 2
  useEffect(() => {
    if (isHydrated && isAuthenticated && currentStep === 1) {
      // Pequeño delay para asegurar que el estado esté completamente actualizado
      const timer = setTimeout(() => {
        setCurrentStep(2)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, isHydrated, currentStep])

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

  if (!convencion) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <p className="text-white text-xl mb-4">No hay convención activa</p>
          <button
            onClick={() => router.push('/#convenciones')}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          >
            Volver a la página principal
          </button>
        </div>
      </div>
    )
  }

  const steps = [
    { number: 1, title: 'Autenticación', description: 'Inicia sesión o crea tu cuenta' },
    { number: 2, title: 'Inscripción', description: 'Completa tus datos y confirma' },
  ]

  const handleStepComplete = (step: number, data?: any) => {
    if (data) {
      setFormData((prev: any) => ({ ...prev, ...data }))
    }
    if (step < 2) {
      setCurrentStep(step + 1)
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
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Inscripción a Convención</h1>
              <p className="text-white/70 text-sm sm:text-base">Asociación Misionera Vida Abundante</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <button
                    onClick={() => {
                      // Solo permitir ir a steps anteriores o al siguiente
                      if (step.number <= currentStep || (step.number === currentStep + 1 && isAuthenticated)) {
                        setCurrentStep(step.number)
                      }
                    }}
                    className={cn(
                      'w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300',
                      pasosCompletados.includes(step.number)
                        ? 'bg-emerald-500 text-white'
                        : step.number === currentStep
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30 scale-110'
                        : 'bg-white/10 text-white/50 border border-white/20'
                    )}
                    disabled={step.number > currentStep && !isAuthenticated}
                  >
                    {pasosCompletados.includes(step.number) ? (
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      <span className="text-sm sm:text-base font-semibold">{step.number}</span>
                    )}
                  </button>
                  <div className="mt-2 text-center hidden sm:block">
                    <p
                      className={cn(
                        'text-xs font-medium',
                        pasosCompletados.includes(step.number) || step.number <= currentStep ? 'text-white' : 'text-white/50'
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 mx-2 transition-all duration-300',
                      pasosCompletados.includes(step.number) ? 'bg-emerald-500' : 'bg-white/10'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {currentStep === 1 && (
          <Step1Auth
            onComplete={(userData) => handleStepComplete(1, userData)}
            onBack={handleBack}
          />
        )}

        {/* Si ya está inscrito, mostrar el card informativo */}
        {currentStep >= 2 && convencion && inscripcionExistente && (
          <InscripcionExistenteCard
            inscripcion={inscripcionExistente}
            convencion={convencion}
            onVolverInicio={() => router.push('/#convenciones')}
          />
        )}

        {/* Formulario unificado de inscripción */}
        {currentStep === 2 && convencion && user && !inscripcionExistente && (
          <UnifiedInscriptionForm
            convencion={convencion}
            user={user}
            onBack={handleBack}
          />
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

