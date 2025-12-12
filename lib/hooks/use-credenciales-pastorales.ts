import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  credencialesPastoralesApi,
  CredencialPastoral,
  CreateCredencialPastoralDto,
  UpdateCredencialPastoralDto,
  CredencialFilterDto,
} from '@/lib/api/credenciales-pastorales'
import { useSmartSync } from './use-smart-sync'

export function useCredencialesPastorales(
  page: number = 1,
  limit: number = 20,
  filters?: CredencialFilterDto
) {
  const { notifyChange } = useSmartSync()

  return useQuery({
    queryKey: ['credenciales-pastorales', page, limit, filters],
    queryFn: () => credencialesPastoralesApi.getAll(page, limit, filters),
    placeholderData: (previousData) => previousData,
  })
}

export function useCredencialPorVencer() {
  return useQuery({
    queryKey: ['credenciales-pastorales', 'por-vencer'],
    queryFn: () => credencialesPastoralesApi.getPorVencer(),
    refetchInterval: 5 * 60 * 1000, // Refrescar cada 5 minutos
  })
}

export function useCredencialesVencidas() {
  return useQuery({
    queryKey: ['credenciales-pastorales', 'vencidas'],
    queryFn: () => credencialesPastoralesApi.getVencidas(),
  })
}

export function useCredencialPastoral(id: string) {
  return useQuery({
    queryKey: ['credencial-pastoral', id],
    queryFn: () => credencialesPastoralesApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateCredencialPastoral() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: (dto: CreateCredencialPastoralDto) =>
      credencialesPastoralesApi.create(dto),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['credenciales-pastorales'] })
      notifyChange('credenciales-pastorales')
      toast.success('✅ Credencial creada exitosamente')
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

export function useUpdateCredencialPastoral() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string
      dto: UpdateCredencialPastoralDto
    }) => credencialesPastoralesApi.update(id, dto),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['credenciales-pastorales'] })
      await queryClient.invalidateQueries({
        queryKey: ['credencial-pastoral', data.id],
      })
      notifyChange('credenciales-pastorales')
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

export function useDeleteCredencialPastoral() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: (id: string) => credencialesPastoralesApi.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['credenciales-pastorales'] })
      notifyChange('credenciales-pastorales')
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

export function useActualizarEstadosCredenciales() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: () => credencialesPastoralesApi.actualizarEstados(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['credenciales-pastorales'] })
      notifyChange('credenciales-pastorales')
      toast.success(`✅ Estados actualizados: ${data.actualizadas} credenciales`)
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Error al actualizar estados'
      toast.error('Error al actualizar estados', {
        description: errorMessage,
      })
    },
  })
}

