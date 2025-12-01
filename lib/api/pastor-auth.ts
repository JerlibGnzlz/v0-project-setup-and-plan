import { apiClient } from "./client"

export interface PastorLoginRequest {
  email: string
  password: string
}

export interface PastorRegisterCompleteRequest {
  nombre: string
  apellido: string
  email: string
  password: string
  sede?: string
  telefono?: string
}

export interface PastorLoginResponse {
  access_token: string
  refresh_token: string
  pastor: {
    id: string
    nombre: string
    apellido: string
    email: string
    tipo: string
    cargo?: string
    ministerio?: string
    sede?: string
    region?: string
    pais?: string
    fotoUrl?: string
  }
}

export interface PastorRegisterCompleteResponse {
  message: string
  pastor: {
    id: string
    nombre: string
    apellido: string
    email: string
  }
}

export const pastorAuthApi = {
  login: async (data: PastorLoginRequest): Promise<PastorLoginResponse> => {
    const response = await apiClient.post<PastorLoginResponse>("/auth/pastor/login", data)
    return response.data
  },

  registerComplete: async (data: PastorRegisterCompleteRequest): Promise<PastorRegisterCompleteResponse> => {
    try {
      console.log('[pastorAuthApi] Enviando datos a /auth/pastor/register-complete:', {
        email: data.email,
        nombre: data.nombre,
        tieneSede: !!data.sede,
        tieneTelefono: !!data.telefono
      })

      const response = await apiClient.post<PastorRegisterCompleteResponse>("/auth/pastor/register-complete", data)
      console.log('[pastorAuthApi] Registro exitoso:', response.data)
      return response.data
    } catch (error: any) {
      console.error('[pastorAuthApi] Error en registerComplete:', error)
      console.error('[pastorAuthApi] Error tipo:', typeof error)
      console.error('[pastorAuthApi] Error response:', error.response)
      console.error('[pastorAuthApi] Error response status:', error.response?.status)
      console.error('[pastorAuthApi] Error response data:', error.response?.data)
      console.error('[pastorAuthApi] Error message:', error.message)
      console.error('[pastorAuthApi] Error code:', error.code)

      // Si no hay respuesta del servidor (error de red)
      if (!error.response) {
        console.error('[pastorAuthApi] Error de red - No hay respuesta del servidor')
        throw new Error('No se pudo conectar con el servidor. Por favor, verifica que el backend esté corriendo.')
      }

      // Si hay un error, extraer el mensaje del formato ErrorResponse del backend
      const responseData = error.response.data
      console.error('[pastorAuthApi] Response data completo:', JSON.stringify(responseData, null, 2))

      let errorMessage = 'Error al registrar pastor'

      // El backend devuelve errores en formato: { success: false, error: { message, statusCode, error, details } }
      if (responseData?.error?.message) {
        // Formato ErrorResponse estándar
        errorMessage = responseData.error.message
        console.error('[pastorAuthApi] Mensaje extraído de error.message:', errorMessage)
      } else if (responseData?.error?.details?.validationErrors && Array.isArray(responseData.error.details.validationErrors)) {
        // Errores de validación
        const validationErrors = responseData.error.details.validationErrors.map((err: any) =>
          typeof err === 'string' ? err : `${err.field || 'campo'}: ${err.message || err}`
        ).join(', ')
        errorMessage = `Error de validación: ${validationErrors}`
        console.error('[pastorAuthApi] Errores de validación:', validationErrors)
      } else if (responseData?.message) {
        // Mensaje directo (puede ser string o array)
        if (Array.isArray(responseData.message)) {
          errorMessage = responseData.message.join(', ')
        } else {
          errorMessage = typeof responseData.message === 'string' ? responseData.message : JSON.stringify(responseData.message)
        }
        console.error('[pastorAuthApi] Mensaje directo:', errorMessage)
      } else if (responseData?.error) {
        // Error directo (puede ser string u objeto)
        if (typeof responseData.error === 'string') {
          errorMessage = responseData.error
        } else if (responseData.error?.message) {
          errorMessage = responseData.error.message
        } else {
          errorMessage = JSON.stringify(responseData.error)
        }
        console.error('[pastorAuthApi] Error directo:', errorMessage)
      } else if (typeof responseData === 'object' && Object.keys(responseData).length === 0) {
        // Si responseData está vacío, puede ser un problema de validación silencioso
        errorMessage = 'Error de validación. Por favor, verifica que todos los campos estén completos y sean válidos.'
        console.error('[pastorAuthApi] Response data vacío - posible problema de validación')
      } else if (error.response.status === 400) {
        errorMessage = 'Error de validación. Por favor, verifica que todos los campos estén completos y sean válidos.'
      } else if (error.response.status === 409) {
        errorMessage = 'Ya existe una cuenta registrada con este email. Por favor, inicia sesión.'
      } else if (error.response.status === 500) {
        errorMessage = 'Error del servidor. Por favor, intenta más tarde o contacta al administrador.'
      }

      console.error('[pastorAuthApi] Mensaje de error final:', errorMessage)
      throw new Error(errorMessage)
    }
  },

  getProfile: async () => {
    const response = await apiClient.get("/auth/pastor/me")
    return response.data
  },
}




