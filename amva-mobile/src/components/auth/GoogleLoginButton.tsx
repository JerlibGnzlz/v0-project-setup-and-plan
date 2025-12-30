import React from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { LoadingButton } from '../ui/LoadingButton'

interface GoogleLoginButtonProps {
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  isSmallScreen?: boolean
  error?: string
}

function GoogleLogo() {
  return (
    <View style={styles.googleLogoContainer}>
      <Image
        source={require('../../../assets/images/google.png')}
        style={styles.googleLogoImage}
        resizeMode="contain"
        resizeMethod="resize"
      />
    </View>
  )
}

export function GoogleLoginButton({
  onPress,
  loading = false,
  disabled = false,
  isSmallScreen = false,
  error,
}: GoogleLoginButtonProps) {
  return (
    <>
      <TouchableOpacity
        style={[
          styles.googleButton,
          isSmallScreen && styles.googleButtonSmall,
          (loading || disabled) && styles.buttonDisabled,
        ]}
        onPress={onPress}
        disabled={loading || disabled}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#3c4043" size="small" />
        ) : (
          <View style={styles.googleButtonContent}>
            <GoogleLogo />
            <Text style={[styles.googleButtonText, isSmallScreen && styles.googleButtonTextSmall]}>
              Continuar con Google
            </Text>
          </View>
        )}
      </TouchableOpacity>
      {error && !error.includes('DEVELOPER_ERROR') && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </>
  )
}

const styles = StyleSheet.create({
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
    overflow: 'hidden',
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
    backgroundColor: 'transparent',
    borderRadius: 2,
  },
  googleLogoImage: {
    width: 20,
    height: 20,
    backgroundColor: 'transparent',
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
  buttonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    textAlign: 'center',
  },
})

