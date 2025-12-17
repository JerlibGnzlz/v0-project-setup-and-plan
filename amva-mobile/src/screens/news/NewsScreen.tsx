import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Newspaper, Calendar as CalendarIcon } from 'lucide-react-native'
import { apiClient } from '@api/client'

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
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Cargando noticias...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Newspaper size={28} color="#22c55e" />
            <Text style={styles.title}>Noticias</Text>
          </View>
          <Text style={styles.subtitle}>Mantente informado con las últimas novedades</Text>
        </View>

        {news.length === 0 ? (
          <View style={styles.emptyContainer}>
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
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card} activeOpacity={0.8}>
                <LinearGradient
                  colors={['rgba(34, 197, 94, 0.1)', 'rgba(15, 23, 42, 0.9)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{item.categoria}</Text>
                    </View>
                    {item.fechaPublicacion && (
                      <View style={styles.dateContainer}>
                        <CalendarIcon size={14} color="rgba(255, 255, 255, 0.5)" />
                        <Text style={styles.dateText}>{formatDate(item.fechaPublicacion)}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardTitle}>{item.titulo}</Text>
                  {item.extracto && <Text style={styles.cardText}>{item.extracto}</Text>}
                </LinearGradient>
              </TouchableOpacity>
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
  header: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
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
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardGradient: {
    padding: 20,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    lineHeight: 24,
  },
  cardText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
