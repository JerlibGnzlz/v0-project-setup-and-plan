import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { User, CheckCircle } from 'lucide-react-native'
import type { Invitado } from '@api/invitado-auth'

interface WelcomeViewProps {
  invitado: Invitado
}

export function WelcomeView({ invitado }: WelcomeViewProps) {
  return (
    <View style={styles.welcomeContainer}>
      <View style={styles.welcomeCard}>
        <View style={styles.avatarContainer}>
          {invitado.fotoUrl ? (
            <Image source={{ uri: invitado.fotoUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User size={32} color="#22c55e" />
            </View>
          )}
          <View style={styles.checkBadge}>
            <CheckCircle size={16} color="#fff" />
          </View>
        </View>
        <Text style={styles.welcomeTitle}>
          ¡Bienvenido, {invitado.nombre} {invitado.apellido}!
        </Text>
        <Text style={styles.welcomeSubtitle}>Autenticación Exitosa</Text>
        <Text style={styles.welcomeMessage}>
          Tu sesión está activa. Continuando con el proceso de inscripción...
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 0,
    borderWidth: 0,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    backgroundColor: '#22c55e',
    borderRadius: 10,
    padding: 3,
    borderWidth: 2,
    borderColor: '#0a1628',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 20,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  welcomeMessage: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    fontWeight: '400',
  },
})

