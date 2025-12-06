import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inscripcionesApi, CreateInscripcionDto } from '@/lib/api/inscripciones'

export function useCreateInscripcion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateInscripcionDto) => inscripcionesApi.create(data),
    onSuccess: () => {
      // Invalidar queries relacionadas si es necesario
      queryClient.invalidateQueries({ queryKey: ['inscripciones'] })
    },
  })
}


