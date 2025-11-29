import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { apiClient } from '@api/client'

interface Noticia {
  id: string
  titulo: string
  extracto?: string
  categoria: string
  fechaPublicacion: string | null
  slug: string
}

export function NewsScreen() {
  const [news, setNews] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadNews = async () => {
      try {
        // Usar el apiClient que ya tiene la URL configurada
        const { apiClient } = await import('@api/client')
        const res = await apiClient.get<Noticia[]>('/noticias/publicadas')
        setNews(res.data)
      } catch (error) {
        console.error('Error cargando noticias', error)
      } finally {
        setLoading(false)
      }
    }
    void loadNews()
  }, [])

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator color="#22c55e" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Text style={styles.title}>Noticias</Text>
      <FlatList
        data={news}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 16, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardTitle}>{item.titulo}</Text>
            {item.extracto && <Text style={styles.cardText}>{item.extracto}</Text>}
          </TouchableOpacity>
        )}
      />
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
    padding: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a1628',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 16,
  },
  card: {
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.4)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 13,
    color: 'rgba(148,163,184,0.9)',
  },
})


