"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { convencionesApi, type Convencion } from "@/lib/api/convenciones"
import { toast } from "sonner"
import { useSmartSync, useSmartPolling } from "./use-smart-sync"

export function useConvenciones() {
  return useQuery({
    queryKey: ["convenciones"],
    queryFn: convencionesApi.getAll,
  })
}

export function useConvencionActiva() {
  // Usar sincronización inteligente
  useSmartSync()
  
  // Polling inteligente que se pausa cuando la pestaña no está visible
  const pollingInterval = useSmartPolling(["convencion", "active"], 30000)
  
  return useQuery({
    queryKey: ["convencion", "active"],
    queryFn: convencionesApi.getActive,
    refetchOnWindowFocus: true,
    staleTime: 0,
    refetchInterval: pollingInterval, // Se pausa automáticamente cuando la pestaña no está visible
    // Mantener los datos anteriores mientras se refetch para evitar parpadeos
    placeholderData: (previousData) => previousData,
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
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: convencionesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["convenciones"] })
      queryClient.invalidateQueries({ queryKey: ["convencion"] })
      notifyChange("convencion")
      toast.success("Convención creada exitosamente")
    },
    onError: () => {
      toast.error("Error al crear la convención")
    },
  })
}

export function useUpdateConvencion() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Convencion> }) => convencionesApi.update(id, data),
    onSuccess: async () => {
      // Invalidar y refetch todas las queries relacionadas con convenciones
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["convenciones"] }),
        queryClient.invalidateQueries({ queryKey: ["convencion"] }),
      ])
      
      // Forzar refetch de la convención activa
      await queryClient.refetchQueries({ queryKey: ["convencion", "active"] })
      
      // Notificar a otras pestañas via BroadcastChannel + localStorage
      notifyChange("convencion")
    },
    onError: () => {
      toast.error("Error al actualizar la convención")
    },
  })
}

export function useArchivarConvencion() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: convencionesApi.archivar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["convenciones"] })
      queryClient.invalidateQueries({ queryKey: ["convencion"] })
      notifyChange("convencion")
      toast.success("Convención archivada exitosamente")
    },
    onError: () => {
      toast.error("Error al archivar la convención")
    },
  })
}

export function useDesarchivarConvencion() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: convencionesApi.desarchivar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["convenciones"] })
      queryClient.invalidateQueries({ queryKey: ["convencion"] })
      notifyChange("convencion")
      toast.success("Convención desarchivada exitosamente")
    },
    onError: () => {
      toast.error("Error al desarchivar la convención")
    },
  })
}

export function useDeleteConvencion() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: convencionesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["convenciones"] })
      queryClient.invalidateQueries({ queryKey: ["convencion"] })
      notifyChange("convencion")
      toast.success("Convención eliminada exitosamente")
    },
    onError: () => {
      toast.error("Error al eliminar la convención")
    },
  })
}
