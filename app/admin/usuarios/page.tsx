'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, Plus, Shield, UserCheck, Eye } from 'lucide-react'
import {
  useUsuarios,
  useCreateUsuario,
  useUpdateUsuario,
  useDeleteUsuario,
  useToggleUsuarioActivo,
  useHasAdminPin,
} from '@/lib/hooks/use-usuarios'
import { UsuariosTable } from '@/components/admin/usuarios/usuarios-table'
import { UsuariosDialog } from '@/components/admin/usuarios/usuarios-dialog'
import { ResetPasswordDialog } from '@/components/admin/usuarios/reset-password-dialog'
import { DeleteUsuarioDialog } from '@/components/admin/usuarios/delete-usuario-dialog'
import { UsuariosStats } from '@/components/admin/usuarios/usuarios-stats'
import { AdminPinDialog } from '@/components/admin/admin-pin-dialog'
import { SetupAdminPinDialog } from '@/components/admin/setup-admin-pin-dialog'
import type { Usuario, UserRole } from '@/lib/api/usuarios'
import { useAuth } from '@/lib/hooks/use-auth'

export default function UsuariosPage() {
  const { user: currentUser } = useAuth()
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false)
  const [usuarioToReset, setUsuarioToReset] = useState<Usuario | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null)
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false)
  const [isSetupPinDialogOpen, setIsSetupPinDialogOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    type: 'edit' | 'reset-password' | 'delete'
    usuario: Usuario | null
  } | null>(null)

  const { data: usuarios = [], isLoading } = useUsuarios()
  const createUsuarioMutation = useCreateUsuario()
  const updateUsuarioMutation = useUpdateUsuario()
  const deleteUsuarioMutation = useDeleteUsuario()
  const toggleActivoMutation = useToggleUsuarioActivo()
  const { data: hasPinData, isLoading: isLoadingPin } = useHasAdminPin()

  // Verificar permisos
  const canCreateUsers = currentUser?.rol === 'ADMIN'
  const hasPin = hasPinData?.hasPin ?? false
  const isAdmin = currentUser?.rol === 'ADMIN'

  const handleCreate = () => {
    setSelectedUsuario(null)
    setIsCreating(true)
    setIsDialogOpen(true)
  }

  const handleEdit = (usuario: Usuario) => {
    if (isAdmin && !hasPin && !isLoadingPin) {
      // Si es admin y no tiene PIN configurado, mostrar diálogo de setup
      setIsSetupPinDialogOpen(true)
      setPendingAction({ type: 'edit', usuario })
      return
    }

    if (isAdmin && hasPin) {
      // Si es admin y tiene PIN, pedir PIN antes de editar
      setPendingAction({ type: 'edit', usuario })
      setIsPinDialogOpen(true)
      return
    }

    // Si no es admin o no requiere PIN, proceder directamente
    setSelectedUsuario(usuario)
    setIsCreating(false)
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (usuario: Usuario) => {
    if (isAdmin && !hasPin && !isLoadingPin) {
      // Si es admin y no tiene PIN configurado, mostrar diálogo de setup
      setIsSetupPinDialogOpen(true)
      setPendingAction({ type: 'delete', usuario })
      return
    }

    if (isAdmin && hasPin) {
      // Si es admin y tiene PIN, pedir PIN antes de eliminar
      setPendingAction({ type: 'delete', usuario })
      setIsPinDialogOpen(true)
      return
    }

    // Si no es admin o no requiere PIN, proceder directamente
    setUsuarioToDelete(usuario)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!usuarioToDelete) return
    try {
      await deleteUsuarioMutation.mutateAsync(usuarioToDelete.id)
      setIsDeleteDialogOpen(false)
      setUsuarioToDelete(null)
    } catch (error) {
      // Error ya manejado en el hook
    }
  }

  const handleResetPassword = (usuario: Usuario) => {
    if (isAdmin && !hasPin && !isLoadingPin) {
      // Si es admin y no tiene PIN configurado, mostrar diálogo de setup
      setIsSetupPinDialogOpen(true)
      setPendingAction({ type: 'reset-password', usuario })
      return
    }

    if (isAdmin && hasPin) {
      // Si es admin y tiene PIN, pedir PIN antes de resetear
      setPendingAction({ type: 'reset-password', usuario })
      setIsPinDialogOpen(true)
      return
    }

    // Si no es admin o no requiere PIN, proceder directamente
    setUsuarioToReset(usuario)
    setIsResetPasswordOpen(true)
  }

  const handlePinSuccess = () => {
    if (!pendingAction) return

    switch (pendingAction.type) {
      case 'edit':
        setSelectedUsuario(pendingAction.usuario)
        setIsCreating(false)
        setIsDialogOpen(true)
        break
      case 'reset-password':
        setUsuarioToReset(pendingAction.usuario)
        setIsResetPasswordOpen(true)
        break
      case 'delete':
        setUsuarioToDelete(pendingAction.usuario)
        setIsDeleteDialogOpen(true)
        break
    }

    setPendingAction(null)
  }

  const handleSetupPinSuccess = () => {
    // Después de establecer el PIN, ejecutar la acción pendiente
    if (pendingAction) {
      // Refrescar el estado de hasPin
      setTimeout(() => {
        handlePinSuccess()
      }, 500)
    }
  }

  const handleToggleActivo = async (usuario: Usuario) => {
    try {
      await toggleActivoMutation.mutateAsync(usuario.id)
    } catch (error) {
      // Error ya manejado en el hook
    }
  }

  const handleSubmit = async (data: {
    email: string
    password?: string
    nombre: string
    rol: UserRole
  }) => {
    try {
      if (isCreating) {
        if (!data.password) {
          throw new Error('La contraseña es requerida para crear un usuario')
        }
        await createUsuarioMutation.mutateAsync({
          email: data.email,
          password: data.password,
          nombre: data.nombre,
          rol: data.rol,
        })
      } else if (selectedUsuario) {
        await updateUsuarioMutation.mutateAsync({
          id: selectedUsuario.id,
          data: {
            email: data.email,
            nombre: data.nombre,
            rol: data.rol,
          },
        })
      }
      setIsDialogOpen(false)
      setSelectedUsuario(null)
      setIsCreating(false)
    } catch (error) {
      // Error ya manejado en el hook
    }
  }

  // Estadísticas
  const stats = {
    total: usuarios.length,
    admins: usuarios.filter(u => u.rol === 'ADMIN').length,
    editors: usuarios.filter(u => u.rol === 'EDITOR').length,
    viewers: usuarios.filter(u => u.rol === 'VIEWER').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500/10 to-emerald-500/10">
              <Users className="size-6 text-sky-600 dark:text-sky-400" />
            </div>
            Gestión de Usuarios
          </h1>
          <p className="text-muted-foreground mt-1">
            Administra los usuarios que pueden acceder al panel administrativo
          </p>
        </div>
        {canCreateUsers ? (
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="size-4" />
            Crear Usuario
          </Button>
        ) : (
          <Button disabled className="gap-2" title="Solo usuarios ADMIN pueden crear usuarios">
            <Plus className="size-4" />
            Crear Usuario
          </Button>
        )}
      </div>

      {/* Stats */}
      <UsuariosStats stats={stats} isLoading={isLoading} />

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            {isLoading ? 'Cargando...' : `${usuarios.length} usuario(s) registrado(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : usuarios.length === 0 ? (
            <div className="text-center py-12">
              <Users className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay usuarios</h3>
              <p className="text-muted-foreground mb-4">Comienza creando tu primer usuario</p>
              <Button onClick={handleCreate}>
                <Plus className="size-4 mr-2" />
                Crear Usuario
              </Button>
            </div>
          ) : (
            <UsuariosTable
              usuarios={usuarios}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onResetPassword={handleResetPassword}
              onToggleActivo={handleToggleActivo}
              isTogglingActivo={toggleActivoMutation.isPending}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <UsuariosDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        usuario={selectedUsuario}
        isCreating={isCreating}
        onSubmit={handleSubmit}
        isLoading={createUsuarioMutation.isPending || updateUsuarioMutation.isPending}
      />

      <ResetPasswordDialog
        open={isResetPasswordOpen}
        onOpenChange={setIsResetPasswordOpen}
        usuario={usuarioToReset}
      />

      <DeleteUsuarioDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        usuario={usuarioToDelete}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteUsuarioMutation.isPending}
      />

      {/* PIN Dialog para acciones críticas */}
      {pendingAction && (
        <AdminPinDialog
          open={isPinDialogOpen}
          onOpenChange={setIsPinDialogOpen}
          onSuccess={handlePinSuccess}
          action={pendingAction.type}
          usuarioNombre={pendingAction.usuario?.nombre}
        />
      )}

      {/* Setup PIN Dialog para establecer PIN inicial */}
      {isAdmin && (
        <SetupAdminPinDialog
          open={isSetupPinDialogOpen}
          onOpenChange={setIsSetupPinDialogOpen}
          onSuccess={handleSetupPinSuccess}
        />
      )}
    </div>
  )
}

