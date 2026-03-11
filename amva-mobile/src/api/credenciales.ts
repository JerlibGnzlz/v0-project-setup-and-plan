/**
 * API para credenciales - Mobile
 */

import * as SecureStore from 'expo-secure-store'
import { apiClient } from './client'

export interface Credencial {
  id: string
  documento: string
  nombre: string
  apellido: string
  tipo: 'ministerial' | 'capellania'
  fechaEmision?: string // Mapeado desde createdAt del backend
  createdAt?: string // Fecha de creación desde el backend
  fechaVencimiento: string
  estado: 'vigente' | 'por_vencer' | 'vencida'
  diasRestantes?: number
  activa: boolean
  observaciones?: string
  nacionalidad?: string
  fechaNacimiento?: string
  fotoUrl?: string
  tipoPastor?: string // Para credenciales ministeriales
  tipoCapellan?: string // Para credenciales de capellanía
}

export interface CredencialResponse {
  encontrada: boolean
  credencial?: Credencial
  credenciales?: Credencial[]
  mensaje?: string
}

export interface CredencialUnificada {
  id: string
  tipo: 'pastoral' | 'ministerial' | 'capellania'
  numero?: string
  documento?: string
  nombre: string
  apellido: string
  fechaEmision?: string | Date
  fechaVencimiento: string | Date
  estado: 'vigente' | 'por_vencer' | 'vencida' | 'sin_credencial'
  diasRestantes: number
  fotoUrl?: string | null
  activa: boolean
  nacionalidad?: string
  fechaNacimiento?: string | Date
  tipoPastor?: string
  tipoCapellan?: string
}

export const credencialesApi = {
  /**
   * Obtener todas las credenciales del usuario autenticado (unificado)
   * Funciona tanto para pastores como para invitados
   * Retorna credenciales pastorales si es pastor, o credenciales ministeriales/capellanía si es invitado
   * Requiere autenticación de pastor o invitado
   */
  obtenerMisCredencialesUnificado: async (): Promise<{
    tieneCredenciales: boolean
    credenciales: CredencialUnificada[]
    resumen?: {
      total: number
      vigentes: number
      porVencer: number
      vencidas: number
    }
    mensaje?: string
  }> => {
    try {
      console.log('🔍 Obteniendo credenciales unificadas...')
      // Cache-busting para que cambios en AMVA Digital (ej. tipo de pastor) se reflejen al abrir Credenciales
      const response = await apiClient.get<{
        tieneCredenciales: boolean
        credenciales: CredencialUnificada[]
        resumen?: {
          total: number
          vigentes: number
          porVencer: number
          vencidas: number
        }
        mensaje?: string
      }>('/credenciales/mis-credenciales', { params: { _: Date.now() } })

      const data = response.data
      const credenciales = (data.credenciales || []).map((c): CredencialUnificada => {
        const fechaVencimiento =
          c.fechaVencimiento instanceof Date
            ? c.fechaVencimiento.toISOString()
            : typeof c.fechaVencimiento === 'string'
              ? c.fechaVencimiento
              : ''
        const fechaEmision =
          c.fechaEmision instanceof Date
            ? c.fechaEmision.toISOString()
            : typeof c.fechaEmision === 'string'
              ? c.fechaEmision
              : undefined
        const fechaNacimiento =
          c.fechaNacimiento instanceof Date
            ? c.fechaNacimiento.toISOString()
            : typeof c.fechaNacimiento === 'string'
              ? c.fechaNacimiento
              : undefined
        return {
          ...c,
          fechaVencimiento,
          fechaEmision,
          fechaNacimiento,
          nombre: c.nombre ?? '',
          apellido: c.apellido ?? '',
          documento: c.documento ?? c.numero ?? '',
          diasRestantes: typeof c.diasRestantes === 'number' ? c.diasRestantes : 0,
          tipoPastor: (c.tipo === 'ministerial' || c.tipo === 'pastoral')
            ? (c.tipoPastor != null && String(c.tipoPastor).trim() !== '' ? String(c.tipoPastor).trim() : 'PASTOR')
            : c.tipoPastor,
          tipoCapellan: c.tipo === 'capellania' ? (c.tipoCapellan ?? 'CAPELLÁN') : c.tipoCapellan,
        }
      })

      console.log('✅ Respuesta unificada recibida:', {
        tieneCredenciales: data.tieneCredenciales,
        cantidad: credenciales.length,
        resumen: data.resumen,
      })

      return {
        ...data,
        credenciales,
      }
    } catch (error: unknown) {
      const axiosStatus = (error as { response?: { status?: number } })?.response?.status
      const errorObj = error as Error & { isSessionExpired?: boolean; requiresReauth?: boolean }
      
      // Si el error ya tiene las flags de sesión expirada, propagarlo tal cual
      // (viene del interceptor después de intentar refrescar)
      if (errorObj.isSessionExpired && error instanceof Error) {
        throw error
      }
      
      // Si es 401 pero no tiene las flags, verificar si hay refresh token disponible
      // Si hay refresh token, el interceptor debería haberlo manejado
      // Solo marcar como expirada si realmente no hay refresh token
      if (axiosStatus === 401) {
        // Verificar si hay refresh token disponible antes de marcar como expirada
        const invitadoRefresh = await SecureStore.getItemAsync('invitado_refresh_token').catch(() => null)
        const pastorRefresh = await SecureStore.getItemAsync('refresh_token').catch(() => null)
        
        if (!invitadoRefresh && !pastorRefresh) {
          // No hay refresh token, realmente está expirada
          console.warn('⚠️ Credenciales: sesión expirada (401 sin refresh token). Se mantienen los datos en caché si los hay.')
          const sessionError = new Error('Sesión expirada. Por favor, cierra sesión en Perfil y vuelve a entrar con Google.') as Error & { isSessionExpired?: boolean; requiresReauth?: boolean }
          sessionError.isSessionExpired = true
          sessionError.requiresReauth = true
          throw sessionError
        } else {
          // Hay refresh token pero aún así falló - puede ser un problema temporal
          // Propagar el error original para que el interceptor lo maneje
          console.warn('⚠️ Credenciales: error 401 pero hay refresh token disponible. El interceptor debería haber refrescado.')
          throw error
        }
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ Error obteniendo credenciales unificadas:', errorMessage)
      throw error
    }
  },

  /**
   * Consultar credencial ministerial por documento
   * Requiere autenticación de pastor
   */
  consultarMinisterial: async (documento: string): Promise<CredencialResponse> => {
    const response = await apiClient.get<CredencialResponse>(
      `/credenciales-ministeriales/consultar/${documento}`
    )
    
    // Mapear createdAt a fechaEmision para compatibilidad
    if (response.data.credencial) {
      response.data.credencial = {
        ...response.data.credencial,
        tipo: 'ministerial' as const,
        fechaEmision: response.data.credencial.createdAt || response.data.credencial.fechaEmision,
      }
    }
    if (response.data.credenciales) {
      response.data.credenciales = response.data.credenciales.map(credencial => ({
        ...credencial,
        tipo: 'ministerial' as const,
        fechaEmision: credencial.createdAt || credencial.fechaEmision,
      }))
    }
    
    return response.data
  },

  /**
   * Consultar credencial de capellanía por documento
   * Requiere autenticación de pastor
   */
  consultarCapellania: async (documento: string): Promise<CredencialResponse> => {
    const response = await apiClient.get<CredencialResponse>(
      `/credenciales-capellania/consultar/${documento}`
    )
    
    // Mapear createdAt a fechaEmision para compatibilidad
    if (response.data.credencial) {
      response.data.credencial = {
        ...response.data.credencial,
        tipo: 'capellania' as const,
        fechaEmision: response.data.credencial.createdAt || response.data.credencial.fechaEmision,
      }
    }
    if (response.data.credenciales) {
      response.data.credenciales = response.data.credenciales.map(credencial => ({
        ...credencial,
        tipo: 'capellania' as const,
        fechaEmision: credencial.createdAt || credencial.fechaEmision,
      }))
    }
    
    return response.data
  },

  /**
   * Obtener credenciales ministeriales del invitado autenticado
   * Basado en el DNI de sus inscripciones
   * Requiere autenticación de invitado
   */
  obtenerMisCredencialesMinisteriales: async (): Promise<CredencialResponse> => {
    try {
      console.log('🔍 Obteniendo credenciales ministeriales...')
      const response = await apiClient.get<CredencialResponse>(
        `/credenciales-ministeriales/mis-credenciales`
      )
      console.log('✅ Respuesta ministerial recibida:', {
        encontrada: response.data.encontrada,
        cantidad: response.data.credenciales?.length || 0,
      })
      
      // Mapear createdAt a fechaEmision para compatibilidad
      if (response.data.credenciales) {
        response.data.credenciales = response.data.credenciales.map(credencial => ({
          ...credencial,
          tipo: 'ministerial' as const,
          fechaEmision: credencial.createdAt || credencial.fechaEmision,
        }))
      }
      if (response.data.credencial) {
        response.data.credencial = {
          ...response.data.credencial,
          tipo: 'ministerial' as const,
          fechaEmision: response.data.credencial.createdAt || response.data.credencial.fechaEmision,
        }
      }
      
      return response.data
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ Error obteniendo credenciales ministeriales:', errorMessage)
      throw error
    }
  },

  /**
   * Obtener credenciales de capellanía del invitado autenticado
   * Basado en el DNI de sus inscripciones
   * Requiere autenticación de invitado
   */
  obtenerMisCredencialesCapellania: async (): Promise<CredencialResponse> => {
    try {
      console.log('🔍 Obteniendo credenciales de capellanía...')
      const response = await apiClient.get<CredencialResponse>(
        `/credenciales-capellania/mis-credenciales`
      )
      console.log('✅ Respuesta capellanía recibida:', {
        encontrada: response.data.encontrada,
        cantidad: response.data.credenciales?.length || 0,
      })
      
      // Mapear createdAt a fechaEmision para compatibilidad
      if (response.data.credenciales) {
        response.data.credenciales = response.data.credenciales.map(credencial => ({
          ...credencial,
          tipo: 'capellania' as const,
          fechaEmision: credencial.createdAt || credencial.fechaEmision,
        }))
      }
      if (response.data.credencial) {
        response.data.credencial = {
          ...response.data.credencial,
          tipo: 'capellania' as const,
          fechaEmision: response.data.credencial.createdAt || response.data.credencial.fechaEmision,
        }
      }
      
      return response.data
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ Error obteniendo credenciales de capellanía:', errorMessage)
      throw error
    }
  },

  /**
   * Obtener todas las credenciales del invitado autenticado (método anterior - mantener para compatibilidad)
   * Basado en el DNI de sus inscripciones
   * Requiere autenticación de invitado
   * @deprecated Usar obtenerMisCredencialesUnificado() en su lugar
   */
  obtenerMisCredenciales: async (): Promise<{
    ministerial?: Credencial[]
    capellania?: Credencial[]
  }> => {
    try {
      console.log('🔍 Obteniendo credenciales del invitado autenticado...')

      const [ministerial, capellania] = await Promise.allSettled([
        credencialesApi.obtenerMisCredencialesMinisteriales(),
        credencialesApi.obtenerMisCredencialesCapellania(),
      ])

      const result: {
        ministerial?: Credencial[]
        capellania?: Credencial[]
      } = {}

      // Manejar resultado de credenciales ministeriales
      if (ministerial.status === 'fulfilled') {
        console.log('✅ Respuesta ministerial:', {
          encontrada: ministerial.value.encontrada,
          cantidad: ministerial.value.credenciales?.length || 0,
          mensaje: ministerial.value.mensaje,
        })

        if (ministerial.value.encontrada && ministerial.value.credenciales) {
          result.ministerial = ministerial.value.credenciales
        } else if (ministerial.value.mensaje) {
          console.log('⚠️ Mensaje ministerial:', ministerial.value.mensaje)
        }
      } else {
        console.error('❌ Error obteniendo credenciales ministeriales:', ministerial.reason)
      }

      // Manejar resultado de credenciales de capellanía
      if (capellania.status === 'fulfilled') {
        console.log('✅ Respuesta capellanía:', {
          encontrada: capellania.value.encontrada,
          cantidad: capellania.value.credenciales?.length || 0,
          mensaje: capellania.value.mensaje,
        })

        if (capellania.value.encontrada && capellania.value.credenciales) {
          result.capellania = capellania.value.credenciales
        } else if (capellania.value.mensaje) {
          console.log('⚠️ Mensaje capellanía:', capellania.value.mensaje)
        }
      } else {
        console.error('❌ Error obteniendo credenciales de capellanía:', capellania.reason)
      }

      console.log('📊 Resultado final:', {
        tieneMinisterial: !!result.ministerial,
        tieneCapellania: !!result.capellania,
        totalMinisterial: result.ministerial?.length || 0,
        totalCapellania: result.capellania?.length || 0,
      })

      return result
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ Error obteniendo mis credenciales:', errorMessage)
      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack)
      }
      return {}
    }
  },

  /**
   * Consultar ambas credenciales (ministerial y capellanía) por documento
   */
  consultarAmbas: async (documento: string): Promise<{
    ministerial?: Credencial
    capellania?: Credencial
  }> => {
    try {
      const [ministerial, capellania] = await Promise.allSettled([
        credencialesApi.consultarMinisterial(documento),
        credencialesApi.consultarCapellania(documento),
      ])

      const result: {
        ministerial?: Credencial
        capellania?: Credencial
      } = {}

      if (
        ministerial.status === 'fulfilled' &&
        ministerial.value.encontrada &&
        ministerial.value.credencial
      ) {
        result.ministerial = ministerial.value.credencial
      }

      if (
        capellania.status === 'fulfilled' &&
        capellania.value.encontrada &&
        capellania.value.credencial
      ) {
        result.capellania = capellania.value.credencial
      }

      return result
    } catch (error) {
      console.error('Error consultando credenciales:', error)
      return {}
    }
  },
}

