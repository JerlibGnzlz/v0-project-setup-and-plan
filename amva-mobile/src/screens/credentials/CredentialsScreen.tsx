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
  Modal,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { CreditCard, AlertCircle, RefreshCw, Info, Plus, CheckCircle2 } from 'lucide-react-native'
import { useQueryClient } from '@tanstack/react-query'
import { useMisCredenciales } from '@hooks/use-credenciales'
import { useInvitadoAuth } from '@hooks/useInvitadoAuth'
import { useAuth } from '@hooks/useAuth'
import { solicitudesCredencialesApi, EstadoSolicitud, TipoCredencial } from '@api/solicitudes-credenciales'
import { useMisSolicitudes } from '@hooks/use-solicitudes-credenciales'
import * as ScreenOrientation from 'expo-screen-orientation'
import { CredentialsWizard } from '@components/credentials/CredentialsWizard'
import { SolicitudesList } from '@components/credentials/SolicitudesList'
import { SolicitarCredencialModal } from '@components/credentials/SolicitarCredencialModal'
import { handleNetworkError } from '@utils/errorHandler'

export function CredentialsScreen() {
  const queryClient = useQueryClient()
  const { invitado, isAuthenticated: isInvitadoAuthenticated } = useInvitadoAuth()
  const { pastor } = useAuth()
  const { data, isLoading, error, refetch, isRefetching } = useMisCredenciales()

  // Refetch cuando la app vuelve a estar activa (ej. volver de segundo plano)
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

  // Invalidar caché y refetch para que tipo de pastor y demás cambios de AMVA Digital se vean al instante
  const refreshCredenciales = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['credenciales', 'mis-credenciales'] })
    refetch()
  }, [queryClient, refetch])

  // Al enfocar Credenciales: refrescar datos y permitir rotación (portrait + landscape)
  useFocusEffect(
    React.useCallback(() => {
      refreshCredenciales()
      ScreenOrientation.unlockAsync().catch(() => {})
      return () => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {})
      }
    }, [refreshCredenciales])
  )

  const isPastorAuthenticated = pastor !== null

  const [currentStep, setCurrentStep] = useState(1)
  const [currentCredencialIndex, setCurrentCredencialIndex] = useState(0)
  const fadeAnim = React.useRef(new Animated.Value(1)).current

  // Usar React Query para obtener solicitudes (se actualiza automáticamente con WebSocket)
  const { data: solicitudes = [], refetch: refetchSolicitudes } = useMisSolicitudes()
  const [showSolicitarModal, setShowSolicitarModal] = useState(false)
  const [showSolicitudGuardadaModal, setShowSolicitudGuardadaModal] = useState(false)
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

  const hasSolicitudCompletada = useMemo(
    () => solicitudes.some(s => s.estado === EstadoSolicitud.COMPLETADA),
    [solicitudes]
  )

  const tieneMinisterial = useMemo(
    () => credencialesList.some(c => c.tipo === 'ministerial'),
    [credencialesList]
  )
  const tieneCapellania = useMemo(
    () => credencialesList.some(c => c.tipo === 'capellania'),
    [credencialesList]
  )
  const tieneAmbasCredenciales = tieneMinisterial && tieneCapellania
  const showSolicitudesSection =
    solicitudes.length > 0 || tieneMinisterial || tieneCapellania

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
    tipoPastor?: string
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
        tipoPastor: formData.tipoPastor,
        nacionalidad: formData.nacionalidad,
        fechaNacimiento: formData.fechaNacimiento,
        motivo: formData.motivo,
      })

      // Actualizar listas antes de cerrar para que se vea la nueva solicitud guardada
      queryClient.invalidateQueries({ queryKey: ['solicitudes-credenciales', 'mis-solicitudes'] })
      queryClient.invalidateQueries({ queryKey: ['credenciales', 'mis-credenciales'] })
      await Promise.all([refetchSolicitudes(), refetch()])
      setShowSolicitarModal(false)
      setShowSolicitudGuardadaModal(true)
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
          <RefreshControl refreshing={isRefetching} onRefresh={refreshCredenciales} tintColor="#22c55e" />
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

        {/* Banner cuando hay error pero tenemos datos en caché: mantener la info visible */}
        {error && !isLoading && data && credencialesList.length > 0 && (
          <TouchableOpacity
            style={styles.errorBanner}
            onPress={refreshCredenciales}
            activeOpacity={0.9}
          >
            <AlertCircle size={20} color="#fbbf24" />
            <View style={styles.errorBannerContent}>
              <Text style={styles.errorBannerTitle}>No se pudo actualizar</Text>
              <Text style={styles.errorBannerText}>
                Se muestran tus credenciales guardadas. Toca para reintentar o cierra sesión en Perfil y vuelve a entrar.
              </Text>
            </View>
            <RefreshCw size={20} color="#fbbf24" />
          </TouchableOpacity>
        )}

        {/* Error State completo: solo cuando no hay datos previos para mostrar */}
        {error && !isLoading && (!data || credencialesList.length === 0) && (
          <View style={styles.errorContainer}>
            <AlertCircle size={48} color="#ef4444" />
            <Text style={styles.errorTitle}>Error al cargar credenciales</Text>
            <Text style={styles.errorText}>
              {(() => {
                const msg = error instanceof Error ? error.message : 'Error desconocido'
                if (msg.includes('401') || msg.includes('Unauthorized') || msg.includes('No autorizado')) {
                  return 'Sesión expirada o no autorizada.'
                }
                return msg
              })()}
            </Text>
            {(error instanceof Error && (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('No autorizado'))) ||
            (typeof (error as { message?: string })?.message === 'string' &&
              ((error as { message: string }).message.includes('401') ||
                (error as { message: string }).message.includes('Unauthorized'))) ? (
              <>
                <Text style={styles.errorHint}>
                  Tu sesión pudo haber expirado. Cierra sesión en Perfil y vuelve a iniciar con el mismo correo para ver tu credencial.
                </Text>
                {!isInvitadoAuthenticated && !isPastorAuthenticated ? (
                  <Text style={[styles.errorHint, { marginTop: 8 }]}>
                    Si aún no has iniciado sesión, ve a Perfil e inicia sesión con Google.
                  </Text>
                ) : null}
              </>
            ) : null}
            <TouchableOpacity style={styles.retryButton} onPress={refreshCredenciales}>
              <RefreshCw size={20} color="#fff" />
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Aviso: solicitud completada pero credencial no visible */}
        {!isLoading &&
          !error &&
          hasSolicitudCompletada &&
          (!data?.tieneCredenciales || credencialesList.length === 0) && (
            <View style={styles.completadaHintBox}>
              <Info size={22} color="#3b82f6" />
              <View style={styles.completadaHintContent}>
                <Text style={styles.completadaHintTitle}>Solicitud completada</Text>
                <Text style={styles.completadaHintText}>
                  Tu solicitud está completada. Si no ves tu credencial arriba, desliza hacia abajo para actualizar o cierra sesión y vuelve a iniciar con el mismo correo.
                </Text>
                <TouchableOpacity
                  style={styles.actualizarButton}
                  onPress={refreshCredenciales}
                  disabled={isRefetching}
                >
                  <RefreshCw size={18} color="#fff" />
                  <Text style={styles.actualizarButtonText}>
                    {isRefetching ? 'Actualizando...' : 'Actualizar credenciales'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        {/* Mensaje del backend cuando no hay credenciales (ej. indicación de email) */}
        {!isLoading &&
          !error &&
          (!data?.tieneCredenciales || credencialesList.length === 0) &&
          data?.mensaje &&
          typeof data.mensaje === 'string' && (
            <View style={styles.backendMensajeBox}>
              <Info size={18} color="#3b82f6" />
              <Text style={styles.backendMensajeText}>{data.mensaje}</Text>
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
                        ? 'Para obtener tu credencial digital debes solicitarla: usa el botón "Solicitar Mi Credencial" y completa el formulario. Un administrador la aprobará y podrás verla aquí.'
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

        {/* Credenciales encontradas (se muestran también con error si hay datos en caché) */}
        {!isLoading && data?.tieneCredenciales && credencialesList.length > 0 && data?.resumen && (
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

        {/* Lista de Solicitudes y botón Nueva Solicitud (visible si hay solicitudes o si ya tiene al menos una credencial) */}
        {isInvitadoAuthenticated && invitado && showSolicitudesSection && (
          <SolicitudesList
            solicitudes={solicitudes}
            onSolicitarPress={() => setShowSolicitarModal(true)}
            getEstadoSolicitudColor={getEstadoSolicitudColor}
            getEstadoSolicitudLabel={getEstadoSolicitudLabel}
            formatDate={formatDate}
            nuevaSolicitudDisabled={tieneAmbasCredenciales}
          />
        )}

      </ScrollView>

      {/* Modal de éxito: solicitud guardada (estilo acorde al resto de la app) */}
      <Modal
        visible={showSolicitudGuardadaModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSolicitudGuardadaModal(false)}
      >
        <TouchableOpacity
          style={styles.successModalOverlay}
          activeOpacity={1}
          onPress={() => setShowSolicitudGuardadaModal(false)}
        >
          <TouchableOpacity
            style={styles.successModalCard}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={styles.successModalIconWrap}>
              <CheckCircle2 size={48} color="#22c55e" />
            </View>
            <Text style={styles.successModalTitle}>Solicitud guardada</Text>
            <Text style={styles.successModalMessage}>
              Tu solicitud de credencial se ha enviado correctamente. Recibirás una notificación
              cuando sea procesada.
            </Text>
            <TouchableOpacity
              style={styles.successModalButton}
              onPress={() => setShowSolicitudGuardadaModal(false)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#22c55e', '#16a34a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.successModalButtonGradient}
              >
                <Text style={styles.successModalButtonText}>Entendido</Text>
              </LinearGradient>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Modal para Solicitar Credencial - Fuera del ScrollView para mejor renderizado */}
      <SolicitarCredencialModal
        visible={showSolicitarModal}
        onClose={() => setShowSolicitarModal(false)}
        onSubmit={handleSolicitarCredencial}
        invitado={invitado}
        loading={solicitandoCredencial}
        tieneMinisterial={tieneMinisterial}
        tieneCapellania={tieneCapellania}
      />
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
  errorHint: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderColor: 'rgba(251, 191, 36, 0.35)',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    gap: 12,
  },
  errorBannerContent: {
    flex: 1,
  },
  errorBannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fbbf24',
    marginBottom: 2,
  },
  errorBannerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
  },
  completadaHintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.4)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  completadaHintContent: {
    flex: 1,
  },
  completadaHintTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#93c5fd',
    marginBottom: 6,
  },
  completadaHintText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 19,
    marginBottom: 12,
  },
  actualizarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  actualizarButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  backendMensajeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderColor: 'rgba(59, 130, 246, 0.35)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  backendMensajeText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 19,
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
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.25)',
    alignItems: 'center',
  },
  successModalIconWrap: {
    marginBottom: 16,
  },
  successModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  successModalMessage: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  successModalButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  successModalButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
})

