/**
 * Hook para obtener credenciales del usuario autenticado
 * Funciona tanto para pastores como para invitados
 */

import { useQuery } from '@tanstack/react-query'
import { credencialesApi, CredencialUnificada } from '../api/credenciales'
import { useWebSocketSync } from './use-websocket-sync'

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

/**
 * Hook para obtener todas las credenciales del usuario autenticado
 * Retorna credenciales pastorales si es pastor, o credenciales ministeriales/capellanía si es invitado
 * Incluye sincronización en tiempo real via WebSockets
 */
export function useMisCredenciales() {
  // Conectar a WebSocket para sincronización en tiempo real
  useWebSocketSync()

  return useQuery<CredencialesResponse>({
    queryKey: ['credenciales', 'mis-credenciales'],
    queryFn: () => credencialesApi.obtenerMisCredencialesUnificado(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    retryDelay: 1000,
  })
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

