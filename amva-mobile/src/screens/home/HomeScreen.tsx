import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Calendar, Newspaper, User, Sparkles, ArrowRight, Globe, Bell, CreditCard } from 'lucide-react-native'
import { useInvitadoAuth } from '@hooks/useInvitadoAuth'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

type TabParamList = {
  Inicio: undefined
  Convenciones: undefined
  Noticias: undefined
  Credenciales: undefined
  Perfil: undefined
}

type RootStackParamList = {
  Notifications: undefined
}

interface Props {
  navigation: BottomTabNavigationProp<TabParamList> & NativeStackNavigationProp<RootStackParamList>
}

const { width } = Dimensions.get('window')

export function HomeScreen({ navigation }: Props) {
  const { invitado } = useInvitadoAuth()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  const handleNavigate = (screen: keyof TabParamList) => {
    navigation.navigate(screen)
  }

  const cards = [
    {
      id: 'convenciones',
      title: 'Convenciones',
      description: 'Inscríbete a la próxima convención',
      icon: Calendar,
      color: '#22c55e',
      gradient: ['#22c55e', '#16a34a'],
      onPress: () => handleNavigate('Convenciones'),
    },
    {
      id: 'noticias',
      title: 'Noticias',
      description: 'Lee las últimas noticias de AMVA',
      icon: Newspaper,
      color: '#3b82f6',
      gradient: ['#3b82f6', '#2563eb'],
      onPress: () => handleNavigate('Noticias'),
    },
    {
      id: 'credenciales',
      title: 'Credenciales',
      description: 'Consulta el estado de tus credenciales',
      icon: CreditCard,
      color: '#f59e0b',
      gradient: ['#f59e0b', '#d97706'],
      onPress: () => handleNavigate('Credenciales'),
    },
    {
      id: 'perfil',
      title: 'Perfil',
      description: 'Ver tu información de perfil',
      icon: User,
      color: '#8b5cf6',
      gradient: ['#8b5cf6', '#7c3aed'],
      onPress: () => handleNavigate('Perfil'),
    },
  ]

  const cardAnims = useRef(cards.map(() => new Animated.Value(0))).current

  useEffect(() => {
    // Animación de entrada del header
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()

    // Animaciones escalonadas para las cards
    cardAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        delay: index * 150,
        useNativeDriver: true,
      }).start()
    })
  }, [])

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header con gradiente */}
        <Animated.View
          style={[
            styles.headerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(34, 197, 94, 0.1)', 'rgba(59, 130, 246, 0.1)', 'transparent']}
            style={styles.headerGradient}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoGlow} />
              <Image
                source={require('../../assets/images/amvamobil.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.welcomeText}>Bienvenido</Text>
            {invitado && (
              <Text style={styles.nameText}>
                {invitado.nombre} {invitado.apellido}
              </Text>
            )}
            <View style={styles.badge}>
              <Sparkles size={16} color="#22c55e" />
              <Text style={styles.badgeText}>AMVA Móvil</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Cards con animación escalonada */}
        <View style={styles.cardsContainer}>
          {cards.map((card, index) => {
            const Icon = card.icon
            const cardAnim = cardAnims[index]

            return (
              <Animated.View
                key={card.id}
                style={[
                  {
                    opacity: cardAnim,
                    transform: [
                      {
                        translateY: cardAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0],
                        }),
                      },
                      {
                        scale: cardAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.95, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <TouchableOpacity style={styles.card} onPress={card.onPress} activeOpacity={0.8}>
                  <LinearGradient
                    colors={[card.gradient[0], card.gradient[1], 'rgba(15, 23, 42, 0.8)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardGradient}
                  >
                    <View style={styles.cardContent}>
                      <View style={[styles.iconContainer, { backgroundColor: `${card.color}20` }]}>
                        <Icon size={28} color={card.color} />
                      </View>
                      <View style={styles.cardTextContainer}>
                        <Text style={styles.cardTitle}>{card.title}</Text>
                        <Text style={styles.cardDescription}>{card.description}</Text>
                      </View>
                      <ArrowRight size={20} color={card.color} style={styles.arrowIcon} />
                    </View>
                    {/* Glow effect */}
                    <View style={[styles.cardGlow, { backgroundColor: `${card.color}15` }]} />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )
          })}
        </View>

        {/* Footer con información */}
        <Animated.View
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.footerContent}>
            <Globe size={20} color="rgba(255, 255, 255, 0.5)" />
            <Text style={styles.footerText}>Transformando vidas desde 1995</Text>
          </View>
        </Animated.View>
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
  contentContainer: {
    paddingBottom: 100, // Espacio para el tab bar
  },
  headerContainer: {
    marginBottom: 32,
  },
  headerGradient: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  logoGlow: {
    position: 'absolute',
    top: -12,
    left: -12,
    right: -12,
    bottom: -12,
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    borderRadius: 50,
    opacity: 0.6,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  nameText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
    textAlign: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
  },
  notificationsButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cardGradient: {
    padding: 20,
    position: 'relative',
  },
  cardGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    opacity: 0.3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  arrowIcon: {
    marginLeft: 12,
  },
  footer: {
    marginTop: 32,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
  },
})
