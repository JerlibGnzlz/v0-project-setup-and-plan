/**
 * API para credenciales - Mobile
 */

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
      }>('/credenciales/mis-credenciales')
      
      console.log('✅ Respuesta unificada recibida:', {
        tieneCredenciales: response.data.tieneCredenciales,
        cantidad: response.data.credenciales?.length || 0,
        resumen: response.data.resumen,
      })
      
      return response.data
    } catch (error: unknown) {
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
      }>('/credenciales/mis-credenciales')
      
      console.log('✅ Respuesta unificada recibida:', {
        tieneCredenciales: response.data.tieneCredenciales,
        cantidad: response.data.credenciales?.length || 0,
        resumen: response.data.resumen,
      })
      
      return response.data
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ Error obteniendo credenciales unificadas:', errorMessage)
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

