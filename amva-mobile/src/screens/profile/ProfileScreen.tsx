import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { User, LogOut, MapPin, UserCircle } from 'lucide-react-native'
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
        {/* Header minimalista */}
        <View style={styles.header}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {invitado.fotoUrl ? (
              <Image source={{ uri: invitado.fotoUrl }} style={styles.profileImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={28} color="#22c55e" />
              </View>
            )}
          </View>
          
          {/* Información del usuario */}
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {invitado.nombre} {invitado.apellido}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>{invitado.email}</Text>
          </View>
        </View>

        {/* Información Personal - Minimalista */}
        <View style={styles.infoSection}>
          {invitado.telefono && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Teléfono</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{invitado.telefono}</Text>
            </View>
          )}

          {invitado.sede && (
            <View style={styles.infoItem}>
              <View style={styles.labelContainer}>
                <MapPin size={12} color="rgba(255, 255, 255, 0.4)" />
                <Text style={styles.infoLabel}>Sede</Text>
              </View>
              <Text style={styles.infoValue}>{invitado.sede}</Text>
            </View>
          )}

          <View style={styles.infoItem}>
            <View style={styles.labelContainer}>
              <UserCircle size={12} color="rgba(255, 255, 255, 0.4)" />
              <Text style={styles.infoLabel}>Tipo de Usuario</Text>
            </View>
            <Text style={styles.infoValue}>Invitado</Text>
          </View>
        </View>

        {/* Logout Button minimalista */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <LogOut size={16} color="#ef4444" />
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
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
    padding: 16,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
    paddingTop: 8,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '400',
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
  infoSection: {
    marginBottom: 20,
  },
  infoItem: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    marginTop: 12,
    marginBottom: 0,
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
  },
  text: {
    fontSize: 14,
    color: 'rgba(148,163,184,0.9)',
    marginTop: 4,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
})
