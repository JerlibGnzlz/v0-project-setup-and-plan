'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useConvencionActiva } from '@/lib/hooks/use-convencion'
import { usePastorAuth } from '@/lib/hooks/use-pastor-auth'
import { useCheckInscripcion } from '@/lib/hooks/use-inscripciones'
import { Step1Auth } from '@/components/convencion/step1-auth'
import { Step2ConvencionInfo } from '@/components/convencion/step2-convencion-info'
import { Step3Formulario } from '@/components/convencion/step3-formulario'
import { Step4Resumen } from '@/components/convencion/step4-resumen'
import Image from 'next/image'
import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { QueryProvider } from '@/lib/providers/query-provider'
import { Button } from '@/components/ui/button'

function ConvencionInscripcionPageContent() {
  const router = useRouter()
  const { data: convencion, isLoading: loadingConvencion } = useConvencionActiva()
  const { pastor, isAuthenticated, isHydrated, checkAuth } = usePastorAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<any>(null)
  const [pasosCompletados, setPasosCompletados] = useState<number[]>([])
  
  // Verificar si ya está inscrito y si está confirmado
  const { data: inscripcionExistente } = useCheckInscripcion(
    convencion?.id,
    pastor?.email
  )
  const estaConfirmado = inscripcionExistente?.estado === 'confirmado'
  
  // Cuando se completa el paso 2 (selección de plan de pago), marcar pasos 1-4 como completados
  useEffect(() => {
    if (currentStep >= 2 && formData?.numeroCuotas) {
      setPasosCompletados([1, 2, 3, 4])
    } else if (currentStep >= 1) {
      setPasosCompletados([1])
    }
  }, [currentStep, formData?.numeroCuotas])

  // Verificar autenticación al montar
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

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
    { number: 2, title: 'Información', description: 'Detalles de la convención' },
    { number: 3, title: 'Inscripción', description: 'Completa tus datos' },
    { number: 4, title: 'Confirmación', description: 'Revisa y confirma' },
  ]

  const handleStepComplete = (step: number, data?: any) => {
    // Si está confirmado, no permitir avanzar a pasos 3 y 4
    if (estaConfirmado && (step + 1 === 3 || step + 1 === 4)) {
      return
    }
    
    if (data) {
      setFormData((prev: any) => ({ ...prev, ...data }))
    }
    if (step < 4) {
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
                      // Si está confirmado, no permitir ir a pasos 3 y 4
                      if (estaConfirmado && (step.number === 3 || step.number === 4)) {
                        return
                      }
                      // Solo permitir ir a steps anteriores o al siguiente
                      if (step.number <= currentStep || (step.number === currentStep + 1 && isAuthenticated)) {
                        setCurrentStep(step.number)
                      }
                    }}
                    className={cn(
                      'w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300',
                      estaConfirmado && (step.number === 3 || step.number === 4)
                        ? 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed opacity-50'
                        : pasosCompletados.includes(step.number)
                        ? 'bg-emerald-500 text-white'
                        : step.number === currentStep
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30 scale-110'
                        : 'bg-white/10 text-white/50 border border-white/20'
                    )}
                    disabled={(step.number > currentStep && !isAuthenticated) || (estaConfirmado && (step.number === 3 || step.number === 4))}
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
                        estaConfirmado && (step.number === 3 || step.number === 4)
                          ? 'text-white/30'
                          : pasosCompletados.includes(step.number) || step.number <= currentStep ? 'text-white' : 'text-white/50'
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

        {currentStep === 2 && convencion && (
          <Step2ConvencionInfo
            convencion={convencion}
            onComplete={(data) => handleStepComplete(2, data)}
            onBack={handleBack}
            initialNumeroCuotas={formData?.numeroCuotas || 3}
          />
        )}

        {currentStep === 3 && convencion && pastor && (
          <Step3Formulario
            convencion={convencion}
            pastor={pastor}
            initialData={formData}
            onComplete={(data) => handleStepComplete(3, data)}
            onBack={handleBack}
            estaConfirmado={estaConfirmado}
          />
        )}

        {currentStep === 4 && convencion && formData && !estaConfirmado && (
          <Step4Resumen
            convencion={convencion}
            formData={formData}
            onConfirm={() => {
              // El step4 maneja el envío internamente
            }}
            onBack={handleBack}
          />
        )}
        
        {/* Mensaje si intenta acceder a paso 4 estando confirmado */}
        {currentStep === 4 && estaConfirmado && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Inscripción Confirmada</h2>
                <p className="text-white/70">
                  Tu inscripción ya está confirmada. No puedes modificar los datos.
                </p>
              </div>
              <Button
                onClick={() => router.push('/#convenciones')}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
              >
                Volver a la página principal
              </Button>
            </div>
          </div>
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

