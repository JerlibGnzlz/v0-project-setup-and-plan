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
        return <CheckCircle size={32} color="#22c55e" />
      case 'error':
        return <AlertCircle size={32} color="#ef4444" />
      case 'warning':
        return <AlertTriangle size={28} color="#f59e0b" />
      case 'confirm':
        return <Info size={32} color="#3b82f6" />
      default:
        return null // Sin icono por defecto para estilo más limpio
    }
  }

  const getButtonColor = (buttonStyle?: string, isPrimary = false) => {
    if (buttonStyle === 'destructive') {
      return '#ef4444'
    }
    if (buttonStyle === 'cancel') {
      return '#6b7280'
    }
    // Botón primario siempre verde
    if (isPrimary) {
      return '#22c55e'
    }
    // Por tipo si no es primario
    switch (type) {
      case 'success':
        return '#22c55e'
      case 'error':
        return '#ef4444'
      case 'warning':
        return '#f59e0b'
      case 'confirm':
        return '#22c55e'
      default:
        return '#22c55e'
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

  // Determinar botón primario (último botón o único botón)
  const primaryButtonIndex = buttons.length - 1

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
              <View style={styles.content}>
                {getIcon() && <View style={styles.iconContainer}>{getIcon()}</View>}

                <Text style={styles.title}>{title}</Text>

                {message && <Text style={styles.message}>{message}</Text>}

                <View style={styles.buttonContainer}>
                  {buttons.map((button, index) => {
                    const isPrimary = index === primaryButtonIndex
                    const buttonColor = getButtonColor(button.style, isPrimary)
                    
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.button,
                          isPrimary && styles.buttonPrimary,
                          { backgroundColor: isPrimary ? buttonColor : 'transparent' },
                          buttons.length > 1 && index < buttons.length - 1 && styles.buttonMargin,
                        ]}
                        onPress={() => handleButtonPress(button)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.buttonText,
                            isPrimary ? styles.buttonTextPrimary : styles.buttonTextSecondary,
                            !isPrimary && { color: buttonColor },
                          ]}
                        >
                          {button.text}
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: width - 40,
    maxWidth: 400,
  },
  content: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  buttonPrimary: {
    // El color de fondo se aplica dinámicamente
  },
  buttonMargin: {
    marginRight: 0,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonTextPrimary: {
    color: '#ffffff',
  },
  buttonTextSecondary: {
    color: '#6b7280',
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

