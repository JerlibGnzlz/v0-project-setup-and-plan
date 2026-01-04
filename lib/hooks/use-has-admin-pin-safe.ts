'use client'

import { useHasAdminPin } from './use-usuarios'
import { useAuth } from './use-auth'

/**
 * Hook seguro para verificar si el admin tiene PIN configurado
 * Solo se ejecuta cuando es seguro hacerlo (usuario autenticado, hidratado y es ADMIN)
 * Esto previene errores de "useQueryClient is not defined" en rutas públicas
 */
export function useHasAdminPinSafe() {
  const { isAuthenticated, isHydrated, user } = useAuth()
  
  // Solo ejecutar el hook si todas las condiciones se cumplen
  const shouldExecute = isAuthenticated && isHydrated && user?.rol === 'ADMIN'
  
  const { data: hasPinData, isLoading, error } = useHasAdminPin()
  
  // Si no debería ejecutarse, retornar valores por defecto
  if (!shouldExecute) {
    return {
      hasPin: false,
      isLoading: false,
      error: null,
    }
  }
  
  return {
    hasPin: hasPinData?.hasPin ?? false,
    isLoading,
    error,
  }
}

