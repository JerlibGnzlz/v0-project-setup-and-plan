import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { User, LogOut, MapPin, UserCircle, Mail, Phone, Building2 } from 'lucide-react-native'
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 8) + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header con Avatar */}
        <View style={styles.headerCard}>
          <View style={styles.avatarContainer}>
            {invitado.fotoUrl ? (
              <Image source={{ uri: invitado.fotoUrl }} style={styles.profileImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={32} color="#22c55e" />
              </View>
            )}
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={2}>
              {invitado.nombre} {invitado.apellido}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>{invitado.email}</Text>
          </View>
        </View>

        {/* Información Personal - Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Información Personal</Text>
          
          {invitado.telefono && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Phone size={16} color="rgba(255, 255, 255, 0.6)" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{invitado.telefono}</Text>
              </View>
            </View>
          )}

          {invitado.email && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Mail size={16} color="rgba(255, 255, 255, 0.6)" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Correo Electrónico</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{invitado.email}</Text>
              </View>
            </View>
          )}

          {invitado.sede && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <MapPin size={16} color="rgba(255, 255, 255, 0.6)" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Sede</Text>
                <Text style={styles.infoValue} numberOfLines={2}>{invitado.sede}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Información de Cuenta - Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Información de Cuenta</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <UserCircle size={16} color="rgba(255, 255, 255, 0.6)" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Tipo de Usuario</Text>
              <Text style={styles.infoValue}>Invitado</Text>
            </View>
          </View>

          {invitado.sede && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Building2 size={16} color="rgba(255, 255, 255, 0.6)" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Organización</Text>
                <Text style={styles.infoValue}>AMVA</Text>
              </View>
            </View>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <LogOut size={18} color="#ef4444" />
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 12,
  },
  headerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  userInfo: {
    alignItems: 'center',
    width: '100%',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
    gap: 12,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '600',
  },
  title: {
    fontSize: 21,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 3,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  text: {
    fontSize: 14,
    color: 'rgba(148,163,184,0.9)',
    marginTop: 4,
  },
})
