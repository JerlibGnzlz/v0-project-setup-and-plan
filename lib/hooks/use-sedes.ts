import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sedesApi, type Sede, type CreateSedeDto, type UpdateSedeDto, type SedeFilterDto } from '@/lib/api/sedes'
import { toast } from 'sonner'

const QUERY_KEY = 'sedes'

export function useSedes(filters?: SedeFilterDto) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: async () => {
      const response = await sedesApi.getAll(filters)
      return response.data
    },
  })
}

export function useSede(id: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null
      const response = await sedesApi.getById(id)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateSede() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateSedeDto) => {
      const response = await sedesApi.create(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Sede creada exitosamente')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear la sede'
      toast.error('Error al crear la sede', {
        description: errorMessage,
      })
    },
  })
}

export function useUpdateSede() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSedeDto }) => {
      const response = await sedesApi.update(id, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Sede actualizada exitosamente')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar la sede'
      toast.error('Error al actualizar la sede', {
        description: errorMessage,
      })
    },
  })
}

export function useDeleteSede() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await sedesApi.delete(id)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Sede eliminada exitosamente')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar la sede'
      toast.error('Error al eliminar la sede', {
        description: errorMessage,
      })
    },
  })
}

export function useSedesCount() {
  return useQuery({
    queryKey: [QUERY_KEY, 'count'],
    queryFn: async () => {
      const response = await sedesApi.getTotalCount()
      return typeof response === 'number' ? response : response.data
    },
  })
}

