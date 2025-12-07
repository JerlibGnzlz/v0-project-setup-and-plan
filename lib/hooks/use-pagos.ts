'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pagosApi, type Pago } from '@/lib/api/pagos'
import { toast } from 'sonner'

export function usePagosStats() {
  return useQuery({
    queryKey: ['pagos', 'stats'],
    queryFn: () => pagosApi.getStats(),
    refetchInterval: 30000, // Refrescar cada 30 segundos
  })
}

export function usePagos(
  page?: number,
  limit?: number,
  filters?: {
    search?: string
    estado?: 'todos' | 'PENDIENTE' | 'COMPLETADO' | 'RECHAZADO' | 'CANCELADO'
    metodoPago?: 'todos' | 'transferencia' | 'mercadopago' | 'efectivo' | 'otro'
    origen?: 'todos' | 'web' | 'dashboard' | 'mobile'
    inscripcionId?: string
    convencionId?: string
  }
) {
  const pageNum = page || 1
  const limitNum = limit || 20

  return useQuery({
    queryKey: ['pagos', pageNum, limitNum, filters],
    queryFn: () => pagosApi.getAllPagos(pageNum, limitNum, filters),
  })
}

export function usePago(id: string) {
  return useQuery({
    queryKey: ['pago', id],
    queryFn: () => pagosApi.getPagoById(id),
    enabled: !!id,
  })
}

export function useUpdatePago() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pago> }) =>
      pagosApi.updatePago(id, data),
    onSuccess: (data: any, variables: { id: string; data: Partial<Pago> }) => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] })
      queryClient.invalidateQueries({ queryKey: ['inscripciones'] })
      // Invalidar notificaciones para actualizar el contador
      queryClient.invalidateQueries({ queryKey: ['notifications'] })

      // Mensaje personalizado según el estado
      if (variables.data?.estado === 'COMPLETADO') {
        // No mostrar toast aquí si hay advertencia, se manejará en el componente
        if (!data?.advertenciaMonto) {
          toast.success('✅ Pago validado exitosamente', {
            description: 'El usuario recibirá una notificación de confirmación',
          })
        }
      } else {
        toast.success('Pago actualizado exitosamente')
      }
    },
    onError: () => {
      toast.error('Error al actualizar el pago')
    },
  })
}

export function useCreatePago() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: pagosApi.createPago,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] })
      queryClient.invalidateQueries({ queryKey: ['inscripciones'] })
      toast.success('Pago creado exitosamente')
    },
    onError: () => {
      toast.error('Error al crear el pago')
    },
  })
}

export function useDeletePago() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: pagosApi.deletePago,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] })
      queryClient.invalidateQueries({ queryKey: ['inscripciones'] })
      toast.success('Pago eliminado exitosamente')
    },
    onError: () => {
      toast.error('Error al eliminar el pago')
    },
  })
}

export function useRechazarPago() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo?: string }) =>
      pagosApi.rechazarPago(id, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] })
      queryClient.invalidateQueries({ queryKey: ['inscripciones'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('❌ Pago rechazado', {
        description: 'Se ha enviado un email al usuario notificando el rechazo',
      })
    },
    onError: () => {
      toast.error('Error al rechazar el pago')
    },
  })
}

export function useRehabilitarPago() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => pagosApi.rehabilitarPago(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] })
      queryClient.invalidateQueries({ queryKey: ['inscripciones'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('🔄 Pago rehabilitado', {
        description: 'El usuario puede volver a enviar su comprobante de pago',
      })
    },
    onError: () => {
      toast.error('Error al rehabilitar el pago')
    },
  })
}

export function useValidarPagosMasivos() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => pagosApi.validarPagosMasivos(ids),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] })
      queryClient.invalidateQueries({ queryKey: ['inscripciones'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })

      const mensaje = `${data.exitosos} pagos validados`
      const detalles: string[] = []
      if (data.advertencias > 0) detalles.push(`${data.advertencias} con advertencias de monto`)
      if (data.fallidos > 0) detalles.push(`${data.fallidos} fallidos`)

      toast.success(`✅ Validación masiva completada`, {
        description: mensaje + (detalles.length > 0 ? ` (${detalles.join(', ')})` : ''),
        duration: 5000,
      })
    },
    onError: () => {
      toast.error('Error al validar pagos masivamente')
    },
  })
}

export function useHistorialAuditoria(pagoId: string) {
  return useQuery({
    queryKey: ['auditoria-pago', pagoId],
    queryFn: () => pagosApi.getHistorialAuditoria(pagoId),
    enabled: !!pagoId,
  })
}
