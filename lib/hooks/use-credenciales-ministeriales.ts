import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  credencialesMinisterialesApi,
  CredencialMinisterial,
  CreateCredencialMinisterialDto,
  UpdateCredencialMinisterialDto,
  CredencialMinisterialFilterDto,
} from '@/lib/api/credenciales-ministeriales'
import { useSmartSync } from './use-smart-sync'

export function useCredencialesMinisteriales(
  page: number = 1,
  limit: number = 20,
  filters?: CredencialMinisterialFilterDto
) {
  const { notifyChange } = useSmartSync()

  return useQuery({
    queryKey: ['credenciales-ministeriales', page, limit, filters],
    queryFn: () => credencialesMinisterialesApi.getAll(page, limit, filters),
    placeholderData: (previousData) => previousData,
  })
}

export function useCredencialMinisterial(id: string) {
  return useQuery({
    queryKey: ['credencial-ministerial', id],
    queryFn: () => credencialesMinisterialesApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateCredencialMinisterial() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: (dto: CreateCredencialMinisterialDto) =>
      credencialesMinisterialesApi.create(dto),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['credenciales-ministeriales'] })
      notifyChange('credenciales-ministeriales')
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

export function useUpdateCredencialMinisterial() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string
      dto: UpdateCredencialMinisterialDto
    }) => credencialesMinisterialesApi.update(id, dto),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['credenciales-ministeriales'] })
      await queryClient.invalidateQueries({
        queryKey: ['credencial-ministerial', data.id],
      })
      notifyChange('credenciales-ministeriales')
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

export function useDeleteCredencialMinisterial() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: (id: string) => credencialesMinisterialesApi.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['credenciales-ministeriales'] })
      notifyChange('credenciales-ministeriales')
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

export function useSincronizarDesdePastorales() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: () => credencialesMinisterialesApi.sincronizarDesdePastorales(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['credenciales-ministeriales'] })
      notifyChange('credenciales-ministeriales')
      toast.success('✅ Sincronización completada', {
        description: `${data.creadas} creadas, ${data.actualizadas} actualizadas, ${data.errores} errores`,
      })
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Error al sincronizar credenciales'
      toast.error('Error al sincronizar credenciales', {
        description: errorMessage,
      })
    },
  })
}

