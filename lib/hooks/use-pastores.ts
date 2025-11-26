"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { pastoresApi, type Pastor } from "@/lib/api/pastores"
import { toast } from "sonner"
import { useSmartSync, useSmartPolling } from "./use-smart-sync"

export function usePastores() {
  // Sincronización inteligente
  useSmartSync()
  
  // Polling que se pausa cuando la pestaña no está visible
  const pollingInterval = useSmartPolling(["pastores"], 60000) // 60 segundos

  return useQuery({
    queryKey: ["pastores"],
    queryFn: pastoresApi.getAll,
    refetchOnWindowFocus: true,
    refetchInterval: pollingInterval,
    placeholderData: (previousData) => previousData,
  })
}

export function usePastoresActivos() {
  return useQuery({
    queryKey: ["pastores", "active"],
    queryFn: pastoresApi.getActive,
  })
}

export function usePastoresLanding() {
  // Sincronización inteligente para la landing
  useSmartSync()
  
  const pollingInterval = useSmartPolling(["pastores", "landing"], 30000) // 30 segundos

  return useQuery({
    queryKey: ["pastores", "landing"],
    queryFn: pastoresApi.getForLanding,
    refetchOnWindowFocus: true,
    refetchInterval: pollingInterval,
    staleTime: 1000 * 60 * 2, // 2 minutos
    placeholderData: (previousData) => previousData,
  })
}

export function usePastor(id: string) {
  return useQuery({
    queryKey: ["pastor", id],
    queryFn: () => pastoresApi.getById(id),
    enabled: !!id,
  })
}

export function useCreatePastor() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: pastoresApi.create,
    onSuccess: () => {
      // Invalidar todas las queries de pastores
      queryClient.invalidateQueries({ queryKey: ["pastores"] })
      // Notificar a otras pestañas
      notifyChange("pastores")
    },
    onError: (error: any) => {
      console.error("Error en useCreatePastor:", error.response?.data || error)
    },
  })
}

export function useUpdatePastor() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pastor> }) => pastoresApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pastores"] })
      notifyChange("pastores")
    },
    onError: (error: any) => {
      console.error("Error en useUpdatePastor:", error.response?.data || error)
    },
  })
}

export function useDeletePastor() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: pastoresApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pastores"] })
      notifyChange("pastores")
      toast.success("Pastor eliminado exitosamente")
    },
    onError: () => {
      toast.error("Error al eliminar el pastor")
    },
  })
}
