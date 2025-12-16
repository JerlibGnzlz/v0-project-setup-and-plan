import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  credencialesCapellaniaApi,
  CredencialCapellania,
  CreateCredencialCapellaniaDto,
  UpdateCredencialCapellaniaDto,
  CredencialCapellaniaFilterDto,
} from '@/lib/api/credenciales-capellania'
import { useSmartSync } from './use-smart-sync'

export function useCredencialesCapellania(
  page: number = 1,
  limit: number = 20,
  filters?: CredencialCapellaniaFilterDto
) {
  const { notifyChange } = useSmartSync()

  return useQuery({
    queryKey: ['credenciales-capellania', page, limit, filters],
    queryFn: () => credencialesCapellaniaApi.getAll(page, limit, filters),
    placeholderData: (previousData) => previousData,
  })
}

export function useCredencialCapellania(id: string) {
  return useQuery({
    queryKey: ['credencial-capellania', id],
    queryFn: () => credencialesCapellaniaApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateCredencialCapellania() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: (dto: CreateCredencialCapellaniaDto) =>
      credencialesCapellaniaApi.create(dto),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['credenciales-capellania'] })
      notifyChange('credenciales-capellania')
      toast.success('✅ Credencial creada exitosamente')
      return data // Retornar la credencial creada
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Error al crear la credencial'
      toast.error('Error al crear la credencial', {
        description: errorMessage,
      })
    },
  })
}

export function useUpdateCredencialCapellania() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string
      dto: UpdateCredencialCapellaniaDto
    }) => credencialesCapellaniaApi.update(id, dto),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['credenciales-capellania'] })
      await queryClient.invalidateQueries({
        queryKey: ['credencial-capellania', data.id],
      })
      notifyChange('credenciales-capellania')
      toast.success('✅ Credencial actualizada exitosamente')
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Error al actualizar la credencial'
      toast.error('Error al actualizar la credencial', {
        description: errorMessage,
      })
    },
  })
}

export function useDeleteCredencialCapellania() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: (id: string) => credencialesCapellaniaApi.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['credenciales-capellania'] })
      notifyChange('credenciales-capellania')
      toast.success('✅ Credencial eliminada exitosamente')
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Error al eliminar la credencial'
      toast.error('Error al eliminar la credencial', {
        description: errorMessage,
      })
    },
  })
}

