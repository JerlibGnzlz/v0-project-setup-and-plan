/**
 * Hook para validación de formularios de autenticación
 */

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  nombre: string
  apellido: string
  email: string
  password: string
  confirmPassword: string
  sede?: string
  telefono?: string
}

export function useAuthValidation() {
  const validateLogin = (data: LoginData): Record<string, string> => {
    const errors: Record<string, string> = {}
    
    if (!data.email.trim()) {
      errors.email = 'El correo electrónico es requerido'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        errors.email = 'Correo electrónico inválido'
      }
    }
    
    if (!data.password || data.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres'
    }
    
    return errors
  }

  const validateRegister = (data: RegisterData): Record<string, string> => {
    const errors: Record<string, string> = {}
    
    if (!data.nombre || data.nombre.trim().length < 2) {
      errors.nombre = 'El nombre debe tener al menos 2 caracteres'
    }
    
    if (!data.apellido || data.apellido.trim().length < 2) {
      errors.apellido = 'El apellido debe tener al menos 2 caracteres'
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!data.email || !emailRegex.test(data.email)) {
      errors.email = 'Correo electrónico inválido'
    }
    
    if (!data.password || data.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
      errors.password = 'Debe contener mayúscula, minúscula y número'
    }
    
    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden'
    }
    
    return errors
  }

  return {
    validateLogin,
    validateRegister,
  }
}

