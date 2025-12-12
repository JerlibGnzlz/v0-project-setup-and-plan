"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { inscripcionesApi, type Inscripcion, type CreateInscripcionDto } from "@/lib/api/inscripciones"
import { toast } from "sonner"
import { useSmartSync, useSmartPolling } from "./use-smart-sync"

export function useInscripciones(
  page?: number,
  limit?: number,
  filters?: {
    search?: string
    estado?: 'todos' | 'pendiente' | 'confirmado' | 'cancelado'
    origen?: 'todos' | 'web' | 'dashboard' | 'mobile'
    convencionId?: string
  }
) {
  // Sincronización inteligente para actualización automática entre pestañas
  useSmartSync()
  
  // Polling inteligente cada 30 segundos (solo cuando la pestaña está visible)
  const pollingInterval = useSmartPolling(["inscripciones", page, limit, filters], 30000)
  
  const pageNum = page || 1
  const limitNum = limit || 20
  
  return useQuery({
    queryKey: ["inscripciones", pageNum, limitNum, filters],
    queryFn: () => inscripcionesApi.getAll(pageNum, limitNum, filters),
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
      // Manejar error 409 (ConflictException - email duplicado)
      if (error.response?.status === 409) {
        const responseData = error.response.data
        const errorMessage = responseData?.error?.message || responseData?.message || error.message || "Este correo electrónico ya está registrado para esta convención"
        
        toast.error("❌ Ya estás inscrito", {
          description: errorMessage,
          duration: 6000,
        })
        return
      }
      
      // Manejar otros errores
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message || "Error al crear la inscripción"
      
      // Detectar errores de duplicado por contenido del mensaje (por si acaso)
      if (errorMessage.toLowerCase().includes("ya está inscrito") || 
          errorMessage.toLowerCase().includes("ya existe") || 
          errorMessage.toLowerCase().includes("duplicado") ||
          errorMessage.toLowerCase().includes("ya está registrado")) {
        toast.error("❌ Ya estás inscrito", {
          description: errorMessage,
          duration: 6000,
        })
      } else {
        toast.error("Error al crear la inscripción", {
          description: errorMessage,
          duration: 5000,
        })
      }
    },
  })
}

export function useCancelarInscripcion() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo?: string }) => 
      inscripcionesApi.cancelarInscripcion(id, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inscripciones"] })
      queryClient.invalidateQueries({ queryKey: ["pagos"] })
      notifyChange("inscripciones")
      toast.success("❌ Inscripción cancelada", {
        description: "Se ha enviado un email al usuario notificando la cancelación",
      })
    },
    onError: () => {
      toast.error("Error al cancelar la inscripción")
    },
  })
}

export function useReporteIngresos() {
  return useQuery({
    queryKey: ["reporte-ingresos"],
    queryFn: inscripcionesApi.getReporteIngresos,
    staleTime: 60000, // Cache por 1 minuto
  })
}

export function useEnviarRecordatorios() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (convencionId?: string) => inscripcionesApi.enviarRecordatorios(convencionId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["inscripciones"] })
      toast.success(`📧 Recordatorios enviados`, {
        description: `${data.enviados} enviados, ${data.fallidos} fallidos`,
      })
    },
    onError: () => {
      toast.error("Error al enviar recordatorios")
    },
  })
}

export function useUpdateInscripcion() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateInscripcionDto> }) => 
      inscripcionesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inscripciones"] })
      notifyChange("inscripciones")
      toast.success("✅ Inscripción actualizada", {
        description: "Los datos de la inscripción han sido actualizados",
      })
    },
    onError: () => {
      toast.error("Error al actualizar la inscripción")
    },
  })
}

export function useRehabilitarInscripcion() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: (id: string) => inscripcionesApi.rehabilitarInscripcion(id),
    onSuccess: async (data, variables) => {
      const inscripcionId = data.id || variables
      
      // Invalidar queries para forzar refetch
      await queryClient.invalidateQueries({ queryKey: ["inscripciones"] })
      await queryClient.invalidateQueries({ queryKey: ["pagos"] })
      await queryClient.invalidateQueries({ queryKey: ["inscripcion", inscripcionId] })
      
      // Refetch explícito para actualización inmediata
      await queryClient.refetchQueries({ queryKey: ["inscripciones"] })
      
      // Notificar a otras pestañas para actualización instantánea
      notifyChange("inscripciones")
      
      toast.success("✅ Inscripción rehabilitada", {
        description: "La inscripción ha cambiado de 'cancelado' a 'pendiente' y los pagos cancelados han sido rehabilitados",
      })
    },
    onError: (error: unknown) => {
      const errorMessage = 
        (error as { response?: { data?: { error?: { message?: string }; message?: string } } })?.response?.data?.error?.message ||
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (error instanceof Error ? error.message : String(error)) ||
        "Error al rehabilitar la inscripción"
      
      toast.error("Error al rehabilitar la inscripción", {
        description: errorMessage,
        duration: 5000,
      })
    },
  })
}

