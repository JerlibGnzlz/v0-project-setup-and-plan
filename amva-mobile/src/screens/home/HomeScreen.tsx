import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Calendar, Newspaper, User, ArrowRight, Globe, Bell, CreditCard } from 'lucide-react-native'
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
      <View style={styles.container}>
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
              <Image
                source={require('../../../assets/images/amvamovil.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            {invitado && (
              <View style={styles.welcomeContainer}>
                <Text style={styles.nameText}>
                  {invitado.nombre} {invitado.apellido}
                </Text>
                <Text style={styles.welcomeSubtitle}>Bienvenido</Text>
              </View>
            )}
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
                  styles.cardWrapper,
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
                        <Icon size={22} color={card.color} />
                      </View>
                      <View style={styles.cardTextContainer}>
                        <Text style={styles.cardTitle}>{card.title}</Text>
                        <Text style={styles.cardDescription} numberOfLines={1}>{card.description}</Text>
                      </View>
                      <ArrowRight size={16} color={card.color} style={styles.arrowIcon} />
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
            <Globe size={14} color="rgba(255, 255, 255, 0.5)" />
            <Text style={styles.footerText}>Transformando vidas desde 1989</Text>
          </View>
        </Animated.View>
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
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  headerContainer: {
    flexShrink: 0,
    alignItems: 'center',
  },
  headerGradient: {
    padding: 12,
    paddingTop: 8,
    paddingBottom: 12,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    overflow: 'hidden',
  },
  logoContainer: {
    marginBottom: 8,
    width: 140,
    height: 140,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  welcomeContainer: {
    marginTop: 8,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    justifyContent: 'center',
  },
  cardWrapper: {
    height: 75,
  },
  card: {
    height: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cardGradient: {
    padding: 12,
    position: 'relative',
    height: '100%',
    justifyContent: 'center',
  },
  cardGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 14,
  },
  arrowIcon: {
    marginLeft: 6,
  },
  footer: {
    flexShrink: 0,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 4,
  },
  footerText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
  },
})
