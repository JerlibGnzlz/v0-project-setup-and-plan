import React, { useRef } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native'
import { FormField } from '../ui/FormField'
import type { TextInput } from 'react-native'

interface EmailPasswordFormProps {
  email: string
  password: string
  showPassword: boolean
  onEmailChange: (email: string) => void
  onPasswordChange: (password: string) => void
  onTogglePassword: () => void
  emailError?: string
  passwordError?: string
  isSmallScreen?: boolean
  emailInputRef?: React.RefObject<TextInput | null>
  passwordInputRef?: React.RefObject<TextInput | null>
  onEmailFocus?: () => void
  onPasswordFocus?: () => void
  onEmailSubmit?: () => void
  onPasswordSubmit?: () => void
  onScrollToInput?: (ref: React.RefObject<TextInput>) => void
}

export function EmailPasswordForm({
  email,
  password,
  showPassword,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  emailError,
  passwordError,
  isSmallScreen = false,
  emailInputRef,
  passwordInputRef,
  onEmailFocus,
  onPasswordFocus,
  onEmailSubmit,
  onPasswordSubmit,
  onScrollToInput,
}: EmailPasswordFormProps) {
  const internalEmailRef = useRef<TextInput>(null)
  const internalPasswordRef = useRef<TextInput>(null)

  const emailRef = emailInputRef || internalEmailRef
  const passRef = passwordInputRef || internalPasswordRef

  return (
    <>
      <FormField
        label="Correo electrónico"
        icon={Mail}
        value={email}
        onChangeText={onEmailChange}
        placeholder="correo@ejemplo.com"
        keyboardType="email-address"
        returnKeyType="next"
        error={emailError}
        isSmallScreen={isSmallScreen}
        onScrollToInput={onScrollToInput}
        onFocus={onEmailFocus}
        onSubmitEditing={() => {
          passRef.current?.focus()
          onEmailSubmit?.()
        }}
      />

      <FormField
        label="Contraseña"
        icon={Lock}
        value={password}
        onChangeText={onPasswordChange}
        placeholder="••••••••"
        secureTextEntry={!showPassword}
        returnKeyType="done"
        error={passwordError}
        isSmallScreen={isSmallScreen}
        onScrollToInput={onScrollToInput}
        showPasswordToggle
        passwordVisible={showPassword}
        onTogglePassword={onTogglePassword}
        PasswordToggleIcon={Eye}
        PasswordToggleOffIcon={EyeOff}
        ref={passRef}
        onFocus={onPasswordFocus}
        onSubmitEditing={onPasswordSubmit}
      />
    </>
  )
}

