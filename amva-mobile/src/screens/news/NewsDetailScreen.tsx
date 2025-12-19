import React from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react-native'
import { apiClient } from '@api/client'

type RootStackParamList = {
  NewsDetail: {
    noticiaId?: string
    noticiaSlug?: string
  }
}

type NewsDetailRouteProp = RouteProp<RootStackParamList, 'NewsDetail'>
type NewsDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewsDetail'>

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

export function NewsDetailScreen() {
  const navigation = useNavigation<NewsDetailNavigationProp>()
  const route = useRoute<NewsDetailRouteProp>()
  const { noticiaId, noticiaSlug } = route.params
  const [noticia, setNoticia] = React.useState<Noticia | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const loadNoticia = async () => {
      try {
        // Usar slug si está disponible (endpoint público)
        if (noticiaSlug) {
          const res = await apiClient.get<Noticia>(`/noticias/slug/${noticiaSlug}`)
          setNoticia(res.data)
        } else if (noticiaId) {
          // Si no hay slug, cargar todas las publicadas y buscar por ID
          const res = await apiClient.get<Noticia[]>(`/noticias/publicadas`)
          const found = res.data.find(n => n.id === noticiaId)
          if (found) {
            setNoticia(found)
          } else {
            console.error('Noticia no encontrada en la lista de publicadas')
          }
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Error al cargar la noticia'
        console.error('Error cargando noticia:', errorMessage)
      } finally {
        setLoading(false)
      }
    }

    void loadNoticia()
  }, [noticiaId, noticiaSlug])

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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Cargando noticia...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!noticia) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se pudo cargar la noticia</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header con botón de volver */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{noticia.categoria}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Imagen */}
        {noticia.imagenUrl && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: noticia.imagenUrl }} style={styles.image} resizeMode="cover" />
          </View>
        )}

        {/* Contenido */}
        <View style={styles.content}>
          {/* Fecha */}
          {noticia.fechaPublicacion && (
            <View style={styles.dateContainer}>
              <CalendarIcon size={16} color="rgba(255, 255, 255, 0.6)" />
              <Text style={styles.dateText}>{formatDate(noticia.fechaPublicacion)}</Text>
            </View>
          )}

          {/* Título */}
          <Text style={styles.title}>{noticia.titulo}</Text>

          {/* Extracto */}
          {noticia.extracto && <Text style={styles.extracto}>{noticia.extracto}</Text>}

          {/* Contenido */}
          {noticia.contenido && (
            <Text style={styles.contenido}>{noticia.contenido}</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    paddingHorizontal: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  extracto: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  contenido: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: '#22c55e',
    fontWeight: '600',
  },
})

