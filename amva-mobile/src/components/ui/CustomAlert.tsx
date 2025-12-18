import React, { useEffect, useRef } from 'react'
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
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react-native'

const { width } = Dimensions.get('window')

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm'

interface AlertButton {
  text: string
  onPress?: () => void
  style?: 'default' | 'cancel' | 'destructive'
}

interface CustomAlertProps {
  visible: boolean
  type?: AlertType
  title: string
  message?: string
  buttons?: AlertButton[]
  onDismiss?: () => void
}

export function CustomAlert({
  visible,
  type = 'info',
  title,
  message,
  buttons = [{ text: 'OK' }],
  onDismiss,
}: CustomAlertProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  useEffect(() => {
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
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={48} color="#22c55e" />
      case 'error':
        return <AlertCircle size={48} color="#ef4444" />
      case 'warning':
        return <AlertTriangle size={48} color="#f59e0b" />
      case 'confirm':
        return <Info size={48} color="#3b82f6" />
      default:
        return <Info size={48} color="#3b82f6" />
    }
  }

  const getGradientColors = () => {
    switch (type) {
      case 'success':
        return ['rgba(34, 197, 94, 0.15)', 'rgba(34, 197, 94, 0.05)']
      case 'error':
        return ['rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0.05)']
      case 'warning':
        return ['rgba(245, 158, 11, 0.15)', 'rgba(245, 158, 11, 0.05)']
      case 'confirm':
        return ['rgba(59, 130, 246, 0.15)', 'rgba(59, 130, 246, 0.05)']
      default:
        return ['rgba(59, 130, 246, 0.15)', 'rgba(59, 130, 246, 0.05)']
    }
  }

  const getButtonColors = (buttonStyle?: string) => {
    if (buttonStyle === 'destructive') {
      return ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.1)']
    }
    if (buttonStyle === 'cancel') {
      return ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
    }
    switch (type) {
      case 'success':
        return ['rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.1)']
      case 'error':
        return ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.1)']
      case 'warning':
        return ['rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.1)']
      default:
        return ['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.1)']
    }
  }

  const getButtonTextColor = (buttonStyle?: string) => {
    if (buttonStyle === 'destructive') {
      return '#ef4444'
    }
    if (buttonStyle === 'cancel') {
      return 'rgba(255, 255, 255, 0.8)'
    }
    switch (type) {
      case 'success':
        return '#22c55e'
      case 'error':
        return '#ef4444'
      case 'warning':
        return '#f59e0b'
      default:
        return '#3b82f6'
    }
  }

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress()
    }
    if (onDismiss) {
      onDismiss()
    }
  }

  if (!visible) return null

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onDismiss}>
      <TouchableWithoutFeedback onPress={onDismiss}>
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
              <LinearGradient colors={getGradientColors()} style={styles.content}>
                <View style={styles.iconContainer}>{getIcon()}</View>

                <Text style={styles.title}>{title}</Text>

                {message && <Text style={styles.message}>{message}</Text>}

                <View style={styles.buttonContainer}>
                  {buttons.map((button, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.button,
                        buttons.length > 1 && index < buttons.length - 1 && styles.buttonMargin,
                      ]}
                      onPress={() => handleButtonPress(button)}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={getButtonColors(button.style)}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonGradient}
                      >
                        <Text
                          style={[
                            styles.buttonText,
                            { color: getButtonTextColor(button.style) },
                          ]}
                        >
                          {button.text}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: width - 40,
    maxWidth: 400,
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
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonMargin: {
    marginRight: 0,
  },
  buttonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
})

// Hook para usar el alert de forma similar a Alert.alert
let alertRef: {
  show: (props: Omit<CustomAlertProps, 'visible'>) => void
  hide: () => void
} | null = null

export function setAlertRef(ref: typeof alertRef) {
  alertRef = ref
}

export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
  type?: AlertType,
) {
  if (alertRef) {
    alertRef.show({ title, message, buttons, type })
  }
}

