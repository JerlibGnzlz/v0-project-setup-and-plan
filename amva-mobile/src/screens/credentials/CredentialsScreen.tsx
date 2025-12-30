import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  RefreshControl,
  AppState,
  AppStateStatus,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { CreditCard, AlertCircle, RefreshCw, Info, Plus } from 'lucide-react-native'
import { useMisCredenciales } from '@hooks/use-credenciales'
import { useInvitadoAuth } from '@hooks/useInvitadoAuth'
import { useAuth } from '@hooks/useAuth'
import { solicitudesCredencialesApi, EstadoSolicitud, TipoCredencial } from '@api/solicitudes-credenciales'
import { useMisSolicitudes } from '@hooks/use-solicitudes-credenciales'
import { CredentialsWizard } from '@components/credentials/CredentialsWizard'
import { SolicitudesList } from '@components/credentials/SolicitudesList'
import { SolicitarCredencialModal } from '@components/credentials/SolicitarCredencialModal'
import { handleNetworkError } from '@utils/errorHandler'

export function CredentialsScreen() {
  const { invitado, isAuthenticated: isInvitadoAuthenticated } = useInvitadoAuth()
  const { pastor } = useAuth()
  const { data, isLoading, error, refetch, isRefetching } = useMisCredenciales()

  // Refetch automático cuando la app vuelve a estar activa
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
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
  const { data: solicitudes = [], refetch: refetchSolicitudes } = useMisSolicitudes()
  const [showSolicitarModal, setShowSolicitarModal] = useState(false)
  const [solicitandoCredencial, setSolicitandoCredencial] = useState(false)

  // Refetch automático cuando la app vuelve a estar activa (para solicitudes también)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active' && isInvitadoAuthenticated) {
        refetchSolicitudes()
      }
    })
    return () => subscription.remove()
  }, [isInvitadoAuthenticated, refetchSolicitudes])

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

  const handleReset = () => {
    setCurrentStep(1)
    setCurrentCredencialIndex(0)
  }

  // Resetear wizard cuando cambian las credenciales
  useEffect(() => {
    if (credencialesList.length > 0) {
      setCurrentStep(1)
      setCurrentCredencialIndex(0)
    }
  }, [credencialesList.length])

  const handleSolicitarCredencial = async (formData: {
    tipo: TipoCredencial
    dni: string
    nombre: string
    apellido: string
    nacionalidad?: string
    fechaNacimiento?: string
    motivo?: string
  }) => {
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

      await solicitudesCredencialesApi.create({
        tipo: formData.tipo,
        dni: formData.dni,
        nombre: formData.nombre,
        apellido: formData.apellido,
        nacionalidad: formData.nacionalidad,
        fechaNacimiento: formData.fechaNacimiento,
        motivo: formData.motivo,
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
      const errorMessage = handleNetworkError(error)
      Alert.alert('Error', errorMessage)
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
        {!isLoading && !error && data?.tieneCredenciales && credencialesList.length > 0 && data?.resumen && (
          <CredentialsWizard
            currentStep={currentStep}
            totalSteps={totalSteps}
            credencialesList={credencialesList}
            currentCredencialIndex={currentCredencialIndex}
            resumen={data.resumen}
            fadeAnim={fadeAnim}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onReset={handleReset}
          />
        )}

        {/* Lista de Solicitudes */}
        {isInvitadoAuthenticated && invitado && solicitudes.length > 0 && (
          <SolicitudesList
            solicitudes={solicitudes}
            onSolicitarPress={() => setShowSolicitarModal(true)}
            getEstadoSolicitudColor={getEstadoSolicitudColor}
            getEstadoSolicitudLabel={getEstadoSolicitudLabel}
            formatDate={formatDate}
          />
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
        <SolicitarCredencialModal
          visible={showSolicitarModal}
          onClose={() => setShowSolicitarModal(false)}
          onSubmit={handleSolicitarCredencial}
          invitado={invitado}
          loading={solicitandoCredencial}
        />
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
    fontWeight: '600',
    color: '#ef4444',
  },
  errorText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    marginTop: 24,
  },
  defaultCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    marginBottom: 16,
  },
  cardGradient: {
    padding: 20,
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
  solicitarContainer: {
    marginTop: 24,
  },
  solicitarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  solicitarButtonText: {
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

