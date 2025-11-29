'use client'

import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './use-auth'
import { useUnreadCount } from './use-notifications'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export function useWebSocketNotifications() {
  const { user, isAuthenticated } = useAuth()
  const { data: unreadCount } = useUnreadCount()
  const queryClient = useQueryClient()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return
    }

    // Obtener token del localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      return
    }

    // Conectar al WebSocket
    const socket = io(`${API_URL.replace('/api', '')}/notifications`, {
      auth: {
        token: token.replace('Bearer ', ''),
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setIsConnected(true)
      console.log('✅ Conectado a WebSocket de notificaciones')
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
      console.log('❌ Desconectado de WebSocket')
    })

    socket.on('notification', (notification: any) => {
      console.log('📬 Nueva notificación recibida:', notification)
      
      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      
      // Mostrar toast solo si el usuario está en el dashboard
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
        toast.info(notification.title, {
          description: notification.body,
          duration: 5000,
        })
      }
    })

    socket.on('unread-count', (data: { count: number }) => {
      console.log('📊 Conteo de no leídas actualizado:', data.count)
      queryClient.setQueryData(['notifications', 'unread-count'], data.count)
    })

    socket.on('connect_error', (error) => {
      console.error('❌ Error conectando a WebSocket:', error)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [isAuthenticated, user, queryClient])

  return {
    isConnected,
    socket: socketRef.current,
  }
}

