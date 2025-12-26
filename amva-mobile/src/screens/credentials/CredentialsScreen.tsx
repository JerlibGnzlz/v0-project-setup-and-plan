import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  RefreshControl,
  Platform,
  AppState,
  AppStateStatus,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  Search,
  ChevronRight,
  ChevronLeft,
  FileText,
  X,
  Plus,
  RefreshCw,
  Info,
} from 'lucide-react-native'
import { useMisCredenciales, getEstadoColor, getEstadoMensaje, getCredencialTipoLegible, getCredencialIdentificador } from '@hooks/use-credenciales'
import { useInvitadoAuth } from '@hooks/useInvitadoAuth'
import { useAuth } from '@hooks/useAuth'
import { solicitudesCredencialesApi, type SolicitudCredencial, TipoCredencial, EstadoSolicitud } from '@api/solicitudes-credenciales'
import { useMisSolicitudes } from '@hooks/use-solicitudes-credenciales'
import type { CredencialUnificada } from '@api/credenciales'
import { CredencialFlipCard } from '@components/CredencialFlipCard'

export function CredentialsScreen() {
  const { invitado, isAuthenticated: isInvitadoAuthenticated } = useInvitadoAuth()
  const { pastor } = useAuth()
  const { data, isLoading, error, refetch, isRefetching } = useMisCredenciales()

  // Refetch automático cuando la app vuelve a estar activa
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('🔄 App activa, refetch de credenciales...')
        refetch()
      }
    })

    return () => {
      subscription.remove()
    }
  }, [refetch])

  const isPastorAuthenticated = pastor !== null

  const [currentStep, setCurrentStep] = useState(1)
  const [currentCredencialIndex, setCurrentCredencialIndex] = useState(0)
  const fadeAnim = React.useRef(new Animated.Value(1)).current
  
  // Usar React Query para obtener solicitudes (se actualiza automáticamente con WebSocket)
  const { data: solicitudes = [], isLoading: loadingSolicitudes, refetch: refetchSolicitudes } = useMisSolicitudes()
  const [showSolicitarModal, setShowSolicitarModal] = useState(false)
  const [solicitandoCredencial, setSolicitandoCredencial] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [fechaNacimientoDate, setFechaNacimientoDate] = useState<Date | null>(null)
  const [formSolicitud, setFormSolicitud] = useState({
    tipo: TipoCredencial.MINISTERIAL as TipoCredencial,
    dni: '',
    nombre: '',
    apellido: '',
    nacionalidad: '',
    fechaNacimiento: '',
    motivo: '',
  })

  const isAuthenticated = isInvitadoAuthenticated || isPastorAuthenticated

  // Refetch automático cuando la app vuelve a estar activa (para solicitudes también)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active' && isInvitadoAuthenticated) {
        console.log('🔄 App activa, refetch de solicitudes...')
        refetchSolicitudes()
      }
    })
    return () => subscription.remove()
  }, [isInvitadoAuthenticated, refetchSolicitudes])

  // Pre-llenar formulario de solicitud con datos del invitado
  useEffect(() => {
    if (isInvitadoAuthenticated && invitado && !formSolicitud.dni) {
      setFormSolicitud(prev => ({
        ...prev,
        dni: prev.dni || '',
        nombre: prev.nombre || invitado.nombre || '',
        apellido: prev.apellido || invitado.apellido || '',
      }))
    }
  }, [isInvitadoAuthenticated, invitado])

  const getEstadoIcon = (estado: 'vigente' | 'por_vencer' | 'vencida') => {
    switch (estado) {
      case 'vigente':
        return CheckCircle
      case 'por_vencer':
        return Clock
      case 'vencida':
        return AlertCircle
      default:
        return CreditCard
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  // Normalizar credenciales a lista para navegación
  const credencialesList = useMemo(() => {
    return data?.credenciales || []
  }, [data?.credenciales])

  const totalSteps = credencialesList.length > 0 ? credencialesList.length + 1 : 1 // +1 para el paso de resumen

  const handleNext = () => {
    if (currentStep < totalSteps) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
      setCurrentStep(prev => prev + 1)
      if (currentStep > 1) {
        setCurrentCredencialIndex(prev => prev + 1)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
      setCurrentStep(prev => prev - 1)
      if (currentStep > 2) {
        setCurrentCredencialIndex(prev => prev - 1)
      }
    }
  }

  // Resetear wizard cuando cambian las credenciales
  useEffect(() => {
    if (credencialesList.length > 0) {
      setCurrentStep(1)
      setCurrentCredencialIndex(0)
    }
  }, [credencialesList.length])

  const handleDateChange = (event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
    }

    if (selectedDate) {
      setFechaNacimientoDate(selectedDate)
      // Formatear fecha como YYYY-MM-DD
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      const fechaFormateada = `${year}-${month}-${day}`
      setFormSolicitud(prev => ({ ...prev, fechaNacimiento: fechaFormateada }))
    }
  }

  const handleSolicitarCredencial = async () => {
    // Validar campos requeridos
    if (!formSolicitud.dni.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa tu número de documento (DNI)')
      return
    }
    if (!formSolicitud.nombre.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa tu nombre')
      return
    }
    if (!formSolicitud.apellido.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa tu apellido')
      return
    }

    // Verificar autenticación antes de enviar
    if (!isInvitadoAuthenticated) {
      Alert.alert(
        'Autenticación requerida',
        'Debes estar autenticado como invitado para solicitar una credencial. Por favor, inicia sesión.'
      )
      return
    }

    setSolicitandoCredencial(true)
    try {
      console.log('📤 Enviando solicitud de credencial...')
      console.log('🔍 Usuario autenticado:', isInvitadoAuthenticated)
      console.log('🔍 Invitado:', invitado?.email)
      
      await solicitudesCredencialesApi.create({
        tipo: formSolicitud.tipo,
        dni: formSolicitud.dni.trim(),
        nombre: formSolicitud.nombre.trim(),
        apellido: formSolicitud.apellido.trim(),
        nacionalidad: formSolicitud.nacionalidad.trim() || undefined,
        fechaNacimiento: formSolicitud.fechaNacimiento.trim() || undefined,
        motivo: formSolicitud.motivo.trim() || undefined,
      })

      Alert.alert(
        'Solicitud Enviada',
        'Tu solicitud de credencial ha sido enviada exitosamente. Recibirás una notificación cuando sea procesada.',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowSolicitarModal(false)
              // Recargar solicitudes y credenciales
              refetchSolicitudes()
              refetch()
            },
          },
        ]
      )
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ Error solicitando credencial:', errorMessage)

      let mensajeUsuario = 'No se pudo enviar la solicitud'
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; statusText?: string; data?: unknown } }
        if (axiosError.response?.status === 404) {
          mensajeUsuario =
            'El endpoint de solicitudes no está disponible.\n\n' +
            'Esto puede deberse a:\n' +
            '• El backend no está desplegado con los últimos cambios\n' +
            '• El servicio está en mantenimiento\n\n' +
            'Por favor, contacta al administrador o intenta más tarde.'
        } else if (axiosError.response?.status === 401) {
          mensajeUsuario = 'No estás autenticado. Por favor, inicia sesión nuevamente.'
        } else if (axiosError.response?.status === 400) {
          mensajeUsuario = 'Datos inválidos. Verifica que todos los campos requeridos estén completos.'
        } else {
          mensajeUsuario = `Error ${axiosError.response?.status}: ${axiosError.response?.statusText || errorMessage}`
        }
      } else {
        mensajeUsuario = `Error: ${errorMessage}`
      }

      Alert.alert('Error', mensajeUsuario)
    } finally {
      setSolicitandoCredencial(false)
    }
  }

  const getEstadoSolicitudColor = (estado: EstadoSolicitud) => {
    switch (estado) {
      case EstadoSolicitud.PENDIENTE:
        return '#f59e0b'
      case EstadoSolicitud.APROBADA:
        return '#22c55e'
      case EstadoSolicitud.RECHAZADA:
        return '#ef4444'
      case EstadoSolicitud.COMPLETADA:
        return '#22c55e'
      default:
        return '#64748b'
    }
  }

  const getEstadoSolicitudLabel = (estado: EstadoSolicitud) => {
    switch (estado) {
      case EstadoSolicitud.PENDIENTE:
        return 'Pendiente'
      case EstadoSolicitud.APROBADA:
        return 'Aprobada'
      case EstadoSolicitud.RECHAZADA:
        return 'Rechazada'
      case EstadoSolicitud.COMPLETADA:
        return 'Completada'
      default:
        return estado
    }
  }

  // Renderizar paso de resumen
  const renderResumenStep = () => {
    if (!data?.resumen) return null

    const { total, vigentes, porVencer, vencidas } = data.resumen

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.wizardStepContainer}>
          <View style={styles.resumenCard}>
            <View style={styles.resumenHeader}>
              <CreditCard size={32} color="#22c55e" />
              <Text style={styles.resumenTitle}>Resumen de Credenciales</Text>
            </View>

            <View style={styles.resumenStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#22c55e' }]}>{vigentes}</Text>
                <Text style={styles.statLabel}>Vigentes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#f59e0b' }]}>{porVencer}</Text>
                <Text style={styles.statLabel}>Por Vencer</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#ef4444' }]}>{vencidas}</Text>
                <Text style={styles.statLabel}>Vencidas</Text>
              </View>
            </View>

            <View style={styles.resumenBreakdown}>
              {credencialesList
                .filter(c => c.tipo === 'pastoral')
                .length > 0 && (
                <View style={styles.breakdownItem}>
                  <View style={styles.breakdownIconContainer}>
                    <CreditCard size={20} color="#22c55e" />
                  </View>
                  <View style={styles.breakdownContent}>
                    <Text style={styles.breakdownTitle}>Credenciales Pastorales</Text>
                    <Text style={styles.breakdownValue}>
                      {credencialesList.filter(c => c.tipo === 'pastoral').length} encontrada
                      {credencialesList.filter(c => c.tipo === 'pastoral').length > 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
              )}

              {credencialesList.filter(c => c.tipo === 'ministerial').length > 0 && (
                <View style={styles.breakdownItem}>
                  <View style={styles.breakdownIconContainer}>
                    <CreditCard size={20} color="#3b82f6" />
                  </View>
                  <View style={styles.breakdownContent}>
                    <Text style={styles.breakdownTitle}>Credenciales Ministeriales</Text>
                    <Text style={styles.breakdownValue}>
                      {credencialesList.filter(c => c.tipo === 'ministerial').length} encontrada
                      {credencialesList.filter(c => c.tipo === 'ministerial').length > 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
              )}

              {credencialesList.filter(c => c.tipo === 'capellania').length > 0 && (
                <View style={styles.breakdownItem}>
                  <View style={styles.breakdownIconContainer}>
                    <CreditCard size={20} color="#8b5cf6" />
                  </View>
                  <View style={styles.breakdownContent}>
                    <Text style={styles.breakdownTitle}>Credenciales de Capellanía</Text>
                    <Text style={styles.breakdownValue}>
                      {credencialesList.filter(c => c.tipo === 'capellania').length} encontrada
                      {credencialesList.filter(c => c.tipo === 'capellania').length > 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    )
  }

  const renderCredencialCard = (credencial: CredencialUnificada) => {
    return (
      <View key={credencial.id} style={styles.credentialCardWrapper}>
        <CredencialFlipCard credencial={credencial} />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#22c55e" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoHeaderContainer}>
            <Image
              source={require('../../../assets/images/amvamovil.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Mis Credenciales</Text>
          <Text style={styles.subtitle}>
            {isPastorAuthenticated && pastor
              ? 'Tus credenciales pastorales'
              : isInvitadoAuthenticated && invitado
                ? 'Tus credenciales ministeriales y de capellanía'
                : 'Consulta el estado de tus credenciales'}
          </Text>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#22c55e" />
            <Text style={styles.loadingText}>Cargando credenciales...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <View style={styles.errorContainer}>
            <AlertCircle size={48} color="#ef4444" />
            <Text style={styles.errorTitle}>Error al cargar credenciales</Text>
            <Text style={styles.errorText}>
              {error instanceof Error ? error.message : 'Error desconocido'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
              <RefreshCw size={20} color="#fff" />
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State - Sin credenciales */}
        {!isLoading &&
          !error &&
          (!data?.tieneCredenciales || credencialesList.length === 0) && (
            <View style={styles.emptyContainer}>
              {/* Tarjeta por defecto cuando no hay credenciales */}
              <View style={styles.defaultCard}>
                <LinearGradient
                  colors={['rgba(34, 197, 94, 0.2)', 'rgba(15, 23, 42, 0.8)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <View style={styles.defaultCardHeader}>
                    <View style={styles.defaultCardIconContainer}>
                      <CreditCard size={32} color="#22c55e" />
                    </View>
                    <View style={styles.defaultCardTitleContainer}>
                      <Text style={styles.defaultCardTitle}>Credencial Digital</Text>
                      <Text style={styles.defaultCardSubtitle}>Ministerio AMVA</Text>
                    </View>
                  </View>

                  <View style={styles.defaultCardContent}>
                    <View style={styles.defaultCardInfo}>
                      <Text style={styles.defaultCardLabel}>Estado</Text>
                      <View style={styles.defaultCardBadge}>
                        <Text style={styles.defaultCardBadgeText}>No Disponible</Text>
                      </View>
                    </View>
                    <View style={styles.defaultCardInfo}>
                      <Text style={styles.defaultCardLabel}>Tipo</Text>
                      <Text style={styles.defaultCardValue}>Ministerial / Capellanía</Text>
                    </View>
                    <View style={styles.defaultCardDivider} />
                    <Text style={styles.defaultCardMessage}>
                      {isInvitadoAuthenticated
                        ? 'No tienes credenciales activas asociadas a tu cuenta.\n\nSolicita tu credencial digital completando el formulario a continuación.'
                        : 'No se encontraron credenciales registradas para tu cuenta.'}
              </Text>
                  </View>
                </LinearGradient>
              </View>

              {/* Botón prominente para solicitar credencial */}
              {isInvitadoAuthenticated && (
                <TouchableOpacity
                  style={styles.solicitarButtonLarge}
                  onPress={() => setShowSolicitarModal(true)}
                >
                  <LinearGradient
                    colors={['#22c55e', '#16a34a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.solicitarButtonGradient}
                  >
                    <Plus size={24} color="#fff" />
                    <Text style={styles.solicitarButtonLargeText}>Solicitar Mi Credencial</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {/* Información adicional */}
              {isInvitadoAuthenticated && (
                <View style={styles.infoBox}>
                  <View style={styles.infoBoxHeader}>
                    <Info size={20} color="#3b82f6" />
                    <Text style={styles.infoBoxTitle}>¿Cómo funciona?</Text>
                  </View>
                  <Text style={styles.infoBoxText}>
                    1. Completa el formulario con tus datos{'\n'}
                    2. Espera la aprobación del administrador{'\n'}
                    3. Recibirás una notificación cuando tu credencial esté lista{'\n'}
                    4. Podrás ver tu credencial digital en esta pantalla
                  </Text>
                </View>
              )}
            </View>
          )}

        {/* Credenciales encontradas */}
        {!isLoading && !error && data?.tieneCredenciales && credencialesList.length > 0 && (
          <>
            {/* Progress Steps */}
            <View style={styles.stepsContainer}>
              {Array.from({ length: totalSteps }).map((_, index) => {
                const stepNumber = index + 1
                const isCompleted = stepNumber < currentStep
                const isActive = stepNumber === currentStep

                return (
                  <View key={stepNumber} style={styles.stepRow}>
                    <View style={styles.stepItem}>
                      <View
                        style={[
                          styles.stepCircle,
                          isCompleted && styles.stepCircleCompleted,
                          isActive && styles.stepCircleActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.stepNumber,
                            isCompleted && styles.stepNumberCompleted,
                            isActive && styles.stepNumberActive,
                          ]}
                        >
                          {isCompleted ? '✓' : stepNumber}
                        </Text>
                      </View>
                      <View style={styles.stepTextContainer}>
                        <Text
                          style={[styles.stepTitle, (isCompleted || isActive) && styles.stepTitleActive]}
                        >
                          {stepNumber === 1 ? 'Resumen' : `Credencial ${stepNumber - 1}`}
                        </Text>
                        <Text style={styles.stepDescription}>
                          {stepNumber === 1
                            ? 'Resumen de credenciales'
                            : getCredencialTipoLegible(credencialesList[stepNumber - 2]?.tipo)}
                        </Text>
                      </View>
                    </View>
                    {index < totalSteps - 1 && (
                      <View style={[styles.stepLine, isCompleted && styles.stepLineCompleted]} />
                    )}
                  </View>
                )
              })}
            </View>

            {/* Wizard Content */}
            <Animated.View style={[styles.wizardContent, { opacity: fadeAnim }]}>
              {currentStep === 1 && renderResumenStep()}

              {currentStep > 1 && currentCredencialIndex < credencialesList.length && (
                <View style={styles.wizardStepContainer}>
                  {renderCredencialCard(credencialesList[currentCredencialIndex])}
                </View>
              )}
            </Animated.View>

            {/* Navigation Buttons */}
            <View style={styles.navigationContainer}>
              {currentStep > 1 && (
                <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
                  <ChevronLeft size={20} color="#fff" />
                  <Text style={styles.navButtonText}>Anterior</Text>
                </TouchableOpacity>
              )}

              {currentStep < totalSteps && (
                <TouchableOpacity style={[styles.navButton, styles.navButtonPrimary]} onPress={handleNext}>
                  <Text style={styles.navButtonText}>Siguiente</Text>
                  <ChevronRight size={20} color="#fff" />
                </TouchableOpacity>
              )}

              {currentStep === totalSteps && (
                <TouchableOpacity
                  style={[styles.navButton, styles.navButtonPrimary]}
                  onPress={() => {
                    setCurrentStep(1)
                    setCurrentCredencialIndex(0)
                  }}
                >
                  <Text style={styles.navButtonText}>Volver al Inicio</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        {/* Lista de Solicitudes */}
        {isInvitadoAuthenticated && invitado && solicitudes.length > 0 && (
          <View style={styles.solicitudesContainer}>
            <Text style={styles.solicitudesTitle}>Mis Solicitudes</Text>
            {solicitudes.map(solicitud => {
              const estadoColor = getEstadoSolicitudColor(solicitud.estado)
              return (
                <View key={solicitud.id} style={styles.solicitudCard}>
                  <LinearGradient
                    colors={[`${estadoColor}15`, 'rgba(15, 23, 42, 0.8)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardGradient}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.cardTitleContainer}>
                        <FileText size={20} color={estadoColor} />
                        <Text style={styles.cardTitle}>
                          Credencial{' '}
                          {solicitud.tipo === TipoCredencial.MINISTERIAL ? 'Ministerial' : 'de Capellanía'}
                        </Text>
                      </View>
                      <View style={[styles.badgeContainer, { backgroundColor: `${estadoColor}20` }]}>
                        <Text style={[styles.badgeText, { color: estadoColor }]}>
                          {getEstadoSolicitudLabel(solicitud.estado)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.cardContent}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>DNI:</Text>
                        <Text style={styles.infoValue}>{solicitud.dni}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Nombre:</Text>
                        <Text style={styles.infoValue}>
                          {solicitud.nombre} {solicitud.apellido}
                        </Text>
                      </View>
                      {solicitud.motivo && (
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Motivo:</Text>
                          <Text style={styles.infoValue}>{solicitud.motivo}</Text>
                        </View>
                      )}
                      {solicitud.observaciones && (
                        <View style={styles.observacionesContainer}>
                          <Text style={styles.observacionesLabel}>Observaciones:</Text>
                          <Text style={styles.observacionesText}>{solicitud.observaciones}</Text>
                        </View>
                      )}
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Fecha de solicitud:</Text>
                        <Text style={styles.infoValue}>{formatDate(solicitud.createdAt)}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              )
            })}
            <TouchableOpacity
              style={styles.solicitarButton}
              onPress={() => setShowSolicitarModal(true)}
            >
              <Plus size={20} color="#fff" />
              <Text style={styles.solicitarButtonText}>Nueva Solicitud</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Botón para solicitar credencial si no tiene ninguna */}
        {isInvitadoAuthenticated &&
          invitado &&
          !isLoading &&
          !error &&
          (!data?.tieneCredenciales || credencialesList.length === 0) &&
          solicitudes.length === 0 && (
            <View style={styles.solicitarContainer}>
              <TouchableOpacity
                style={styles.solicitarButton}
                onPress={() => setShowSolicitarModal(true)}
              >
                <Plus size={20} color="#fff" />
                <Text style={styles.solicitarButtonText}>Solicitar Credencial</Text>
              </TouchableOpacity>
            </View>
          )}

        {/* Modal para Solicitar Credencial */}
        {showSolicitarModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Solicitar Credencial</Text>
                <TouchableOpacity
                  onPress={() => setShowSolicitarModal(false)}
                  style={styles.modalCloseButton}
                >
                  <X size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Tipo de Credencial *</Text>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity
                      style={[
                        styles.radioOption,
                        formSolicitud.tipo === TipoCredencial.MINISTERIAL && styles.radioOptionSelected,
                      ]}
                      onPress={() =>
                        setFormSolicitud(prev => ({ ...prev, tipo: TipoCredencial.MINISTERIAL }))
                      }
                    >
                      <Text
                        style={[
                          styles.radioText,
                          formSolicitud.tipo === TipoCredencial.MINISTERIAL && styles.radioTextSelected,
                        ]}
                      >
                        Ministerial
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.radioOption,
                        formSolicitud.tipo === TipoCredencial.CAPELLANIA && styles.radioOptionSelected,
                      ]}
                      onPress={() =>
                        setFormSolicitud(prev => ({ ...prev, tipo: TipoCredencial.CAPELLANIA }))
                      }
                    >
                      <Text
                        style={[
                          styles.radioText,
                          formSolicitud.tipo === TipoCredencial.CAPELLANIA && styles.radioTextSelected,
                        ]}
                      >
                        Capellanía
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>DNI *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Número de documento"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={formSolicitud.dni}
                    onChangeText={value => setFormSolicitud(prev => ({ ...prev, dni: value }))}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nombre *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Tu nombre"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={formSolicitud.nombre}
                    onChangeText={value => setFormSolicitud(prev => ({ ...prev, nombre: value }))}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Apellido *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Tu apellido"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={formSolicitud.apellido}
                    onChangeText={value => setFormSolicitud(prev => ({ ...prev, apellido: value }))}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nacionalidad</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Ej: Argentina"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={formSolicitud.nacionalidad}
                    onChangeText={value => setFormSolicitud(prev => ({ ...prev, nacionalidad: value }))}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Fecha de Nacimiento</Text>
                  <TouchableOpacity
                    style={styles.dateInputContainer}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <TextInput
                      style={styles.formInput}
                      placeholder="Selecciona tu fecha de nacimiento"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={formSolicitud.fechaNacimiento}
                      editable={false}
                      pointerEvents="none"
                    />
                    <Clock size={20} color="rgba(255, 255, 255, 0.5)" style={styles.dateIcon} />
                  </TouchableOpacity>
                  {showDatePicker && (
                    <>
                      <DateTimePicker
                        value={fechaNacimientoDate || new Date(2000, 0, 1)}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                        minimumDate={new Date(1900, 0, 1)}
                      />
                      {Platform.OS === 'ios' && (
                        <View style={styles.datePickerActions}>
                          <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => {
                              setShowDatePicker(false)
                            }}
                          >
                            <Text style={styles.datePickerButtonText}>Cancelar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.datePickerButton, styles.datePickerButtonPrimary]}
                            onPress={() => {
                              if (fechaNacimientoDate) {
                                handleDateChange(null, fechaNacimientoDate)
                              }
                              setShowDatePicker(false)
                            }}
                          >
                            <Text style={styles.datePickerButtonText}>Seleccionar</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </>
                  )}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Motivo de la Solicitud</Text>
                  <TextInput
                    style={[styles.formInput, styles.formTextArea]}
                    placeholder="Explica el motivo de tu solicitud..."
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={formSolicitud.motivo}
                    onChangeText={value => setFormSolicitud(prev => ({ ...prev, motivo: value }))}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setShowSolicitarModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSubmit]}
                  onPress={handleSolicitarCredencial}
                  disabled={solicitandoCredencial}
                >
                  {solicitandoCredencial ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.modalButtonText}>Enviar Solicitud</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
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
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logoHeaderContainer: {
    width: 160,
    height: 52,
    marginBottom: 16,
  },
  headerLogo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  errorText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
    marginBottom: 24,
  },
  solicitarContainer: {
    marginTop: 24,
  },
  credentialCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  fotoContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  foto: {
    width: 120,
    height: 150,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  observacionesContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  observacionesLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  observacionesText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  wizardStepContainer: {
    marginBottom: 24,
  },
  wizardContent: {
    minHeight: 300,
  },
  resumenCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  resumenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  resumenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  resumenStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resumenBreakdown: {
    gap: 12,
    marginBottom: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  breakdownIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  breakdownContent: {
    flex: 1,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  navigationContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 24,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  navButtonPrimary: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  stepsContainer: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
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
  solicitarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 24,
    gap: 8,
  },
  solicitarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  solicitudesContainer: {
    marginTop: 24,
    gap: 16,
  },
  solicitudesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  solicitudCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalButtonSubmit: {
    backgroundColor: '#22c55e',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
  },
  formTextArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  radioOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  radioOptionSelected: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  radioText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  radioTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  dateInputContainer: {
    position: 'relative',
  },
  dateIcon: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
  datePickerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  datePickerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  datePickerButtonPrimary: {
    backgroundColor: '#22c55e',
  },
  datePickerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  solicitarButtonLarge: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  solicitarButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 12,
  },
  solicitarButtonLargeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  defaultCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    marginBottom: 16,
  },
  defaultCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  defaultCardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultCardTitleContainer: {
    flex: 1,
  },
  defaultCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  defaultCardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  defaultCardContent: {
    padding: 20,
    paddingTop: 0,
  },
  defaultCardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  defaultCardLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  defaultCardValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  defaultCardBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  defaultCardBadgeText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  defaultCardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  defaultCardMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    textAlign: 'center',
  },
  infoBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  infoBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoBoxTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  infoBoxText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
})
