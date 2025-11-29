"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { inscripcionesApi, type Inscripcion, type CreateInscripcionDto } from "@/lib/api/inscripciones"
import { toast } from "sonner"
import { useSmartSync, useSmartPolling } from "./use-smart-sync"

export function useInscripciones() {
  // Sincronización inteligente para actualización automática entre pestañas
  useSmartSync()
  
  // Polling inteligente cada 30 segundos (solo cuando la pestaña está visible)
  const pollingInterval = useSmartPolling(["inscripciones"], 30000)
  
  return useQuery({
    queryKey: ["inscripciones"],
    queryFn: inscripcionesApi.getAll,
    refetchOnWindowFocus: true,
    refetchInterval: pollingInterval,
    placeholderData: (previousData) => previousData,
  })
}

export function useInscripcion(id: string) {
  return useQuery({
    queryKey: ["inscripcion", id],
    queryFn: () => inscripcionesApi.getById(id),
    enabled: !!id,
  })
}

export function useCheckInscripcion(convencionId: string | undefined, email: string | undefined) {
  return useQuery({
    queryKey: ["checkInscripcion", convencionId, email],
    queryFn: () => {
      if (!convencionId || !email) return null
      return inscripcionesApi.checkInscripcion(convencionId, email)
    },
    enabled: !!convencionId && !!email,
    retry: false,
    staleTime: 30000, // Cache por 30 segundos
  })
}

export function useCreateInscripcion() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: (data: CreateInscripcionDto) => inscripcionesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inscripciones"] })
      queryClient.invalidateQueries({ queryKey: ["checkInscripcion"] })
      // Notificar a otras pestañas para actualización instantánea
      notifyChange("inscripciones")
      toast.success("Inscripción creada exitosamente")
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Error al crear la inscripción"
      
      // Manejar error de email duplicado
      if (errorMessage.includes("ya está inscrito") || errorMessage.includes("ya existe") || errorMessage.includes("duplicado")) {
        toast.error("Ya estás inscrito", {
          description: "Este correo electrónico ya está registrado para esta convención",
        })
      } else {
        toast.error("Error al crear la inscripción", {
          description: errorMessage,
        })
      }
    },
  })
}

