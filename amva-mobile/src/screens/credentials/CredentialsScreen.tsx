import React, { useState } from 'react'
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
import { CreditCard, CheckCircle, AlertCircle, Clock, Search } from 'lucide-react-native'
import { credencialesApi, type Credencial } from '@api/credenciales'
import { useAuth } from '@hooks/useAuth'

export function CredentialsScreen() {
  const { pastor } = useAuth()
  const [documento, setDocumento] = useState('')
  const [loading, setLoading] = useState(false)
  const [credenciales, setCredenciales] = useState<{
    ministerial?: Credencial
    capellania?: Credencial
  }>({})

  const handleConsultar = async () => {
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
        return Card
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

  const renderCredencialCard = (credencial: Credencial, tipo: 'ministerial' | 'capellania') => {
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
            Ingresa tu número de documento para consultar tus credenciales
          </Text>
        </View>

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

        {(credenciales.ministerial || credenciales.capellania) && (
          <View style={styles.credentialsContainer}>
            {credenciales.ministerial && renderCredencialCard(credenciales.ministerial, 'ministerial')}
            {credenciales.capellania && renderCredencialCard(credenciales.capellania, 'capellania')}
          </View>
        )}

        {!loading && !credenciales.ministerial && !credenciales.capellania && documento && (
          <View style={styles.emptyContainer}>
            <CreditCard size={48} color="rgba(255, 255, 255, 0.3)" />
            <Text style={styles.emptyText}>
              Ingresa un número de documento y presiona "Consultar" para ver tus credenciales
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
})

