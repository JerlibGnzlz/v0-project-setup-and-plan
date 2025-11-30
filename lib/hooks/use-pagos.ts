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
    onSuccess: (_data: any, variables: { id: string; data: Partial<Pago> }) => {
      queryClient.invalidateQueries({ queryKey: ["pagos"] })
      queryClient.invalidateQueries({ queryKey: ["inscripciones"] })
      // Invalidar notificaciones para actualizar el contador
      queryClient.invalidateQueries({ queryKey: ["notifications"] })

      // Mensaje personalizado según el estado
      if (variables.data?.estado === 'COMPLETADO') {
        toast.success("✅ Pago validado exitosamente", {
          description: "El usuario recibirá una notificación de confirmación",
        })
      } else {
        toast.success("Pago actualizado exitosamente")
      }
    },
    onError: () => {
      toast.error("Error al actualizar el pago")
    },
  })
}

export function useCreatePago() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: pagosApi.createPago,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pagos"] })
      queryClient.invalidateQueries({ queryKey: ["inscripciones"] })
      toast.success("Pago creado exitosamente")
    },
    onError: () => {
      toast.error("Error al crear el pago")
    },
  })
}

export function useDeletePago() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: pagosApi.deletePago,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pagos"] })
      queryClient.invalidateQueries({ queryKey: ["inscripciones"] })
      toast.success("Pago eliminado exitosamente")
    },
    onError: () => {
      toast.error("Error al eliminar el pago")
    },
  })
}

