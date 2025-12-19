/**
 * Componente de estado vacío reutilizable con logo
 */

import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { LucideIcon } from 'lucide-react-native'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  message?: string
  showLogo?: boolean
}

export function EmptyState({ icon: Icon, title, message, showLogo = true }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {showLogo && (
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/amvamovil.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      )}
      {Icon && (
        <View style={styles.iconContainer}>
          <Icon size={64} color="#64748b" />
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 400,
  },
  logoContainer: {
    width: 150,
    height: 50,
    marginBottom: 24,
    opacity: 0.3,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
})

