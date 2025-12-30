import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Image,
  Animated,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useInvitadoAuth } from '@hooks/useInvitadoAuth'
import { useGoogleAuth } from '@hooks/useGoogleAuth'
import { invitadoAuthApi } from '@api/invitado-auth'
import { Alert as CustomAlert } from '@utils/alert'
import { isUserCancellation, handleAuthError } from '@utils/errorHandler'
import { AuthTabs } from '@components/auth/AuthTabs'
import { LoginForm } from '@components/auth/LoginForm'
import { RegisterForm } from '@components/auth/RegisterForm'
import { WelcomeView } from '@components/auth/WelcomeView'
import { GoogleLoginButton } from '@components/auth/GoogleLoginButton'
import { useAuthValidation } from '@hooks/use-auth-validation'
import type { TextInput } from 'react-native'

interface Step1AuthProps {
  onComplete: (userData?: unknown) => void | Promise<void>
  onBack: () => void
}

export function Step1Auth({ onComplete, onBack }: Step1AuthProps) {
  const { login, loginWithGoogle, invitado, isAuthenticated } = useInvitadoAuth()
  const { signIn: googleSignIn, loading: googleAuthLoading } = useGoogleAuth()
  const { validateLogin, validateRegister } = useAuthValidation()
  
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Formulario de login
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })

  // Formulario de registro
  const [registerData, setRegisterData] = useState({
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
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const logoScaleAnim = useRef(new Animated.Value(1)).current
  const scrollViewRef = useRef<ScrollView>(null)

  // Manejar teclado
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true)
        Animated.spring(logoScaleAnim, {
          toValue: 0.7,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start()
      },
    )

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false)
        Animated.spring(logoScaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start()
      },
    )

    return () => {
      keyboardWillShow.remove()
      keyboardWillHide.remove()
    }
  }, [logoScaleAnim])

  // Si ya está autenticado, avanzar automáticamente
  useEffect(() => {
    if (isAuthenticated && invitado) {
      const timer = setTimeout(() => {
        void onComplete(invitado)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, invitado, onComplete])

  const handleGoogleLogin = async () => {
    try {
      // TODO: remove - console.log('🔐 Iniciando login con Google (nativo)...')
      const idToken = await googleSignIn()

      if (!idToken) {
        // TODO: remove - console.log('ℹ️ Usuario canceló el inicio de sesión con Google (token null)')
        return
      }

      // TODO: remove - console.log('✅ Token de Google obtenido, enviando al backend...')
      await loginWithGoogle(idToken)
      // TODO: remove - console.log('✅ Login con Google exitoso')
      await onComplete(invitado)
    } catch (error: unknown) {
      if (isUserCancellation(error)) {
        // TODO: remove - console.log('ℹ️ Usuario canceló el inicio de sesión con Google')
        return
      }

      const errorMessage = handleAuthError(error)
      CustomAlert.alert('Error', errorMessage, undefined, 'error')
    }
  }

  const handleLogin = async () => {
    Keyboard.dismiss()
    const validationErrors = validateLogin(loginData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      const firstError = Object.keys(validationErrors)[0]
      if (firstError) {
        Alert.alert('Campos inválidos', validationErrors[firstError], undefined, 'warning')
      }
      return
    }

    try {
      setLoading(true)
      await login(loginData.email, loginData.password)
      await onComplete(invitado)
    } catch (error: unknown) {
      const errorMessage = handleAuthError(error)
      CustomAlert.alert('Error de autenticación', errorMessage, undefined, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    Keyboard.dismiss()
    const validationErrors = validateRegister(registerData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      const firstError = Object.keys(validationErrors)[0]
      if (firstError) {
        Alert.alert('Campos inválidos', validationErrors[firstError], undefined, 'warning')
      }
      return
    }

    try {
      setLoading(true)
      const response = await invitadoAuthApi.registerComplete({
        nombre: registerData.nombre.trim(),
        apellido: registerData.apellido.trim(),
        email: registerData.email.trim().toLowerCase(),
        password: registerData.password,
        sede: registerData.sede.trim() || undefined,
        telefono: registerData.telefono.trim() || undefined,
      })

      // Guardar tokens
      await import('expo-secure-store').then(module =>
        Promise.all([
          module.default.setItemAsync('invitado_token', response.access_token),
          response.refresh_token
            ? module.default.setItemAsync('invitado_refresh_token', response.refresh_token)
            : Promise.resolve(),
        ]),
      )

      // Refrescar estado
      await login(registerData.email, registerData.password)
      await onComplete(invitado)
    } catch (error: unknown) {
      const errorMessage = handleAuthError(error)
      CustomAlert.alert('Error de registro', errorMessage, undefined, 'error')
    } finally {
      setLoading(false)
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
          () => {},
        )
      }
    }, 100)
  }

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Si ya está autenticado, mostrar vista de bienvenida
  if (isAuthenticated && invitado) {
    return <WelcomeView invitado={invitado} />
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
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                transform: [{ scale: logoScaleAnim }],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../../assets/images/amvamovil.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.subtitle}>Asociación Misionera Vida Abundante</Text>
          </Animated.View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Inscripción a Convención</Text>
            <Text style={styles.cardSubtitle}>Paso 1: Autenticación</Text>

            {/* Google Button */}
            <GoogleLoginButton
              onPress={handleGoogleLogin}
              loading={googleAuthLoading}
              error={undefined}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Tabs */}
            <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Login Form */}
            {activeTab === 'login' && (
              <LoginForm
                email={loginData.email}
                password={loginData.password}
                showPassword={showPassword}
                errors={errors}
                loading={loading}
                onEmailChange={value => {
                  setLoginData(prev => ({ ...prev, email: value }))
                  clearError('email')
                }}
                onPasswordChange={value => {
                  setLoginData(prev => ({ ...prev, password: value }))
                  clearError('password')
                }}
                onTogglePassword={() => setShowPassword(!showPassword)}
                onSubmit={handleLogin}
                onScrollToInput={scrollToInput}
              />
            )}

            {/* Register Form */}
            {activeTab === 'register' && (
              <RegisterForm
                nombre={registerData.nombre}
                apellido={registerData.apellido}
                email={registerData.email}
                password={registerData.password}
                confirmPassword={registerData.confirmPassword}
                sede={registerData.sede}
                telefono={registerData.telefono}
                showPassword={showPassword}
                showConfirmPassword={showConfirmPassword}
                errors={errors}
                loading={loading}
                onNombreChange={value => {
                  setRegisterData(prev => ({ ...prev, nombre: value }))
                  clearError('nombre')
                }}
                onApellidoChange={value => {
                  setRegisterData(prev => ({ ...prev, apellido: value }))
                  clearError('apellido')
                }}
                onEmailChange={value => {
                  setRegisterData(prev => ({ ...prev, email: value }))
                  clearError('email')
                }}
                onPasswordChange={value => {
                  setRegisterData(prev => ({ ...prev, password: value }))
                  clearError('password')
                }}
                onConfirmPasswordChange={value => {
                  setRegisterData(prev => ({ ...prev, confirmPassword: value }))
                  clearError('confirmPassword')
                }}
                onSedeChange={value => setRegisterData(prev => ({ ...prev, sede: value }))}
                onTelefonoChange={value => setRegisterData(prev => ({ ...prev, telefono: value }))}
                onTogglePassword={() => setShowPassword(!showPassword)}
                onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
                onSubmit={handleRegister}
                onScrollToInput={scrollToInput}
              />
            )}

            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
              <Text style={styles.backButtonText}>← Volver</Text>
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
    padding: 16,
    paddingTop: 20,
    paddingBottom: 32,
    justifyContent: 'center',
    minHeight: '100%',
  },
  contentContainerKeyboard: {
    paddingTop: 8,
    paddingBottom: 280,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
  },
  logoContainer: {
    marginBottom: 12,
    width: 180,
    height: 180,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 20,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerText: {
    marginHorizontal: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
  },
  backButton: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    fontWeight: '500',
  },
})

