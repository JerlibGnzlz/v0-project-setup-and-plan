import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
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
      <View style={styles.container}>
        {/* Header con gradiente */}
        <LinearGradient
          colors={['rgba(34, 197, 94, 0.15)', 'rgba(59, 130, 246, 0.1)', 'transparent']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            {/* Logo compacto */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/images/amvamovil.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.avatarContainer}>
              {invitado.fotoUrl ? (
                <Image source={{ uri: invitado.fotoUrl }} style={styles.profileImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={24} color="#22c55e" />
                </View>
              )}
              <View style={styles.avatarBorder} />
            </View>
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
            <User size={20} color="#22c55e" />
            <Text style={styles.cardTitle}>Mi Perfil</Text>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.sectionHeader}>
              <User size={14} color="rgba(255, 255, 255, 0.6)" />
              <Text style={styles.label}>Nombre Completo</Text>
            </View>
            <Text style={styles.value} numberOfLines={1}>
              {invitado.nombre} {invitado.apellido}
            </Text>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.sectionHeader}>
              <Mail size={14} color="rgba(255, 255, 255, 0.6)" />
              <Text style={styles.label}>Correo Electrónico</Text>
            </View>
            <Text style={styles.value} numberOfLines={1}>{invitado.email}</Text>
          </View>

          {invitado.telefono && (
            <View style={styles.profileSection}>
              <View style={styles.sectionHeader}>
                <Phone size={14} color="rgba(255, 255, 255, 0.6)" />
                <Text style={styles.label}>Teléfono</Text>
              </View>
              <Text style={styles.value} numberOfLines={1}>{invitado.telefono}</Text>
            </View>
          )}

          {invitado.sede && (
            <View style={styles.profileSection}>
              <View style={styles.sectionHeader}>
                <MapPin size={14} color="rgba(255, 255, 255, 0.6)" />
                <Text style={styles.label}>Sede</Text>
              </View>
              <Text style={styles.value} numberOfLines={1}>{invitado.sede}</Text>
            </View>
          )}

          <View style={[styles.profileSection, styles.lastSection]}>
            <View style={styles.sectionHeader}>
              <Tag size={14} color="rgba(255, 255, 255, 0.6)" />
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
            <LogOut size={18} color="#ef4444" />
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    padding: 12,
    paddingTop: 8,
  },
  headerGradient: {
    paddingTop: 8,
    paddingBottom: 12,
    marginBottom: 12,
    borderRadius: 16,
    marginHorizontal: -12,
  },
  header: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 180,
    height: 60,
    marginBottom: 12,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 32,
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
    borderRadius: 16,
    padding: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 10,
    flex: 1,
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
    gap: 8,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  profileSection: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  lastSection: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.55)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  value: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
    marginLeft: 20,
  },
  badgeContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginTop: 2,
  },
  badgeText: {
    color: '#4ade80',
    fontSize: 11,
    fontWeight: '600',
  },
  logoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutButtonText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '600',
  },
  text: {
    fontSize: 14,
    color: 'rgba(148,163,184,0.9)',
    marginTop: 4,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
})
