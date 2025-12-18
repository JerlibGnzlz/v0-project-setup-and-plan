import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { invitadoAuthApi } from '@api/invitado-auth'
import * as SecureStore from 'expo-secure-store'
import { useInvitadoAuth } from '@hooks/useInvitadoAuth'

interface RegisterScreenProps {
  onSuccess: () => void
  onBack: () => void
}

export function RegisterScreen({ onSuccess, onBack }: RegisterScreenProps) {
  const scrollViewRef = useRef<ScrollView>(null)
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({})
  const { refresh } = useInvitadoAuth()

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    sede: '',
    telefono: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpiar error del campo cuando se modifica
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre || formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres'
    }

    if (!formData.apellido || formData.apellido.trim().length < 2) {
      newErrors.apellido = 'El apellido debe tener al menos 2 caracteres'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Correo electrónico inválido'
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const inputPositions = useRef<{ [key: string]: number }>({})

  const handleInputFocus = (field: string) => {
    // Hacer scroll al input cuando se enfoca
    setTimeout(() => {
      const position = inputPositions.current[field]
      if (position !== undefined && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: position - 120, // Offset para dejar espacio arriba
          animated: true,
        })
      }
    }, 300)
  }

  const handleInputLayout = (field: string, event: any) => {
    const { y } = event.nativeEvent.layout
    inputPositions.current[field] = y
  }

  const handleInputBlur = (field: string, value: string) => {
    // Validar y cerrar teclado si el campo está completo
    const trimmedValue = value?.trim() || ''

    // Si el campo está completo y válido, cerrar el teclado
    if (trimmedValue.length > 0) {
      // Validaciones específicas por campo
      if (field === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (emailRegex.test(trimmedValue)) {
          setTimeout(() => Keyboard.dismiss(), 300)
        }
      } else if (field === 'telefono') {
        // Si tiene al menos 8 dígitos, considerar completo
        const digitsOnly = trimmedValue.replace(/\D/g, '')
        if (digitsOnly.length >= 8) {
          setTimeout(() => Keyboard.dismiss(), 300)
        }
      } else if (['nombre', 'apellido', 'sede'].includes(field)) {
        // Si tiene al menos 2 caracteres, considerar completo
        if (trimmedValue.length >= 2) {
          setTimeout(() => Keyboard.dismiss(), 300)
        }
      } else if (field === 'password' || field === 'confirmPassword') {
        // Si tiene al menos 8 caracteres, considerar completo
        if (trimmedValue.length >= 8) {
          setTimeout(() => Keyboard.dismiss(), 300)
        }
      }
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Campos inválidos', 'Por favor completa todos los campos correctamente.')
      return
    }

    try {
      setLoading(true)

      console.log('📝 Iniciando registro de invitado...')

      // Llamar al endpoint de registro completo de INVITADOS (no pastores)
      // Esto crea el registro en la tabla 'invitados', NO en 'pastores'
      const response = await invitadoAuthApi.registerComplete({
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        sede: formData.sede.trim() || undefined,
        telefono: formData.telefono.trim() || undefined,
      })

      console.log('✅ Registro exitoso:', response.invitado.email)
      console.log('🔍 Verificando tokens recibidos:', {
        hasAccessToken: !!response.access_token,
        hasRefreshToken: !!response.refresh_token,
        accessTokenLength: response.access_token?.length || 0,
        refreshTokenLength: response.refresh_token?.length || 0,
      })

      // Guardar tokens automáticamente para que el usuario quede autenticado
      await SecureStore.setItemAsync('invitado_token', response.access_token)
      if (response.refresh_token) {
        await SecureStore.setItemAsync('invitado_refresh_token', response.refresh_token)
        console.log('✅ Refresh token guardado correctamente')
      } else {
        console.error('❌ ERROR: No se recibió refresh_token en la respuesta de registro')
        console.error('❌ Esto causará problemas cuando el token expire')
      }

      // Refrescar el estado del invitado en el contexto
      // Esto actualiza el estado y permite que AppNavigator detecte la autenticación
      await refresh()

      console.log('✅ Estado de invitado refrescado después del registro')

      // No mostrar alerta, simplemente cerrar el registro y dejar que AppNavigator redirija
      // El usuario ya está autenticado, el AppNavigator detectará el cambio y mostrará MainTabs
      onSuccess()
    } catch (error: any) {
      console.error('Error en registro:', error)
      let errorMessage = 'No se pudo crear la cuenta. Intenta nuevamente.'

      if (error?.response?.status === 400) {
        errorMessage =
          error?.response?.data?.message ||
          'El correo ya está registrado o los datos son inválidos.'
      } else if (error?.response?.data?.message) {
        errorMessage = Array.isArray(error.response.data.message)
          ? error.response.data.message.join('\n')
          : error.response.data.message
      }

      Alert.alert('Error de registro', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/images/amvamobil.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.subtitle}>Asociación Misionera Vida Abundante</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Crear Cuenta</Text>
            <Text style={styles.cardSubtitle}>Registro para invitados</Text>

            {/* Nombre y Apellido */}
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>
                  Nombre <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  ref={ref => {
                    inputRefs.current['nombre'] = ref
                  }}
                  style={[styles.input, errors.nombre && styles.inputError]}
                  value={formData.nombre}
                  onChangeText={value => handleChange('nombre', value)}
                  placeholder="Tu nombre"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  autoCapitalize="words"
                  returnKeyType="next"
                  onFocus={() => handleInputFocus('nombre')}
                  onBlur={() => handleInputBlur('nombre', formData.nombre)}
                  onLayout={e => handleInputLayout('nombre', e)}
                  onSubmitEditing={() => inputRefs.current['apellido']?.focus()}
                />
                {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>
                  Apellido <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  ref={ref => {
                    inputRefs.current['apellido'] = ref
                  }}
                  style={[styles.input, errors.apellido && styles.inputError]}
                  value={formData.apellido}
                  onChangeText={value => handleChange('apellido', value)}
                  placeholder="Tu apellido"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  autoCapitalize="words"
                  returnKeyType="next"
                  onFocus={() => handleInputFocus('apellido')}
                  onBlur={() => handleInputBlur('apellido', formData.apellido)}
                  onLayout={e => handleInputLayout('apellido', e)}
                  onSubmitEditing={() => inputRefs.current['email']?.focus()}
                />
                {errors.apellido && <Text style={styles.errorText}>{errors.apellido}</Text>}
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                📧 Correo electrónico <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                ref={ref => {
                  inputRefs.current['email'] = ref
                }}
                style={[styles.input, errors.email && styles.inputError]}
                value={formData.email}
                onChangeText={value => handleChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="pastor@iglesia.org"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                returnKeyType="next"
                onFocus={() => handleInputFocus('email')}
                onBlur={() => handleInputBlur('email', formData.email)}
                onLayout={e => handleInputLayout('email', e)}
                onSubmitEditing={() => inputRefs.current['telefono']?.focus()}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Teléfono */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>📱 Teléfono</Text>
              <TextInput
                ref={ref => {
                  inputRefs.current['telefono'] = ref
                }}
                style={styles.input}
                value={formData.telefono}
                onChangeText={value => handleChange('telefono', value)}
                keyboardType="phone-pad"
                placeholder="+54 11 1234-5678"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                returnKeyType="next"
                onFocus={() => handleInputFocus('telefono')}
                onBlur={() => handleInputBlur('telefono', formData.telefono)}
                onLayout={e => handleInputLayout('telefono', e)}
                onSubmitEditing={() => inputRefs.current['sede']?.focus()}
              />
            </View>

            {/* Sede */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>⛪ Iglesia / Sede</Text>
              <TextInput
                ref={ref => {
                  inputRefs.current['sede'] = ref
                }}
                style={styles.input}
                value={formData.sede}
                onChangeText={value => handleChange('sede', value)}
                placeholder="Nombre de tu iglesia o sede"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                autoCapitalize="words"
                returnKeyType="next"
                onFocus={() => handleInputFocus('sede')}
                onBlur={() => handleInputBlur('sede', formData.sede)}
                onLayout={e => handleInputLayout('sede', e)}
                onSubmitEditing={() => inputRefs.current['password']?.focus()}
              />
            </View>

            {/* Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                🔒 Contraseña <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                ref={ref => {
                  inputRefs.current['password'] = ref
                }}
                style={[styles.input, errors.password && styles.inputError]}
                value={formData.password}
                onChangeText={value => handleChange('password', value)}
                secureTextEntry
                placeholder="Mínimo 8 caracteres"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                returnKeyType="next"
                onFocus={() => handleInputFocus('password')}
                onBlur={() => handleInputBlur('password', formData.password)}
                onLayout={e => handleInputLayout('password', e)}
                onSubmitEditing={() => inputRefs.current['confirmPassword']?.focus()}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              <Text style={styles.helperText}>
                Debe contener al menos una mayúscula, una minúscula y un número
              </Text>
            </View>

            {/* Confirmar Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                🔒 Confirmar Contraseña <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                ref={ref => {
                  inputRefs.current['confirmPassword'] = ref
                }}
                style={[styles.input, errors.confirmPassword && styles.inputError]}
                value={formData.confirmPassword}
                onChangeText={value => handleChange('confirmPassword', value)}
                secureTextEntry
                placeholder="Repite tu contraseña"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                returnKeyType="done"
                onFocus={() => handleInputFocus('confirmPassword')}
                onBlur={() => handleInputBlur('confirmPassword', formData.confirmPassword)}
                onLayout={e => handleInputLayout('confirmPassword', e)}
                onSubmitEditing={() => Keyboard.dismiss()}
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>✓ Crear Cuenta</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>← Volver al Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    flexGrow: 1,
    padding: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  logoContainer: {
    marginBottom: 24,
    width: 280,
    height: 280,
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
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 24,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
})
