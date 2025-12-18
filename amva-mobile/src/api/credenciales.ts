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
  fechaEmision: string
  fechaVencimiento: string
  estado: 'vigente' | 'por_vencer' | 'vencida'
  diasRestantes?: number
  activa: boolean
  observaciones?: string
}

export interface CredencialResponse {
  encontrada: boolean
  credencial?: Credencial
  credenciales?: Credencial[]
  mensaje?: string
}

export const credencialesApi = {
  /**
   * Consultar credencial ministerial por documento
   * Requiere autenticación de pastor
   */
  consultarMinisterial: async (documento: string): Promise<CredencialResponse> => {
    const response = await apiClient.get<CredencialResponse>(
      `/credenciales-ministeriales/consultar/${documento}`
    )
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
    return response.data
  },

  /**
   * Obtener credenciales ministeriales del invitado autenticado
   * Basado en el DNI de sus inscripciones
   * Requiere autenticación de invitado
   */
  obtenerMisCredencialesMinisteriales: async (): Promise<CredencialResponse> => {
    const response = await apiClient.get<CredencialResponse>(
      `/credenciales-ministeriales/mis-credenciales`
    )
    return response.data
  },

  /**
   * Obtener credenciales de capellanía del invitado autenticado
   * Basado en el DNI de sus inscripciones
   * Requiere autenticación de invitado
   */
  obtenerMisCredencialesCapellania: async (): Promise<CredencialResponse> => {
    const response = await apiClient.get<CredencialResponse>(
      `/credenciales-capellania/mis-credenciales`
    )
    return response.data
  },

  /**
   * Obtener todas las credenciales del invitado autenticado
   * Basado en el DNI de sus inscripciones
   * Requiere autenticación de invitado
   */
  obtenerMisCredenciales: async (): Promise<{
    ministerial?: Credencial[]
    capellania?: Credencial[]
  }> => {
    try {
      const [ministerial, capellania] = await Promise.allSettled([
        credencialesApi.obtenerMisCredencialesMinisteriales(),
        credencialesApi.obtenerMisCredencialesCapellania(),
      ])

      const result: {
        ministerial?: Credencial[]
        capellania?: Credencial[]
      } = {}

      if (
        ministerial.status === 'fulfilled' &&
        ministerial.value.encontrada &&
        ministerial.value.credenciales
      ) {
        result.ministerial = ministerial.value.credenciales
      }

      if (
        capellania.status === 'fulfilled' &&
        capellania.value.encontrada &&
        capellania.value.credenciales
      ) {
        result.capellania = capellania.value.credenciales
      }

      return result
    } catch (error) {
      console.error('Error obteniendo mis credenciales:', error)
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

