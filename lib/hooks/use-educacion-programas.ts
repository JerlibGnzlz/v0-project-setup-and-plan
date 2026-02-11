import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  educacionProgramasApi,
  type EducacionProgramasResponse,
  type UpdateProgramasEducacionDto,
} from '@/lib/api/educacion-programas'
import { toast } from 'sonner'

const QUERY_KEY = ['educacion-programas']

/**
 * Hook para obtener los programas AMVA Digital (público, landing).
 */
export function useEducacionProgramas() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => educacionProgramasApi.getAll(),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook para actualizar los programas desde el panel de control (admin).
 */
export function useUpdateEducacionProgramas() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProgramasEducacionDto) =>
      educacionProgramasApi.update(data).then((r) => r.data as EducacionProgramasResponse),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Programas de educación actualizados')
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido'
      toast.error('Error al actualizar programas', {
        description: errorMessage,
      })
    },
  })
}
