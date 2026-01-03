import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/api/auth'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useAuth } from './use-auth'

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: () => {
      toast.success('Email enviado', {
        description: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña.',
      })
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Error al enviar email'
      toast.error('Error', {
        description: errorMessage,
      })
    },
  })
}

export function useResetPassword() {
  const router = useRouter()

  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authApi.resetPassword(token, newPassword),
    onSuccess: () => {
      toast.success('Contraseña restablecida', {
        description: 'Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión.',
      })
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push('/admin/login')
      }, 2000)
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Error al restablecer contraseña'
      toast.error('Error', {
        description: errorMessage,
      })
    },
  })
}

export function useChangePassword() {
  const queryClient = useQueryClient()
  const { checkAuth } = useAuth()

  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(currentPassword, newPassword),
    onSuccess: async () => {
      toast.success('Contraseña cambiada', {
        description: 'Tu contraseña ha sido cambiada exitosamente.',
      })
      
      // Verificar autenticación para actualizar el estado del usuario
      // Esto asegura que el token sigue siendo válido y el estado está actualizado
      try {
        // Usar setTimeout para evitar bloquear el UI
        setTimeout(async () => {
          try {
            await checkAuth()
          } catch (error) {
            // Si la verificación falla, el token podría haber sido invalidado
            // En ese caso, el usuario necesitará hacer login de nuevo
            console.warn('[useChangePassword] Error al verificar autenticación después de cambiar contraseña:', error)
          }
          
          // Invalidar solo las queries relacionadas con el usuario, no todas
          // Esto evita que la aplicación se congele
          queryClient.invalidateQueries({ queryKey: ['auth'] })
          queryClient.invalidateQueries({ queryKey: ['usuarios'] })
        }, 100)
      } catch (error) {
        // Si hay un error, solo loguear pero no bloquear
        console.warn('[useChangePassword] Error al actualizar estado después de cambiar contraseña:', error)
      }
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Error al cambiar contraseña'
      toast.error('Error', {
        description: errorMessage,
      })
    },
  })
}

