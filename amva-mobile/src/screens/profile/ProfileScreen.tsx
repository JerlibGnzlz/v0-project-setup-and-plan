import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@hooks/useAuth'

export function ProfileScreen() {
  const { pastor, logout } = useAuth()

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas cerrar sesión?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout()
          } catch (error) {
            console.error('Error al cerrar sesión:', error)
            Alert.alert('Error', 'No se pudo cerrar sesión. Intenta nuevamente.')
          }
        },
      },
    ])
  }

  if (!pastor) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Perfil</Text>
        <Text style={styles.text}>No se encontró información del pastor.</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoGlow} />
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>🌍</Text>
            </View>
          </View>
          <Text style={styles.title}>AMVA Go</Text>
          <Text style={styles.subtitle}>Asociación Misionera Vida Abundante</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mi Perfil</Text>

          <View style={styles.profileSection}>
            <Text style={styles.label}>👤 Nombre Completo</Text>
            <Text style={styles.value}>
              {pastor.nombre} {pastor.apellido}
            </Text>
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.label}>📧 Correo Electrónico</Text>
            <Text style={styles.value}>{pastor.email}</Text>
          </View>

          {pastor.cargo && (
            <View style={styles.profileSection}>
              <Text style={styles.label}>💼 Cargo</Text>
              <Text style={styles.value}>{pastor.cargo}</Text>
            </View>
          )}

          {pastor.ministerio && (
            <View style={styles.profileSection}>
              <Text style={styles.label}>⛪ Ministerio</Text>
              <Text style={styles.value}>{pastor.ministerio}</Text>
            </View>
          )}

          {(pastor.sede || pastor.region || pastor.pais) && (
            <View style={styles.profileSection}>
              <Text style={styles.label}>📍 Ubicación</Text>
              <Text style={styles.value}>
                {[pastor.sede, pastor.region, pastor.pais].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}

          {pastor.tipo && (
            <View style={styles.profileSection}>
              <Text style={styles.label}>🏷️ Tipo</Text>
              <Text style={styles.value}>{pastor.tipo}</Text>
            </View>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>🚪 Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
  container: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 12,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  logoGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 50,
    opacity: 0.6,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  profileSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  label: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  text: {
    fontSize: 14,
    color: 'rgba(148,163,184,0.9)',
    marginTop: 4,
  },
})
