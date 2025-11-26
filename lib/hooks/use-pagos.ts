"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { pagosApi, type Pago } from "@/lib/api/pagos"
import { toast } from "sonner"

export function usePagos() {
  return useQuery({
    queryKey: ["pagos"],
    queryFn: pagosApi.getAllPagos,
  })
}

export function usePago(id: string) {
  return useQuery({
    queryKey: ["pago", id],
    queryFn: () => pagosApi.getPagoById(id),
    enabled: !!id,
  })
}

export function useUpdatePago() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pago> }) => pagosApi.updatePago(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pagos"] })
      toast.success("Pago actualizado exitosamente")
    },
    onError: () => {
      toast.error("Error al actualizar el pago")
    },
  })
}

export function useDeletePago() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: pagosApi.deletePago,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pagos"] })
      toast.success("Pago eliminado exitosamente")
    },
    onError: () => {
      toast.error("Error al eliminar el pago")
    },
  })
}



