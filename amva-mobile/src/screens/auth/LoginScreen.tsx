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
  Animated,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as WebBrowser from 'expo-web-browser'
import * as Google from 'expo-auth-session/providers/google'
import Constants from 'expo-constants'
import { useInvitadoAuth } from '@hooks/useInvitadoAuth'
import { invitadoAuthApi } from '@api/invitado-auth'
import { testBackendConnection } from '../../utils/testConnection'
import { RegisterScreen } from './RegisterScreen'
import { Alert } from '@utils/alert'

// Necesario para que expo-auth-session funcione correctamente
WebBrowser.maybeCompleteAuthSession()

export function LoginScreen() {
  const { login, loginWithGoogle, loading } = useInvitadoAuth()
  const scrollViewRef = useRef<ScrollView>(null)
  const emailInputRef = useRef<TextInput>(null)
  const passwordInputRef = useRef<TextInput>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [testingConnection, setTestingConnection] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const emailFocusAnim = useRef(new Animated.Value(0)).current
  const passwordFocusAnim = useRef(new Animated.Value(0)).current

  // Configuración de Google OAuth
  // NOTA: Configura el Client ID en app.json en extra.googleClientId
  // O crea un archivo .env en la raíz de amva-mobile con:
  // EXPO_PUBLIC_GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
  // El CLIENT_ID debe ser el mismo que el del backend (GOOGLE_CLIENT_ID)

  // Intentar leer desde diferentes fuentes
  const googleClientIdFromEnv = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || ''
  const googleClientIdFromConfig =
    Constants?.expoConfig?.extra?.googleClientId ||
    Constants?.manifest?.extra?.googleClientId ||
    ''

  const googleClientId = googleClientIdFromEnv || googleClientIdFromConfig

  // Filtrar valores placeholder
  const isValidClientId =
    googleClientId &&
    googleClientId !== 'TU_GOOGLE_CLIENT_ID.apps.googleusercontent.com' &&
    googleClientId.includes('.apps.googleusercontent.com')

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(
    isValidClientId && googleClientId
      ? {
        clientId: googleClientId,
      }
      : { clientId: '' } // Valor por defecto para evitar error de tipo
  )

  // Validar que el clientId esté configurado
  useEffect(() => {
    if (!isValidClientId) {
      console.warn('⚠️ Google Client ID no está configurado o es inválido.')
      console.warn('   Opción 1: Agrega en app.json -> extra.googleClientId con tu Client ID real')
      console.warn('   Opción 2: Crea .env en amva-mobile/ con EXPO_PUBLIC_GOOGLE_CLIENT_ID=tu-client-id')
      console.warn('   El Client ID debe ser el mismo que GOOGLE_CLIENT_ID en el backend')
      console.warn('   Formato esperado: xxxxxx.apps.googleusercontent.com')
    } else {
      console.log('✅ Google Client ID configurado:', googleClientId.substring(0, 30) + '...')
    }
  }, [isValidClientId, googleClientId])

  // Manejar respuesta de Google OAuth
  useEffect(() => {
    const handleGoogleAuth = async () => {
      if (response?.type === 'success') {
        const { id_token } = response.params
        if (!id_token) {
          Alert.alert('Error', 'No se recibió el token de Google', undefined, 'error')
          setGoogleLoading(false)
          return
        }

        try {
          setGoogleLoading(true)
          console.log('🔐 Iniciando login con Google...')
          // Usar el hook para login con Google (ya maneja el guardado de tokens)
          await loginWithGoogle(id_token)
          console.log('✅ Login con Google exitoso')

          // El hook ya actualiza el estado del invitado, no necesitamos hacer nada más
          // La app debería detectar el token y mostrar la pantalla correspondiente
          Alert.alert(
            '¡Bienvenido!',
            'Has iniciado sesión exitosamente',
            [{ text: 'OK' }],
            'success',
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
          Alert.alert('Error de autenticación', errorMessage, undefined, 'error')
        } finally {
          setGoogleLoading(false)
        }
      } else if (response?.type === 'error') {
        console.error('❌ Error en respuesta de Google:', response.error)
        let errorMessage = 'No se pudo completar la autenticación con Google.'

        // Mensajes más específicos según el tipo de error
        if (response.error?.message) {
          if (
            response.error.message.includes('400') ||
            response.error.message.includes('invalid_request') ||
            response.error.message.includes("doesn't comply") ||
            response.error.message.includes('OAuth 2.0 policy')
          ) {
            errorMessage =
              '⚠️ Error de configuración de Google OAuth\n\n' +
              'Pasos para resolver:\n\n' +
              '1. Ve a Google Cloud Console → OAuth consent screen\n' +
              '2. Completa "Información de la marca":\n' +
              '   • Página principal: https://ministerio-backend-wdbj.onrender.com\n' +
              '   • Política de Privacidad: https://ministerio-backend-wdbj.onrender.com/privacy-policy\n' +
              '   • Términos de Servicio: https://ministerio-backend-wdbj.onrender.com/terms-of-service\n' +
              '3. Guarda los cambios\n' +
              '4. Espera 5-15 minutos\n' +
              '5. Cierra completamente la app y vuelve a intentar\n\n' +
              'Si el problema persiste, verifica que:\n' +
              '• El estado sea "En producción"\n' +
              '• El dominio esté autorizado\n' +
              '• Las URLs sean accesibles'
          } else if (response.error.message.includes('access_denied')) {
            errorMessage = 'Acceso denegado. Por favor, autoriza la aplicación para continuar.'
          } else {
            errorMessage = `Error: ${response.error.message}`
          }
        }

        Alert.alert('Error de autenticación con Google', errorMessage, undefined, 'error')
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
      Alert.alert('Campos requeridos', 'Ingresa tu correo y contraseña.', undefined, 'warning')
      return
    }
    try {
      console.log('🔐 Intentando login como invitado:', email.trim())
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
          // Mensaje más detallado para credenciales inválidas
          const responseData = axiosError.response.data as {
            error?: { message?: string }
            message?: string | string[]
          }

          let backendMessage = 'Credenciales incorrectas'
          if (responseData.error?.message) {
            backendMessage = responseData.error.message
          } else if (responseData.message) {
            backendMessage = Array.isArray(responseData.message)
              ? responseData.message.join('\n')
              : responseData.message
          }

          errorMessage = `${backendMessage}\n\n` +
            'Verifica que:\n' +
            '• Tu email sea correcto\n' +
            '• Tu contraseña sea correcta\n' +
            '• Tu cuenta esté registrada\n\n' +
            'Si no tienes cuenta, puedes crear una nueva con el botón "Crear nueva cuenta"'
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

      Alert.alert('Error de inicio de sesión', errorMessage, undefined, 'error')
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
            <Text style={styles.cardTitle}>Iniciar Sesión</Text>
            <Text style={styles.cardSubtitle}>Acceso para invitados registrados</Text>

            {testingConnection && (
              <View style={styles.testingContainer}>
                <ActivityIndicator size="small" color="#22c55e" />
                <Text style={styles.testingText}>Verificando conexión...</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>📧 Correo electrónico</Text>
              <Animated.View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: emailFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['rgba(255, 255, 255, 0.2)', 'rgba(34, 197, 94, 0.6)'],
                    }),
                    shadowOpacity: emailFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.2],
                    }),
                    shadowColor: '#22c55e',
                  },
                ]}
              >
                <TextInput
                  ref={emailInputRef}
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="tu@email.com"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  returnKeyType="next"
                  onFocus={() => {
                    setEmailFocused(true)
                    Animated.spring(emailFocusAnim, {
                      toValue: 1,
                      useNativeDriver: false,
                      tension: 100,
                      friction: 8,
                    }).start()
                  }}
                  onBlur={() => {
                    setEmailFocused(false)
                    Animated.spring(emailFocusAnim, {
                      toValue: 0,
                      useNativeDriver: false,
                      tension: 100,
                      friction: 8,
                    }).start()
                  }}
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                />
              </Animated.View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>🔒 Contraseña</Text>
              <Animated.View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: passwordFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['rgba(255, 255, 255, 0.2)', 'rgba(34, 197, 94, 0.6)'],
                    }),
                    shadowOpacity: passwordFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.2],
                    }),
                    shadowColor: '#22c55e',
                  },
                ]}
              >
                <TextInput
                  ref={passwordInputRef}
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="********"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  secureTextEntry
                  returnKeyType="done"
                  onFocus={() => {
                    setPasswordFocused(true)
                    Animated.spring(passwordFocusAnim, {
                      toValue: 1,
                      useNativeDriver: false,
                      tension: 100,
                      friction: 8,
                    }).start()
                  }}
                  onBlur={() => {
                    setPasswordFocused(false)
                    Animated.spring(passwordFocusAnim, {
                      toValue: 0,
                      useNativeDriver: false,
                      tension: 100,
                      friction: 8,
                    }).start()
                  }}
                  onSubmitEditing={handleSubmit}
                />
              </Animated.View>
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
              Si no tienes cuenta, puedes crear una nueva cuenta de invitado.
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 10,
  },
  inputContainer: {
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'transparent',
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
