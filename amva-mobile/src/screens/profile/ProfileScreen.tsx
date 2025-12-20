import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { User, Mail, Phone, MapPin, Tag, LogOut } from 'lucide-react-native'
import { useInvitadoAuth } from '@hooks/useInvitadoAuth'
import { Alert } from '@utils/alert'

export function ProfileScreen() {
  const { invitado, logout } = useInvitadoAuth()
  const insets = useSafeAreaInsets()

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
              console.log('🚪 Iniciando proceso de cierre de sesión...')
              await logout()
              console.log('✅ Sesión cerrada exitosamente')
              // La navegación se actualizará automáticamente cuando invitado sea null
            } catch (error) {
              console.error('❌ Error al cerrar sesión:', error)
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) + 80 }]}>
        <View style={styles.contentWrapper}>
          {/* Header mejorado con gradiente */}
          <LinearGradient
            colors={['rgba(34, 197, 94, 0.2)', 'rgba(59, 130, 246, 0.15)', 'rgba(34, 197, 94, 0.05)', 'transparent']}
            style={styles.headerGradient}
          >
            <View style={styles.header}>
              {/* Avatar prominente */}
              <View style={styles.avatarContainer}>
                {invitado.fotoUrl ? (
                  <Image source={{ uri: invitado.fotoUrl }} style={styles.profileImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <LinearGradient
                      colors={['rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.1)']}
                      style={StyleSheet.absoluteFill}
                    />
                    <User size={32} color="#22c55e" />
                  </View>
                )}
                <View style={styles.avatarBorder} />
                <View style={styles.avatarGlow} />
              </View>
              
              {/* Nombre del usuario */}
              <Text style={styles.userName}>
                {invitado.nombre} {invitado.apellido}
              </Text>
              <Text style={styles.userEmail}>{invitado.email}</Text>
            </View>
          </LinearGradient>

          {/* Profile Card con nueva estética minimalista */}
          <View style={styles.card}>
            {invitado.telefono && (
              <View style={styles.infoRow}>
                <Phone size={16} color="rgba(255, 255, 255, 0.5)" />
                <Text style={styles.infoText}>{invitado.telefono}</Text>
              </View>
            )}

            {invitado.sede && (
              <View style={styles.infoRow}>
                <MapPin size={16} color="rgba(255, 255, 255, 0.5)" />
                <Text style={styles.infoText}>{invitado.sede}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Tag size={16} color="rgba(255, 255, 255, 0.5)" />
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>Invitado</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Logout Button compacto */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <LinearGradient
            colors={['rgba(239, 68, 68, 0.2)', 'rgba(220, 38, 38, 0.15)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoutGradient}
          >
            <LogOut size={16} color="#ef4444" />
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
    justifyContent: 'space-between',
  },
  contentWrapper: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 24,
    paddingBottom: 24,
    marginBottom: 16,
    borderRadius: 20,
    marginHorizontal: -12,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarBorder: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 54,
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  avatarGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 58,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontWeight: '500',
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
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    flex: 1,
  },
  badgeContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.25)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#4ade80',
    fontSize: 11,
    fontWeight: '600',
  },
  logoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 0,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
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
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
})
