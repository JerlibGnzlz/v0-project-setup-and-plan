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
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') {
      return
    }

    // Verificar PRIMERO que estamos en una ruta de admin antes de hacer cualquier cosa
    const currentPath = window.location.pathname || ''
    if (!currentPath.startsWith('/admin') || currentPath === '/admin/login') {
      // No conectar si no estamos en admin
      return
    }

    // Solo conectar si está autenticado
    if (!isAuthenticated || !user) {
      return
    }

    // Esperar a que la página termine de cargar antes de conectar
    const connectWebSocket = () => {
      try {
        // Obtener token del localStorage o sessionStorage
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
            : null
        if (!token) {
          console.log('[WebSocket] No se encontró token de autenticación')
          return
        }

        // Construir URL del WebSocket de forma segura
        const baseUrl = API_URL.replace('/api', '')
        const wsUrl = `${baseUrl}/notifications`

        // Conectar al WebSocket con manejo de errores mejorado
        const socket = io(wsUrl, {
          auth: {
            token: token.replace('Bearer ', ''),
          },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 3, // Reducir intentos para evitar conexiones persistentes
          timeout: 10000, // Timeout de 10 segundos
          forceNew: false,
          autoConnect: true,
        })

        socketRef.current = socket

        socket.on('connect', () => {
          setIsConnected(true)
          console.log('✅ Conectado a WebSocket de notificaciones')
          // Invalidar queries al conectar para obtener datos frescos
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
        })

        socket.on('disconnect', (reason) => {
          setIsConnected(false)
          // Solo loguear si no es un cierre intencional
          if (reason !== 'io client disconnect') {
            console.log('❌ Desconectado de WebSocket:', reason)
          }
        })

        socket.on('reconnect', (attemptNumber) => {
          console.log(`🔄 Reconectado a WebSocket después de ${attemptNumber} intentos`)
          // Invalidar queries al reconectar
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
        })

        socket.on('notification', (notification: unknown) => {
          try {
            if (notification && typeof notification === 'object') {
              const notif = notification as { title?: string; body?: string }
              console.log('📬 Nueva notificación recibida:', notif)

              // Invalidar queries para refrescar datos
              queryClient.invalidateQueries({ queryKey: ['notifications'] })
              
              // Actualizar el conteo de no leídas inmediatamente
              queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })

              // Mostrar toast solo si el usuario está en el dashboard
              if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
                toast.info(notif.title || 'Nueva notificación', {
                  description: notif.body || '',
                  duration: 5000,
                })
              }
            }
          } catch (error) {
            console.warn('[WebSocket] Error procesando notificación:', error)
          }
        })

        socket.on('unread-count', (data: unknown) => {
          try {
            if (data && typeof data === 'object' && 'count' in data) {
              const count = typeof (data as { count: unknown }).count === 'number' 
                ? (data as { count: number }).count 
                : 0
              console.log('📊 Conteo de no leídas actualizado vía WebSocket:', count)
              queryClient.setQueryData(['notifications', 'unread-count'], count)
            }
          } catch (error) {
            console.warn('[WebSocket] Error procesando unread-count:', error)
          }
        })

        socket.on('connect_error', (error: unknown) => {
          // Solo loguear errores, no romper la aplicación
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
          console.warn('⚠️ Error conectando a WebSocket (no crítico):', errorMessage)
          // No establecer isConnected en false aquí, dejar que el sistema de reconexión maneje
        })

        // Manejar errores no capturados
        socket.on('error', (error: unknown) => {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
          console.warn('⚠️ Error en WebSocket (no crítico):', errorMessage)
        })
      } catch (error) {
        // Capturar cualquier error durante la inicialización
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.warn('⚠️ Error inicializando WebSocket (no crítico):', errorMessage)
        // No romper la aplicación si el WebSocket falla
      }
    }

    // Esperar a que la página termine de cargar antes de conectar
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        // Pequeño delay adicional para asegurar que todo esté listo
        setTimeout(connectWebSocket, 500)
      })
    } else {
      // Si ya está cargado, conectar después de un pequeño delay
      setTimeout(connectWebSocket, 500)
    }

    return () => {
      // Limpiar conexión al desmontar
      if (socketRef.current) {
        try {
          socketRef.current.disconnect()
        } catch (error) {
          console.warn('[WebSocket] Error al desconectar:', error)
        }
        socketRef.current = null
      }
    }
  }, [isAuthenticated, user, queryClient])

  return {
    isConnected,
    socket: socketRef.current,
  }
}
