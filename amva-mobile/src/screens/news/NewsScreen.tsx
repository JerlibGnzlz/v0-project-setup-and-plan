import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Image,
  Animated,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Newspaper, Calendar as CalendarIcon, ArrowRight } from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { apiClient } from '@api/client'

type RootStackParamList = {
  NewsDetail: {
    noticiaId: string
  }
}

interface Noticia {
  id: string
  titulo: string
  extracto?: string
  categoria: string
  fechaPublicacion: string | null
  slug: string
  contenido?: string
  imagenUrl?: string
}

interface NewsCardProps {
  item: Noticia
  index: number
  formatDate: (dateString: string | null) => string
}

function NewsCard({ item, index, formatDate }: NewsCardProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const slideAnim = React.useRef(new Animated.Value(30)).current

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start()
  }, [fadeAnim, slideAnim, index])

  const handlePress = () => {
    navigation.navigate('NewsDetail', { 
      noticiaId: item.id,
      noticiaSlug: item.slug 
    })
  }

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={handlePress}>
        <LinearGradient
          colors={['rgba(34, 197, 94, 0.12)', 'rgba(59, 130, 246, 0.08)', 'rgba(15, 23, 42, 0.95)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {item.imagenUrl && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.imagenUrl }} style={styles.cardImage} resizeMode="cover" />
              <View style={styles.imageOverlay} />
            </View>
          )}
          
          <View style={styles.cardHeader}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.categoria}</Text>
            </View>
            {item.fechaPublicacion && (
              <View style={styles.dateContainer}>
                <CalendarIcon size={14} color="rgba(255, 255, 255, 0.6)" />
                <Text style={styles.dateText}>{formatDate(item.fechaPublicacion)}</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.cardTitle} numberOfLines={2}>{item.titulo}</Text>
          
          {item.extracto && (
            <Text style={styles.cardText} numberOfLines={3}>
              {item.extracto}
            </Text>
          )}
          
          <View style={styles.cardFooter}>
            <View style={styles.readMoreContainer}>
              <Text style={styles.readMoreText}>Leer más</Text>
              <ArrowRight size={16} color="#22c55e" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  )
}

export function NewsScreen() {
  const [news, setNews] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadNews = async () => {
    try {
      const res = await apiClient.get<Noticia[]>('/noticias/publicadas')
      setNews(res.data || [])
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al cargar noticias'
      console.error('Error cargando noticias:', errorMessage)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void loadNews()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    void loadNews()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <View
            style={{
              width: 200,
              height: 200,
              marginBottom: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Image
              source={require('../../../assets/images/amvamovil.png')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </View>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Cargando noticias...</Text>
        </View>
      </SafeAreaView>
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
            <View style={styles.logoHeaderContainer}>
              <Image
                source={require('../../../assets/images/amvamovil.png')}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.headerContent}>
              <Newspaper size={28} color="#22c55e" />
              <Text style={styles.title}>Noticias</Text>
            </View>
            <Text style={styles.subtitle}>Mantente informado con las últimas novedades</Text>
          </View>
        </LinearGradient>

        {news.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyLogoContainer}>
              <Image
                source={require('../../../assets/images/amvamovil.png')}
                style={styles.emptyLogo}
                resizeMode="contain"
              />
            </View>
            <Newspaper size={64} color="rgba(255, 255, 255, 0.3)" />
            <Text style={styles.emptyTitle}>No hay noticias disponibles</Text>
            <Text style={styles.emptyText}>
              En este momento no hay noticias publicadas. Vuelve pronto para ver las últimas
              novedades.
            </Text>
          </View>
        ) : (
          <FlatList
            data={news}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
            }
            renderItem={({ item, index }) => (
              <NewsCard item={item} index={index} formatDate={formatDate} />
            )}
          />
        )}
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
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a1628',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 24,
    marginBottom: 18,
    borderRadius: 18,
    marginHorizontal: -16,
  },
  header: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 0,
    alignItems: 'center',
  },
  logoHeaderContainer: {
    width: 140,
    height: 45,
    marginBottom: 16,
    alignSelf: 'center',
  },
  headerLogo: {
    width: '100%',
    height: '100%',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardGradient: {
    padding: 16,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    marginHorizontal: -16,
    marginTop: -16,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22c55e',
    textTransform: 'uppercase',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    lineHeight: 23,
    letterSpacing: -0.2,
  },
  cardText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  readMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4ade80',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyLogoContainer: {
    width: 180,
    height: 60,
    marginBottom: 24,
    opacity: 0.4,
  },
  emptyLogo: {
    width: '100%',
    height: '100%',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 20,
  },
})
