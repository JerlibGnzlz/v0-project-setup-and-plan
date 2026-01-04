'use client'

import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './use-auth'
import { useUnreadCount } from './use-notifications'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authApi } from '@/lib/api/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export function useWebSocketNotifications() {
  const { user, isAuthenticated, isHydrated } = useAuth()
  const queryClient = useQueryClient()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') {
      return
    }

    // Verificar que QueryProvider esté disponible
    if (!queryClient) {
      console.warn('[WebSocket] QueryClient no disponible aún')
      return
    }

    // Verificar que el estado esté hidratado
    if (!isHydrated) {
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

        socket.on('connect_error', async (error: unknown) => {
          // Solo loguear errores, no romper la aplicación
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
          console.warn('⚠️ Error conectando a WebSocket:', errorMessage)
          
          // Si el error indica token expirado, intentar refrescar
          if (errorMessage.includes('expired') || errorMessage.includes('jwt expired')) {
            console.log('🔄 Token expirado detectado, intentando refrescar...')
            try {
              const refreshToken = typeof window !== 'undefined'
                ? localStorage.getItem('auth_refresh_token') || sessionStorage.getItem('auth_refresh_token')
                : null
              
              if (refreshToken) {
                const response = await authApi.refreshToken(refreshToken)
                
                // Guardar nuevos tokens
                if (typeof window !== 'undefined') {
                  const storage = localStorage.getItem('auth_token') ? localStorage : sessionStorage
                  storage.setItem('auth_token', response.access_token)
                  if (response.refresh_token) {
                    storage.setItem('auth_refresh_token', response.refresh_token)
                  }
                }
                
                console.log('✅ Token refrescado exitosamente, reconectando WebSocket...')
                // Reconectar con el nuevo token
                if (socketRef.current) {
                  socketRef.current.disconnect()
                  socketRef.current.auth = { token: response.access_token.replace('Bearer ', '') }
                  socketRef.current.connect()
                }
              } else {
                console.warn('⚠️ No hay refresh token disponible, el usuario necesitará iniciar sesión nuevamente')
              }
            } catch (refreshError) {
              console.error('❌ Error al refrescar token:', refreshError)
            }
          }
          // No establecer isConnected en false aquí, dejar que el sistema de reconexión maneje
        })

        // Manejar errores específicos del servidor (evento 'error' personalizado)
        socket.on('error', async (data: unknown) => {
          try {
            if (data && typeof data === 'object' && 'type' in data) {
              const errorData = data as { type: string; message?: string }
              
              if (errorData.type === 'TOKEN_EXPIRED') {
                console.log('🔄 Token expirado recibido del servidor, intentando refrescar...')
                try {
                  const refreshToken = typeof window !== 'undefined'
                    ? localStorage.getItem('auth_refresh_token') || sessionStorage.getItem('auth_refresh_token')
                    : null
                  
                  if (refreshToken) {
                    const response = await authApi.refreshToken(refreshToken)
                    
                    // Guardar nuevos tokens
                    if (typeof window !== 'undefined') {
                      const storage = localStorage.getItem('auth_token') ? localStorage : sessionStorage
                      storage.setItem('auth_token', response.access_token)
                      if (response.refresh_token) {
                        storage.setItem('auth_refresh_token', response.refresh_token)
                      }
                    }
                    
                    console.log('✅ Token refrescado exitosamente, reconectando WebSocket...')
                    // Reconectar con el nuevo token
                    if (socketRef.current) {
                      socketRef.current.disconnect()
                      socketRef.current.auth = { token: response.access_token.replace('Bearer ', '') }
                      socketRef.current.connect()
                    }
                  } else {
                    console.warn('⚠️ No hay refresh token disponible')
                    toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
                  }
                } catch (refreshError) {
                  console.error('❌ Error al refrescar token:', refreshError)
                  toast.error('Error al renovar tu sesión. Por favor, inicia sesión nuevamente.')
                }
              } else if (errorData.type === 'INVALID_TOKEN') {
                console.warn('⚠️ Token inválido:', errorData.message)
                toast.error(errorData.message || 'Token inválido. Por favor, inicia sesión nuevamente.')
              } else if (errorData.type === 'AUTH_ERROR') {
                console.warn('⚠️ Error de autenticación:', errorData.message)
                toast.error(errorData.message || 'Error de autenticación.')
              } else {
                const errorMessage = errorData.message || 'Error desconocido'
                console.warn('⚠️ Error en WebSocket:', errorMessage)
              }
            } else {
              const errorMessage = data instanceof Error ? data.message : 'Error desconocido'
              console.warn('⚠️ Error en WebSocket (no crítico):', errorMessage)
            }
          } catch (error) {
            console.warn('⚠️ Error procesando evento de error del WebSocket:', error)
          }
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
  }, [isAuthenticated, isHydrated, user, queryClient])

  return {
    isConnected,
    socket: socketRef.current,
  }
}
