import React from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { CreditCard } from 'lucide-react-native'
import type { CredencialUnificada } from '@api/credenciales'

interface CredentialsResumenProps {
  resumen: {
    total: number
    vigentes: number
    porVencer: number
    vencidas: number
  }
  credencialesList: CredencialUnificada[]
  fadeAnim: Animated.Value
}

export function CredentialsResumen({ resumen, credencialesList, fadeAnim }: CredentialsResumenProps) {
  const { total, vigentes, porVencer, vencidas } = resumen

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View style={styles.wizardStepContainer}>
        <View style={styles.resumenCard}>
          <View style={styles.resumenHeader}>
            <CreditCard size={32} color="#22c55e" />
            <Text style={styles.resumenTitle}>Resumen de Credenciales</Text>
          </View>

          <View style={styles.resumenStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#22c55e' }]}>{vigentes}</Text>
              <Text style={styles.statLabel}>Vigentes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#f59e0b' }]}>{porVencer}</Text>
              <Text style={styles.statLabel}>Por Vencer</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>{vencidas}</Text>
              <Text style={styles.statLabel}>Vencidas</Text>
            </View>
          </View>

          <View style={styles.resumenBreakdown}>
            {credencialesList.filter(c => c.tipo === 'pastoral').length > 0 && (
              <View style={styles.breakdownItem}>
                <View style={styles.breakdownIconContainer}>
                  <CreditCard size={20} color="#22c55e" />
                </View>
                <View style={styles.breakdownContent}>
                  <Text style={styles.breakdownTitle}>Credenciales Pastorales</Text>
                  <Text style={styles.breakdownValue}>
                    {credencialesList.filter(c => c.tipo === 'pastoral').length} encontrada
                    {credencialesList.filter(c => c.tipo === 'pastoral').length > 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            )}

            {credencialesList.filter(c => c.tipo === 'ministerial').length > 0 && (
              <View style={styles.breakdownItem}>
                <View style={styles.breakdownIconContainer}>
                  <CreditCard size={20} color="#3b82f6" />
                </View>
                <View style={styles.breakdownContent}>
                  <Text style={styles.breakdownTitle}>Credenciales Ministeriales</Text>
                  <Text style={styles.breakdownValue}>
                    {credencialesList.filter(c => c.tipo === 'ministerial').length} encontrada
                    {credencialesList.filter(c => c.tipo === 'ministerial').length > 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            )}

            {credencialesList.filter(c => c.tipo === 'capellania').length > 0 && (
              <View style={styles.breakdownItem}>
                <View style={styles.breakdownIconContainer}>
                  <CreditCard size={20} color="#8b5cf6" />
                </View>
                <View style={styles.breakdownContent}>
                  <Text style={styles.breakdownTitle}>Credenciales de Capellanía</Text>
                  <Text style={styles.breakdownValue}>
                    {credencialesList.filter(c => c.tipo === 'capellania').length} encontrada
                    {credencialesList.filter(c => c.tipo === 'capellania').length > 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wizardStepContainer: {
    marginBottom: 24,
  },
  resumenCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  resumenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  resumenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  resumenStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  resumenBreakdown: {
    gap: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
  },
  breakdownIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breakdownContent: {
    flex: 1,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
})

