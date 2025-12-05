import { apiClient } from "./client"

export interface UnifiedLoginRequest {
  email: string
  password: string
}

export interface UnifiedLoginResponse {
  access_token: string
  refresh_token: string
  user: {
    id: string
    nombre: string
    apellido: string
    email: string
    telefono?: string
    sede?: string
    tipo: 'ADMIN' | 'PASTOR' | 'INVITADO'
    role: string
  }
}

export const unifiedAuthApi = {
  login: async (data: UnifiedLoginRequest): Promise<UnifiedLoginResponse> => {
    try {
      const response = await apiClient.post<UnifiedLoginResponse>("/auth/login/unified", data)
      return response.data
    } catch (error: any) {
      // Extraer mensaje de error del backend
      // El backend usa el formato: { success: false, error: { message: "...", statusCode: 401, error: "Unauthorized" } }
      let errorMessage = 'Error al iniciar sesión. Por favor, intenta de nuevo.'
      
      if (error.response?.data) {
        const responseData = error.response.data
        
        // Formato del GlobalExceptionFilter: { success: false, error: { message: "...", ... } }
        if (responseData.error?.message) {
          errorMessage = responseData.error.message
        }
        // Formato alternativo: { message: "..." }
        else if (responseData.message) {
          errorMessage = typeof responseData.message === 'string' 
            ? responseData.message 
            : Array.isArray(responseData.message) 
              ? responseData.message.join(', ')
              : errorMessage
        }
        // Formato string directo
        else if (typeof responseData === 'string') {
          errorMessage = responseData
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      // Crear un nuevo error con el mensaje extraído
      // Preservar toda la información del error original
      const enhancedError: any = new Error(errorMessage)
      enhancedError.response = error.response
      enhancedError.status = error.response?.status || error.status
      enhancedError.isAxiosError = error.isAxiosError
      enhancedError.config = error.config
      
      throw enhancedError
    }
  },
}

