import { apiClient } from './client'

export type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER'

export interface Usuario {
  id: string
  email: string
  nombre: string
  rol: UserRole
  avatar?: string | null
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateUsuarioRequest {
  email: string
  password: string
  nombre: string
  rol: UserRole
}

export interface UpdateUsuarioRequest {
  email?: string
  nombre?: string
  rol?: UserRole
  avatar?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface AdminResetPasswordRequest {
  newPassword: string
}

export const usuariosApi = {
  getAll: async (): Promise<Usuario[]> => {
    const response = await apiClient.get<Usuario[]>('/usuarios')
    return response.data
  },

  getById: async (id: string): Promise<Usuario> => {
    const response = await apiClient.get<Usuario>(`/usuarios/${id}`)
    return response.data
  },

  create: async (data: CreateUsuarioRequest): Promise<Usuario> => {
    const response = await apiClient.post<Usuario>('/usuarios', data)
    return response.data
  },

  update: async (id: string, data: UpdateUsuarioRequest): Promise<Usuario> => {
    const response = await apiClient.patch<Usuario>(`/usuarios/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/usuarios/${id}`)
  },

  adminResetPassword: async (id: string, data: AdminResetPasswordRequest): Promise<void> => {
    await apiClient.post(`/usuarios/${id}/reset-password`, data)
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post('/usuarios/me/change-password', data)
  },

  toggleActivo: async (id: string): Promise<Usuario> => {
    const response = await apiClient.patch<Usuario>(`/usuarios/${id}/toggle-activo`)
    return response.data
  },
}

