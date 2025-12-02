import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invitadoAuthApi } from '@/lib/api/invitado-auth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function useInvitadoAuth() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      invitadoAuthApi.login(data),
    onSuccess: (data) => {
      // Guardar tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem('invitado_token', data.access_token)
        localStorage.setItem('invitado_refresh_token', data.refresh_token)
        localStorage.setItem('invitado_user', JSON.stringify(data.invitado))
      }
      queryClient.setQueryData(['invitado', 'me'], data.invitado)
      toast.success('Bienvenido', {
        description: 'Has iniciado sesión correctamente',
      })
    },
    onError: (error: any) => {
      console.error('Error en login de invitado:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Credenciales inválidas'
      toast.error('Error de autenticación', {
        description: errorMessage,
      })
    },
  })

  const registerMutation = useMutation({
    mutationFn: (data: {
      nombre: string
      apellido: string
      email: string
      password: string
      telefono?: string
      sede?: string
    }) => invitadoAuthApi.registerComplete(data),
    onSuccess: (data) => {
      // Guardar tokens después del registro
      if (typeof window !== 'undefined') {
        localStorage.setItem('invitado_token', data.access_token)
        localStorage.setItem('invitado_refresh_token', data.refresh_token)
        localStorage.setItem('invitado_user', JSON.stringify(data.invitado))
      }
      queryClient.setQueryData(['invitado', 'me'], data.invitado)
      toast.success('Cuenta creada exitosamente', {
        description: 'Tu cuenta ha sido creada. Puedes iniciar sesión ahora.',
      })
    },
    onError: (error: any) => {
      console.error('Error en registro de invitado:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear la cuenta'
      toast.error('Error de registro', {
        description: errorMessage,
      })
    },
  })

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('invitado_token')
      localStorage.removeItem('invitado_refresh_token')
      localStorage.removeItem('invitado_user')
    }
    queryClient.removeQueries({ queryKey: ['invitado'] })
    router.push('/')
  }

  const checkAuth = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('invitado_token')
      return !!token
    }
    return false
  }

  return {
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    checkAuth,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  }
}

