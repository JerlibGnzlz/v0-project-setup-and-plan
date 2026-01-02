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

  return useMutation({
    mutationFn: (data: CreateUsuarioRequest) => usuariosApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('Usuario creado', {
        description: 'El usuario ha sido creado exitosamente',
      })
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear usuario'
      toast.error('Error', {
        description: errorMessage,
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

