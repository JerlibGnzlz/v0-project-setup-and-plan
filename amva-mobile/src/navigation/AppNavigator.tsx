import React, { useEffect, useRef } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { ActivityIndicator, View, Platform, Text, Image, Animated } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Home, Calendar, Newspaper, User, CreditCard } from 'lucide-react-native'
import { LoginScreen } from '@screens/auth/LoginScreen'
import { HomeScreen } from '@screens/home/HomeScreen'
import { NewsScreen } from '@screens/news/NewsScreen'
import { ConventionInscripcionScreen } from '@screens/conventions/ConventionInscripcionScreen'
import { CredentialsScreen } from '@screens/credentials/CredentialsScreen'
import { ProfileScreen } from '@screens/profile/ProfileScreen'
import NotificationsHistoryScreen from '@screens/notifications/NotificationsHistoryScreen'
import { useInvitadoAuth } from '@hooks/useInvitadoAuth'

type RootStackParamList = {
  Auth: undefined
  Main: undefined
  Notifications: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator()

function MainTabs() {
  const insets = useSafeAreaInsets()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0a1628',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          height: 64 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          position: 'absolute',
        },
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Inicio"
        options={{
          tabBarIcon: ({ color, size }) => <Home size={size || 24} color={color} />,
        }}
      >
        {props => <HomeScreen navigation={props.navigation} />}
      </Tab.Screen>
      <Tab.Screen
        name="Convenciones"
        component={ConventionInscripcionScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Calendar size={size || 24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Noticias"
        component={NewsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Newspaper size={size || 24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Credenciales"
        component={CredentialsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <CreditCard size={size || 24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <User size={size || 24} color={color} />,
        }}
      />
    </Tab.Navigator>
  )
}

export function AppNavigator() {
  const { invitado, loading } = useInvitadoAuth()
  
  // Animaciones para la pantalla de carga
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const rotateAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (loading) {
      // Animación de entrada
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start()

      // Animación de rotación suave para el logo (opcional, muy sutil)
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start()
    }
  }, [loading, fadeAnim, scaleAnim, rotateAnim])

  // Mostrar loading solo mientras se verifica autenticación
  const isAuthenticated = !!invitado

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0a1628',
        }}
      >
        <Animated.View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          {/* Logo Container con animación */}
          <Animated.View
            style={{
              width: 240,
              height: 240,
              marginBottom: 32,
              shadowColor: '#22c55e',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 12,
              borderRadius: 24,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: 20,
              borderWidth: 1,
              borderColor: 'rgba(34, 197, 94, 0.2)',
              transform: [{ rotate: spin }],
            }}
          >
            <Image
              source={require('../../assets/images/amvamobil.png')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </Animated.View>
          
          {/* App Name */}
          <Animated.Text
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: '#fff',
              marginBottom: 8,
              letterSpacing: 0.5,
              opacity: fadeAnim,
            }}
          >
            AMVA Móvil
          </Animated.Text>
          
          {/* Subtitle */}
          <Animated.Text
            style={{
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: 32,
              textAlign: 'center',
              paddingHorizontal: 40,
              opacity: fadeAnim,
            }}
          >
            Asociación Misionera Vida Abundante
          </Animated.Text>
          
          {/* Loading Indicator */}
          <ActivityIndicator size="large" color="#22c55e" />
          
          {/* Loading Text */}
          <Animated.Text
            style={{
              fontSize: 12,
              color: 'rgba(255, 255, 255, 0.5)',
              marginTop: 16,
              opacity: fadeAnim,
            }}
          >
            Cargando...
          </Animated.Text>
        </Animated.View>
      </View>
    )
  }

  // Siempre renderizar NavigationContainer, incluso si hay errores
  // Permitir acceso si hay pastor O invitado autenticado

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="Notifications"
              component={NotificationsHistoryScreen}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
