import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usuariosApi, type Usuario, type CreateUsuarioRequest, type UpdateUsuarioRequest, type ChangePasswordRequest, type AdminResetPasswordRequest } from '@/lib/api/usuarios'
import { toast } from 'sonner'
import { useAuth } from './use-auth'

export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: usuariosApi.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

export function useUsuario(id: string) {
  return useQuery({
    queryKey: ['usuarios', id],
    queryFn: () => usuariosApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateUsuario() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (data: CreateUsuarioRequest) => {
      // Log para debugging
      console.log('[useCreateUsuario] Creando usuario:', {
        email: data.email,
        nombre: data.nombre,
        rol: data.rol,
        usuarioActual: user?.email,
        rolUsuarioActual: user?.rol,
      })
      return usuariosApi.create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('Usuario creado', {
        description: 'El usuario ha sido creado exitosamente',
      })
    },
    onError: (error: unknown) => {
      let errorMessage = 'Error al crear usuario'
      
      // Log detallado del error
      console.error('[useCreateUsuario] Error al crear usuario:', error)
      
      if (error && typeof error === 'object' && 'response' in error) {
        const response = error.response as { status?: number; data?: { message?: string } }
        console.error('[useCreateUsuario] Response status:', response.status)
        console.error('[useCreateUsuario] Response data:', response.data)
        
        if (response.status === 403) {
          errorMessage = 'No tienes permisos para crear usuarios. Se requiere rol ADMIN. '
          if (user?.rol !== 'ADMIN') {
            errorMessage += `Tu rol actual es ${user?.rol || 'desconocido'}. `
          }
          errorMessage += 'Si acabas de cambiar tu rol, cierra sesión y vuelve a iniciar sesión para obtener un nuevo token.'
        } else if (response.data?.message) {
          errorMessage = response.data.message
        } else if (error instanceof Error) {
          errorMessage = error.message
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      // Verificar si el usuario actual tiene rol ADMIN
      if (user?.rol !== 'ADMIN') {
        errorMessage = `Tu rol actual es ${user?.rol || 'desconocido'}. Solo los usuarios con rol ADMIN pueden crear usuarios. Por favor, cierra sesión y vuelve a iniciar sesión si acabas de cambiar tu rol.`
      }

      toast.error('Error al crear usuario', {
        description: errorMessage,
        duration: 5000,
      })
    },
  })
}

export function useUpdateUsuario() {
  const queryClient = useQueryClient()
  const { user: currentUser, updateUser } = useAuth()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUsuarioRequest }) =>
      usuariosApi.update(id, data),
    onSuccess: (updatedUsuario, variables) => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      queryClient.invalidateQueries({ queryKey: ['usuarios', variables.id] })
      
      // Si el usuario actualizado es el mismo que está logueado, actualizar el estado de autenticación
      if (currentUser && currentUser.id === variables.id) {
        updateUser({
          email: updatedUsuario.email,
          nombre: updatedUsuario.nombre,
          rol: updatedUsuario.rol,
          avatar: updatedUsuario.avatar,
        })
      }
      
      toast.success('Usuario actualizado', {
        description: 'Los cambios se han guardado correctamente',
      })
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar usuario'
      toast.error('Error', {
        description: errorMessage,
      })
    },
  })
}

export function useDeleteUsuario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => usuariosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('Usuario eliminado', {
        description: 'El usuario ha sido eliminado exitosamente',
      })
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar usuario'
      toast.error('Error', {
        description: errorMessage,
      })
    },
  })
}

export function useAdminResetPassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminResetPasswordRequest }) =>
      usuariosApi.adminResetPassword(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('Contraseña reseteada', {
        description: 'La contraseña ha sido reseteada exitosamente',
      })
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Error al resetear contraseña'
      toast.error('Error', {
        description: errorMessage,
      })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => usuariosApi.changePassword(data),
    onSuccess: () => {
      toast.success('Contraseña cambiada', {
        description: 'Tu contraseña ha sido cambiada exitosamente',
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

export function useChangeEmail() {
  const queryClient = useQueryClient()
  const { user: currentUser, updateUser } = useAuth()

  return useMutation({
    mutationFn: (data: { newEmail: string; password: string }) => usuariosApi.changeEmail(data),
    onSuccess: (updatedUsuario) => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      
      // Solo actualizar el estado si NO estamos en setup-credentials (porque vamos a hacer logout)
      // Verificar si estamos en la página de setup-credentials
      const isInSetupCredentials = typeof window !== 'undefined' && window.location.pathname === '/admin/setup-credentials'
      
      // Actualizar el estado de autenticación si es el usuario actual y NO estamos en setup-credentials
      if (currentUser && !isInSetupCredentials) {
        updateUser({
          email: updatedUsuario.email,
          nombre: updatedUsuario.nombre,
          rol: updatedUsuario.rol,
          avatar: updatedUsuario.avatar,
        })
      }
      
      // Solo mostrar toast si NO estamos en setup-credentials (el toast se mostrará después del logout)
      if (!isInSetupCredentials) {
        toast.success('Email cambiado', {
          description: 'Tu email ha sido cambiado exitosamente',
        })
      }
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Error al cambiar email'
      toast.error('Error', {
        description: errorMessage,
      })
    },
  })
}

export function useToggleUsuarioActivo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => usuariosApi.toggleActivo(id),
    onSuccess: (updatedUsuario) => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      queryClient.invalidateQueries({ queryKey: ['usuarios', updatedUsuario.id] })
      toast.success(
        updatedUsuario.activo ? 'Usuario activado' : 'Usuario desactivado',
        {
          description: `El usuario ${updatedUsuario.nombre} ha sido ${
            updatedUsuario.activo ? 'activado' : 'desactivado'
          } exitosamente`,
        }
      )
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Error al cambiar estado'
      toast.error('Error', {
        description: errorMessage,
      })
    },
  })
}

