'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertTriangle } from 'lucide-react'
import type { Usuario } from '@/lib/api/usuarios'

interface DeleteUsuarioDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuario: Usuario | null
  onConfirm: () => void
  isLoading?: boolean
}

export function DeleteUsuarioDialog({
  open,
  onOpenChange,
  usuario,
  onConfirm,
  isLoading = false,
}: DeleteUsuarioDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="size-5 text-destructive" />
            </div>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            Esta acción no se puede deshacer. Se eliminará permanentemente el usuario{' '}
            <span className="font-semibold text-foreground">
              {usuario?.nombre || 'este usuario'}
            </span>
            {usuario?.email && (
              <>
                {' '}
                (<span className="font-medium">{usuario.email}</span>)
              </>
            )}
            .
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

