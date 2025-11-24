import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"

console.log("[v0] API Client initialized with baseURL:", API_URL)

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add auth token to requests
apiClient.interceptors.request.use((config: any) => {
  const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
  console.log("[v0] Making request to:", config.url, "with token:", token ? "Present" : "Missing")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
apiClient.interceptors.response.use(
  (response: any) => {
    console.log("[v0] API Response success:", response.config.url, "Status:", response.status)
    return response
  },
  (error: any) => {
    console.error("[v0] API Error:", error.message, "URL:", error.config?.url, "Status:", error.response?.status)
    if (error.response?.status === 401) {
      console.log("[v0] Unauthorized - redirecting to login")
      localStorage.removeItem("auth_token")
      sessionStorage.removeItem("auth_token")
      window.location.href = "/admin/login"
    }
    return Promise.reject(error)
  },
)
