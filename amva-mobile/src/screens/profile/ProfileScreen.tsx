import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { User, Mail, Phone, MapPin, Tag, LogOut } from 'lucide-react-native'
import { useInvitadoAuth } from '@hooks/useInvitadoAuth'
import { Alert } from '@utils/alert'

export function ProfileScreen() {
  const { invitado, logout } = useInvitadoAuth()

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
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
              Alert.alert('Error', 'No se pudo cerrar sesión. Intenta nuevamente.', undefined, 'error')
            }
          },
        },
      ],
      'confirm',
    )
  }

  if (!invitado) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Perfil</Text>
        <Text style={styles.text}>No se encontró información del invitado.</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header con gradiente */}
        <LinearGradient
          colors={['rgba(34, 197, 94, 0.15)', 'rgba(59, 130, 246, 0.1)', 'transparent']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              {invitado.fotoUrl ? (
                <Image source={{ uri: invitado.fotoUrl }} style={styles.profileImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={40} color="#22c55e" />
                </View>
              )}
              <View style={styles.avatarBorder} />
            </View>
            <Text style={styles.title}>AMVA Móvil</Text>
            <Text style={styles.subtitle}>Asociación Misionera Vida Abundante</Text>
          </View>
        </LinearGradient>

        {/* Profile Card con gradiente */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <User size={24} color="#22c55e" />
            <Text style={styles.cardTitle}>Mi Perfil</Text>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.sectionHeader}>
              <User size={18} color="rgba(255, 255, 255, 0.6)" />
              <Text style={styles.label}>Nombre Completo</Text>
            </View>
            <Text style={styles.value}>
              {invitado.nombre} {invitado.apellido}
            </Text>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.sectionHeader}>
              <Mail size={18} color="rgba(255, 255, 255, 0.6)" />
              <Text style={styles.label}>Correo Electrónico</Text>
            </View>
            <Text style={styles.value}>{invitado.email}</Text>
          </View>

          {invitado.telefono && (
            <View style={styles.profileSection}>
              <View style={styles.sectionHeader}>
                <Phone size={18} color="rgba(255, 255, 255, 0.6)" />
                <Text style={styles.label}>Teléfono</Text>
              </View>
              <Text style={styles.value}>{invitado.telefono}</Text>
            </View>
          )}

          {invitado.sede && (
            <View style={styles.profileSection}>
              <View style={styles.sectionHeader}>
                <MapPin size={18} color="rgba(255, 255, 255, 0.6)" />
                <Text style={styles.label}>Sede</Text>
              </View>
              <Text style={styles.value}>{invitado.sede}</Text>
            </View>
          )}

          <View style={[styles.profileSection, styles.lastSection]}>
            <View style={styles.sectionHeader}>
              <Tag size={18} color="rgba(255, 255, 255, 0.6)" />
              <Text style={styles.label}>Tipo de Usuario</Text>
            </View>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>Invitado</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Logout Button con gradiente */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <LinearGradient
            colors={['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoutGradient}
          >
            <LogOut size={20} color="#ef4444" />
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </LinearGradient>
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
    padding: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 24,
    marginBottom: 18,
    borderRadius: 18,
    marginHorizontal: -16,
  },
  header: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBorder: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 43,
    borderWidth: 1.5,
    borderColor: 'rgba(34, 197, 94, 0.15)',
  },
  title: {
    fontSize: 21,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 3,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
  },
  card: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileSection: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  lastSection: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    marginLeft: 26,
  },
  badgeContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginLeft: 26,
    marginTop: 4,
  },
  badgeText: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
  },
  text: {
    fontSize: 14,
    color: 'rgba(148,163,184,0.9)',
    marginTop: 4,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
})
