import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/lib/api/auth'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

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
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Contraseña cambiada', {
        description: 'Tu contraseña ha sido cambiada exitosamente.',
      })
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Error al cambiar contraseña'
      toast.error('Error', {
        description: errorMessage,
      })
    },
  })
}

