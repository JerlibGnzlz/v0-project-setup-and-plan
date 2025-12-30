import React from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'

interface ConnectionTestProps {
  testing: boolean
  isSmallScreen?: boolean
}

export function ConnectionTest({ testing, isSmallScreen = false }: ConnectionTestProps) {
  if (!testing) return null

  return (
    <View style={[styles.testingContainer, isSmallScreen && styles.testingContainerSmall]}>
      <ActivityIndicator size="small" color="#22c55e" />
      <Text style={[styles.testingText, isSmallScreen && styles.testingTextSmall]}>
        Verificando conexión...
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  testingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  testingContainerSmall: {
    padding: 10,
    marginBottom: 12,
  },
  testingText: {
    fontSize: 13,
    color: '#22c55e',
    fontWeight: '500',
  },
  testingTextSmall: {
    fontSize: 12,
  },
})

