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
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { CreditCard, CheckCircle, AlertCircle, Clock, Search, Badge, ChevronRight, ChevronLeft, FileText, X, Plus } from 'lucide-react-native'
import { credencialesApi, type Credencial } from '@api/credenciales'
import { inscripcionesApi } from '@api/inscripciones'
import { useInvitadoAuth } from '@hooks/useInvitadoAuth'
import { solicitudesCredencialesApi, type SolicitudCredencial, TipoCredencial, EstadoSolicitud } from '@api/solicitudes-credenciales'

export function CredentialsScreen() {
  const { invitado, isAuthenticated: isInvitadoAuthenticated } = useInvitadoAuth()
  const [documento, setDocumento] = useState('')
  const [loading, setLoading] = useState(false)
  const [autoLoading, setAutoLoading] = useState(false)
  const [loadingDni, setLoadingDni] = useState(false)
  const [credenciales, setCredenciales] = useState<{
    ministerial?: Credencial | Credencial[]
    capellania?: Credencial | Credencial[]
  }>({})
  const [currentStep, setCurrentStep] = useState(1)
  const [currentCredencialIndex, setCurrentCredencialIndex] = useState(0)
  const fadeAnim = React.useRef(new Animated.Value(1)).current
  const [solicitudes, setSolicitudes] = useState<SolicitudCredencial[]>([])
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false)
  const [showSolicitarModal, setShowSolicitarModal] = useState(false)
  const [solicitandoCredencial, setSolicitandoCredencial] = useState(false)
  const [formSolicitud, setFormSolicitud] = useState({
    tipo: TipoCredencial.MINISTERIAL as TipoCredencial,
    dni: '',
    nombre: '',
    apellido: '',
    nacionalidad: '',
    fechaNacimiento: '',
    motivo: '',
  })

  // Obtener DNI del invitado desde sus inscripciones
  useEffect(() => {
    let isMounted = true

    const obtenerDniDelInvitado = async () => {
      if (!isInvitadoAuthenticated || !invitado || loadingDni) {
        return
      }

      setLoadingDni(true)
      try {
        console.log('🔍 Obteniendo DNI del invitado desde sus inscripciones...')
        const inscripciones = await inscripcionesApi.getMyInscripciones()

        if (!isMounted) return

        // Buscar el primer DNI válido en las inscripciones
        const dniEncontrado = inscripciones
          .map(insc => insc.dni)
          .find(dni => dni && dni.trim() !== '')

        if (dniEncontrado && !documento) {
          console.log('✅ DNI encontrado en inscripciones:', dniEncontrado)
          setDocumento(dniEncontrado.trim())
        } else if (!dniEncontrado) {
          console.log('⚠️ No se encontró DNI en las inscripciones del invitado')
        }
      } catch (error: unknown) {
        if (!isMounted) return
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.error('❌ Error obteniendo DNI del invitado:', errorMessage)
        // No mostrar alerta, solo loggear
      } finally {
        if (isMounted) {
          setLoadingDni(false)
        }
      }
    }

    void obtenerDniDelInvitado()

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInvitadoAuthenticated, invitado?.id])

  // Buscar automáticamente credenciales si el usuario está autenticado como invitado
  // Solo ejecutar una vez cuando el invitado se autentica, no en cada render
  useEffect(() => {
    let isMounted = true

    const buscarCredencialesAutomaticamente = async () => {
      // Solo buscar si está autenticado, tiene invitado, y no está cargando
      if (!isInvitadoAuthenticated || !invitado || autoLoading) {
        return
      }

      setAutoLoading(true)
      try {
        console.log('🔍 Buscando credenciales automáticamente para invitado:', invitado.email)
        const result = await credencialesApi.obtenerMisCredenciales()

        if (!isMounted) return // Evitar actualizar estado si el componente se desmontó

        console.log('📊 Resultado de búsqueda automática:', {
          tieneMinisterial: !!result.ministerial,
          tieneCapellania: !!result.capellania,
          cantidadMinisterial: result.ministerial?.length || 0,
          cantidadCapellania: result.capellania?.length || 0,
        })

        if (result.ministerial || result.capellania) {
          setCredenciales(result)
          console.log('✅ Credenciales cargadas automáticamente')
        } else {
          console.log('⚠️ No se encontraron credenciales automáticamente')
        }
      } catch (error: unknown) {
        if (!isMounted) return // Evitar actualizar estado si el componente se desmontó

        const errorMessage =
          error instanceof Error ? error.message : 'Error al obtener credenciales'
        console.error('❌ Error obteniendo credenciales automáticamente:', errorMessage)
        if (error instanceof Error && error.stack) {
          console.error('Stack trace:', error.stack)
        }
        // No mostrar alerta, solo loggear el error (el usuario puede buscar manualmente)
      } finally {
        if (isMounted) {
          setAutoLoading(false)
        }
      }
    }

    void buscarCredencialesAutomaticamente()

    return () => {
      isMounted = false
    }
    // Remover autoLoading de las dependencias para evitar loops infinitos
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInvitadoAuthenticated, invitado?.id])

  const handleConsultar = async () => {
    // Si es invitado autenticado, usar el endpoint automático
    if (isInvitadoAuthenticated && invitado) {
      setLoading(true)
      try {
        console.log('🔍 Consultando credenciales para invitado:', invitado.email)
        const result = await credencialesApi.obtenerMisCredenciales()
        console.log('📊 Resultado de consulta:', {
          tieneMinisterial: !!result.ministerial,
          tieneCapellania: !!result.capellania,
          cantidadMinisterial: result.ministerial?.length || 0,
          cantidadCapellania: result.capellania?.length || 0,
        })

        if (result.ministerial || result.capellania) {
          setCredenciales(result)
          console.log('✅ Credenciales encontradas y cargadas')
        } else {
          console.log('⚠️ No se encontraron credenciales')
          Alert.alert(
            'No se encontraron credenciales',
            'No se encontraron credenciales asociadas a tus inscripciones.\n\n' +
            'Posibles causas:\n' +
            '• No has ingresado tu DNI al inscribirte a una convención\n' +
            '• Tu credencial no está registrada en el sistema\n' +
            '• El DNI ingresado no coincide con el de tu credencial\n\n' +
            'Verifica que hayas ingresado tu DNI correctamente al inscribirte.'
          )
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Error al consultar credenciales'
        console.error('❌ Error consultando credenciales:', errorMessage)
        if (error instanceof Error && error.stack) {
          console.error('Stack trace:', error.stack)
        }

        // Mensaje más específico según el tipo de error
        let mensajeUsuario = 'Error al consultar credenciales'
        if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
          mensajeUsuario = 'No estás autenticado. Por favor, inicia sesión nuevamente.'
        } else if (errorMessage.includes('Network')) {
          mensajeUsuario = 'Error de conexión. Verifica tu conexión a internet.'
        } else {
          mensajeUsuario = `Error: ${errorMessage}`
        }

        Alert.alert('Error', mensajeUsuario)
      } finally {
        setLoading(false)
      }
      return
    }

    // Si no es invitado o no está autenticado, usar búsqueda manual por documento
    if (!documento.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa tu número de documento')
      return
    }

    setLoading(true)
    try {
      const result = await credencialesApi.consultarAmbas(documento.trim())
      setCredenciales(result)

      if (!result.ministerial && !result.capellania) {
        Alert.alert(
          'No se encontraron credenciales',
          'No se encontraron credenciales para este documento. Verifica que el número sea correcto.'
        )
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al consultar credenciales'
      Alert.alert('Error', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'vigente':
        return '#22c55e'
      case 'por_vencer':
        return '#f59e0b'
      case 'vencida':
        return '#ef4444'
      default:
        return '#64748b'
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'vigente':
        return CheckCircle
      case 'por_vencer':
        return Clock
      case 'vencida':
        return AlertCircle
      default:
        return Badge
    }
  }

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'vigente':
        return 'Vigente'
      case 'por_vencer':
        return 'Por Vencer'
      case 'vencida':
        return 'Vencida'
      default:
        return estado
    }
  }

  // Normalizar credenciales a arrays para facilitar navegación
  const credencialesList = useMemo(() => {
    const list: Array<{ credencial: Credencial; tipo: 'ministerial' | 'capellania' }> = []

    if (credenciales.ministerial) {
      const ministerial = Array.isArray(credenciales.ministerial)
        ? credenciales.ministerial
        : [credenciales.ministerial]
      ministerial.forEach(c => list.push({ credencial: c, tipo: 'ministerial' }))
    }

    if (credenciales.capellania) {
      const capellania = Array.isArray(credenciales.capellania)
        ? credenciales.capellania
        : [credenciales.capellania]
      capellania.forEach(c => list.push({ credencial: c, tipo: 'capellania' }))
    }

    return list
  }, [credenciales])

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

    setSolicitandoCredencial(true)
    try {
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
              // Recargar solicitudes
              solicitudesCredencialesApi.getMisSolicitudes().then(setSolicitudes).catch(console.error)
            },
          },
        ]
      )
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ Error solicitando credencial:', errorMessage)

      // Detectar error 404 específicamente
      let mensajeUsuario = 'No se pudo enviar la solicitud'
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; statusText?: string; data?: unknown } }
        if (axiosError.response?.status === 404) {
          mensajeUsuario = 'El endpoint de solicitudes no está disponible.\n\n' +
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
    const totalMinisterial = credencialesList.filter(c => c.tipo === 'ministerial').length
    const totalCapellania = credencialesList.filter(c => c.tipo === 'capellania').length
    const totalVigentes = credencialesList.filter(c => c.credencial.estado === 'vigente').length
    const totalPorVencer = credencialesList.filter(c => c.credencial.estado === 'por_vencer').length

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
                <Text style={styles.statValue}>{credencialesList.length}</Text>
                <Text style={styles.statLabel}>Total Credenciales</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#22c55e' }]}>{totalVigentes}</Text>
                <Text style={styles.statLabel}>Vigentes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#f59e0b' }]}>{totalPorVencer}</Text>
                <Text style={styles.statLabel}>Por Vencer</Text>
              </View>
            </View>

            <View style={styles.resumenBreakdown}>
              {totalMinisterial > 0 && (
                <View style={styles.breakdownItem}>
                  <View style={styles.breakdownIconContainer}>
                    <CreditCard size={20} color="#3b82f6" />
                  </View>
                  <View style={styles.breakdownContent}>
                    <Text style={styles.breakdownTitle}>Credenciales Ministeriales</Text>
                    <Text style={styles.breakdownValue}>{totalMinisterial} encontrada{totalMinisterial > 1 ? 's' : ''}</Text>
                  </View>
                </View>
              )}

              {totalCapellania > 0 && (
                <View style={styles.breakdownItem}>
                  <View style={styles.breakdownIconContainer}>
                    <CreditCard size={20} color="#8b5cf6" />
                  </View>
                  <View style={styles.breakdownContent}>
                    <Text style={styles.breakdownTitle}>Credenciales de Capellanía</Text>
                    <Text style={styles.breakdownValue}>{totalCapellania} encontrada{totalCapellania > 1 ? 's' : ''}</Text>
                  </View>
                </View>
              )}
            </View>

            {documento && (
              <View style={styles.dniInfo}>
                <Text style={styles.dniLabel}>DNI consultado:</Text>
                <Text style={styles.dniValue}>{documento}</Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    )
  }

  const renderCredencialCardSingle = (credencial: Credencial, tipo: 'ministerial' | 'capellania') => {
    const estadoColor = getEstadoColor(credencial.estado)
    const EstadoIcon = getEstadoIcon(credencial.estado)

    return (
      <View key={credencial.id} style={styles.credentialCard}>
        <LinearGradient
          colors={[`${estadoColor}15`, 'rgba(15, 23, 42, 0.8)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <CreditCard size={24} color={estadoColor} />
              <Text style={styles.cardTitle}>
                Credencial {tipo === 'ministerial' ? 'Ministerial' : 'de Capellanía'}
              </Text>
            </View>
            <View style={[styles.badgeContainer, { backgroundColor: `${estadoColor}20` }]}>
              <EstadoIcon size={16} color={estadoColor} />
              <Text style={[styles.badgeText, { color: estadoColor }]}>
                {getEstadoLabel(credencial.estado)}
              </Text>
            </View>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre:</Text>
              <Text style={styles.infoValue}>
                {credencial.nombre} {credencial.apellido}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Documento:</Text>
              <Text style={styles.infoValue}>{credencial.documento}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha de Emisión:</Text>
              <Text style={styles.infoValue}>{formatDate(credencial.fechaEmision)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha de Vencimiento:</Text>
              <Text style={[styles.infoValue, { color: estadoColor }]}>
                {formatDate(credencial.fechaVencimiento)}
              </Text>
            </View>
            {credencial.diasRestantes !== undefined && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Días Restantes:</Text>
                <Text
                  style={[
                    styles.infoValue,
                    {
                      color: estadoColor,
                      fontWeight: 'bold',
                    },
                  ]}
                >
                  {credencial.diasRestantes > 0
                    ? `${credencial.diasRestantes} días`
                    : credencial.diasRestantes === 0
                      ? 'Vence hoy'
                      : `Vencida hace ${Math.abs(credencial.diasRestantes)} días`}
                </Text>
              </View>
            )}
            {credencial.observaciones && (
              <View style={styles.observacionesContainer}>
                <Text style={styles.observacionesLabel}>Observaciones:</Text>
                <Text style={styles.observacionesText}>{credencial.observaciones}</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Consultar Credenciales</Text>
          <Text style={styles.subtitle}>
            {isInvitadoAuthenticated && invitado
              ? 'Tus credenciales se cargan automáticamente basándose en tu DNI de inscripciones'
              : 'Ingresa tu número de documento para consultar tus credenciales'}
          </Text>
        </View>

        {/* Campo de búsqueda manual - siempre visible */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="rgba(255, 255, 255, 0.5)" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={
                isInvitadoAuthenticated && invitado
                  ? 'DNI (se pre-llenó desde tus inscripciones)'
                  : 'Número de documento (DNI)'
              }
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={documento}
              onChangeText={setDocumento}
              keyboardType="numeric"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loadingDni}
            />
            {loadingDni && (
              <ActivityIndicator size="small" color="rgba(255, 255, 255, 0.5)" style={styles.dniLoader} />
            )}
          </View>
          {isInvitadoAuthenticated && invitado && documento && (
            <Text style={styles.dniHint}>
              💡 DNI obtenido de tus inscripciones. Puedes cambiarlo para buscar otro documento.
            </Text>
          )}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.searchButton, (loading || autoLoading) && styles.searchButtonDisabled]}
              onPress={handleConsultar}
              disabled={loading || autoLoading}
            >
              {(loading || autoLoading) ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Search size={20} color="#fff" />
                  <Text style={styles.searchButtonText}>
                    {isInvitadoAuthenticated && invitado ? 'Buscar por DNI' : 'Consultar'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            {isInvitadoAuthenticated && invitado && (
              <TouchableOpacity
                style={[styles.refreshButton, (loading || autoLoading) && styles.searchButtonDisabled]}
                onPress={async () => {
                  setLoading(true)
                  try {
                    const result = await credencialesApi.obtenerMisCredenciales()
                    setCredenciales(result)
                    if (!result.ministerial && !result.capellania) {
                      Alert.alert(
                        'No se encontraron credenciales',
                        'No se encontraron credenciales asociadas a tu DNI de inscripciones.'
                      )
                    }
                  } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
                    Alert.alert('Error', errorMessage)
                  } finally {
                    setLoading(false)
                  }
                }}
                disabled={loading || autoLoading}
              >
                {loading || autoLoading ? (
                  <ActivityIndicator color="#22c55e" />
                ) : (
                  <>
                    <Text style={styles.refreshButtonText}>🔄 Mis Credenciales</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Mostrar loading automático si es invitado */}
        {isInvitadoAuthenticated && invitado && autoLoading && (
          <View style={styles.autoLoadingContainer}>
            <View
              style={{
                width: 120,
                height: 120,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Image
                source={require('../../../assets/images/amvamobil.png')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
            <ActivityIndicator color="#22c55e" size="large" />
            <Text style={styles.autoLoadingText}>Buscando tus credenciales...</Text>
          </View>
        )}

        {/* Wizard de Credenciales */}
        {credencialesList.length > 0 && !autoLoading && (
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
                            : credencialesList[stepNumber - 2]?.tipo === 'ministerial'
                              ? 'Credencial Ministerial'
                              : 'Credencial de Capellanía'}
                        </Text>
                      </View>
                    </View>
                    {index < totalSteps - 1 && (
                      <View
                        style={[styles.stepLine, isCompleted && styles.stepLineCompleted]}
                      />
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
                  {renderCredencialCardSingle(
                    credencialesList[currentCredencialIndex].credencial,
                    credencialesList[currentCredencialIndex].tipo
                  )}
                </View>
              )}
            </Animated.View>

            {/* Navigation Buttons */}
            <View style={styles.navigationContainer}>
              {currentStep > 1 && (
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={handlePrevious}
                >
                  <ChevronLeft size={20} color="#fff" />
                  <Text style={styles.navButtonText}>Anterior</Text>
                </TouchableOpacity>
              )}

              {currentStep < totalSteps && (
                <TouchableOpacity
                  style={[styles.navButton, styles.navButtonPrimary]}
                  onPress={handleNext}
                >
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

        {!loading &&
          !autoLoading &&
          !credenciales.ministerial &&
          !credenciales.capellania &&
          (documento || (isInvitadoAuthenticated && invitado)) && (
            <View style={styles.emptyContainer}>
              <CreditCard size={48} color="rgba(255, 255, 255, 0.3)" />
              <Text style={styles.emptyText}>
                {isInvitadoAuthenticated && invitado
                  ? 'No se encontraron credenciales asociadas a tu DNI.\n\nSi necesitas una credencial, puedes solicitarla desde aquí.'
                  : 'Ingresa un número de documento y presiona "Consultar" para ver tus credenciales'}
              </Text>
              {isInvitadoAuthenticated && invitado && (
                <TouchableOpacity
                  style={styles.solicitarButton}
                  onPress={() => setShowSolicitarModal(true)}
                >
                  <Plus size={20} color="#fff" />
                  <Text style={styles.solicitarButtonText}>Solicitar Credencial</Text>
                </TouchableOpacity>
              )}
            </View>
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
                          Credencial {solicitud.tipo === TipoCredencial.MINISTERIAL ? 'Ministerial' : 'de Capellanía'}
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
                      onPress={() => setFormSolicitud(prev => ({ ...prev, tipo: TipoCredencial.MINISTERIAL }))}
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
                      onPress={() => setFormSolicitud(prev => ({ ...prev, tipo: TipoCredencial.CAPELLANIA }))}
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
                  <TextInput
                    style={styles.formInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={formSolicitud.fechaNacimiento}
                    onChangeText={value => setFormSolicitud(prev => ({ ...prev, fechaNacimiento: value }))}
                  />
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  searchContainer: {
    marginBottom: 24,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 14,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  refreshButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    borderRadius: 12,
    paddingVertical: 14,
  },
  refreshButtonText: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '600',
  },
  dniHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  dniLoader: {
    marginLeft: 8,
  },
  credentialsContainer: {
    gap: 16,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  autoLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  autoLoadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
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
  dniInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  dniLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  dniValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22c55e',
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
})

