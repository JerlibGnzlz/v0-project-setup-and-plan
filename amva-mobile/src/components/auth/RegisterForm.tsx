import React, { useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { User, Mail, Lock, CheckCircle, Eye, EyeOff } from 'lucide-react-native'
import { FormField } from '../ui/FormField'
import type { TextInput } from 'react-native'

interface RegisterFormProps {
  nombre: string
  apellido: string
  email: string
  password: string
  confirmPassword: string
  sede: string
  telefono: string
  showPassword: boolean
  showConfirmPassword: boolean
  errors: Record<string, string>
  loading: boolean
  onNombreChange: (value: string) => void
  onApellidoChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  onSedeChange: (value: string) => void
  onTelefonoChange: (value: string) => void
  onTogglePassword: () => void
  onToggleConfirmPassword: () => void
  onSubmit: () => void
  onScrollToInput?: (ref: React.RefObject<TextInput>) => void
}

export function RegisterForm({
  nombre,
  apellido,
  email,
  password,
  confirmPassword,
  sede,
  telefono,
  showPassword,
  showConfirmPassword,
  errors,
  loading,
  onNombreChange,
  onApellidoChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSedeChange,
  onTelefonoChange,
  onTogglePassword,
  onToggleConfirmPassword,
  onSubmit,
  onScrollToInput,
}: RegisterFormProps) {
  const nombreInputRef = useRef<TextInput>(null)
  const apellidoInputRef = useRef<TextInput>(null)
  const emailInputRef = useRef<TextInput>(null)
  const passwordInputRef = useRef<TextInput>(null)
  const confirmPasswordInputRef = useRef<TextInput>(null)
  const sedeInputRef = useRef<TextInput>(null)
  const telefonoInputRef = useRef<TextInput>(null)

  const passwordsMatch = password.length > 0 && password === confirmPassword && !errors.confirmPassword

  return (
    <View style={styles.form}>
      {/* Nombre y Apellido en fila */}
      <View style={styles.row}>
        <View style={styles.halfInput}>
          <FormField
            label="Nombre"
            icon={User}
            value={nombre}
            onChangeText={onNombreChange}
            placeholder="Tu nombre"
            autoCapitalize="words"
            error={errors.nombre}
            onScrollToInput={onScrollToInput}
            ref={nombreInputRef}
            onSubmitEditing={() => apellidoInputRef.current?.focus()}
          />
        </View>

        <View style={styles.halfInput}>
          <FormField
            label="Apellido"
            icon={User}
            value={apellido}
            onChangeText={onApellidoChange}
            placeholder="Tu apellido"
            autoCapitalize="words"
            error={errors.apellido}
            onScrollToInput={onScrollToInput}
            ref={apellidoInputRef}
            onSubmitEditing={() => emailInputRef.current?.focus()}
          />
        </View>
      </View>

      {/* Email */}
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

      {/* Password */}
      <FormField
        label="Contraseña"
        icon={Lock}
        value={password}
        onChangeText={onPasswordChange}
        placeholder="Mínimo 8 caracteres"
        secureTextEntry={!showPassword}
        error={errors.password}
        showPasswordToggle
        passwordVisible={showPassword}
        onTogglePassword={onTogglePassword}
        PasswordToggleIcon={Eye}
        PasswordToggleOffIcon={EyeOff}
        onScrollToInput={onScrollToInput}
        ref={passwordInputRef}
        onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
      />
      {!errors.password && (
        <Text style={styles.helperText}>Debe contener mayúscula, minúscula y número</Text>
      )}

      {/* Confirm Password */}
      <FormField
        label="Confirmar Contraseña"
        icon={Lock}
        value={confirmPassword}
        onChangeText={onConfirmPasswordChange}
        placeholder="Repite tu contraseña"
        secureTextEntry={!showConfirmPassword}
        error={errors.confirmPassword}
        showPasswordToggle
        passwordVisible={showConfirmPassword}
        onTogglePassword={onToggleConfirmPassword}
        PasswordToggleIcon={Eye}
        PasswordToggleOffIcon={EyeOff}
        onScrollToInput={onScrollToInput}
        ref={confirmPasswordInputRef}
        onSubmitEditing={() => sedeInputRef.current?.focus()}
      />
      {passwordsMatch && (
        <View style={styles.helperContainer}>
          <CheckCircle size={12} color="#22c55e" />
          <Text style={[styles.helperText, { color: '#22c55e' }]}>Las contraseñas coinciden</Text>
        </View>
      )}

      {/* Sede */}
      <FormField
        label="Iglesia / Sede"
        icon={User}
        value={sede}
        onChangeText={onSedeChange}
        placeholder="Nombre de tu iglesia o sede"
        autoCapitalize="words"
        onScrollToInput={onScrollToInput}
        ref={sedeInputRef}
        onSubmitEditing={() => telefonoInputRef.current?.focus()}
      />

      {/* Teléfono */}
      <FormField
        label="Teléfono"
        icon={Mail}
        value={telefono}
        onChangeText={onTelefonoChange}
        placeholder="+54 11 1234-5678"
        keyboardType="phone-pad"
        onScrollToInput={onScrollToInput}
        ref={telefonoInputRef}
        onSubmitEditing={onSubmit}
      />

      {/* Submit Button */}
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
              <Text style={styles.buttonText}>Crear Cuenta</Text>
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  helperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: -12,
    marginBottom: 4,
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
})

