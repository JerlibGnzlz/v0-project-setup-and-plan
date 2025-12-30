import React from 'react'
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native'

interface LoadingButtonProps {
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  title: string
  variant?: 'primary' | 'secondary' | 'google'
  isSmallScreen?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  testID?: string
}

export function LoadingButton({
  onPress,
  loading = false,
  disabled = false,
  title,
  variant = 'primary',
  isSmallScreen = false,
  style,
  textStyle,
  testID,
}: LoadingButtonProps) {
  const isDisabled = loading || disabled

  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle = [styles.button, isSmallScreen && styles.buttonSmall]
    
    switch (variant) {
      case 'google':
        return [...baseStyle, styles.googleButton, isDisabled && styles.buttonDisabled]
      case 'secondary':
        return [...baseStyle, styles.secondaryButton, isDisabled && styles.buttonDisabled]
      default:
        return [...baseStyle, styles.primaryButton, isDisabled && styles.buttonDisabled]
    }
  }

  const getTextStyle = (): TextStyle[] => {
    const baseStyle = [styles.buttonText, isSmallScreen && styles.buttonTextSmall]
    
    switch (variant) {
      case 'google':
        return [...baseStyle, styles.googleButtonText]
      case 'secondary':
        return [...baseStyle, styles.secondaryButtonText]
      default:
        return [...baseStyle, styles.primaryButtonText]
    }
  }

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'google' ? '#3c4043' : '#fff'} 
          size="small" 
        />
      ) : (
        <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonSmall: {
    paddingVertical: 12,
  },
  primaryButton: {
    backgroundColor: '#22c55e',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 6,
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  buttonTextSmall: {
    fontSize: 14,
  },
  primaryButtonText: {
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#fff',
  },
  googleButtonText: {
    color: '#3c4043',
    fontWeight: '500',
    letterSpacing: 0.1,
  },
})

