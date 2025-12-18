import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { CreditCard, CheckCircle, AlertCircle, Clock, Search, Badge } from 'lucide-react-native'
import { credencialesApi, type Credencial } from '@api/credenciales'
import { useAuth } from '@hooks/useAuth'
import { useInvitadoAuth } from '@hooks/useInvitadoAuth'

export function CredentialsScreen() {
  const { pastor } = useAuth()
  const { invitado, isAuthenticated: isInvitadoAuthenticated } = useInvitadoAuth()
  const [documento, setDocumento] = useState('')
  const [loading, setLoading] = useState(false)
  const [autoLoading, setAutoLoading] = useState(false)
  const [credenciales, setCredenciales] = useState<{
    ministerial?: Credencial | Credencial[]
    capellania?: Credencial | Credencial[]
  }>({})

  // Buscar automáticamente credenciales si el usuario está autenticado como invitado
  useEffect(() => {
    const buscarCredencialesAutomaticamente = async () => {
      if (isInvitadoAuthenticated && invitado && !autoLoading) {
        setAutoLoading(true)
        try {
          console.log('🔍 Buscando credenciales automáticamente para invitado:', invitado.email)
          const result = await credencialesApi.obtenerMisCredenciales()
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
          const errorMessage =
            error instanceof Error ? error.message : 'Error al obtener credenciales'
          console.error('❌ Error obteniendo credenciales automáticamente:', errorMessage)
          if (error instanceof Error && error.stack) {
            console.error('Stack trace:', error.stack)
          }
          // No mostrar alerta, solo loggear el error (el usuario puede buscar manualmente)
        } finally {
          setAutoLoading(false)
        }
      }
    }

    void buscarCredencialesAutomaticamente()
  }, [isInvitadoAuthenticated, invitado, autoLoading])

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

  const renderCredencialCard = (
    credencial: Credencial | Credencial[],
    tipo: 'ministerial' | 'capellania'
  ) => {
    // Si es un array, renderizar múltiples cards
    if (Array.isArray(credencial)) {
      return credencial.map(c => renderCredencialCardSingle(c, tipo))
    }
    // Si es un solo objeto, renderizar una card
    return renderCredencialCardSingle(credencial, tipo)
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

        {/* Mostrar búsqueda manual solo si NO es invitado autenticado */}
        {!isInvitadoAuthenticated && (
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color="rgba(255, 255, 255, 0.5)" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Número de documento"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={documento}
                onChangeText={setDocumento}
                keyboardType="numeric"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <TouchableOpacity
              style={[styles.searchButton, loading && styles.searchButtonDisabled]}
              onPress={handleConsultar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Search size={20} color="#fff" />
                  <Text style={styles.searchButtonText}>Consultar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Mostrar botón de actualizar si es invitado autenticado */}
        {isInvitadoAuthenticated && invitado && (
          <View style={styles.searchContainer}>
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
                  <Text style={styles.searchButtonText}>Actualizar Credenciales</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Mostrar loading automático si es invitado */}
        {isInvitadoAuthenticated && invitado && autoLoading && (
          <View style={styles.autoLoadingContainer}>
            <ActivityIndicator color="#22c55e" size="small" />
            <Text style={styles.autoLoadingText}>Buscando tus credenciales...</Text>
          </View>
        )}

        {(credenciales.ministerial || credenciales.capellania) && (
          <View style={styles.credentialsContainer}>
            {credenciales.ministerial && renderCredencialCard(credenciales.ministerial, 'ministerial')}
            {credenciales.capellania && renderCredencialCard(credenciales.capellania, 'capellania')}
          </View>
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
                  ? 'No se encontraron credenciales asociadas a tus inscripciones. Asegúrate de haber ingresado tu DNI al inscribirte a una convención.'
                  : 'Ingresa un número de documento y presiona "Consultar" para ver tus credenciales'}
              </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  autoLoadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
})

