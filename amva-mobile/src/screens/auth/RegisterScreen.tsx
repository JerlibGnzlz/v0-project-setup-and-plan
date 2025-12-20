import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
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
import { Mail, Lock, User, Phone, MapPin, CheckCircle, AlertCircle, Eye, EyeOff, UserPlus } from 'lucide-react-native'
import { invitadoAuthApi } from '@api/invitado-auth'
import * as SecureStore from 'expo-secure-store'
import { useInvitadoAuth } from '@hooks/useInvitadoAuth'
import { Alert } from '@utils/alert'

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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const logoScaleAnim = useRef(new Animated.Value(1)).current
  
  // Animaciones de focus para cada input
  const focusAnims = {
    nombre: useRef(new Animated.Value(0)).current,
    apellido: useRef(new Animated.Value(0)).current,
    email: useRef(new Animated.Value(0)).current,
    telefono: useRef(new Animated.Value(0)).current,
    sede: useRef(new Animated.Value(0)).current,
    password: useRef(new Animated.Value(0)).current,
    confirmPassword: useRef(new Animated.Value(0)).current,
  }

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

  // Manejar teclado
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true)
        Animated.spring(logoScaleAnim, {
          toValue: 0.6,
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

  const scrollToInput = (field: string, offset: number = 0) => {
    setTimeout(() => {
      const inputRef = inputRefs.current[field]
      if (inputRef && scrollViewRef.current) {
        inputRef.measureLayout(
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

  const handleInputFocus = (field: string) => {
    setFocusedField(field)
    const anim = focusAnims[field as keyof typeof focusAnims]
    if (anim) {
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start()
    }
    scrollToInput(field)
  }

  const handleInputBlur = (field: string, value: string) => {
    setFocusedField(null)
    const anim = focusAnims[field as keyof typeof focusAnims]
    if (anim) {
      Animated.spring(anim, {
        toValue: 0,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start()
    }
    
    // Validación en tiempo real al perder focus
    const trimmedValue = value?.trim() || ''
    if (trimmedValue.length > 0) {
      validateField(field, trimmedValue)
      
      // Cerrar teclado si el campo está completo y válido
      if (!errors[field]) {
        if (field === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (emailRegex.test(trimmedValue)) {
            setTimeout(() => Keyboard.dismiss(), 300)
          }
        } else if (field === 'telefono') {
          const digitsOnly = trimmedValue.replace(/\D/g, '')
          if (digitsOnly.length >= 8) {
            setTimeout(() => Keyboard.dismiss(), 300)
          }
        } else if (['nombre', 'apellido', 'sede'].includes(field)) {
          if (trimmedValue.length >= 2) {
            setTimeout(() => Keyboard.dismiss(), 300)
          }
        } else if (field === 'password' || field === 'confirmPassword') {
          if (trimmedValue.length >= 8 && !errors[field]) {
            setTimeout(() => Keyboard.dismiss(), 300)
          }
        }
      }
    }
  }

  const validateField = (field: string, value: string) => {
    const newErrors: Record<string, string> = { ...errors }
    
    switch (field) {
      case 'nombre':
        if (!value || value.trim().length < 2) {
          newErrors.nombre = 'El nombre debe tener al menos 2 caracteres'
        } else {
          delete newErrors.nombre
        }
        break
      case 'apellido':
        if (!value || value.trim().length < 2) {
          newErrors.apellido = 'El apellido debe tener al menos 2 caracteres'
        } else {
          delete newErrors.apellido
        }
        break
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!value || !emailRegex.test(value)) {
          newErrors.email = 'Correo electrónico inválido'
        } else {
          delete newErrors.email
        }
        break
      case 'password':
        if (!value || value.length < 8) {
          newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          newErrors.password = 'Debe contener mayúscula, minúscula y número'
        } else {
          delete newErrors.password
        }
        break
      case 'confirmPassword':
        if (value !== formData.password) {
          newErrors.confirmPassword = 'Las contraseñas no coinciden'
        } else {
          delete newErrors.confirmPassword
        }
        break
    }
    
    setErrors(newErrors)
  }


  const handleSubmit = async () => {
    Keyboard.dismiss()
    if (!validateForm()) {
      // Scroll al primer error
      const firstErrorField = Object.keys(errors)[0]
      if (firstErrorField) {
        scrollToInput(firstErrorField)
        inputRefs.current[firstErrorField]?.focus()
      }
      Alert.alert(
        'Campos inválidos',
        'Por favor completa todos los campos correctamente.',
        undefined,
        'warning',
      )
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

      Alert.alert('Error de registro', errorMessage, undefined, 'error')
    } finally {
      setLoading(false)
    }
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
                source={require('../../../assets/images/amvamovil.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.subtitle}>Asociación Misionera Vida Abundante</Text>
          </Animated.View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Crear Cuenta</Text>
            <Text style={styles.cardSubtitle}>Registro para invitados</Text>

            {/* Nombre y Apellido */}
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>
                  <User size={14} color="rgba(255, 255, 255, 0.6)" /> Nombre <Text style={styles.required}>*</Text>
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
                      shadowOpacity: focusAnims.nombre.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 0.2],
                      }),
                      shadowColor: errors.nombre ? '#ef4444' : '#22c55e',
                    },
                    errors.nombre && styles.inputErrorContainer,
                  ]}
                >
                  <TextInput
                    ref={ref => {
                      inputRefs.current['nombre'] = ref
                    }}
                    style={styles.input}
                    value={formData.nombre}
                    onChangeText={value => handleChange('nombre', value)}
                    placeholder="Nombre"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    autoCapitalize="words"
                    returnKeyType="next"
                    onFocus={() => handleInputFocus('nombre')}
                    onBlur={() => handleInputBlur('nombre', formData.nombre)}
                    onSubmitEditing={() => inputRefs.current['apellido']?.focus()}
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
                  <User size={14} color="rgba(255, 255, 255, 0.6)" /> Apellido <Text style={styles.required}>*</Text>
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
                      shadowOpacity: focusAnims.apellido.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 0.2],
                      }),
                      shadowColor: errors.apellido ? '#ef4444' : '#22c55e',
                    },
                    errors.apellido && styles.inputErrorContainer,
                  ]}
                >
                  <TextInput
                    ref={ref => {
                      inputRefs.current['apellido'] = ref
                    }}
                    style={styles.input}
                    value={formData.apellido}
                    onChangeText={value => handleChange('apellido', value)}
                    placeholder="Apellido"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    autoCapitalize="words"
                    returnKeyType="next"
                    onFocus={() => handleInputFocus('apellido')}
                    onBlur={() => handleInputBlur('apellido', formData.apellido)}
                    onSubmitEditing={() => inputRefs.current['email']?.focus()}
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

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Mail size={14} color="rgba(255, 255, 255, 0.6)" /> Correo electrónico <Text style={styles.required}>*</Text>
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
                  ref={ref => {
                    inputRefs.current['email'] = ref
                  }}
                  style={styles.input}
                  value={formData.email}
                  onChangeText={value => handleChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  returnKeyType="next"
                  onFocus={() => handleInputFocus('email')}
                  onBlur={() => handleInputBlur('email', formData.email)}
                  onSubmitEditing={() => inputRefs.current['telefono']?.focus()}
                />
              </Animated.View>
              {errors.email && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={12} color="#ef4444" />
                  <Text style={styles.errorText}>{errors.email}</Text>
                </View>
              )}
            </View>

            {/* Teléfono */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Phone size={14} color="rgba(255, 255, 255, 0.6)" /> Teléfono
              </Text>
              <Animated.View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: focusAnims.telefono.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['rgba(255, 255, 255, 0.2)', 'rgba(34, 197, 94, 0.6)'],
                    }),
                    shadowOpacity: focusAnims.telefono.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.2],
                    }),
                    shadowColor: '#22c55e',
                  },
                ]}
              >
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
                  onSubmitEditing={() => inputRefs.current['sede']?.focus()}
                />
              </Animated.View>
            </View>

            {/* Sede */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <MapPin size={14} color="rgba(255, 255, 255, 0.6)" /> Iglesia / Sede
              </Text>
              <Animated.View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: focusAnims.sede.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['rgba(255, 255, 255, 0.2)', 'rgba(34, 197, 94, 0.6)'],
                    }),
                    shadowOpacity: focusAnims.sede.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.2],
                    }),
                    shadowColor: '#22c55e',
                  },
                ]}
              >
                <TextInput
                  ref={ref => {
                    inputRefs.current['sede'] = ref
                  }}
                  style={styles.input}
                  value={formData.sede}
                  onChangeText={value => handleChange('sede', value)}
                  placeholder="Nombre de la iglesia"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  autoCapitalize="words"
                  returnKeyType="next"
                  onFocus={() => handleInputFocus('sede')}
                  onBlur={() => handleInputBlur('sede', formData.sede)}
                  onSubmitEditing={() => inputRefs.current['password']?.focus()}
                />
              </Animated.View>
            </View>

            {/* Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Lock size={14} color="rgba(255, 255, 255, 0.6)" /> Contraseña <Text style={styles.required}>*</Text>
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
                  ref={ref => {
                    inputRefs.current['password'] = ref
                  }}
                  style={styles.passwordInput}
                  value={formData.password}
                  onChangeText={value => handleChange('password', value)}
                  secureTextEntry={!showPassword}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  returnKeyType="next"
                  onFocus={() => handleInputFocus('password')}
                  onBlur={() => handleInputBlur('password', formData.password)}
                  onSubmitEditing={() => inputRefs.current['confirmPassword']?.focus()}
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
              {errors.password && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={12} color="#ef4444" />
                  <Text style={styles.errorText}>{errors.password}</Text>
                </View>
              )}
              {!errors.password && formData.password.length > 0 && (
                <View style={styles.helperContainer}>
                  <CheckCircle size={12} color="#22c55e" />
                  <Text style={styles.helperText}>
                    Debe contener mayúscula, minúscula y número
                  </Text>
                </View>
              )}
              {!formData.password && (
                <Text style={styles.helperText}>
                  Debe contener al menos una mayúscula, una minúscula y un número
                </Text>
              )}
            </View>

            {/* Confirmar Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Lock size={14} color="rgba(255, 255, 255, 0.6)" /> Confirmar Contraseña <Text style={styles.required}>*</Text>
              </Text>
              <Animated.View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: focusAnims.confirmPassword.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        errors.confirmPassword ? 'rgba(239, 68, 68, 0.6)' : 'rgba(255, 255, 255, 0.2)',
                        'rgba(34, 197, 94, 0.6)',
                      ],
                    }),
                    shadowOpacity: focusAnims.confirmPassword.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.2],
                    }),
                    shadowColor: errors.confirmPassword ? '#ef4444' : '#22c55e',
                  },
                  errors.confirmPassword && styles.inputErrorContainer,
                ]}
              >
                <TextInput
                  ref={ref => {
                    inputRefs.current['confirmPassword'] = ref
                  }}
                  style={styles.passwordInput}
                  value={formData.confirmPassword}
                  onChangeText={value => handleChange('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  returnKeyType="done"
                  onFocus={() => handleInputFocus('confirmPassword')}
                  onBlur={() => handleInputBlur('confirmPassword', formData.confirmPassword)}
                  onSubmitEditing={() => {
                    Keyboard.dismiss()
                    if (validateForm()) {
                      void handleSubmit()
                    }
                  }}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="rgba(255, 255, 255, 0.6)" />
                  ) : (
                    <Eye size={20} color="rgba(255, 255, 255, 0.6)" />
                  )}
                </TouchableOpacity>
              </Animated.View>
              {errors.confirmPassword && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={12} color="#ef4444" />
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                </View>
              )}
              {!errors.confirmPassword && formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword && (
                <View style={styles.helperContainer}>
                  <CheckCircle size={12} color="#22c55e" />
                  <Text style={[styles.helperText, { color: '#22c55e' }]}>Las contraseñas coinciden</Text>
                </View>
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
                <View style={styles.buttonContent}>
                  <UserPlus size={16} color="#fff" />
                  <Text style={styles.buttonText}>Crear Cuenta</Text>
                </View>
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
    padding: 16,
    paddingTop: 20,
    paddingBottom: 32,
    minHeight: '100%',
  },
  contentContainerKeyboard: {
    paddingTop: 8,
    paddingBottom: 360,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  logoContainer: {
    marginBottom: 10,
    width: 160,
    height: 160,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 12,
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
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  halfInput: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
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
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: '#fff',
    fontSize: 15,
    backgroundColor: 'transparent',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    paddingRight: 45,
    color: '#fff',
    fontSize: 15,
    backgroundColor: 'transparent',
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 11,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
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
