import { apiClient } from "./client"

// Tipos de pastor
export type TipoPastor = "DIRECTIVA" | "SUPERVISOR" | "PRESIDENTE" | "PASTOR"

export interface Pastor {
  id: string
  nombre: string
  apellido: string
  email?: string
  telefono?: string
  
  // Clasificación
  tipo: TipoPastor
  cargo?: string
  ministerio?: string
  
  // Ubicación
  sede?: string
  region?: string
  pais?: string
  
  // Contenido
  fotoUrl?: string
  biografia?: string
  trayectoria?: string
  
  // Control
  orden: number
  activo: boolean
  mostrarEnLanding: boolean
  
  createdAt: string
  updatedAt: string
}

export type CreatePastorData = Omit<Pastor, "id" | "createdAt" | "updatedAt">
export type UpdatePastorData = Partial<CreatePastorData>

export const pastoresApi = {
  // ==========================================
  // ENDPOINTS PÚBLICOS (para landing)
  // ==========================================
  
  /**
   * Obtiene pastores para mostrar en la landing page
   */
  getForLanding: async (): Promise<Pastor[]> => {
    const response = await apiClient.get<Pastor[]>("/pastores/landing")
    return response.data
  },

  /**
   * Obtiene la directiva pastoral
   */
  getDirectiva: async (): Promise<Pastor[]> => {
    const response = await apiClient.get<Pastor[]>("/pastores/directiva")
    return response.data
  },

  /**
   * Obtiene supervisores (opcionalmente por región)
   */
  getSupervisores: async (region?: string): Promise<Pastor[]> => {
    const url = region 
      ? `/pastores/supervisores?region=${encodeURIComponent(region)}`
      : "/pastores/supervisores"
    const response = await apiClient.get<Pastor[]>(url)
    return response.data
  },

  /**
   * Obtiene pastores por tipo
   */
  getByTipo: async (tipo: TipoPastor): Promise<Pastor[]> => {
    const response = await apiClient.get<Pastor[]>(`/pastores/tipo/${tipo}`)
    return response.data
  },

  // ==========================================
  // ENDPOINTS GENERALES
  // ==========================================

  getAll: async (): Promise<Pastor[]> => {
    const response = await apiClient.get<Pastor[]>("/pastores")
    return response.data
  },

  getById: async (id: string): Promise<Pastor> => {
    const response = await apiClient.get<Pastor>(`/pastores/${id}`)
    return response.data
  },

  getActive: async (): Promise<Pastor[]> => {
    const response = await apiClient.get<Pastor[]>("/pastores/active")
    return response.data
  },

  // ==========================================
  // ENDPOINTS PROTEGIDOS (CRUD)
  // ==========================================

  create: async (data: CreatePastorData): Promise<Pastor> => {
    const response = await apiClient.post<Pastor>("/pastores", data)
    return response.data
  },

  update: async (id: string, data: UpdatePastorData): Promise<Pastor> => {
    const response = await apiClient.patch<Pastor>(`/pastores/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/pastores/${id}`)
  },
}
