"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { convencionesApi, type Convencion } from "@/lib/api/convenciones"
import { toast } from "sonner"

export function useConvenciones() {
  return useQuery({
    queryKey: ["convenciones"],
    queryFn: convencionesApi.getAll,
  })
}

export function useConvencionActiva() {
  return useQuery({
    queryKey: ["convencion", "active"],
    queryFn: convencionesApi.getActive,
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
      queryClient.invalidateQueries({ queryKey: ["convenciones"] })
      toast.success("Convención actualizada exitosamente")
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
