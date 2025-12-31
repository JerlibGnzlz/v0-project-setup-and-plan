import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  configuracionLandingApi,
  type ConfiguracionLanding,
  type UpdateConfiguracionLandingDto,
} from '@/lib/api/configuracion-landing'
import { toast } from 'sonner'

/**
 * Hook para obtener la configuración de landing (público)
 */
export function useConfiguracionLanding() {
  return useQuery({
    queryKey: ['configuracion-landing'],
    queryFn: () => configuracionLandingApi.getConfiguracion(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para actualizar la configuración de landing (admin)
 */
export function useUpdateConfiguracionLanding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateConfiguracionLandingDto) =>
      configuracionLandingApi.updateConfiguracion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracion-landing'] })
      toast.success('Configuración actualizada exitosamente')
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido'
      toast.error('Error al actualizar configuración', {
        description: errorMessage,
      })
    },
  })
}

