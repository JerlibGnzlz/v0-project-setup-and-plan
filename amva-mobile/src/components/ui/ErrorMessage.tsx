import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { AlertCircle } from 'lucide-react-native'

interface ErrorMessageProps {
  message: string
  type?: 'error' | 'warning' | 'info'
  style?: object
}

export function ErrorMessage({ message, type = 'error', style }: ErrorMessageProps) {
  const getColor = () => {
    switch (type) {
      case 'warning':
        return '#f59e0b'
      case 'info':
        return '#3b82f6'
      default:
        return '#ef4444'
    }
  }

  return (
    <View style={[styles.container, { borderColor: getColor() }, style]}>
      <AlertCircle size={16} color={getColor()} style={styles.icon} />
      <Text style={[styles.text, { color: getColor() }]}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    gap: 8,
  },
  icon: {
    marginRight: 0,
  },
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
})

