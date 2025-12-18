import React, { useState } from 'react'
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@api/notifications'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Bell, Check, CheckCheck, ArrowLeft } from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'

export default function NotificationsHistoryScreen() {
  const navigation = useNavigation()
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)

  const { data: history, isLoading } = useQuery({
    queryKey: ['notifications', 'history'],
    queryFn: () => notificationsApi.getHistory(50, 0),
  })

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
  })

  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const markAllAsRead = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const onRefresh = async () => {
    setRefreshing(true)
    await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    setRefreshing(false)
  }

  const getNotificationIcon = (type: string) => {
    if (type === 'pago_validado') return '✅'
    if (type === 'inscripcion_confirmada') return '🎉'
    return '📬'
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={['#0a1628', '#0d1f35']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Bell size={24} color="#10b981" />
            <Text style={styles.headerTitle}>Notificaciones</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={() => markAllAsRead.mutate()} style={styles.markAllButton}>
              <CheckCheck size={20} color="#10b981" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {isLoading ? (
          <View style={styles.emptyContainer}>
            <View
              style={{
                width: 180,
                height: 180,
                marginBottom: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Image
                source={require('../../../assets/images/amvamobil.png')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
            <ActivityIndicator size="large" color="#22c55e" />
            <Text style={styles.emptyText}>Cargando notificaciones...</Text>
          </View>
        ) : history?.notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Bell size={64} color="#6b7280" />
            <Text style={styles.emptyText}>No hay notificaciones</Text>
          </View>
        ) : (
          history?.notifications.map(notification => (
            <TouchableOpacity
              key={notification.id}
              style={[styles.notificationCard, !notification.read && styles.unreadCard]}
              onPress={() => {
                if (!notification.read) {
                  markAsRead.mutate(notification.id)
                }
              }}
            >
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationIcon}>
                  {getNotificationIcon(notification.type)}
                </Text>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationBody}>{notification.body}</Text>
                  <View style={styles.notificationFooter}>
                    <Text style={styles.notificationDate}>
                      {format(new Date(notification.createdAt), 'PPp', { locale: es })}
                    </Text>
                    {notification.sentVia !== 'none' && (
                      <View style={styles.sentViaBadge}>
                        <Text style={styles.sentViaText}>
                          {notification.sentVia === 'push' && '📱'}
                          {notification.sentVia === 'email' && '📧'}
                          {notification.sentVia === 'both' && '📱📧'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                {!notification.read && (
                  <TouchableOpacity
                    onPress={() => markAsRead.mutate(notification.id)}
                    style={styles.markReadButton}
                  >
                    <Check size={18} color="#10b981" />
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  markAllButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 16,
  },
  notificationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  unreadCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  notificationHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  sentViaBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sentViaText: {
    fontSize: 12,
  },
  markReadButton: {
    padding: 4,
  },
})
