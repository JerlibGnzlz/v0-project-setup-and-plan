/**
 * Hook para sincronización en tiempo real usando WebSockets
 * Conecta a Socket.io y escucha eventos de actualización de datos
 */

import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io, Socket } from 'socket.io-client'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

// Obtener URL del servidor (similar a client.ts)
const EXPO_PUBLIC_API_URL =
  typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_API_URL : undefined

const getApiUrl = () => {
  if (EXPO_PUBLIC_API_URL) {
    // Si viene con /api, removerlo para obtener la base URL
    return EXPO_PUBLIC_API_URL.replace('/api', '')
  }
  // Producción por defecto (sin /api)
  return 'https://ministerio-backend-wdbj.onrender.com'
}

const SERVER_URL = getApiUrl()
const WS_URL = `${SERVER_URL}/data-sync`

export type DataSyncEventType = 'credencial_updated' | 'convencion_updated' | 'convencion_created' | 'convencion_deleted'

export interface DataSyncEvent {
  type: DataSyncEventType
  data: Record<string, unknown>
  timestamp: number
}

/**
 * Hook para sincronización en tiempo real usando WebSockets
 * Escucha eventos del backend y actualiza las queries de React Query automáticamente
 */
export function useWebSocketSync() {
  const queryClient = useQueryClient()
  const socketRef = useRef<Socket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(async () => {
    try {
      // Obtener token (intentar primero invitado, luego pastor)
      let token = await SecureStore.getItemAsync('invitado_token')
      if (!token) {
        token = await SecureStore.getItemAsync('access_token')
      }

      if (!token) {
        console.log('⚠️ No hay token disponible para WebSocket, esperando autenticación...')
        return
      }

      // Si ya hay una conexión activa, no crear otra
      if (socketRef.current?.connected) {
        console.log('✅ WebSocket ya está conectado')
        return
      }

      console.log('🔌 Conectando a WebSocket:', WS_URL)

      // Crear conexión Socket.io
      const socket = io(WS_URL, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'], // Fallback a polling si websocket falla
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: maxReconnectAttempts,
        timeout: 20000,
      })

      socketRef.current = socket

      // Evento: Conexión exitosa
      socket.on('connect', () => {
        console.log('✅ WebSocket conectado:', socket.id)
        reconnectAttemptsRef.current = 0
      })

      // Evento: Conexión establecida
      socket.on('connected', (data: { message: string; userId: string; tipo: string }) => {
        console.log('✅ WebSocket autenticado:', data)
      })

      // Evento: Sincronización de datos
      socket.on('data-sync', (event: DataSyncEvent) => {
        console.log('📡 Evento de sincronización recibido:', event.type, event.data)

        // Invalidar queries según el tipo de evento
        switch (event.type) {
          case 'credencial_updated':
            console.log('🔄 Invalidando queries de credenciales')
            queryClient.invalidateQueries({ queryKey: ['credenciales'] })
            queryClient.invalidateQueries({ queryKey: ['credenciales', 'mis-credenciales'] })
            break

          case 'convencion_updated':
          case 'convencion_created':
          case 'convencion_deleted':
            console.log('🔄 Invalidando queries de convenciones')
            queryClient.invalidateQueries({ queryKey: ['convencion'] })
            queryClient.invalidateQueries({ queryKey: ['convenciones'] })
            break

          default:
            console.log('⚠️ Tipo de evento desconocido:', event.type)
        }
      })

      // Evento: Error de autenticación
      socket.on('error', (error: { type: string; message: string }) => {
        console.error('❌ Error en WebSocket:', error)
        
        if (error.type === 'TOKEN_EXPIRED' || error.type === 'INVALID_TOKEN') {
          console.log('🔄 Token inválido, intentando refrescar...')
          // El interceptor de axios manejará el refresh automáticamente
          // Desconectar y reconectar después de un delay
          setTimeout(() => {
            disconnect()
            setTimeout(() => connect(), 2000)
          }, 1000)
        }
      })

      // Evento: Desconexión
      socket.on('disconnect', (reason: string) => {
        console.log('🔌 WebSocket desconectado:', reason)
        
        // Si fue desconexión forzada del servidor, intentar reconectar
        if (reason === 'io server disconnect') {
          console.log('🔄 Servidor desconectó, reconectando...')
          setTimeout(() => connect(), 2000)
        }
      })

      // Evento: Error de conexión
      socket.on('connect_error', (error: Error) => {
        reconnectAttemptsRef.current += 1
        console.error('❌ Error de conexión WebSocket:', error.message)
        
        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.error('❌ Máximo de intentos de reconexión alcanzado')
          disconnect()
        }
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ Error al conectar WebSocket:', errorMessage)
    }
  }, [queryClient])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('🔌 Desconectando WebSocket...')
      socketRef.current.disconnect()
      socketRef.current = null
      reconnectAttemptsRef.current = 0
    }
  }, [])

  // Conectar al montar el componente
  useEffect(() => {
    connect()

    // Limpiar al desmontar
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  // Reconectar cuando cambie el token (usuario autenticado)
  useEffect(() => {
    const checkTokenAndReconnect = async () => {
      const invitadoToken = await SecureStore.getItemAsync('invitado_token')
      const pastorToken = await SecureStore.getItemAsync('access_token')
      
      // Si hay token y no hay conexión, conectar
      if ((invitadoToken || pastorToken) && !socketRef.current?.connected) {
        console.log('🔄 Token disponible, reconectando WebSocket...')
        connect()
      }
      
      // Si no hay token y hay conexión, desconectar
      if (!invitadoToken && !pastorToken && socketRef.current?.connected) {
        console.log('🔄 No hay token, desconectando WebSocket...')
        disconnect()
      }
    }

    // Verificar cada 5 segundos si hay cambios en el token
    const interval = setInterval(checkTokenAndReconnect, 5000)

    return () => clearInterval(interval)
  }, [connect, disconnect])

  return {
    isConnected: socketRef.current?.connected || false,
    connect,
    disconnect,
  }
}

