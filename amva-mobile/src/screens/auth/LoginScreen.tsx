import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Eye, EyeOff } from 'lucide-react-native'
import { useInvitadoAuth } from '@hooks/useInvitadoAuth'
import { useGoogleAuth } from '@hooks/useGoogleAuth'
import { invitadoAuthApi } from '@api/invitado-auth'
import { testBackendConnection } from '../../utils/testConnection'
import { RegisterScreen } from './RegisterScreen'
import { Alert } from '@utils/alert'

// Componente del logo de Google usando imagen
function GoogleLogo() {
  return (
    <View style={styles.googleLogoContainer}>
      <Image
        source={require('../../../assets/images/google.png')}
        style={styles.googleLogoImage}
        resizeMode="contain"
      />
    </View>
  )
}

export function LoginScreen() {
  const { login, loginWithGoogle, loading } = useInvitadoAuth()
  const { signIn: googleSignIn, loading: googleAuthLoading, error: googleAuthError } = useGoogleAuth()
  const scrollViewRef = useRef<ScrollView>(null)
  const emailInputRef = useRef<TextInput>(null)
  const passwordInputRef = useRef<TextInput>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const emailFocusAnim = useRef(new Animated.Value(0)).current
  const passwordFocusAnim = useRef(new Animated.Value(0)).current
  const logoScaleAnim = useRef(new Animated.Value(1)).current

  // Manejar errores de Google Auth
  useEffect(() => {
    if (googleAuthError) {
      console.warn('⚠️ Error en configuración de Google Auth:', googleAuthError)
    }
  }, [googleAuthError])

  // Función para manejar login con Google (nativo)
  const handleGoogleLogin = async () => {
    try {
      console.log('🔐 Iniciando login con Google (nativo)...')

      // Obtener idToken usando el hook nativo
      const idToken = await googleSignIn()

      if (!idToken) {
        throw new Error('No se recibió el token de Google')
      }

      console.log('✅ Token de Google obtenido, enviando al backend...')

      // Enviar token al backend usando el hook existente
      await loginWithGoogle(idToken)

      console.log('✅ Login con Google exitoso')
      // La navegación se actualizará automáticamente cuando el estado cambie
    } catch (error: unknown) {
      console.error('❌ Error en login con Google:', error)
      let errorMessage = 'No se pudo iniciar sesión con Google.'

      if (error instanceof Error) {
        // Si el usuario canceló, no mostrar error
        if (error.message.includes('canceló')) {
          console.log('ℹ️ Usuario canceló el inicio de sesión')
          return
        }
        errorMessage = error.message
      } else if (error && typeof error === 'object') {
        const axiosError = error as {
          response?: {
            status?: number
            data?: {
              message?: string | string[]
              error?: { message?: string }
            }
          }
          message?: string
        }

        // Manejar diferentes tipos de errores del backend
        if (axiosError.response?.status === 400) {
          errorMessage = 'Error de validación. Verifica que el token de Google sea válido.'
        } else if (axiosError.response?.status === 401) {
          errorMessage = 'Token de Google inválido o expirado. Por favor, intenta nuevamente.'
        } else if (axiosError.response?.status === 500) {
          errorMessage = 'Error del servidor. Por favor, intenta más tarde.'
        } else if (axiosError.response?.data?.message) {
          const msg = axiosError.response.data.message
          errorMessage = Array.isArray(msg) ? msg.join('\n') : msg
        } else if (axiosError.response?.data?.error?.message) {
          errorMessage = axiosError.response.data.error.message
        } else if (axiosError.message) {
          errorMessage = axiosError.message
        }
      }

      Alert.alert('Error de autenticación', errorMessage, undefined, 'error')
    }
  }

  // Probar conexión al montar el componente (solo en desarrollo)
  useEffect(() => {
    const testConnection = async () => {
      setTestingConnection(true)
      const isConnected = await testBackendConnection()
      if (!isConnected) {
        Alert.alert(
          '⚠️ Problema de Conexión',
          'No se pudo conectar al servidor.\n\nVerifica que:\n• El backend esté corriendo\n• La URL del API sea correcta\n• Estés en la misma red WiFi (si usas dispositivo físico)',
          [{ text: 'OK' }],
          'warning',
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

  const { height: screenHeight } = Dimensions.get('window')
  const isSmallScreen = screenHeight < 700

  const scrollToInput = (inputRef: React.RefObject<TextInput | null>, offset: number = 0) => {
    setTimeout(() => {
      if (inputRef.current && scrollViewRef.current) {
        inputRef.current.measureLayout(
          scrollViewRef.current as any,
          (_x: number, y: number) => {
            scrollViewRef.current?.scrollTo({
              y: y - 100 + offset,
              animated: true,
            })
          },
          () => { },
        )
      }
    }, 100)
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.contentContainer,
            keyboardVisible && styles.contentContainerKeyboard,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          bounces={false}
        >
          {/* Header con Logo */}
          <Animated.View
            style={[
              styles.header,
              isSmallScreen && styles.headerSmall,
              {
                transform: [{ scale: logoScaleAnim }],
              },
            ]}
          >
            <View style={[styles.logoContainer, isSmallScreen && styles.logoContainerSmall]}>
              <Image
                source={require('../../../assets/images/amvamovil.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          {/* Form Card */}
          <View style={[styles.card, isSmallScreen && styles.cardSmall]}>
            <Text style={[styles.cardTitle, isSmallScreen && styles.cardTitleSmall]}>Iniciar Sesión</Text>
            <Text style={[styles.cardSubtitle, isSmallScreen && styles.cardSubtitleSmall]}>Acceso para invitados registrados</Text>

            {testingConnection && (
              <View style={[styles.testingContainer, isSmallScreen && styles.testingContainerSmall]}>
                <ActivityIndicator size="small" color="#22c55e" />
                <Text style={[styles.testingText, isSmallScreen && styles.testingTextSmall]}>Verificando conexión...</Text>
              </View>
            )}

            <View style={[styles.inputGroup, isSmallScreen && styles.inputGroupSmall]}>
              <Text style={[styles.label, isSmallScreen && styles.labelSmall]}>📧 Correo electrónico</Text>
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
                  placeholder="tu.email@ejemplo.com (usado en AMVA)"
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
                    scrollToInput(emailInputRef)
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

            <View style={[styles.inputGroup, isSmallScreen && styles.inputGroupSmall]}>
              <Text style={[styles.label, isSmallScreen && styles.labelSmall]}>🔒 Contraseña</Text>
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
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Tu contraseña de acceso a AMVA Móvil"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onFocus={() => {
                    setPasswordFocused(true)
                    Animated.spring(passwordFocusAnim, {
                      toValue: 1,
                      useNativeDriver: false,
                      tension: 100,
                      friction: 8,
                    }).start()
                    scrollToInput(passwordInputRef, 20)
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
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="rgba(255, 255, 255, 0.6)" />
                  ) : (
                    <Eye size={20} color="rgba(255, 255, 255, 0.6)" />
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>

            <TouchableOpacity
              style={[styles.button, isSmallScreen && styles.buttonSmall, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={[styles.buttonText, isSmallScreen && styles.buttonTextSmall]}>✓ Iniciar sesión</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={[styles.divider, isSmallScreen && styles.dividerSmall]}>
              <View style={styles.dividerLine} />
              <Text style={[styles.dividerText, isSmallScreen && styles.dividerTextSmall]}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[
                styles.googleButton,
                isSmallScreen && styles.googleButtonSmall,
                googleAuthLoading && styles.buttonDisabled,
              ]}
              onPress={handleGoogleLogin}
              disabled={googleAuthLoading || !!googleAuthError}
            >
              {googleAuthLoading ? (
                <View style={styles.googleButtonContent}>
                  <ActivityIndicator color="#3c4043" size="small" />
                  <Text style={[styles.googleButtonText, isSmallScreen && styles.googleButtonTextSmall]}>Autenticando...</Text>
                </View>
              ) : (
                <View style={styles.googleButtonContent}>
                  <GoogleLogo />
                  <Text style={[styles.googleButtonText, isSmallScreen && styles.googleButtonTextSmall]}>Continuar con Google</Text>
                </View>
              )}
            </TouchableOpacity>
            {googleAuthError && (
              <Text style={[styles.hint, isSmallScreen && styles.hintSmall]}>
                ⚠️ Login con Google no disponible: {googleAuthError}
              </Text>
            )}

            <TouchableOpacity style={[styles.registerButton, isSmallScreen && styles.registerButtonSmall]} onPress={() => setShowRegister(true)}>
              <Text style={[styles.registerButtonText, isSmallScreen && styles.registerButtonTextSmall]}>📝 Crear nueva cuenta</Text>
            </TouchableOpacity>

            {!isSmallScreen && (
              <Text style={styles.hint}>
                Si no tienes cuenta, puedes crear una nueva cuenta de invitado.
              </Text>
            )}
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
    padding: 16,
    paddingTop: 12,
    paddingBottom: 16,
    justifyContent: 'center',
    minHeight: '100%',
  },
  contentContainerKeyboard: {
    paddingTop: 4,
    paddingBottom: 200,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 4,
  },
  headerSmall: {
    marginBottom: 8,
    paddingTop: 0,
  },
  logoContainer: {
    marginBottom: 12,
    width: 140,
    height: 140,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoContainerSmall: {
    width: 100,
    height: 100,
    marginBottom: 8,
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
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardSmall: {
    padding: 12,
    borderRadius: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  cardTitleSmall: {
    fontSize: 16,
  },
  cardSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 14,
    textAlign: 'center',
  },
  cardSubtitleSmall: {
    fontSize: 11,
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputGroupSmall: {
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: 10,
    marginBottom: 5,
  },
  inputContainer: {
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingRight: 40,
    color: '#fff',
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  passwordToggle: {
    position: 'absolute',
    right: 10,
    top: 10,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginTop: 4,
    backgroundColor: '#22c55e',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonSmall: {
    paddingVertical: 9,
    borderRadius: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  buttonTextSmall: {
    fontSize: 13,
  },
  hint: {
    marginTop: 12,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 16,
  },
  hintSmall: {
    fontSize: 10,
    marginTop: 8,
  },
  testingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    padding: 10,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  testingContainerSmall: {
    marginBottom: 10,
    padding: 8,
  },
  testingText: {
    marginLeft: 6,
    fontSize: 11,
    color: '#22c55e',
    fontWeight: '500',
  },
  testingTextSmall: {
    fontSize: 10,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerSmall: {
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  dividerTextSmall: {
    fontSize: 11,
    marginHorizontal: 8,
  },
  registerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  registerButtonSmall: {
    paddingVertical: 9,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  registerButtonTextSmall: {
    fontSize: 13,
  },
  googleButton: {
    marginTop: 6,
    backgroundColor: '#fff',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  googleButtonSmall: {
    paddingVertical: 9,
    marginBottom: 8,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleLogoContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleLogoImage: {
    width: 20,
    height: 20,
  },
  googleButtonText: {
    color: '#3c4043',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  googleButtonTextSmall: {
    fontSize: 13,
  },
})
