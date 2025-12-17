import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as WebBrowser from 'expo-web-browser'
import * as Google from 'expo-auth-session/providers/google'
import { useAuth } from '@hooks/useAuth'
import { invitadoAuthApi } from '@api/invitado-auth'
import { testBackendConnection } from '../../utils/testConnection'
import { RegisterScreen } from './RegisterScreen'

// Necesario para que expo-auth-session funcione correctamente
WebBrowser.maybeCompleteAuthSession()

export function LoginScreen() {
  const { login, loading } = useAuth()
  const scrollViewRef = useRef<ScrollView>(null)
  const emailInputRef = useRef<TextInput>(null)
  const passwordInputRef = useRef<TextInput>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [testingConnection, setTestingConnection] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // Configuración de Google OAuth
  // NOTA: Necesitas configurar EXPO_PUBLIC_GOOGLE_CLIENT_ID en app.json o variables de entorno
  // Para apps móviles, necesitas un Client ID específico de Android/iOS (no el mismo que web)
  // El CLIENT_ID debe ser el mismo que el del backend (o uno compatible)
  const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || ''
  
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: googleClientId,
    // Para desarrollo, puedes usar el clientId directamente aquí si no está en variables de entorno
    // clientId: 'TU_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  })

  // Validar que el clientId esté configurado
  useEffect(() => {
    if (!googleClientId) {
      console.warn('⚠️ EXPO_PUBLIC_GOOGLE_CLIENT_ID no está configurado. El login con Google no funcionará.')
      console.warn('   Configura EXPO_PUBLIC_GOOGLE_CLIENT_ID en app.json o variables de entorno.')
    }
  }, [googleClientId])

  // Manejar respuesta de Google OAuth
  useEffect(() => {
    const handleGoogleAuth = async () => {
      if (response?.type === 'success') {
        const { id_token } = response.params
        if (!id_token) {
          Alert.alert('Error', 'No se recibió el token de Google')
          setGoogleLoading(false)
          return
        }

        try {
          setGoogleLoading(true)
          console.log('🔐 Iniciando login con Google...')
          const result = await invitadoAuthApi.loginWithGoogle(id_token)
          console.log('✅ Login con Google exitoso')

          // Guardar tokens
          const SecureStore = await import('expo-secure-store')
          await SecureStore.default.setItemAsync('access_token', result.access_token)
          await SecureStore.default.setItemAsync('refresh_token', result.refresh_token)

          // Nota: El login con Google es para invitados (no pastores)
          // Los tokens se guardan y la app debería detectar el cambio
          // Si necesitas manejar invitados diferente a pastores, puedes hacerlo aquí

          console.log('✅ Sesión iniciada con Google como invitado:', result.invitado.email)

          // Recargar la app para que detecte el token
          // La app debería detectar el token y mostrar la pantalla correspondiente
          Alert.alert(
            '¡Bienvenido!',
            `Has iniciado sesión como ${result.invitado.nombre} ${result.invitado.apellido}`,
            [{ text: 'OK' }]
          )
        } catch (error: unknown) {
          console.error('❌ Error en login con Google:', error)
          let errorMessage = 'No se pudo iniciar sesión con Google.'
          if (error && typeof error === 'object') {
            const axiosError = error as {
              response?: { data?: { message?: string | string[] } }
              message?: string
            }
            if (axiosError.response?.data?.message) {
              const msg = axiosError.response.data.message
              errorMessage = Array.isArray(msg) ? msg.join('\n') : msg
            } else if (axiosError.message) {
              errorMessage = axiosError.message
            }
          }
          Alert.alert('Error de autenticación', errorMessage)
        } finally {
          setGoogleLoading(false)
        }
      } else if (response?.type === 'error') {
        console.error('❌ Error en respuesta de Google:', response.error)
        let errorMessage = 'No se pudo completar la autenticación con Google.'
        
        // Mensajes más específicos según el tipo de error
        if (response.error?.message) {
          if (response.error.message.includes('400') || response.error.message.includes('invalid_request')) {
            errorMessage =
              'Error de configuración de Google OAuth.\n\nVerifica que:\n• El Client ID esté configurado correctamente\n• El Client ID sea válido para aplicaciones móviles\n• La configuración esté correcta en Google Cloud Console'
          } else if (response.error.message.includes('access_denied')) {
            errorMessage = 'Acceso denegado. Por favor, autoriza la aplicación para continuar.'
          } else {
            errorMessage = `Error: ${response.error.message}`
          }
        }
        
        Alert.alert('Error de autenticación', errorMessage)
        setGoogleLoading(false)
      } else if (response?.type === 'dismiss') {
        console.log('ℹ️ Usuario canceló la autenticación con Google')
        setGoogleLoading(false)
      }
    }

    if (response) {
      void handleGoogleAuth()
    }
  }, [response])

  // Probar conexión al montar el componente (solo en desarrollo)
  useEffect(() => {
    const testConnection = async () => {
      setTestingConnection(true)
      const isConnected = await testBackendConnection()
      if (!isConnected) {
        Alert.alert(
          '⚠️ Problema de Conexión',
          'No se pudo conectar al servidor.\n\nVerifica que:\n• El backend esté corriendo\n• La URL del API sea correcta\n• Estés en la misma red WiFi (si usas dispositivo físico)',
          [{ text: 'OK' }]
        )
      }
      setTestingConnection(false)
    }
    // Solo probar en desarrollo y después de un pequeño delay
    if (__DEV__) {
      setTimeout(() => {
        void testConnection()
      }, 1000)
    }
  }, [])

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Campos requeridos', 'Ingresa tu correo y contraseña.')
      return
    }
    try {
      console.log('🔐 Intentando login con:', email.trim())
      await login(email.trim(), password)
      console.log('✅ Login exitoso')
    } catch (error: unknown) {
      console.error('❌ Error en login:', error)

      // Detectar tipo de error
      let errorMessage = 'No se pudo iniciar sesión.'

      if (error && typeof error === 'object') {
        const axiosError = error as {
          code?: string
          message?: string
          response?: {
            status?: number
            data?: { message?: string | string[] }
          }
        }

        if (axiosError.code === 'ECONNREFUSED' || axiosError.message?.includes('Network Error')) {
          errorMessage =
            'No se pudo conectar al servidor.\n\nVerifica que:\n• El backend esté accesible\n• La URL del API sea correcta\n• Tengas conexión a internet'
        } else if (axiosError.response?.status === 401) {
          errorMessage = 'Credenciales incorrectas.\n\nVerifica tu email y contraseña.'
        } else if (axiosError.response?.status === 404) {
          errorMessage =
            'Endpoint no encontrado.\n\nEl endpoint de autenticación no está disponible. Contacta al administrador.'
        } else if (axiosError.response?.status === 500) {
          errorMessage = 'Error del servidor.\n\nIntenta nuevamente más tarde.'
        } else if (axiosError.message) {
          // El mensaje ya viene extraído del formato del backend en authApi.login
          errorMessage = axiosError.message
        } else if (axiosError.response?.data) {
          // Formato alternativo del backend: { error: { message: "..." } }
          const responseData = axiosError.response.data as {
            error?: { message?: string }
            message?: string | string[]
          }
          if (responseData.error?.message) {
            errorMessage = responseData.error.message
          } else if (responseData.message) {
            errorMessage = Array.isArray(responseData.message)
              ? responseData.message.join('\n')
              : responseData.message
          }
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      Alert.alert('Error de inicio de sesión', errorMessage)
    }
  }

  if (showRegister) {
    return (
      <RegisterScreen
        onSuccess={() => {
          setShowRegister(false)
          // El email se puede pre-llenar si se guarda en el estado
        }}
        onBack={() => setShowRegister(false)}
      />
    )
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
          {/* Header con Logo */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoGlow} />
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>🌍</Text>
              </View>
            </View>
            <Text style={styles.title}>AMVA Go</Text>
            <Text style={styles.subtitle}>Asociación Misionera Vida Abundante</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Iniciar Sesión</Text>
            <Text style={styles.cardSubtitle}>Acceso para pastores registrados</Text>

            {testingConnection && (
              <View style={styles.testingContainer}>
                <ActivityIndicator size="small" color="#22c55e" />
                <Text style={styles.testingText}>Verificando conexión...</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>📧 Correo electrónico</Text>
              <TextInput
                ref={emailInputRef}
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="pastor@iglesia.org"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>🔒 Contraseña</Text>
              <TextInput
                ref={passwordInputRef}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="********"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.buttonText}>✓ Iniciar sesión</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[
                styles.googleButton,
                (googleLoading || !request || !googleClientId) && styles.buttonDisabled,
              ]}
              onPress={() => {
                if (!googleClientId) {
                  Alert.alert(
                    'Configuración requerida',
                    'El Client ID de Google no está configurado. Por favor, contacta al administrador.',
                  )
                  return
                }
                setGoogleLoading(true)
                void promptAsync()
              }}
              disabled={googleLoading || !request || !googleClientId}
            >
              {googleLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.googleButtonText}>🔵 Continuar con Google</Text>
                </>
              )}
            </TouchableOpacity>
            {!googleClientId && (
              <Text style={styles.hint}>
                ⚠️ Login con Google no disponible: Client ID no configurado
              </Text>
            )}

            <TouchableOpacity style={styles.registerButton} onPress={() => setShowRegister(true)}>
              <Text style={styles.registerButtonText}>📝 Crear nueva cuenta</Text>
            </TouchableOpacity>

            <Text style={styles.hint}>
              Si tu correo no está registrado como pastor, puedes crear una cuenta nueva.
            </Text>
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
    paddingBottom: 32,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  logoGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 50,
    opacity: 0.6,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoText: {
    fontSize: 40,
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
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
  button: {
    marginTop: 8,
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
  hint: {
    marginTop: 20,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 18,
  },
  testingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  testingText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  registerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    marginTop: 8,
    backgroundColor: '#4285F4',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 12,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
