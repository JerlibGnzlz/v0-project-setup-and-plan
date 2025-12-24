import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  solicitudesCredencialesApi,
  SolicitudCredencial,
  UpdateSolicitudCredencialDto,
  EstadoSolicitud,
  TipoCredencial,
} from '@/lib/api/solicitudes-credenciales'
import { useSmartSync } from './use-smart-sync'

export function useSolicitudesCredenciales(
  page: number = 1,
  limit: number = 20,
  estado?: EstadoSolicitud,
  tipo?: TipoCredencial
) {
  const { notifyChange } = useSmartSync()

  return useQuery({
    queryKey: ['solicitudes-credenciales', page, limit, estado, tipo],
    queryFn: () => solicitudesCredencialesApi.getAll(page, limit, estado, tipo),
    placeholderData: (previousData) => previousData,
  })
}

export function useSolicitudCredencial(id: string) {
  return useQuery({
    queryKey: ['solicitud-credencial', id],
    queryFn: () => solicitudesCredencialesApi.getById(id),
    enabled: !!id,
  })
}

export function useUpdateSolicitudCredencial() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSolicitudCredencialDto }) =>
      solicitudesCredencialesApi.update(id, dto),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['solicitudes-credenciales'] })
      await queryClient.invalidateQueries({ queryKey: ['solicitud-credencial', data.id] })
      notifyChange('inscripciones') // Invalidar también inscripciones por si acaso
      toast.success('✅ Solicitud actualizada exitosamente')
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error al actualizar la solicitud'
      toast.error('Error al actualizar la solicitud', {
        description: errorMessage,
      })
    },
  })
}

