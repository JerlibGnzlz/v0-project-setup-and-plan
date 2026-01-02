'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, Plus, Shield, UserCheck, Eye } from 'lucide-react'
import { useUsuarios, useCreateUsuario, useUpdateUsuario, useDeleteUsuario } from '@/lib/hooks/use-usuarios'
import { UsuariosTable } from '@/components/admin/usuarios/usuarios-table'
import { UsuariosDialog } from '@/components/admin/usuarios/usuarios-dialog'
import { ResetPasswordDialog } from '@/components/admin/usuarios/reset-password-dialog'
import { UsuariosStats } from '@/components/admin/usuarios/usuarios-stats'
import type { Usuario, UserRole } from '@/lib/api/usuarios'

export default function UsuariosPage() {
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false)
  const [usuarioToReset, setUsuarioToReset] = useState<Usuario | null>(null)

  const { data: usuarios = [], isLoading } = useUsuarios()
  const createUsuarioMutation = useCreateUsuario()
  const updateUsuarioMutation = useUpdateUsuario()
  const deleteUsuarioMutation = useDeleteUsuario()

  const handleCreate = () => {
    setSelectedUsuario(null)
    setIsCreating(true)
    setIsDialogOpen(true)
  }

  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario)
    setIsCreating(false)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await deleteUsuarioMutation.mutateAsync(id)
      } catch (error) {
        // Error ya manejado en el hook
      }
    }
  }

  const handleResetPassword = (usuario: Usuario) => {
    setUsuarioToReset(usuario)
    setIsResetPasswordOpen(true)
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
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="size-4" />
          Crear Usuario
        </Button>
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
              onDelete={handleDelete}
              onResetPassword={handleResetPassword}
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
    </div>
  )
}

