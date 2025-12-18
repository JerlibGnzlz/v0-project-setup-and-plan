import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from 'react-native'
import { inscripcionesApi } from '@api/inscripciones'
import { convencionesApi, type Convencion, normalizeBoolean } from '@api/convenciones'
import { useAuth } from '@hooks/useAuth'

export function ConventionRegistrationScreen() {
  const { pastor } = useAuth()
  const [convencion, setConvencion] = useState<Convencion | null>(null)
  const [loadingConvencion, setLoadingConvencion] = useState(true)

  const [nombre, setNombre] = useState(pastor?.nombre || '')
  const [apellido, setApellido] = useState(pastor?.apellido || '')
  const [email, setEmail] = useState(pastor?.email || '')
  const [telefono, setTelefono] = useState('')
  const [sede, setSede] = useState(pastor?.sede || '')
  const [numeroCuotas, setNumeroCuotas] = useState('3')
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(false)

  // Cargar convención activa al montar
  useEffect(() => {
    const loadConvencion = async () => {
      try {
        setLoadingConvencion(true)
        const activa = await convencionesApi.getActive()
        if (activa) {
          // Normalizar valores booleanos antes de guardar
          const convencionNormalizada = {
            ...activa,
            activa: normalizeBoolean(activa.activa),
            archivada: normalizeBoolean(activa.archivada),
          }
          setConvencion(convencionNormalizada)
        } else {
          setConvencion(null)
        }
        if (!activa) {
          Alert.alert(
            'Sin convención activa',
            'No hay ninguna convención disponible para inscripción en este momento.'
          )
        }
      } catch (error) {
        console.error('Error cargando convención:', error)
        Alert.alert('Error', 'No se pudo cargar la información de la convención.')
      } finally {
        setLoadingConvencion(false)
      }
    }
    void loadConvencion()
  }, [])

  const handleSubmit = async () => {
    if (!convencion) {
      Alert.alert('Error', 'No hay convención activa disponible.')
      return
    }

    if (!nombre || !apellido || !email) {
      Alert.alert('Campos requeridos', 'Completa nombre, apellido y correo electrónico.')
      return
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      Alert.alert('Email inválido', 'Por favor ingresa un correo electrónico válido.')
      return
    }

    try {
      setLoading(true)
      console.log('📝 Creando inscripción...')

      await inscripcionesApi.create({
        convencionId: convencion.id,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim().toLowerCase(),
        telefono: telefono.trim() || undefined,
        sede: sede.trim() || undefined,
        numeroCuotas: parseInt(numeroCuotas) || 3,
        origenRegistro: 'mobile',
        notas: notas.trim() || undefined,
      })

      Alert.alert(
        '✅ Inscripción exitosa',
        `Tu inscripción a "${convencion.titulo}" fue registrada correctamente.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Limpiar formulario
              setTelefono('')
              setSede(pastor?.sede || '')
              setNumeroCuotas('3')
              setNotas('')
            },
          },
        ]
      )
    } catch (error: any) {
      console.error('❌ Error creando inscripción:', error)
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'No se pudo registrar la inscripción. Intenta nuevamente.'
      Alert.alert('Error', Array.isArray(message) ? message.join('\n') : message)
    } finally {
      setLoading(false)
    }
  }

  if (loadingConvencion) {
    return (
      <View style={styles.centered}>
        <View
          style={{
            width: 200,
            height: 200,
            marginBottom: 24,
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
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    )
  }

  if (!convencion) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Sin convención activa</Text>
        <Text style={styles.subtitle}>
          No hay ninguna convención disponible para inscripción en este momento.
        </Text>
      </View>
    )
  }

  // Convertir costo a número si viene como string o Decimal de Prisma
  const costo =
    typeof convencion.costo === 'number'
      ? Number(convencion.costo)
      : parseFloat(String(convencion.costo || 0))

  // Asegurar que numeroCuotas sea un número
  const numeroCuotasNum = parseInt(String(numeroCuotas || '3'), 10) || 3
  const montoPorCuota = Number(costo) / numeroCuotasNum

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Inscripción a Convención</Text>
        <Text style={styles.convencionTitle}>{convencion.titulo}</Text>
        {convencion.ubicacion && <Text style={styles.subtitle}>📍 {convencion.ubicacion}</Text>}
        <View style={styles.costContainer}>
          <Text style={styles.costLabel}>Costo total:</Text>
          <Text style={styles.costValue}>${Number(costo).toFixed(2)}</Text>
        </View>
        <View style={styles.costContainer}>
          <Text style={styles.costLabel}>Cuotas:</Text>
          <Text style={styles.costValue}>
            {numeroCuotas} cuotas de ${Number(montoPorCuota).toFixed(2)}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Datos Personales</Text>

      <Text style={styles.label}>Nombre *</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Tu nombre"
        placeholderTextColor="rgba(148,163,184,0.5)"
      />

      <Text style={styles.label}>Apellido *</Text>
      <TextInput
        style={styles.input}
        value={apellido}
        onChangeText={setApellido}
        placeholder="Tu apellido"
        placeholderTextColor="rgba(148,163,184,0.5)"
      />

      <Text style={styles.label}>Correo electrónico *</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="tu@email.com"
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="rgba(148,163,184,0.5)"
      />

      <Text style={styles.label}>Teléfono</Text>
      <TextInput
        style={styles.input}
        value={telefono}
        onChangeText={setTelefono}
        placeholder="+54 11 1234-5678"
        keyboardType="phone-pad"
        placeholderTextColor="rgba(148,163,184,0.5)"
      />

      <Text style={styles.label}>Iglesia / Sede</Text>
      <TextInput
        style={styles.input}
        value={sede}
        onChangeText={setSede}
        placeholder="Nombre de tu iglesia o sede"
        placeholderTextColor="rgba(148,163,184,0.5)"
      />

      <Text style={styles.label}>Número de cuotas</Text>
      <View style={styles.cuotasContainer}>
        {['1', '2', '3'].map(num => (
          <TouchableOpacity
            key={num}
            style={[styles.cuotaButton, numeroCuotas === num && styles.cuotaButtonActive]}
            onPress={() => setNumeroCuotas(num)}
          >
            <Text
              style={[styles.cuotaButtonText, numeroCuotas === num && styles.cuotaButtonTextActive]}
            >
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.cuotaInfo}>
        {numeroCuotas} cuota{numeroCuotas !== '1' ? 's' : ''} de ${Number(montoPorCuota).toFixed(2)}{' '}
        cada una
      </Text>

      <Text style={styles.label}>Notas adicionales (opcional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notas}
        onChangeText={setNotas}
        placeholder="Información adicional que quieras agregar..."
        multiline
        numberOfLines={4}
        placeholderTextColor="rgba(148,163,184,0.5)"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading || !convencion}
      >
        {loading ? (
          <ActivityIndicator color="#0a1628" />
        ) : (
          <Text style={styles.buttonText}>Confirmar Inscripción</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.hint}>
        Los campos marcados con * son obligatorios. Tu inscripción será procesada y recibirás
        confirmación.
      </Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a1628',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    color: 'rgba(148,163,184,0.9)',
    fontSize: 14,
  },
  header: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148,163,184,0.2)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  convencionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#22c55e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(148,163,184,0.9)',
    marginTop: 4,
    marginBottom: 12,
  },
  costContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  costLabel: {
    fontSize: 14,
    color: 'rgba(148,163,184,0.9)',
  },
  costValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22c55e',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginTop: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(248,250,252,0.9)',
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.6)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: 'white',
    backgroundColor: 'rgba(15,23,42,0.9)',
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  cuotasContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cuotaButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.6)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  cuotaButtonActive: {
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  cuotaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(148,163,184,0.9)',
  },
  cuotaButtonTextActive: {
    color: '#22c55e',
  },
  cuotaInfo: {
    fontSize: 12,
    color: 'rgba(148,163,184,0.7)',
    marginTop: 8,
    marginBottom: 8,
  },
  button: {
    marginTop: 32,
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#0a1628',
    fontSize: 16,
    fontWeight: '700',
  },
  hint: {
    marginTop: 16,
    fontSize: 12,
    color: 'rgba(148,163,184,0.7)',
    textAlign: 'center',
    lineHeight: 18,
  },
})
