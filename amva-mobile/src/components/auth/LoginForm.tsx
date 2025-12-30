import React, { useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Mail, Lock, CheckCircle, Eye, EyeOff } from 'lucide-react-native'
import { FormField } from '../ui/FormField'
import { LoadingButton } from '../ui/LoadingButton'
import type { TextInput } from 'react-native'

interface LoginFormProps {
  email: string
  password: string
  showPassword: boolean
  errors: Record<string, string>
  loading: boolean
  onEmailChange: (email: string) => void
  onPasswordChange: (password: string) => void
  onTogglePassword: () => void
  onSubmit: () => void
  onScrollToInput?: (ref: React.RefObject<TextInput>) => void
}

export function LoginForm({
  email,
  password,
  showPassword,
  errors,
  loading,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onScrollToInput,
}: LoginFormProps) {
  const emailInputRef = useRef<TextInput>(null)
  const passwordInputRef = useRef<TextInput>(null)

  return (
    <View style={styles.form}>
      <FormField
        label="Correo electrónico"
        icon={Mail}
        value={email}
        onChangeText={onEmailChange}
        placeholder="tu@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
        onScrollToInput={onScrollToInput}
        ref={emailInputRef}
        onSubmitEditing={() => passwordInputRef.current?.focus()}
      />

      <FormField
        label="Contraseña"
        icon={Lock}
        value={password}
        onChangeText={onPasswordChange}
        placeholder="••••••••"
        secureTextEntry={!showPassword}
        error={errors.password}
        showPasswordToggle
        passwordVisible={showPassword}
        onTogglePassword={onTogglePassword}
        PasswordToggleIcon={Eye}
        PasswordToggleOffIcon={EyeOff}
        onScrollToInput={onScrollToInput}
        ref={passwordInputRef}
        onSubmitEditing={onSubmit}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={onSubmit}
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
            <Text style={styles.buttonText}>Cargando...</Text>
          ) : (
            <>
              <CheckCircle size={18} color="#fff" />
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
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
})

