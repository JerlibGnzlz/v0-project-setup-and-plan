"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { invitadoAuthApi, type Invitado } from "@/lib/api/invitado-auth"
import { useEffect, useCallback } from "react"

/**
 * Hook de React Query para manejar la autenticación del invitado
 * Reemplaza el uso de useEffect y eventos personalizados con React Query
 */
export function useInvitadoAuth() {
  const queryClient = useQueryClient()

  // Obtener token del localStorage
  const getToken = useCallback(() => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("invitado_token") || sessionStorage.getItem("invitado_token")
  }, [])

  // Query para obtener el perfil del usuario invitado
  const {
    data: user,
    isLoading: isLoadingUser,
    isFetching: isFetchingUser,
    error: userError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["invitado", "profile"],
    queryFn: async () => {
      const token = getToken()
      if (!token) {
        throw new Error("No hay token disponible")
      }
      console.log("[useInvitadoAuth] Obteniendo perfil del invitado...")
      const profile = await invitadoAuthApi.getProfile()
      return profile
    },
    enabled: !!getToken(), // Solo ejecutar si hay token
    retry: (failureCount, error: any) => {
      // No reintentar en errores 401 (token inválido) o 429 (rate limit)
      if (error?.response?.status === 401 || error?.response?.status === 429) {
        return false
      }
      // Reintentar hasta 1 vez para otros errores (reducido de 2)
      return failureCount < 1
    },
    staleTime: 30000, // Cache por 30 segundos para evitar refetches innecesarios
    gcTime: 300000, // Mantener en cache por 5 minutos
    refetchOnWindowFocus: false, // Deshabilitado para evitar refetches automáticos
    refetchOnMount: false, // Deshabilitado para evitar refetches automáticos
    placeholderData: (previousData) => previousData, // Mantener datos anteriores mientras se refetch
  })

  // Escuchar cambios en localStorage para detectar cuando se guarda un nuevo token
  useEffect(() => {
    let lastToken: string | null = null
    let invalidateTimeout: NodeJS.Timeout | null = null

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "invitado_token" || e.key === "invitado_refresh_token") {
        const newToken = e.newValue
        // Solo invalidar si el token realmente cambió
        if (newToken && newToken !== lastToken) {
          console.log("[useInvitadoAuth] Token detectado en storage (otra pestaña), invalidando query...")
          lastToken = newToken
          // Debounce: esperar 500ms antes de invalidar para evitar múltiples invalidaciones
          if (invalidateTimeout) clearTimeout(invalidateTimeout)
          invalidateTimeout = setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["invitado", "profile"] })
          }, 500)
        }
      }
    }

    // Escuchar cambios de otras pestañas
    window.addEventListener("storage", handleStorageChange)

    // Verificar inicialmente el token
    lastToken = getToken()

    // Verificar periódicamente si hay un token nuevo (para la misma pestaña)
    // Aumentado a 5 segundos para reducir la frecuencia de verificaciones
    const interval = setInterval(() => {
      const currentToken = getToken()
      const queryState = queryClient.getQueryState(["invitado", "profile"])
      
      // Solo invalidar si el token cambió Y la query está en un estado que requiere refetch
      if (currentToken && currentToken !== lastToken) {
        lastToken = currentToken
        // Solo invalidar si la query no está cargando y no tiene datos válidos
        if (queryState && queryState.status !== "loading" && !queryState.data) {
          console.log("[useInvitadoAuth] Token nuevo detectado, invalidando query...")
          // Debounce: esperar antes de invalidar
          if (invalidateTimeout) clearTimeout(invalidateTimeout)
          invalidateTimeout = setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["invitado", "profile"] })
          }, 500)
        }
      }
    }, 5000) // Verificar cada 5 segundos (aumentado de 1 segundo)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
      if (invalidateTimeout) clearTimeout(invalidateTimeout)
    }
  }, [queryClient, getToken])

  // Función para invalidar y refetch manualmente (útil después de login/registro)
  const invalidateAndRefetch = useCallback(async () => {
    console.log("[useInvitadoAuth] Invalidando y refetching perfil...")
    queryClient.invalidateQueries({ queryKey: ["invitado", "profile"] })
    return await refetchUser()
  }, [queryClient, refetchUser])

  const token = getToken()
  const isAuthenticated = !!token && !!user && !userError
  const isHydrated = true // Siempre hidratado con React Query

  return {
    user: user || null,
    token,
    isAuthenticated,
    isHydrated,
    isLoadingUser,
    isFetchingUser,
    userError,
    refetchUser: invalidateAndRefetch,
  }
}
