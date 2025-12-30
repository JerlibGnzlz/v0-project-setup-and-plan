import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

interface AuthTabsProps {
  activeTab: 'login' | 'register'
  onTabChange: (tab: 'login' | 'register') => void
}

export function AuthTabs({ activeTab, onTabChange }: AuthTabsProps) {
  return (
    <View style={styles.tabs}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'login' && styles.tabActive]}
        onPress={() => onTabChange('login')}
      >
        <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>
          Iniciar Sesión
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'register' && styles.tabActive]}
        onPress={() => onTabChange('register')}
      >
        <Text style={[styles.tabText, activeTab === 'register' && styles.tabTextActive]}>
          Crear Cuenta
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  tabTextActive: {
    color: '#22c55e',
    fontWeight: '600',
  },
})

