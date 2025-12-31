import { apiClient } from './client'

export interface ConfiguracionLanding {
  id: string
  pastoresFormados: number
  pastoresFormadosSuffix: string
  anosMinisterio: number
  anosMinisterioSuffix: string
  convenciones: number
  convencionesSuffix: string
  paisesOverride: number | null
  titulo: string
  subtitulo: string
  misionTitulo: string
  misionContenido: string
  visionTitulo: string
  visionContenido: string
  createdAt: string
  updatedAt: string
}

export interface UpdateConfiguracionLandingDto {
  pastoresFormados?: number
  pastoresFormadosSuffix?: string
  anosMinisterio?: number
  anosMinisterioSuffix?: string
  convenciones?: number
  convencionesSuffix?: string
  paisesOverride?: number | null
  titulo?: string
  subtitulo?: string
  misionTitulo?: string
  misionContenido?: string
  visionTitulo?: string
  visionContenido?: string
}

export const configuracionLandingApi = {
  /**
   * Obtiene la configuración de landing (público)
   */
  getConfiguracion: async (): Promise<ConfiguracionLanding> => {
    const response = await apiClient.get<ConfiguracionLanding>(
      '/configuracion-landing'
    )
    return response.data
  },

  /**
   * Actualiza la configuración de landing (admin)
   */
  updateConfiguracion: (data: UpdateConfiguracionLandingDto) =>
    apiClient.patch<ConfiguracionLanding>('/configuracion-landing', data),
}

