/**
 * Header reutilizable con logo para todas las pantallas
 */

import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Bell } from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

type RootStackParamList = {
  Notifications: undefined
}

interface AppHeaderProps {
  title?: string
  showNotifications?: boolean
  showLogo?: boolean
  rightAction?: React.ReactNode
}

export function AppHeader({
  title,
  showNotifications = true,
  showLogo = true,
  rightAction,
}: AppHeaderProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        {/* Logo */}
        {showLogo && (
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/amvamovil.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Título */}
        {title && (
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
          </View>
        )}

        {/* Acciones derechas */}
        <View style={styles.rightContainer}>
          {showNotifications && (
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Bell size={24} color="#fff" />
            </TouchableOpacity>
          )}
          {rightAction}
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#0a1628',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0a1628',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoContainer: {
    width: 120,
    height: 40,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 40,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
})

