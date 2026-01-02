'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit, Trash2, Shield, UserCheck, Eye, Lock } from 'lucide-react'
import type { Usuario } from '@/lib/api/usuarios'

interface UsuariosTableProps {
  usuarios: Usuario[]
  onEdit: (usuario: Usuario) => void
  onDelete: (id: string) => void
  onResetPassword: (usuario: Usuario) => void
}
// Función simple para formatear fecha
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

interface UsuariosTableProps {
  usuarios: Usuario[]
  onEdit: (usuario: Usuario) => void
  onDelete: (id: string) => void
}

const rolConfig = {
  ADMIN: {
    label: 'Administrador',
    icon: Shield,
    variant: 'default' as const,
    className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  },
  EDITOR: {
    label: 'Editor',
    icon: UserCheck,
    variant: 'secondary' as const,
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  },
  VIEWER: {
    label: 'Visualizador',
    icon: Eye,
    variant: 'outline' as const,
    className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  },
}

export function UsuariosTable({ usuarios, onEdit, onDelete, onResetPassword }: UsuariosTableProps) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Creado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="p-8 text-center text-muted-foreground">
                No hay usuarios registrados
              </TableCell>
            </TableRow>
          ) : (
            usuarios.map(usuario => {
              const rolInfo = rolConfig[usuario.rol]
              const RolIcon = rolInfo.icon

              return (
                <TableRow key={usuario.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {usuario.avatar ? (
                        <img
                          src={usuario.avatar}
                          alt={usuario.nombre}
                          className="size-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="size-10 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                          {usuario.nombre.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{usuario.nombre}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground">{usuario.email}</p>
                  </TableCell>
                  <TableCell>
                    <Badge className={`gap-1.5 ${rolInfo.className}`}>
                      <RolIcon className="size-3" />
                      {rolInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(usuario.createdAt)}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(usuario)}
                        className="gap-1.5"
                      >
                        <Edit className="size-4" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onResetPassword(usuario)}
                        className="gap-1.5"
                        title="Resetear contraseña"
                      >
                        <Lock className="size-4" />
                        Resetear Clave
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(usuario.id)}
                        className="gap-1.5 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

