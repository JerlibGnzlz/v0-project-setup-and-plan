import { apiClient } from "./client"

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: {
    id: string
    email: string
    nombre: string
    rol: string
  }
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/auth/login", data)
    return response.data
  },

  register: async (data: {
    email: string
    password: string
    nombre: string
  }): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/auth/register", data)
    return response.data
  },

  getProfile: async () => {
    const response = await apiClient.get("/auth/profile")
    return response.data
  },
}
