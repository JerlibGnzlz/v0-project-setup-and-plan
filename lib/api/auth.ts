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
    const response = await apiClient.get("/auth/me")
    return response.data
  },

  requestPasswordReset: async (email: string) => {
    const response = await apiClient.post("/auth/forgot-password", { email })
    return response.data
  },

  resetPassword: async (token: string, password: string) => {
    const response = await apiClient.post("/auth/reset-password", { token, password })
    return response.data
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await apiClient.patch("/auth/change-password", { oldPassword, newPassword })
    return response.data
  },
}
