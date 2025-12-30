/**
 * Utilidades para manejo centralizado de errores
 */

interface AxiosErrorLike {
  code?: string
  message?: string
  response?: {
    status?: number
    data?: {
      message?: string | string[]
      error?: {
        message?: string
      }
    }
  }
}

/**
 * Maneja errores de autenticación y retorna un mensaje amigable
 */
export function handleAuthError(error: unknown): string {
  if (!error) {
    return 'No se pudo iniciar sesión.'
  }

  // Si es un string, retornarlo directamente
  if (typeof error === 'string') {
    return error
  }

  // Si es un Error, usar su mensaje
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase()

    // Detectar cancelación del usuario
    if (
      errorMessage.includes('cancel') ||
      errorMessage.includes('cancelled') ||
      errorMessage.includes('user cancelled')
    ) {
      return 'Inicio de sesión cancelado.'
    }

    // Detectar errores de red
    if (errorMessage.includes('network') || errorMessage.includes('econnrefused')) {
      return 'No se pudo conectar al servidor.\n\nVerifica que:\n• El backend esté accesible\n• La URL del API sea correcta\n• Tengas conexión a internet'
    }

    return error.message
  }

  // Si es un objeto con estructura de axios error
  if (typeof error === 'object' && error !== null) {
    const axiosError = error as AxiosErrorLike

    // Error de conexión
    if (axiosError.code === 'ECONNREFUSED' || axiosError.message?.includes('Network Error')) {
      return 'No se pudo conectar al servidor.\n\nVerifica que:\n• El backend esté accesible\n• La URL del API sea correcta\n• Tengas conexión a internet'
    }

    // Error 401 - Credenciales inválidas
    if (axiosError.response?.status === 401) {
      const responseData = axiosError.response.data
      let backendMessage = 'Credenciales incorrectas'

      if (responseData?.error?.message) {
        backendMessage = responseData.error.message
      } else if (responseData?.message) {
        backendMessage = Array.isArray(responseData.message)
          ? responseData.message.join('\n')
          : responseData.message
      }

      return `${backendMessage}\n\n` +
        'Verifica que:\n' +
        '• Tu email sea correcto\n' +
        '• Tu contraseña sea correcta\n' +
        '• Tu cuenta esté registrada\n\n' +
        'Si no tienes cuenta, puedes crear una nueva con el botón "Crear nueva cuenta"'
    }

    // Error 404 - Endpoint no encontrado
    if (axiosError.response?.status === 404) {
      return 'Endpoint no encontrado.\n\nEl endpoint de autenticación no está disponible. Contacta al administrador.'
    }

    // Error 500 - Error del servidor
    if (axiosError.response?.status === 500) {
      return 'Error del servidor.\n\nIntenta nuevamente más tarde.'
    }

    // Error 400 - Bad Request
    if (axiosError.response?.status === 400) {
      const responseData = axiosError.response.data
      if (responseData?.error?.message) {
        return responseData.error.message
      }
      if (responseData?.message) {
        return Array.isArray(responseData.message)
          ? responseData.message.join('\n')
          : responseData.message
      }
      return 'Datos inválidos. Verifica que todos los campos estén completos y sean válidos.'
    }

    // Usar mensaje del error si existe
    if (axiosError.message) {
      return axiosError.message
    }

    // Intentar extraer mensaje de response.data
    if (axiosError.response?.data) {
      const responseData = axiosError.response.data
      if (responseData.error?.message) {
        return responseData.error.message
      }
      if (responseData.message) {
        return Array.isArray(responseData.message)
          ? responseData.message.join('\n')
          : responseData.message
      }
    }
  }

  return 'No se pudo iniciar sesión. Intenta nuevamente.'
}

/**
 * Maneja errores de red y retorna un mensaje amigable
 */
export function handleNetworkError(error: unknown): string {
  if (!error) {
    return 'Error de conexión.'
  }

  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase()
    
    if (errorMessage.includes('network') || errorMessage.includes('econnrefused')) {
      return 'No se pudo conectar al servidor.\n\nVerifica que:\n• El backend esté corriendo\n• La URL del API sea correcta\n• Estés en la misma red WiFi (si usas dispositivo físico)'
    }

    if (errorMessage.includes('timeout')) {
      return 'La solicitud tardó demasiado.\n\nVerifica tu conexión a internet.'
    }

    return error.message
  }

  if (typeof error === 'object' && error !== null) {
    const axiosError = error as AxiosErrorLike

    if (axiosError.code === 'ECONNREFUSED' || axiosError.message?.includes('Network Error')) {
      return 'No se pudo conectar al servidor.\n\nVerifica que:\n• El backend esté corriendo\n• La URL del API sea correcta\n• Estés en la misma red WiFi (si usas dispositivo físico)'
    }

    if (axiosError.response?.status === 0) {
      return 'No se pudo conectar al servidor. Verifica tu conexión a internet.'
    }
  }

  return 'Error de conexión. Intenta nuevamente.'
}

/**
 * Detecta si un error es una cancelación del usuario
 */
export function isUserCancellation(error: unknown): boolean {
  if (error instanceof Error) {
    // Verificar por nombre del error (para GoogleSignInCancelled)
    if (error.name === 'GoogleSignInCancelled' || error.message === 'SIGN_IN_CANCELLED') {
      return true
    }
    
    const errorMessage = error.message.toLowerCase()
    return (
      errorMessage.includes('cancel') ||
      errorMessage.includes('cancelled') ||
      errorMessage.includes('user cancelled') ||
      errorMessage.includes('sign_in_cancelled')
    )
  }
  return false
}

