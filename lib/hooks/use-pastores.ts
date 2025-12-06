'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pastoresApi, type Pastor } from '@/lib/api/pastores'
import { toast } from 'sonner'
import { useSmartSync, useSmartPolling } from './use-smart-sync'

export function usePastores(
  page?: number,
  limit?: number,
  filters?: {
    search?: string
    status?: 'todos' | 'activos' | 'inactivos'
    tipo?: 'DIRECTIVA' | 'SUPERVISOR' | 'PRESIDENTE' | 'todos'
    mostrarEnLanding?: boolean
  }
) {
  // Sincronización inteligente
  useSmartSync()

  // Polling que se pausa cuando la pestaña no está visible
  const pollingInterval = useSmartPolling(['pastores', page, limit, filters], 60000) // 60 segundos

  const pageNum = page || 1
  const limitNum = limit || 20

  return useQuery({
    queryKey: ['pastores', pageNum, limitNum, filters],
    queryFn: () => pastoresApi.getAll(pageNum, limitNum, filters),
    refetchOnWindowFocus: true,
    refetchInterval: pollingInterval,
    placeholderData: previousData => previousData,
  })
}

export function usePastoresActivos() {
  return useQuery({
    queryKey: ['pastores', 'active'],
    queryFn: pastoresApi.getActive,
  })
}

export function usePastoresLanding() {
  // Sincronización inteligente para la landing
  useSmartSync()

  const pollingInterval = useSmartPolling(['pastores', 'landing'], 30000) // 30 segundos

  return useQuery({
    queryKey: ['pastores', 'landing'],
    queryFn: pastoresApi.getForLanding,
    refetchOnWindowFocus: true,
    refetchInterval: pollingInterval,
    staleTime: 1000 * 60 * 2, // 2 minutos
    placeholderData: previousData => previousData,
  })
}

export function usePastor(id: string) {
  return useQuery({
    queryKey: ['pastor', id],
    queryFn: () => pastoresApi.getById(id),
    enabled: !!id,
  })
}

export function useCreatePastor() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: pastoresApi.create,
    onSuccess: () => {
      // Invalidar todas las queries de pastores
      queryClient.invalidateQueries({ queryKey: ['pastores'] })
      // Notificar a otras pestañas
      notifyChange('pastores')
      toast.success('✅ Pastor creado exitosamente', {
        description: 'El pastor ha sido agregado a la estructura organizacional',
      })
    },
    onError: (error: any) => {
      console.error('Error en useCreatePastor:', error.response?.data || error)

      // Manejar error 409 (ConflictException - email duplicado)
      if (error.response?.status === 409) {
        const responseData = error.response.data
        const errorMessage =
          responseData?.error?.message ||
          responseData?.message ||
          error.message ||
          'Ya existe un pastor con este correo electrónico'

        toast.error('❌ Pastor duplicado', {
          description: errorMessage,
          duration: 6000,
        })
        return
      }

      // Manejar error 400 (BadRequestException - validación)
      if (error.response?.status === 400) {
        const responseData = error.response.data
        let errorMessage = 'Error de validación. Por favor, verifica los datos ingresados.'

        if (responseData?.error?.message) {
          errorMessage = responseData.error.message
        } else if (responseData?.message) {
          errorMessage = responseData.message
        } else if (responseData?.error?.details?.validationErrors) {
          const validationErrors = responseData.error.details.validationErrors
            .map((err: any) =>
              typeof err === 'string' ? err : `${err.field || 'campo'}: ${err.message || err}`
            )
            .join(', ')
          errorMessage = `Error de validación: ${validationErrors}`
        }

        toast.error('❌ Error de validación', {
          description: errorMessage,
          duration: 6000,
        })
        return
      }

      // Detectar errores de duplicado por contenido del mensaje (por si acaso)
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        'Error al crear el pastor'

      if (
        errorMessage.toLowerCase().includes('ya existe') ||
        errorMessage.toLowerCase().includes('duplicado') ||
        errorMessage.toLowerCase().includes('unique constraint') ||
        (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('ya'))
      ) {
        toast.error('❌ Pastor duplicado', {
          description: errorMessage,
          duration: 6000,
        })
      } else {
        toast.error('❌ Error al crear el pastor', {
          description: errorMessage,
          duration: 5000,
        })
      }
    },
  })
}

export function useUpdatePastor() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pastor> }) =>
      pastoresApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pastores'] })
      notifyChange('pastores')
      toast.success('✅ Pastor actualizado exitosamente', {
        description: 'Los datos del pastor han sido actualizados',
      })
    },
    onError: (error: any) => {
      console.error('Error en useUpdatePastor:', error.response?.data || error)

      // Manejar error 409 (ConflictException - email duplicado)
      if (error.response?.status === 409) {
        const responseData = error.response.data
        const errorMessage =
          responseData?.error?.message ||
          responseData?.message ||
          error.message ||
          'Ya existe otro pastor con este correo electrónico'

        toast.error('❌ Email duplicado', {
          description: errorMessage,
          duration: 6000,
        })
        return
      }

      // Manejar error 400 (BadRequestException - validación)
      if (error.response?.status === 400) {
        const responseData = error.response.data
        let errorMessage = 'Error de validación. Por favor, verifica los datos ingresados.'

        if (responseData?.error?.message) {
          errorMessage = responseData.error.message
        } else if (responseData?.message) {
          errorMessage = responseData.message
        } else if (responseData?.error?.details?.validationErrors) {
          const validationErrors = responseData.error.details.validationErrors
            .map((err: any) =>
              typeof err === 'string' ? err : `${err.field || 'campo'}: ${err.message || err}`
            )
            .join(', ')
          errorMessage = `Error de validación: ${validationErrors}`
        }

        toast.error('❌ Error de validación', {
          description: errorMessage,
          duration: 6000,
        })
        return
      }

      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        'Error al actualizar el pastor'

      toast.error('❌ Error al actualizar el pastor', {
        description: errorMessage,
        duration: 5000,
      })
    },
  })
}

export function useDeletePastor() {
  const queryClient = useQueryClient()
  const { notifyChange } = useSmartSync()

  return useMutation({
    mutationFn: pastoresApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pastores'] })
      notifyChange('pastores')
      toast.success('Pastor eliminado exitosamente')
    },
    onError: () => {
      toast.error('Error al eliminar el pastor')
    },
  })
}
