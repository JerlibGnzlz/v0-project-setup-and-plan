"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { pastoresApi, type Pastor } from "@/lib/api/pastores"
import { toast } from "sonner"

export function usePastores() {
  return useQuery({
    queryKey: ["pastores"],
    queryFn: pastoresApi.getAll,
  })
}

export function usePastoresActivos() {
  return useQuery({
    queryKey: ["pastores", "active"],
    queryFn: pastoresApi.getActive,
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

  return useMutation({
    mutationFn: pastoresApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pastores"] })
      toast.success("Pastor registrado exitosamente")
    },
    onError: () => {
      toast.error("Error al registrar el pastor")
    },
  })
}

export function useUpdatePastor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pastor> }) => pastoresApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pastores"] })
      toast.success("Pastor actualizado exitosamente")
    },
    onError: () => {
      toast.error("Error al actualizar el pastor")
    },
  })
}

export function useDeletePastor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: pastoresApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pastores"] })
      toast.success("Pastor eliminado exitosamente")
    },
    onError: () => {
      toast.error("Error al eliminar el pastor")
    },
  })
}
