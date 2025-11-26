"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { galeriaApi, type GaleriaImagen } from "@/lib/api/galeria"
import { toast } from "sonner"
import { useSmartSync, useSmartPolling } from "./use-smart-sync"

export function useGaleria() {
  // Usar sincronización inteligente
  useSmartSync()

  // Polling inteligente (cada 60 segundos, se pausa cuando no está visible)
  const pollingInterval = useSmartPolling(["galeria"], 60000)

  return useQuery({
    queryKey: ["galeria"],
    queryFn: galeriaApi.getAll,
    refetchOnWindowFocus: true,
    refetchInterval: pollingInterval,
    placeholderData: (previousData) => previousData,
  })
}

export function useGaleriaImagen(id: string) {
  return useQuery({
    queryKey: ["galeria", id],
    queryFn: () => galeriaApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateGaleriaImagen() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: galeriaApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galeria"] })
      notifyChange("galeria")
      toast.success("Imagen agregada exitosamente")
    },
    onError: () => {
      toast.error("Error al agregar la imagen")
    },
  })
}

export function useUpdateGaleriaImagen() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GaleriaImagen> }) => galeriaApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galeria"] })
      notifyChange("galeria")
      toast.success("Imagen actualizada exitosamente")
    },
    onError: () => {
      toast.error("Error al actualizar la imagen")
    },
  })
}

export function useDeleteGaleriaImagen() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: galeriaApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galeria"] })
      notifyChange("galeria")
      toast.success("Imagen eliminada exitosamente")
    },
    onError: () => {
      toast.error("Error al eliminar la imagen")
    },
  })
}


