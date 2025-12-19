import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { convencionesApi, type Convencion, normalizeBoolean } from '@api/convenciones'
import { inscripcionesApi } from '@api/inscripciones'
import { useInvitadoAuth } from '@hooks/useInvitadoAuth'
import { Step1Auth } from './steps/Step1Auth'
import { Step2ConvencionInfo } from './steps/Step2ConvencionInfo'
import { Step3Formulario } from './steps/Step3Formulario'
import { Step4Confirmacion } from './steps/Step4Confirmacion'

type TabParamList = {
  Inicio: undefined
  Convenciones: undefined
  Noticias: undefined
  Perfil: undefined
}

export function ConventionInscripcionScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>()
  const { invitado, isAuthenticated } = useInvitadoAuth()
  const [convencion, setConvencion] = useState<Convencion | null>(null)
  const [loadingConvencion, setLoadingConvencion] = useState(true)
  const [currentStep, setCurrentStep] = useState(1) // Empezar en step 1 (autenticación)
  const [formData, setFormData] = useState<any>(null)
  const [inscripcionCompleta, setInscripcionCompleta] = useState(false)
  const [yaInscrito, setYaInscrito] = useState(false)
  const [inscripcionExistente, setInscripcionExistente] = useState<any>(null)

  // Cargar convención activa (solo una vez al montar)
  useEffect(() => {
    let isMounted = true
    let hasInitialized = false // Prevenir cambios de step después de la inicialización

    const loadConvencion = async (showLoading = true) => {
      try {
        if (!isMounted) return
        if (showLoading) {
          setLoadingConvencion(true)
        }
        const activa = await convencionesApi.getActive()
        // Verificar que la convención esté activa
        // Normalizar activa.activa a boolean (puede venir como string desde el backend)
        const isActiva = activa && normalizeBoolean(activa.activa)
        if (isMounted) {
          if (isActiva) {
            // Normalizar los valores booleanos antes de guardar
            const convencionNormalizada = {
              ...activa,
              activa: normalizeBoolean(activa.activa),
              archivada: normalizeBoolean(activa.archivada),
            }
            setConvencion(convencionNormalizada)

            // Solo verificar inscripción y cambiar step en la primera carga
            // No cambiar step si el usuario ya está llenando el formulario (currentStep > 1)
            if (!hasInitialized && currentStep === 1) {
              // Verificar si el usuario ya está inscrito (silenciosamente)
              if (invitado?.email) {
                try {
                  const inscripcion = await inscripcionesApi.checkInscripcion(activa.id, invitado.email)
                  if (inscripcion) {
                    setYaInscrito(true)
                    setInscripcionExistente(inscripcion)
                    // Si ya está inscrito y autenticado, ir directamente al step 2 o 4 según estado
                    if (isAuthenticated) {
                      if (inscripcion.estado === 'confirmado') {
                        setCurrentStep(4)
                        setInscripcionCompleta(true)
                      } else {
                        setCurrentStep(2)
                      }
                    }
                  } else {
                    setYaInscrito(false)
                    setInscripcionExistente(null)
                    // Si está autenticado pero no inscrito, ir al step 2
                    if (isAuthenticated) {
                      setCurrentStep(2)
                    }
                  }
                } catch (error) {
                  console.error('Error verificando inscripción:', error)
                  // No actualizar estado si hay error, mantener el anterior
                }
              } else if (isAuthenticated && invitado) {
                // Si está autenticado pero no hay email aún, ir al step 2
                setCurrentStep(2)
              }
              hasInitialized = true
            } else if (hasInitialized && invitado?.email && currentStep === 1 && isAuthenticated) {
              // Si el usuario se autenticó después de cargar la página, verificar inscripción
              try {
                const inscripcion = await inscripcionesApi.checkInscripcion(activa.id, invitado.email)
                if (inscripcion) {
                  setYaInscrito(true)
                  setInscripcionExistente(inscripcion)
                  if (inscripcion.estado === 'confirmado') {
                    setCurrentStep(4)
                    setInscripcionCompleta(true)
                  } else {
                    setCurrentStep(2)
                  }
                } else {
                  setYaInscrito(false)
                  setInscripcionExistente(null)
                  setCurrentStep(2)
                }
              } catch (error) {
                console.error('Error verificando inscripción:', error)
              }
            }
          } else {
            setConvencion(null)
            setYaInscrito(false)
            setInscripcionExistente(null)
          }
        }
      } catch (error) {
        console.error('Error cargando convención:', error)
        if (isMounted && showLoading) {
          setConvencion(null)
          setYaInscrito(false)
          setInscripcionExistente(null)
        }
      } finally {
        if (isMounted && showLoading) {
          setLoadingConvencion(false)
        }
      }
    }

    // Cargar inmediatamente con loading
    void loadConvencion(true)

    // Recargar silenciosamente cada 30 segundos (sin mostrar loading)
    const interval = setInterval(() => {
      void loadConvencion(false)
    }, 30000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [invitado?.email, isAuthenticated, currentStep])

  const handleStepComplete = (step: number, data?: any) => {
    if (data) {
      setFormData((prev: any) => ({ ...prev, ...data }))
    }
    if (step === 1 && isAuthenticated) {
      // Después de autenticación, si ya está inscrito, ir a step 2 (info)
      if (yaInscrito) {
        setCurrentStep(2)
      } else {
        setCurrentStep(2) // Ir a información de convención
      }
    } else if (step === 2) {
      // Después de información, ir a formulario
      setCurrentStep(3)
    } else if (step === 3) {
      // Cuando se completa el step 3 (formulario), mostrar confirmación
      setInscripcionCompleta(true)
      setCurrentStep(4)
    } else if (step < 4) {
      setCurrentStep(step + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleConfirm = () => {
    // Después de confirmar, volver al inicio
    setInscripcionCompleta(true)
    setCurrentStep(2) // Volver a información en lugar de autenticación
    setFormData(null)
    navigation.navigate('Inicio')
  }

  if (loadingConvencion) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/images/amvadigital.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <ActivityIndicator size="large" color="#22c55e" style={styles.loader} />
            <Text style={styles.loadingText}>Cargando información...</Text>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  if (!convencion) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.emptyContentContainer}>
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
          </View>
          <Text style={styles.emptyTitle}>No hay convención activa</Text>
          <Text style={styles.emptySubtitle}>
            En este momento no hay ninguna convención disponible para inscripción.
          </Text>
          <Text style={styles.emptyDescription}>
            Te notificaremos cuando tengamos novedades sobre próximas convenciones.
          </Text>
          <TouchableOpacity
            style={styles.backToHomeButton}
            onPress={() => navigation.navigate('Inicio')}
          >
            <Text style={styles.backToHomeButtonText}>🏠 Volver al Inicio</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  const steps = [
    { number: 1, title: 'Autenticación', description: 'Inicia sesión o crea tu cuenta' },
    { number: 2, title: 'Información', description: 'Detalles de la convención' },
    { number: 3, title: 'Formulario', description: 'Completa tus datos' },
    { number: 4, title: 'Confirmación', description: 'Revisa y confirma' },
  ]

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Inscripción a Convención</Text>
          <Text style={styles.subtitle}>Asociación Misionera Vida Abundante</Text>
        </View>

        {/* Progress Steps */}
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View key={step.number} style={styles.stepRow}>
              <View style={styles.stepItem}>
                <TouchableOpacity
                  style={[
                    styles.stepCircle,
                    step.number < currentStep && styles.stepCircleCompleted,
                    step.number === currentStep && styles.stepCircleActive,
                  ]}
                  disabled={step.number > currentStep && !inscripcionCompleta}
                >
                  <Text
                    style={[
                      styles.stepNumber,
                      step.number < currentStep && styles.stepNumberCompleted,
                      step.number === currentStep && styles.stepNumberActive,
                    ]}
                  >
                    {step.number < currentStep ? '✓' : step.number}
                  </Text>
                </TouchableOpacity>
                <View style={styles.stepTextContainer}>
                  <Text
                    style={[styles.stepTitle, step.number <= currentStep && styles.stepTitleActive]}
                  >
                    {step.title}
                  </Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              </View>
              {index < steps.length - 1 && (
                <View
                  style={[styles.stepLine, step.number < currentStep && styles.stepLineCompleted]}
                />
              )}
            </View>
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {currentStep === 1 && (
            <Step1Auth
              onComplete={userData => handleStepComplete(1, userData)}
              onBack={handleBack}
            />
          )}

          {currentStep === 2 && convencion && (
            <Step2ConvencionInfo
              convencion={convencion}
              yaInscrito={yaInscrito}
              inscripcionExistente={inscripcionExistente}
              initialNumeroCuotas={formData?.numeroCuotas}
              onComplete={data => handleStepComplete(2, data)}
              onBack={handleBack}
            />
          )}

          {currentStep === 3 && convencion && invitado && (
            <Step3Formulario
              convencion={convencion}
              invitado={invitado}
              initialData={formData}
              onComplete={data => handleStepComplete(3, data)}
              onBack={handleBack}
            />
          )}

          {currentStep === 4 && convencion && formData && (
            <Step4Confirmacion
              convencion={convencion}
              formData={formData}
              onConfirm={handleConfirm}
              onBack={handleBack}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
  container: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
  contentContainer: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a1628',
  },
  loadingContent: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
    width: 200,
    height: 200,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  loader: {
    marginVertical: 16,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a1628',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: 'center',
    backgroundColor: '#0d1f35',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  stepsContainer: {
    padding: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepCircleCompleted: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  stepCircleActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
    borderWidth: 3,
  },
  stepNumber: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepNumberCompleted: {
    color: '#fff',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 2,
  },
  stepTitleActive: {
    color: '#fff',
  },
  stepDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  stepLine: {
    width: 2,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 20,
    marginRight: 20,
  },
  stepLineCompleted: {
    backgroundColor: '#22c55e',
  },
  content: {
    padding: 20,
  },
  emptyContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  emptyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  backToHomeButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backToHomeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
