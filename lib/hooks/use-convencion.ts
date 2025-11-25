"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { convencionesApi, type Convencion } from "@/lib/api/convenciones"
import { toast } from "sonner"
import { useEffect } from "react"

export function useConvenciones() {
  return useQuery({
    queryKey: ["convenciones"],
    queryFn: convencionesApi.getAll,
  })
}

export function useConvencionActiva() {
  const queryClient = useQueryClient()
  
  // Escuchar cambios de otras pestañas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'convencion-updated') {
        // Refetch cuando otra pestaña actualiza la convención
        queryClient.invalidateQueries({ queryKey: ["convencion", "active"] })
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [queryClient])
  
  return useQuery({
    queryKey: ["convencion", "active"],
    queryFn: convencionesApi.getActive,
    refetchOnWindowFocus: true, // Actualizar cuando la ventana obtiene foco
    staleTime: 0, // Siempre considerar datos como obsoletos
  })
}

export function useConvencion(id: string) {
  return useQuery({
    queryKey: ["convencion", id],
    queryFn: () => convencionesApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateConvencion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: convencionesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["convenciones"] })
      toast.success("Convención creada exitosamente")
    },
    onError: () => {
      toast.error("Error al crear la convención")
    },
  })
}

export function useUpdateConvencion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Convencion> }) => convencionesApi.update(id, data),
    onSuccess: () => {
      // Invalidar todas las queries relacionadas con convenciones
      queryClient.invalidateQueries({ queryKey: ["convenciones"] })
      queryClient.invalidateQueries({ queryKey: ["convencion"] })
      
      // Notificar a otras pestañas que la convención fue actualizada
      localStorage.setItem('convencion-updated', Date.now().toString())
    },
    onError: () => {
      toast.error("Error al actualizar la convención")
    },
  })
}

export function useDeleteConvencion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: convencionesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["convenciones"] })
      toast.success("Convención eliminada exitosamente")
    },
    onError: () => {
      toast.error("Error al eliminar la convención")
    },
  })
}
