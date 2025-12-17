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

