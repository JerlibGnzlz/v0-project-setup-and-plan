import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { LogOut, X } from 'lucide-react-native'

const { width } = Dimensions.get('window')

interface ConfirmDialogProps {
  visible: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  type?: 'logout' | 'danger' | 'warning'
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  type = 'logout',
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const scaleAnim = React.useRef(new Animated.Value(0.85)).current
  const slideAnim = React.useRef(new Animated.Value(30)).current

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.85,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 30,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start()
      setIsLoading(false)
    }
  }, [visible])

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
    } finally {
      setIsLoading(false)
    }
  }

  const getIconColor = () => {
    switch (type) {
      case 'logout':
        return '#ef4444'
      case 'danger':
        return '#ef4444'
      case 'warning':
        return '#f59e0b'
      default:
        return '#ef4444'
    }
  }

  const getConfirmButtonStyle = () => {
    switch (type) {
      case 'logout':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
        }
      case 'danger':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
        }
      case 'warning':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderColor: 'rgba(245, 158, 11, 0.3)',
          color: '#f59e0b',
        }
      default:
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
        }
    }
  }

  if (!visible) return null

  const confirmStyle = getConfirmButtonStyle()

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.container,
                {
                  transform: [
                    { scale: scaleAnim },
                    { translateY: slideAnim },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.04)', 'rgba(255, 255, 255, 0.02)']}
                style={styles.content}
              >
                {/* Icon Container */}
                <View style={[styles.iconContainer, { backgroundColor: `${getIconColor()}15` }]}>
                  <LogOut size={32} color={getIconColor()} strokeWidth={2} />
                </View>

                {/* Title */}
                <Text style={styles.title}>{title}</Text>

                {/* Message */}
                <Text style={styles.message}>{message}</Text>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={onCancel}
                    activeOpacity={0.7}
                    disabled={isLoading}
                  >
                    <Text style={styles.cancelButtonText}>{cancelText}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.confirmButton,
                      {
                        backgroundColor: confirmStyle.backgroundColor,
                        borderColor: confirmStyle.borderColor,
                      },
                      isLoading && styles.buttonDisabled,
                    ]}
                    onPress={handleConfirm}
                    activeOpacity={0.8}
                    disabled={isLoading}
                  >
                    <Text style={[styles.confirmButtonText, { color: confirmStyle.color }]}>
                      {isLoading ? 'Cerrando...' : confirmText}
                    </Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: width - 40,
    maxWidth: 380,
  },
  content: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  confirmButton: {
    borderWidth: 1.5,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
})

