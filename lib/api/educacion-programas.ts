import { apiClient } from './client'

export interface ProgramaEducacion {
  id: string
  clave: string
  titulo: string
  duracion: string
  modalidad: string
  inscripcion: string
  cuotaMensual: string
  requisitos: string
  orden: number
  createdAt: string
  updatedAt: string
}

export interface UpdateProgramaEducacionItemDto {
  clave: string
  titulo?: string
  duracion?: string
  modalidad?: string
  inscripcion?: string
  cuotaMensual?: string
  requisitos?: string
  orden?: number
}

export interface UpdateProgramasEducacionDto {
  programas: UpdateProgramaEducacionItemDto[]
  contactEmail?: string
  contactTelefono?: string
}

export interface EducacionProgramasResponse {
  programas: ProgramaEducacion[]
  contactEmail: string
  contactTelefono: string
}

export const educacionProgramasApi = {
  /**
   * Obtiene los programas AMVA Digital y contacto (público, para la landing).
   */
  getAll: (): Promise<EducacionProgramasResponse> =>
    apiClient
      .get<EducacionProgramasResponse>('/educacion-programas')
      .then((r) => r.data),

  /**
   * Actualiza programas y/o contacto desde el panel de control (admin).
   */
  update: (data: UpdateProgramasEducacionDto) =>
    apiClient.patch<EducacionProgramasResponse>('/educacion-programas', data),
}
