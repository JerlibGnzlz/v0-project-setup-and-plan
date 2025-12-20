import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
  Animated,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { CheckCircle2, Calendar as CalendarIcon } from 'lucide-react-native'
import { convencionesApi, type Convencion, normalizeBoolean } from '@api/convenciones'
import { inscripcionesApi } from '@api/inscripciones'
import { useInvitadoAuth } from '@hooks/useInvitadoAuth'
import { Step1Auth } from './steps/Step1Auth'
import { Step2UnifiedForm } from './steps/Step2UnifiedForm'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

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
  const slideAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(1)).current

  // Inicializar animaciones cuando cambia el step
  useEffect(() => {
    fadeAnim.setValue(1)
    slideAnim.setValue(0)
  }, [currentStep, fadeAnim, slideAnim])

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
                    // Si ya está inscrito y autenticado, ir directamente al step 2
                    if (isAuthenticated) {
                      setCurrentStep(2)
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
                  setCurrentStep(2)
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
    
    // Animación de salida
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -SCREEN_WIDTH * 0.1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Cambiar step - Solo 2 pasos ahora
      if (step === 1 && isAuthenticated) {
        setCurrentStep(2)
      } else if (step === 2) {
        // Inscripción completada
        setInscripcionCompleta(true)
        navigation.navigate('Inicio')
      }
      
      // Animación de entrada
      slideAnim.setValue(SCREEN_WIDTH * 0.1)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    })
  }

  const handleBack = () => {
    if (currentStep > 1) {
      // Animación de salida
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_WIDTH * 0.1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep - 1)
        
        // Animación de entrada
        slideAnim.setValue(-SCREEN_WIDTH * 0.1)
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start()
      })
    }
  }


  if (loadingConvencion) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/images/amvamovil.png')}
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
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.container}>
          {/* Header con gradiente */}
          <LinearGradient
            colors={['rgba(34, 197, 94, 0.15)', 'rgba(59, 130, 246, 0.1)', 'transparent']}
            style={styles.headerGradient}
          >
            <View style={styles.header}>
              <View style={styles.logoHeaderContainer}>
                <Image
                  source={require('../../../assets/images/amvamovil.png')}
                  style={styles.headerLogo}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.headerContent}>
                <CalendarIcon size={28} color="#22c55e" />
                <Text style={styles.title}>Inscripción a Convención</Text>
              </View>
            </View>
          </LinearGradient>

          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.emptyContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Mensaje "Muy Pronto" similar a la web */}
            <View style={styles.comingSoonContainer}>
              <View style={styles.comingSoonCard}>
                {/* Gradient header animado */}
                <LinearGradient
                  colors={['rgba(14, 165, 233, 0.8)', 'rgba(34, 197, 94, 0.8)', 'rgba(251, 191, 36, 0.8)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.comingSoonGradientHeader}
                />
                
                <View style={styles.comingSoonContent}>
                  <View style={styles.comingSoonIconContainer}>
                    <Clock size={32} color="#22c55e" />
                  </View>
                  
                  <Text style={styles.comingSoonTitle}>
                    Muy Pronto
                  </Text>
                  
                  <Text style={styles.comingSoonSubtitle}>
                    Gran Convención
                  </Text>
                  
                  <Text style={styles.comingSoonDescription}>
                    Estamos preparando un evento extraordinario para ti.{'\n'}
                    ¡Pronto tendrás toda la información!
                  </Text>
                  
                  <View style={styles.comingSoonInfoContainer}>
                    <View style={styles.comingSoonInfoItem}>
                      <CalendarIcon size={20} color="#60a5fa" />
                      <Text style={styles.comingSoonInfoText}>Fecha por confirmar</Text>
                    </View>
                    
                    <View style={styles.comingSoonInfoItem}>
                      <MapPin size={20} color="#fbbf24" />
                      <Text style={styles.comingSoonInfoText}>Ubicación por confirmar</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.comingSoonFooter}>
                    Estamos definiendo la fecha, ubicación y todos los detalles de nuestra próxima convención.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    )
  }

  const steps = [
    { number: 1, title: 'Autenticación', description: 'Inicia sesión o crea tu cuenta' },
    { number: 2, title: 'Inscripción', description: 'Completa tu inscripción' },
  ]

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Header con gradiente - Sticky */}
        <LinearGradient
          colors={['rgba(34, 197, 94, 0.15)', 'rgba(59, 130, 246, 0.1)', 'transparent']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.logoHeaderContainer}>
              <Image
                source={require('../../../assets/images/amvamovil.png')}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.headerContent}>
              <CalendarIcon size={28} color="#22c55e" />
              <Text style={styles.title}>Inscripción a Convención</Text>
            </View>
            <Text style={styles.subtitle}>Asociación Misionera Vida Abundante</Text>
          </View>
        </LinearGradient>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={true}
        >
          {/* Progress Steps - Mejorado */}
          <View style={styles.stepsContainer}>
          {/* Barra de progreso horizontal */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
          
          {/* Steps horizontales */}
          <View style={styles.stepsHorizontal}>
            {steps.map((step, index) => {
              const isCompleted = step.number < currentStep
              const isActive = step.number === currentStep
              const isAccessible = step.number <= currentStep || inscripcionCompleta
              
              return (
                <View key={step.number} style={styles.stepHorizontalItem}>
                  <TouchableOpacity
                    style={[
                      styles.stepCircleHorizontal,
                      isCompleted && styles.stepCircleCompleted,
                      isActive && styles.stepCircleActive,
                      !isAccessible && styles.stepCircleDisabled,
                    ]}
                    disabled={!isAccessible}
                    activeOpacity={0.7}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={20} color="#fff" />
                    ) : (
                      <Text
                        style={[
                          styles.stepNumberHorizontal,
                          isActive && styles.stepNumberActive,
                        ]}
                      >
                        {step.number}
                      </Text>
                    )}
                  </TouchableOpacity>
                  <View style={styles.stepTextContainerHorizontal}>
                    <Text
                      style={[
                        styles.stepTitleHorizontal,
                        (isCompleted || isActive) && styles.stepTitleActive,
                      ]}
                      numberOfLines={1}
                    >
                      {step.title}
                    </Text>
                  </View>
                </View>
              )
            })}
          </View>
        </View>

        {/* Content con animaciones */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {currentStep === 1 && (
            <Step1Auth
              onComplete={userData => handleStepComplete(1, userData)}
              onBack={handleBack}
            />
          )}

          {currentStep === 2 && convencion && invitado && (
            <Step2UnifiedForm
              convencion={convencion}
              invitado={invitado}
              yaInscrito={yaInscrito}
              inscripcionExistente={inscripcionExistente}
              onComplete={() => handleStepComplete(2)}
              onBack={handleBack}
            />
          )}
        </Animated.View>
        </ScrollView>
      </View>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  headerGradient: {
    padding: 12,
    paddingTop: 8,
    paddingBottom: 12,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    overflow: 'hidden',
    zIndex: 10,
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
    alignItems: 'center',
    width: '100%',
  },
  logoHeaderContainer: {
    width: 140,
    height: 45,
    marginBottom: 12,
    alignSelf: 'center',
  },
  headerLogo: {
    width: '100%',
    height: '100%',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    textAlign: 'center',
  },
  stepsContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 2,
  },
  stepsHorizontal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stepHorizontalItem: {
    flex: 1,
    alignItems: 'center',
    maxWidth: (SCREEN_WIDTH - 32) / 2,
  },
  stepCircleHorizontal: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleCompleted: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  stepCircleActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
    borderWidth: 3,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  stepCircleDisabled: {
    opacity: 0.4,
  },
  stepNumberHorizontal: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    fontWeight: '700',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepTextContainerHorizontal: {
    width: '100%',
    alignItems: 'center',
  },
  stepTitleHorizontal: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
  },
  stepTitleActive: {
    color: '#fff',
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  emptyContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 40,
  },
  comingSoonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  comingSoonCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  comingSoonGradientHeader: {
    height: 4,
    width: '100%',
  },
  comingSoonContent: {
    padding: 24,
    alignItems: 'center',
  },
  comingSoonIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  comingSoonTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  comingSoonSubtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 16,
    textAlign: 'center',
  },
  comingSoonDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  comingSoonInfoContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  comingSoonInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  comingSoonInfoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    flex: 1,
  },
  comingSoonFooter: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 20,
  },
})
