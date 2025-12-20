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
        {/* Header compacto con gradiente */}
        <LinearGradient
          colors={['rgba(34, 197, 94, 0.2)', 'rgba(59, 130, 246, 0.15)', 'rgba(34, 197, 94, 0.05)', 'transparent']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            {/* Avatar compacto */}
            <View style={styles.avatarContainer}>
              {invitado.fotoUrl ? (
                <Image source={{ uri: invitado.fotoUrl }} style={styles.profileImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <LinearGradient
                    colors={['rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.1)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <User size={28} color="#22c55e" />
                </View>
              )}
              <View style={styles.avatarBorder} />
            </View>
            
            {/* Información del usuario */}
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {invitado.nombre} {invitado.apellido}
              </Text>
              <View style={styles.emailRow}>
                <Mail size={14} color="rgba(255, 255, 255, 0.6)" />
                <Text style={styles.userEmail} numberOfLines={1}>{invitado.email}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Profile Card optimizada */}
        <View style={styles.card}>
          {invitado.telefono && (
            <View style={styles.infoRow}>
              <View style={styles.iconWrapper}>
                <Phone size={18} color="#22c55e" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <Text style={styles.infoText} numberOfLines={1}>{invitado.telefono}</Text>
              </View>
            </View>
          )}

          {invitado.sede && (
            <View style={styles.infoRow}>
              <View style={styles.iconWrapper}>
                <MapPin size={18} color="#22c55e" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Sede</Text>
                <Text style={styles.infoText} numberOfLines={1}>{invitado.sede}</Text>
              </View>
            </View>
          )}

          <View style={[styles.infoRow, styles.lastInfoRow]}>
            <View style={styles.iconWrapper}>
              <Tag size={18} color="#22c55e" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Tipo de Usuario</Text>
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
    padding: 16,
    paddingTop: 12,
  },
  headerGradient: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderRadius: 18,
    marginHorizontal: -16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2.5,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarBorder: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 38,
    borderWidth: 1.5,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userEmail: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    flex: 1,
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
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  lastInfoRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
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
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2.5,
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
})
