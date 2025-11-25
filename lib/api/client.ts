import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add auth token to requests
apiClient.interceptors.request.use((config: any) => {
  const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
apiClient.interceptors.response.use(
  (response: any) => {
    return response
  },
  (error: any) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token")
      sessionStorage.removeItem("auth_token")
      window.location.href = "/admin/login"
    }
    return Promise.reject(error)
  },
)

export default apiClient
