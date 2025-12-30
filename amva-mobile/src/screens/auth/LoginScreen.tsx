import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { UserPlus } from 'lucide-react-native'
import { useInvitadoAuth } from '@hooks/useInvitadoAuth'
import { useGoogleAuthProxy } from '@hooks/useGoogleAuthProxy'
import { testBackendConnection } from '../../utils/testConnection'
import { RegisterScreen } from './RegisterScreen'
import { Alert } from '@utils/alert'
import { handleAuthError, isUserCancellation } from '@utils/errorHandler'
import { EmailPasswordForm } from '@components/auth/EmailPasswordForm'
import { GoogleLoginButton } from '@components/auth/GoogleLoginButton'
import { ConnectionTest } from '@components/auth/ConnectionTest'
import { LoadingButton } from '@components/ui/LoadingButton'

export function LoginScreen() {
  const { login, loginWithGoogle, loading } = useInvitadoAuth()
  const { signIn: googleSignIn, loading: googleAuthLoading, error: googleAuthError } = useGoogleAuthProxy()

  const scrollViewRef = useRef<ScrollView>(null)
  const emailInputRef = useRef<TextInput>(null)
  const passwordInputRef = useRef<TextInput>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const logoScaleAnim = useRef(new Animated.Value(1)).current

  // Manejar visibilidad del teclado
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true))
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false))
    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

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

  // Función para manejar login con Google (Backend Proxy)
  const handleGoogleLogin = async () => {
    try {
      const idToken = await googleSignIn()

      if (!idToken) {
        return
      }

      await loginWithGoogle(idToken)
    } catch (error: unknown) {
      // Si el usuario canceló, salir silenciosamente
      if (isUserCancellation(error)) {
        return
      }

      const errorMessage = handleAuthError(error)
      Alert.alert('Error de autenticación', errorMessage, undefined, 'error')
    }
  }

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Campos requeridos', 'Ingresa tu correo y contraseña.', undefined, 'warning')
      return
    }
    try {
      // TODO: remove - console.log('🔐 Intentando login como invitado:', email.trim())
      await login(email.trim(), password)
      // TODO: remove - console.log('✅ Login exitoso')
    } catch (error: unknown) {
      // TODO: remove - console.error('❌ Error en login:', error)
      const errorMessage = handleAuthError(error)
      Alert.alert('Error de inicio de sesión', errorMessage, undefined, 'error')
    }
  }

  const scrollToInput = (inputRef: React.RefObject<TextInput>, offset: number = 0) => {
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

  if (showRegister) {
    return (
      <RegisterScreen
        onSuccess={() => {
          setShowRegister(false)
        }}
        onBack={() => setShowRegister(false)}
      />
    )
  }

  const { height: screenHeight } = Dimensions.get('window')
  const isSmallScreen = screenHeight < 700

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
            <Text style={[styles.cardSubtitle, isSmallScreen && styles.cardSubtitleSmall]}>
              Acceso para invitados registrados
            </Text>

            <ConnectionTest testing={testingConnection} isSmallScreen={isSmallScreen} />

            <EmailPasswordForm
              email={email}
              password={password}
              showPassword={showPassword}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              isSmallScreen={isSmallScreen}
              emailInputRef={emailInputRef}
              passwordInputRef={passwordInputRef}
              onScrollToInput={scrollToInput}
              onPasswordSubmit={handleSubmit}
            />

            <LoadingButton
              onPress={handleSubmit}
              loading={loading}
              title="✓ Iniciar sesión"
              isSmallScreen={isSmallScreen}
            />

            <View style={[styles.divider, isSmallScreen && styles.dividerSmall]}>
              <View style={styles.dividerLine} />
              <Text style={[styles.dividerText, isSmallScreen && styles.dividerTextSmall]}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            <GoogleLoginButton
              onPress={handleGoogleLogin}
              loading={googleAuthLoading}
              isSmallScreen={isSmallScreen}
              error={googleAuthError}
            />

            {googleAuthError && googleAuthError.includes('DEVELOPER_ERROR') && (
              <Text style={[styles.hint, isSmallScreen && styles.hintSmall, { color: '#f59e0b' }]}>
                ⚠️ Configuración requerida: Agrega el SHA-1 BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3 en Google Cloud Console. Consulta docs/SHA1_CORRECTO_GOOGLE_OAUTH.md
              </Text>
            )}

            <TouchableOpacity
              style={[styles.registerButton, isSmallScreen && styles.registerButtonSmall]}
              onPress={() => setShowRegister(true)}
            >
              <View style={styles.registerButtonContent}>
                <UserPlus size={14} color="rgba(255, 255, 255, 0.9)" />
                <Text style={[styles.registerButtonText, isSmallScreen && styles.registerButtonTextSmall]}>
                  Crear nueva cuenta
                </Text>
              </View>
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
  registerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  registerButtonTextSmall: {
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
})
