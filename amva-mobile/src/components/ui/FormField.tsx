import React, { useRef, forwardRef, useImperativeHandle } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import type { TextInputProps } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'

interface FormFieldProps extends Omit<TextInputProps, 'style'> {
  label: string
  icon?: LucideIcon
  error?: string
  containerStyle?: object
  isSmallScreen?: boolean
  onScrollToInput?: (ref: React.RefObject<TextInput>) => void
  showPasswordToggle?: boolean
  passwordVisible?: boolean
  onTogglePassword?: () => void
  PasswordToggleIcon?: LucideIcon
  PasswordToggleOffIcon?: LucideIcon
}

export const FormField = forwardRef<TextInput, FormFieldProps>(function FormField({
  label,
  icon: Icon,
  error,
  containerStyle,
  isSmallScreen = false,
  onScrollToInput,
  showPasswordToggle = false,
  passwordVisible = false,
  onTogglePassword,
  PasswordToggleIcon,
  PasswordToggleOffIcon,
  ...textInputProps
}, ref) {
  const inputRef = useRef<TextInput>(null)
  const focusAnim = useRef(new Animated.Value(0)).current
  const [isFocused, setIsFocused] = React.useState(false)

  useImperativeHandle(ref, () => inputRef.current as TextInput)

  const handleFocus = () => {
    setIsFocused(true)
    Animated.spring(focusAnim, {
      toValue: 1,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start()
    if (onScrollToInput) {
      onScrollToInput(inputRef)
    }
    textInputProps.onFocus?.(undefined as any)
  }

  const handleBlur = () => {
    setIsFocused(false)
    Animated.spring(focusAnim, {
      toValue: 0,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start()
    textInputProps.onBlur?.(undefined as any)
  }

  return (
    <View style={[styles.inputGroup, isSmallScreen && styles.inputGroupSmall, containerStyle]}>
      <View style={styles.labelContainer}>
        {Icon && <Icon size={14} color="rgba(255, 255, 255, 0.7)" style={styles.labelIcon} />}
        <Text style={[styles.label, isSmallScreen && styles.labelSmall]}>{label}</Text>
      </View>
      <Animated.View
        style={[
          styles.inputContainer,
          {
            borderColor: focusAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['rgba(255, 255, 255, 0.2)', 'rgba(34, 197, 94, 0.6)'],
            }),
            shadowOpacity: focusAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.2],
            }),
            shadowColor: '#22c55e',
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[styles.input, showPasswordToggle && styles.passwordInput]}
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          autoCapitalize="none"
          autoCorrect={false}
          {...textInputProps}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {showPasswordToggle && onTogglePassword && (
          <TouchableOpacity style={styles.passwordToggle} onPress={onTogglePassword} activeOpacity={0.7}>
            {passwordVisible && PasswordToggleOffIcon ? (
              <PasswordToggleOffIcon size={20} color="rgba(255, 255, 255, 0.6)" />
            ) : PasswordToggleIcon ? (
              <PasswordToggleIcon size={20} color="rgba(255, 255, 255, 0.6)" />
            ) : null}
          </TouchableOpacity>
        )}
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
})

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 20,
  },
  inputGroupSmall: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  labelIcon: {
    marginRight: 0,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.2,
  },
  labelSmall: {
    fontSize: 12,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
    padding: 0,
  },
  passwordInput: {
    paddingRight: 40,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 6,
    marginLeft: 4,
  },
})

