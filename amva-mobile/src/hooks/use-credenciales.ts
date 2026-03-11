/**
 * Hook para obtener credenciales del usuario autenticado
 * Funciona tanto para pastores como para invitados
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { credencialesApi, CredencialUnificada } from '../api/credenciales'
import { useWebSocketSync } from './use-websocket-sync'
import { useInvitadoAuth } from './useInvitadoAuth'
import { useAuth } from './useAuth'
import * as SecureStore from 'expo-secure-store'

export interface CredencialesResponse {
  tieneCredenciales: boolean
  credenciales: CredencialUnificada[]
  resumen?: {
    total: number
    vigentes: number
    porVencer: number
    vencidas: number
  }
  mensaje?: string
}

// Expo define __DEV__ de forma global en tiempo de ejecución
declare const __DEV__: boolean

// Helper para logging condicional (solo en desarrollo)
const logDebug = (...args: unknown[]) => {
  if (__DEV__) {
    console.log(...args)
  }
}

/**
 * Hook para obtener todas las credenciales del usuario autenticado
 * Retorna credenciales pastorales si es pastor, o credenciales ministeriales/capellanía si es invitado
 * Incluye sincronización en tiempo real via WebSockets
 */
// Variable global para rastrear si la sesión está expirada (se resetea cuando el usuario vuelve a loguearse)
let globalSessionExpired = false

export function useMisCredenciales() {
  const queryClient = useQueryClient()
  const [isEnabled, setIsEnabled] = useState(false) // Iniciar como false hasta verificar tokens
  const hasCheckedTokensRef = useRef(false)
  
  // Obtener estado de autenticación para reaccionar cuando el usuario hace login
  const { invitado, isAuthenticated: isInvitadoAuthenticated } = useInvitadoAuth()
  const { pastor } = useAuth()
  
  // Conectar a WebSocket para sincronización en tiempo real
  const { isConnected } = useWebSocketSync()

  // Función para verificar tokens y habilitar/deshabilitar el query
  const checkTokens = async () => {
    try {
      const invitadoToken = await SecureStore.getItemAsync('invitado_token')
      const invitadoRefreshToken = await SecureStore.getItemAsync('invitado_refresh_token')
      const pastorToken = await SecureStore.getItemAsync('access_token')
      const pastorRefreshToken = await SecureStore.getItemAsync('refresh_token')
      
      // Si hay algún token disponible (access o refresh), habilitar el query
      const hasTokens = !!(invitadoToken || invitadoRefreshToken || pastorToken || pastorRefreshToken)
      
      if (hasTokens) {
        // Si hay tokens, SIEMPRE resetear el flag y habilitar el query
        // Esto permite que el interceptor maneje el refresh automáticamente si es necesario
        globalSessionExpired = false
        setIsEnabled(true)
        logDebug('✅ Tokens encontrados, habilitando query (el interceptor manejará el refresh si es necesario)')
      } else {
        // Si no hay tokens, deshabilitar pero NO marcar como expirada
        // (puede ser que el usuario simplemente no esté logueado)
        setIsEnabled(false)
        logDebug('ℹ️ No hay tokens disponibles, deshabilitando query')
      }
    } catch (error) {
      console.error('❌ Error verificando tokens:', error)
      setIsEnabled(false)
    }
  }

  // Verificar tokens al montar el componente
  useEffect(() => {
    // Resetear el flag cuando el hook se monta (app se reinicia o componente se monta)
    if (!hasCheckedTokensRef.current) {
      logDebug('🔄 Hook montado, reseteando flag de sesión expirada y verificando tokens')
      globalSessionExpired = false // SIEMPRE resetear al montar
      hasCheckedTokensRef.current = true
    }
    
    void checkTokens()
  }, []) // Solo ejecutar una vez al montar

  // Reaccionar cuando el usuario se autentica (hace login)
  // Esto es crítico para que el hook detecte cuando el usuario hace login después de una sesión expirada
  useEffect(() => {
    // Si el usuario está autenticado (invitado o pastor), verificar tokens y habilitar query
    if (isInvitadoAuthenticated || pastor) {
      logDebug('🔄 Usuario autenticado detectado, verificando tokens y reseteando flag de sesión expirada')
      globalSessionExpired = false // Resetear flag cuando el usuario se autentica
      // Usar un pequeño delay para asegurar que los tokens se hayan guardado en SecureStore
      const timeoutId = setTimeout(() => {
        void checkTokens()
      }, 300)
      
      return () => clearTimeout(timeoutId)
    }
  }, [isInvitadoAuthenticated, pastor]) // Reaccionar cuando cambia el estado de autenticación

  const query = useQuery<CredencialesResponse, Error>({
    queryKey: ['credenciales', 'mis-credenciales'],
    queryFn: async () => {
      // Verificar tokens antes de hacer el request
      const invitadoToken = await SecureStore.getItemAsync('invitado_token')
      const invitadoRefreshToken = await SecureStore.getItemAsync('invitado_refresh_token')
      const pastorToken = await SecureStore.getItemAsync('access_token')
      const pastorRefreshToken = await SecureStore.getItemAsync('refresh_token')
      
      // Si no hay tokens disponibles, lanzar error
      if (!invitadoToken && !invitadoRefreshToken && !pastorToken && !pastorRefreshToken) {
        const noTokensError = new Error('No hay tokens disponibles. Sesión expirada.') as Error & { isSessionExpired?: boolean; requiresReauth?: boolean }
        noTokensError.isSessionExpired = true
        noTokensError.requiresReauth = true
        throw noTokensError
      }
      
      // Si hay tokens pero el flag está marcado como expirada, resetearlo
      if (globalSessionExpired && (invitadoToken || invitadoRefreshToken || pastorToken || pastorRefreshToken)) {
        logDebug('✅ Tokens encontrados en queryFn, reseteando flag de sesión expirada')
        globalSessionExpired = false
        setIsEnabled(true)
      }
      
      return credencialesApi.obtenerMisCredencialesUnificado()
    },
    enabled: isEnabled && !globalSessionExpired,
    staleTime: Infinity, // No considerar datos obsoletos automáticamente (solo cuando el usuario hace pull-to-refresh)
    retry: (failureCount, error) => {
      // En una aplicación profesional, NO deberíamos marcar como expirada prematuramente
      // El interceptor maneja el refresh automáticamente, así que solo marcamos como expirada
      // cuando realmente no hay tokens válidos disponibles
      
      if (error instanceof Error) {
        const errorObj = error as Error & { isSessionExpired?: boolean; requiresReauth?: boolean; response?: { status?: number } }
        
        // Si el error explícitamente indica sesión expirada (viene del interceptor después de intentar refresh)
        if (errorObj.isSessionExpired || errorObj.requiresReauth) {
          // Este error ya viene del interceptor después de intentar refrescar
          // Solo marcar como expirada si realmente no hay refresh token
          void SecureStore.getItemAsync('invitado_refresh_token')
            .then(invitadoRefresh => {
              return SecureStore.getItemAsync('refresh_token')
                .then(pastorRefresh => {
                  // Solo marcar como expirada si NO hay ningún refresh token
                  if (!invitadoRefresh && !pastorRefresh) {
                    logDebug('⚠️ No hay refresh tokens disponibles, marcando sesión como expirada')
                    globalSessionExpired = true
                    setIsEnabled(false)
                  } else {
                    // Si hay refresh token pero aún así dice expirada, puede ser un problema temporal
                    // No marcar como expirada, permitir que el usuario intente manualmente
                    console.log('ℹ️ Hay refresh token disponible, no marcando como expirada')
                  }
                })
            })
            .catch(() => {
              // En caso de error al verificar, no marcar como expirada (puede ser temporal)
            })
          return false // No reintentar automáticamente
        }
        
        // Si es 401, el interceptor manejará el refresh automáticamente
        // NO marcar como expirada - dejar que el interceptor intente refrescar
        if (errorObj.response?.status === 401) {
          logDebug('ℹ️ Error 401 detectado, el interceptor manejará el refresh automáticamente')
          return false // No reintentar, el interceptor manejará el refresh
        }
        
        // Si el mensaje indica que no hay tokens, verificar antes de marcar como expirada
        if (error.message.includes('No hay tokens disponibles')) {
          // Verificar si realmente no hay tokens (ni access ni refresh)
          void SecureStore.getItemAsync('invitado_refresh_token')
            .then(invitadoRefresh => {
              return SecureStore.getItemAsync('refresh_token')
                .then(pastorRefresh => {
                  // Solo marcar como expirada si NO hay ningún token (ni access ni refresh)
                  const invitadoAccess = SecureStore.getItemAsync('invitado_token')
                  const pastorAccess = SecureStore.getItemAsync('access_token')
                  return Promise.all([invitadoAccess, pastorAccess])
                    .then(([invitadoAcc, pastorAcc]) => {
                      if (!invitadoRefresh && !pastorRefresh && !invitadoAcc && !pastorAcc) {
                        console.log('⚠️ No hay tokens disponibles, marcando sesión como expirada')
                        globalSessionExpired = true
                        setIsEnabled(false)
                      }
                    })
                })
            })
            .catch(() => {
              // En caso de error, no marcar como expirada
            })
          return false
        }
      }
      // Máximo 1 reintento para otros errores (no de sesión)
      return failureCount < 1
    },
    retryDelay: 1000,
    refetchOnWindowFocus: false, // No refetch automático cuando la ventana recupera el foco
    refetchOnReconnect: false, // No refetch automático al reconectar
    refetchOnMount: false, // No refetch automático al montar (solo cuando el usuario lo solicita)
  })

  // NO hacer refetch automático con WebSocket - solo cuando el usuario lo solicita manualmente
  // El WebSocket puede invalidar queries, pero no hacer refetch automático

  // Resetear el flag de sesión expirada cuando el query es exitoso
  useEffect(() => {
    if (query.isSuccess) {
      if (globalSessionExpired) {
        logDebug('✅ Query exitoso, reseteando flag de sesión expirada')
        globalSessionExpired = false
      }
      setIsEnabled(true)
    }
  }, [query.isSuccess])

  // Actualizar estado cuando hay error pero verificar si realmente está expirada
  useEffect(() => {
    if (query.isError) {
      const errorObj = query.error as Error & { isSessionExpired?: boolean; requiresReauth?: boolean } | undefined
      
      // Verificar si realmente está expirada (sin refresh token disponible)
      if (errorObj?.isSessionExpired || errorObj?.requiresReauth) {
        // Verificar si hay refresh token antes de deshabilitar
        void SecureStore.getItemAsync('invitado_refresh_token')
          .then(invitadoRefresh => {
            return SecureStore.getItemAsync('refresh_token')
              .then(pastorRefresh => {
                // Solo deshabilitar si NO hay refresh token disponible
                if (!invitadoRefresh && !pastorRefresh) {
                  setIsEnabled(false)
                } else {
                  // Si hay refresh token, mantener habilitado para permitir reintentos
                  setIsEnabled(true)
                }
              })
          })
          .catch(() => {
            // En caso de error, mantener habilitado
            setIsEnabled(true)
          })
      } else {
        // Si no es error de sesión expirada, mantener habilitado para permitir reintentos manuales
        setIsEnabled(true)
      }
    } else if (query.isSuccess) {
      // Si el query es exitoso, asegurar que esté habilitado
      setIsEnabled(true)
      globalSessionExpired = false
    }
  }, [query.isError, query.error, query.isSuccess])

  return query
}

// Función para resetear el flag de sesión expirada cuando el usuario vuelve a loguearse
export function resetSessionExpiredFlag(queryClient?: ReturnType<typeof useQueryClient>) {
  logDebug('🔄 Reseteando flag de sesión expirada (usuario volvió a loguearse)')
  globalSessionExpired = false
  // Invalidar queries de credenciales para que se vuelvan a cargar con los nuevos tokens
  if (queryClient) {
    queryClient.invalidateQueries({ queryKey: ['credenciales', 'mis-credenciales'] })
    // También forzar un refetch después de invalidar para asegurar que se carguen los datos
    setTimeout(() => {
      queryClient.refetchQueries({ queryKey: ['credenciales', 'mis-credenciales'] })
    }, 500)
  }
}

/**
 * Helper para obtener el color según el estado de la credencial
 */
export function getEstadoColor(estado: 'vigente' | 'por_vencer' | 'vencida'): string {
  switch (estado) {
    case 'vigente':
      return '#22c55e' // Verde
    case 'por_vencer':
      return '#f59e0b' // Amarillo/Naranja
    case 'vencida':
      return '#ef4444' // Rojo
    default:
      return '#6b7280' // Gris
  }
}

/**
 * Helper para obtener el mensaje según el estado de la credencial
 */
export function getEstadoMensaje(
  estado: 'vigente' | 'por_vencer' | 'vencida',
  diasRestantes: number
): string {
  switch (estado) {
    case 'vigente':
      return `Vigente - ${diasRestantes} días restantes`
    case 'por_vencer':
      return `Por vencer - ${diasRestantes} días restantes`
    case 'vencida':
      return `Vencida hace ${diasRestantes} días`
    default:
      return 'Estado desconocido'
  }
}

/**
 * Helper para obtener el nombre completo de la credencial
 */
export function getCredencialNombreCompleto(credencial: CredencialUnificada): string {
  return `${credencial.nombre} ${credencial.apellido}`.trim()
}

/**
 * Helper para obtener el identificador de la credencial (numero o documento)
 */
export function getCredencialIdentificador(credencial: CredencialUnificada): string {
  return credencial.numero || credencial.documento || 'Sin identificador'
}

/**
 * Helper para obtener el tipo de credencial en formato legible
 */
export function getCredencialTipoLegible(tipo: 'pastoral' | 'ministerial' | 'capellania'): string {
  switch (tipo) {
    case 'pastoral':
      return 'Credencial Pastoral'
    case 'ministerial':
      return 'Credencial Ministerial'
    case 'capellania':
      return 'Credencial de Capellanía'
    default:
      return 'Credencial'
  }
}

