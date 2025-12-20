/**
 * API para autenticación de invitados - Mobile
 */

import { apiClient } from './client'

export interface Invitado {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  sede?: string
  fotoUrl?: string
  tipo: 'INVITADO'
}

export interface InvitadoAuthResponse {
  access_token: string
  refresh_token: string
  invitado: Invitado
}

export interface InvitadoRegisterDto {
  email: string
  password: string
}

export interface InvitadoCompleteRegisterDto {
  nombre: string
  apellido: string
  email: string
  password: string
  telefono?: string
  sede?: string
}

export const invitadoAuthApi = {
  register: async (data: InvitadoRegisterDto): Promise<InvitadoAuthResponse> => {
    const response = await apiClient.post<InvitadoAuthResponse>('/auth/invitado/register', data)
    return response.data
  },

  registerComplete: async (
    data: InvitadoCompleteRegisterDto
  ): Promise<InvitadoAuthResponse> => {
    const response = await apiClient.post<InvitadoAuthResponse>(
      '/auth/invitado/register-complete',
      data
    )
    return response.data
  },

  login: async (
    email: string,
    password: string,
    deviceToken?: string,
    platform?: 'ios' | 'android',
    deviceId?: string
  ): Promise<InvitadoAuthResponse> => {
    const response = await apiClient.post<InvitadoAuthResponse>('/auth/invitado/login', {
      email,
      password,
      deviceToken,
      platform,
      deviceId,
    })
    return response.data
  },

  me: async (): Promise<Invitado> => {
    const response = await apiClient.get<Invitado>('/auth/invitado/me')
    return response.data
  },

  loginWithGoogle: async (
    idToken: string,
    deviceToken?: string,
    platform?: 'ios' | 'android',
    deviceId?: string
  ): Promise<InvitadoAuthResponse> => {
    const response = await apiClient.post<InvitadoAuthResponse>('/auth/invitado/google/mobile', {
      idToken,
      deviceToken,
      platform,
      deviceId,
    })
    return response.data
  },

  logout: async (refreshToken?: string): Promise<void> => {
    if (refreshToken) {
      await apiClient.post('/auth/invitado/logout', { refreshToken })
    }
  },
}

