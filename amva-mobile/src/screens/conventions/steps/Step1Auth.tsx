import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Image,
  Animated,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Mail, Lock, User, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react-native'
import { useInvitadoAuth } from '@hooks/useInvitadoAuth'
import { useGoogleAuth } from '@hooks/useGoogleAuth'
import { invitadoAuthApi } from '@api/invitado-auth'
import { Alert } from '@utils/alert'
import { useNavigation } from '@react-navigation/native'

interface Step1AuthProps {
  onComplete: (userData?: any) => void | Promise<void>
  onBack: () => void
}

export function Step1Auth({ onComplete, onBack }: Step1AuthProps) {
  const navigation = useNavigation()
  const { login, loginWithGoogle, invitado, isAuthenticated } = useInvitadoAuth()
  const { signIn: googleSignIn, loading: googleAuthLoading } = useGoogleAuth()
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

  // Animaciones de focus para inputs
  const focusAnims = {
    email: useRef(new Animated.Value(0)).current,
    password: useRef(new Animated.Value(0)).current,
    nombre: useRef(new Animated.Value(0)).current,
    apellido: useRef(new Animated.Value(0)).current,
    sede: useRef(new Animated.Value(0)).current,
    telefono: useRef(new Animated.Value(0)).current,
  }

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
      console.log('🔐 Iniciando login con Google (nativo)...')
      
      // Obtener idToken usando el hook nativo
      const idToken = await googleSignIn()
      
      if (!idToken) {
        throw new Error('No se recibió el token de Google')
      }

      console.log('✅ Token de Google obtenido, enviando al backend...')
      
      // Enviar token al backend
      await loginWithGoogle(idToken)
      
      console.log('✅ Login con Google exitoso')
      await onComplete(invitado)
    } catch (error: unknown) {
      // Si el usuario canceló, no mostrar error
      if (error instanceof Error && error.message.includes('canceló')) {
        console.log('ℹ️ Usuario canceló el inicio de sesión')
        return
      }
      
      const errorMessage =
        error instanceof Error ? (error.message || 'Error desconocido') : 'Error desconocido'
      Alert.alert('Error', errorMessage, undefined, 'error')
    }
  }

  const validateLogin = () => {
    const newErrors: Record<string, string> = {}
    if (!loginData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(loginData.email)) {
        newErrors.email = 'Correo electrónico inválido'
      }
    }
    if (!loginData.password || loginData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateRegister = () => {
    const newErrors: Record<string, string> = {}
    if (!registerData.nombre || registerData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres'
    }
    if (!registerData.apellido || registerData.apellido.trim().length < 2) {
      newErrors.apellido = 'El apellido debe tener al menos 2 caracteres'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!registerData.email || !emailRegex.test(registerData.email)) {
      newErrors.email = 'Correo electrónico inválido'
    }
    if (!registerData.password || registerData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(registerData.password)) {
      newErrors.password = 'Debe contener mayúscula, minúscula y número'
    }
    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async () => {
    Keyboard.dismiss()
    if (!validateLogin()) {
      const firstError = Object.keys(errors)[0]
      if (firstError) {
        Alert.alert('Campos inválidos', errors[firstError], undefined, 'warning')
      }
      return
    }

    try {
      setLoading(true)
      await login(loginData.email, loginData.password)
      await onComplete(invitado)
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? (error.message || 'Error desconocido') : 'Error desconocido'
      Alert.alert('Error de autenticación', errorMessage, undefined, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    Keyboard.dismiss()
    if (!validateRegister()) {
      const firstError = Object.keys(errors)[0]
      if (firstError) {
        Alert.alert('Campos inválidos', errors[firstError], undefined, 'warning')
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
      const errorMessage =
        error instanceof Error ? (error.message || 'Error desconocido') : 'Error desconocido'
      Alert.alert('Error de registro', errorMessage, undefined, 'error')
    } finally {
      setLoading(false)
    }
  }

  const scrollViewRef = useRef<ScrollView>(null)

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
          () => {},
        )
      }
    }, 100)
  }

  // Si ya está autenticado, mostrar vista de bienvenida
  if (isAuthenticated && invitado) {
    return (
      <View style={styles.welcomeContainer}>
        <View style={styles.welcomeCard}>
          <View style={styles.avatarContainer}>
            {invitado.fotoUrl ? (
              <Image source={{ uri: invitado.fotoUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={40} color="#22c55e" />
              </View>
            )}
            <View style={styles.checkBadge}>
              <CheckCircle size={16} color="#fff" />
            </View>
          </View>
          <Text style={styles.welcomeTitle}>¡Bienvenido, {invitado.nombre}!</Text>
          <Text style={styles.welcomeEmail}>{invitado.email}</Text>
          <View style={styles.googleBadge}>
            <Text style={styles.googleBadgeText}>Autenticado con Google</Text>
          </View>
          <Text style={styles.welcomeMessage}>Redirigiendo al formulario...</Text>
        </View>
      </View>
    )
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
                source={require('../../../../assets/images/amvadigital.png')}
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
            <TouchableOpacity
              style={[styles.googleButton, googleAuthLoading && styles.buttonDisabled]}
              onPress={handleGoogleLogin}
              disabled={googleAuthLoading}
            >
              {googleAuthLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.googleButtonText}>🔵 Continuar con Google</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'login' && styles.tabActive]}
                onPress={() => setActiveTab('login')}
              >
                <Text
                  style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}
                >
                  Iniciar Sesión
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'register' && styles.tabActive]}
                onPress={() => setActiveTab('register')}
              >
                <Text
                  style={[styles.tabText, activeTab === 'register' && styles.tabTextActive]}
                >
                  Crear Cuenta
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Form */}
            {activeTab === 'login' && (
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    <Mail size={12} color="rgba(255, 255, 255, 0.6)" /> Correo electrónico{' '}
                    <Text style={styles.required}>*</Text>
                  </Text>
                  <Animated.View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: focusAnims.email.interpolate({
                          inputRange: [0, 1],
                          outputRange: [
                            errors.email ? 'rgba(239, 68, 68, 0.6)' : 'rgba(255, 255, 255, 0.2)',
                            'rgba(34, 197, 94, 0.6)',
                          ],
                        }),
                        shadowOpacity: focusAnims.email.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 0.2],
                        }),
                        shadowColor: errors.email ? '#ef4444' : '#22c55e',
                      },
                      errors.email && styles.inputErrorContainer,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      value={loginData.email}
                      onChangeText={value => {
                        setLoginData(prev => ({ ...prev, email: value }))
                        if (errors.email) {
                          setErrors(prev => {
                            const newErrors = { ...prev }
                            delete newErrors.email
                            return newErrors
                          })
                        }
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholder="tu@email.com"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      onFocus={() => {
                        Animated.spring(focusAnims.email, {
                          toValue: 1,
                          useNativeDriver: false,
                        }).start()
                        scrollToInput({ current: null }, 0)
                      }}
                      onBlur={() => {
                        Animated.spring(focusAnims.email, {
                          toValue: 0,
                          useNativeDriver: false,
                        }).start()
                      }}
                    />
                  </Animated.View>
                  {errors.email && (
                    <View style={styles.errorContainer}>
                      <AlertCircle size={12} color="#ef4444" />
                      <Text style={styles.errorText}>{errors.email}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    <Lock size={12} color="rgba(255, 255, 255, 0.6)" /> Contraseña{' '}
                    <Text style={styles.required}>*</Text>
                  </Text>
                  <Animated.View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: focusAnims.password.interpolate({
                          inputRange: [0, 1],
                          outputRange: [
                            errors.password ? 'rgba(239, 68, 68, 0.6)' : 'rgba(255, 255, 255, 0.2)',
                            'rgba(34, 197, 94, 0.6)',
                          ],
                        }),
                        shadowOpacity: focusAnims.password.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 0.2],
                        }),
                        shadowColor: errors.password ? '#ef4444' : '#22c55e',
                      },
                      errors.password && styles.inputErrorContainer,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      value={loginData.password}
                      onChangeText={value => {
                        setLoginData(prev => ({ ...prev, password: value }))
                        if (errors.password) {
                          setErrors(prev => {
                            const newErrors = { ...prev }
                            delete newErrors.password
                            return newErrors
                          })
                        }
                      }}
                      secureTextEntry={!showPassword}
                      placeholder="••••••••"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      onFocus={() => {
                        Animated.spring(focusAnims.password, {
                          toValue: 1,
                          useNativeDriver: false,
                        }).start()
                      }}
                      onBlur={() => {
                        Animated.spring(focusAnims.password, {
                          toValue: 0,
                          useNativeDriver: false,
                        }).start()
                      }}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={18} color="rgba(255, 255, 255, 0.6)" />
                      ) : (
                        <Eye size={18} color="rgba(255, 255, 255, 0.6)" />
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                  {errors.password && (
                    <View style={styles.errorContainer}>
                      <AlertCircle size={12} color="#ef4444" />
                      <Text style={styles.errorText}>{errors.password}</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#22c55e', '#16a34a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <CheckCircle size={18} color="#fff" />
                        <Text style={styles.buttonText}>Iniciar Sesión</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* Register Form */}
            {activeTab === 'register' && (
              <View style={styles.form}>
                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>
                      <User size={12} color="rgba(255, 255, 255, 0.6)" /> Nombre{' '}
                      <Text style={styles.required}>*</Text>
                    </Text>
                    <Animated.View
                      style={[
                        styles.inputContainer,
                        {
                          borderColor: focusAnims.nombre.interpolate({
                            inputRange: [0, 1],
                            outputRange: [
                              errors.nombre ? 'rgba(239, 68, 68, 0.6)' : 'rgba(255, 255, 255, 0.2)',
                              'rgba(34, 197, 94, 0.6)',
                            ],
                          }),
                        },
                        errors.nombre && styles.inputErrorContainer,
                      ]}
                    >
                      <TextInput
                        style={styles.input}
                        value={registerData.nombre}
                        onChangeText={value => {
                          setRegisterData(prev => ({ ...prev, nombre: value }))
                          if (errors.nombre) {
                            setErrors(prev => {
                              const newErrors = { ...prev }
                              delete newErrors.nombre
                              return newErrors
                            })
                          }
                        }}
                        placeholder="Tu nombre"
                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                        autoCapitalize="words"
                        onFocus={() => {
                          Animated.spring(focusAnims.nombre, {
                            toValue: 1,
                            useNativeDriver: false,
                          }).start()
                        }}
                        onBlur={() => {
                          Animated.spring(focusAnims.nombre, {
                            toValue: 0,
                            useNativeDriver: false,
                          }).start()
                        }}
                      />
                    </Animated.View>
                    {errors.nombre && (
                      <View style={styles.errorContainer}>
                        <AlertCircle size={12} color="#ef4444" />
                        <Text style={styles.errorText}>{errors.nombre}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.halfInput}>
                    <Text style={styles.label}>
                      <User size={12} color="rgba(255, 255, 255, 0.6)" /> Apellido{' '}
                      <Text style={styles.required}>*</Text>
                    </Text>
                    <Animated.View
                      style={[
                        styles.inputContainer,
                        {
                          borderColor: focusAnims.apellido.interpolate({
                            inputRange: [0, 1],
                            outputRange: [
                              errors.apellido ? 'rgba(239, 68, 68, 0.6)' : 'rgba(255, 255, 255, 0.2)',
                              'rgba(34, 197, 94, 0.6)',
                            ],
                          }),
                        },
                        errors.apellido && styles.inputErrorContainer,
                      ]}
                    >
                      <TextInput
                        style={styles.input}
                        value={registerData.apellido}
                        onChangeText={value => {
                          setRegisterData(prev => ({ ...prev, apellido: value }))
                          if (errors.apellido) {
                            setErrors(prev => {
                              const newErrors = { ...prev }
                              delete newErrors.apellido
                              return newErrors
                            })
                          }
                        }}
                        placeholder="Tu apellido"
                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                        autoCapitalize="words"
                        onFocus={() => {
                          Animated.spring(focusAnims.apellido, {
                            toValue: 1,
                            useNativeDriver: false,
                          }).start()
                        }}
                        onBlur={() => {
                          Animated.spring(focusAnims.apellido, {
                            toValue: 0,
                            useNativeDriver: false,
                          }).start()
                        }}
                      />
                    </Animated.View>
                    {errors.apellido && (
                      <View style={styles.errorContainer}>
                        <AlertCircle size={12} color="#ef4444" />
                        <Text style={styles.errorText}>{errors.apellido}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    <Mail size={12} color="rgba(255, 255, 255, 0.6)" /> Correo electrónico{' '}
                    <Text style={styles.required}>*</Text>
                  </Text>
                  <Animated.View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: focusAnims.email.interpolate({
                          inputRange: [0, 1],
                          outputRange: [
                            errors.email ? 'rgba(239, 68, 68, 0.6)' : 'rgba(255, 255, 255, 0.2)',
                            'rgba(34, 197, 94, 0.6)',
                          ],
                        }),
                      },
                      errors.email && styles.inputErrorContainer,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      value={registerData.email}
                      onChangeText={value => {
                        setRegisterData(prev => ({ ...prev, email: value }))
                        if (errors.email) {
                          setErrors(prev => {
                            const newErrors = { ...prev }
                            delete newErrors.email
                            return newErrors
                          })
                        }
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholder="tu@email.com"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      onFocus={() => {
                        Animated.spring(focusAnims.email, {
                          toValue: 1,
                          useNativeDriver: false,
                        }).start()
                      }}
                      onBlur={() => {
                        Animated.spring(focusAnims.email, {
                          toValue: 0,
                          useNativeDriver: false,
                        }).start()
                      }}
                    />
                  </Animated.View>
                  {errors.email && (
                    <View style={styles.errorContainer}>
                      <AlertCircle size={12} color="#ef4444" />
                      <Text style={styles.errorText}>{errors.email}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    <Lock size={12} color="rgba(255, 255, 255, 0.6)" /> Contraseña{' '}
                    <Text style={styles.required}>*</Text>
                  </Text>
                  <Animated.View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: focusAnims.password.interpolate({
                          inputRange: [0, 1],
                          outputRange: [
                            errors.password ? 'rgba(239, 68, 68, 0.6)' : 'rgba(255, 255, 255, 0.2)',
                            'rgba(34, 197, 94, 0.6)',
                          ],
                        }),
                      },
                      errors.password && styles.inputErrorContainer,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      value={registerData.password}
                      onChangeText={value => {
                        setRegisterData(prev => ({ ...prev, password: value }))
                        if (errors.password) {
                          setErrors(prev => {
                            const newErrors = { ...prev }
                            delete newErrors.password
                            return newErrors
                          })
                        }
                      }}
                      secureTextEntry={!showPassword}
                      placeholder="Mínimo 8 caracteres"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      onFocus={() => {
                        Animated.spring(focusAnims.password, {
                          toValue: 1,
                          useNativeDriver: false,
                        }).start()
                      }}
                      onBlur={() => {
                        Animated.spring(focusAnims.password, {
                          toValue: 0,
                          useNativeDriver: false,
                        }).start()
                      }}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={18} color="rgba(255, 255, 255, 0.6)" />
                      ) : (
                        <Eye size={18} color="rgba(255, 255, 255, 0.6)" />
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                  {errors.password && (
                    <View style={styles.errorContainer}>
                      <AlertCircle size={12} color="#ef4444" />
                      <Text style={styles.errorText}>{errors.password}</Text>
                    </View>
                  )}
                  <Text style={styles.helperText}>
                    Debe contener mayúscula, minúscula y número
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    <Lock size={12} color="rgba(255, 255, 255, 0.6)" /> Confirmar Contraseña{' '}
                    <Text style={styles.required}>*</Text>
                  </Text>
                  <Animated.View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: focusAnims.password.interpolate({
                          inputRange: [0, 1],
                          outputRange: [
                            errors.confirmPassword
                              ? 'rgba(239, 68, 68, 0.6)'
                              : 'rgba(255, 255, 255, 0.2)',
                            'rgba(34, 197, 94, 0.6)',
                          ],
                        }),
                      },
                      errors.confirmPassword && styles.inputErrorContainer,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      value={registerData.confirmPassword}
                      onChangeText={value => {
                        setRegisterData(prev => ({ ...prev, confirmPassword: value }))
                        if (errors.confirmPassword) {
                          setErrors(prev => {
                            const newErrors = { ...prev }
                            delete newErrors.confirmPassword
                            return newErrors
                          })
                        }
                      }}
                      secureTextEntry={!showConfirmPassword}
                      placeholder="Repite tu contraseña"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      onFocus={() => {
                        Animated.spring(focusAnims.password, {
                          toValue: 1,
                          useNativeDriver: false,
                        }).start()
                      }}
                      onBlur={() => {
                        Animated.spring(focusAnims.password, {
                          toValue: 0,
                          useNativeDriver: false,
                        }).start()
                      }}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} color="rgba(255, 255, 255, 0.6)" />
                      ) : (
                        <Eye size={18} color="rgba(255, 255, 255, 0.6)" />
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                  {errors.confirmPassword && (
                    <View style={styles.errorContainer}>
                      <AlertCircle size={12} color="#ef4444" />
                      <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                    </View>
                  )}
                  {!errors.confirmPassword &&
                    registerData.confirmPassword.length > 0 &&
                    registerData.password === registerData.confirmPassword && (
                      <View style={styles.helperContainer}>
                        <CheckCircle size={12} color="#22c55e" />
                        <Text style={[styles.helperText, { color: '#22c55e' }]}>
                          Las contraseñas coinciden
                        </Text>
                      </View>
                    )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    <User size={12} color="rgba(255, 255, 255, 0.6)" /> Iglesia / Sede
                  </Text>
                  <Animated.View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: focusAnims.sede.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['rgba(255, 255, 255, 0.2)', 'rgba(34, 197, 94, 0.6)'],
                        }),
                      },
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      value={registerData.sede}
                      onChangeText={value => setRegisterData(prev => ({ ...prev, sede: value }))}
                      placeholder="Nombre de tu iglesia o sede"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      autoCapitalize="words"
                      onFocus={() => {
                        Animated.spring(focusAnims.sede, {
                          toValue: 1,
                          useNativeDriver: false,
                        }).start()
                      }}
                      onBlur={() => {
                        Animated.spring(focusAnims.sede, {
                          toValue: 0,
                          useNativeDriver: false,
                        }).start()
                      }}
                    />
                  </Animated.View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    <Mail size={12} color="rgba(255, 255, 255, 0.6)" /> Teléfono
                  </Text>
                  <Animated.View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: focusAnims.telefono.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['rgba(255, 255, 255, 0.2)', 'rgba(34, 197, 94, 0.6)'],
                        }),
                      },
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      value={registerData.telefono}
                      onChangeText={value => setRegisterData(prev => ({ ...prev, telefono: value }))}
                      keyboardType="phone-pad"
                      placeholder="+54 11 1234-5678"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      onFocus={() => {
                        Animated.spring(focusAnims.telefono, {
                          toValue: 1,
                          useNativeDriver: false,
                        }).start()
                      }}
                      onBlur={() => {
                        Animated.spring(focusAnims.telefono, {
                          toValue: 0,
                          useNativeDriver: false,
                        }).start()
                      }}
                    />
                  </Animated.View>
                </View>

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#22c55e', '#16a34a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <CheckCircle size={18} color="#fff" />
                        <Text style={styles.buttonText}>Crear Cuenta</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
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
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 18,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 2,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#22c55e',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  form: {
    gap: 14,
  },
  inputGroup: {
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  halfInput: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.65)',
    marginBottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  required: {
    color: '#ef4444',
  },
  inputContainer: {
    borderWidth: 1.5,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputErrorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.03)',
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: '#fff',
    fontSize: 15,
    backgroundColor: 'transparent',
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
  },
  errorText: {
    fontSize: 11,
    color: '#f87171',
    flex: 1,
  },
  helperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
  },
  helperText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
    flex: 1,
  },
  button: {
    marginTop: 6,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 13,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  googleButton: {
    marginTop: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#60a5fa',
    fontSize: 14,
    fontWeight: '500',
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
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    padding: 4,
  },
  welcomeTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  welcomeEmail: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    marginBottom: 12,
  },
  googleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  googleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  welcomeMessage: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
})

