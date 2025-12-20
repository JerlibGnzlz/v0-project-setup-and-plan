'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Edit, UserX, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import type { Pastor } from '@/lib/api/pastores'
import type { TipoPastor } from '@/lib/validations/pastor'
import { tipoPastorLabels } from '@/lib/validations/pastor'
import { useUpdatePastor } from '@/lib/hooks/use-pastores'

interface PastoresTableRowProps {
  pastor: Pastor
  onEdit: (pastor: Pastor) => void
  tipoConfig: Record<
    TipoPastor,
    { icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string }
  >
}

export function PastoresTableRow({ pastor, onEdit, tipoConfig }: PastoresTableRowProps) {
  const updatePastorMutation = useUpdatePastor()
  const config = tipoConfig[pastor.tipo] || tipoConfig.PASTOR
  const Icon = config.icon

  const handleToggleActive = async () => {
    try {
      await updatePastorMutation.mutateAsync({
        id: pastor.id,
        data: { activo: !pastor.activo },
      })
      toast.success(pastor.activo ? 'Pastor desactivado' : 'Pastor activado')
    } catch (error: unknown) {
      toast.error('Error', {
        description: 'No se pudo actualizar el pastor',
      })
    }
  }

  return (
    <tr className="border-t hover:bg-muted/50">
      <td className="p-3">
        <div className="flex items-center gap-3">
          {pastor.fotoUrl ? (
            <img
              src={pastor.fotoUrl}
              alt={`${pastor.nombre} ${pastor.apellido}`}
              className="size-10 rounded-full object-cover"
            />
          ) : (
            <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-medium">
              {pastor.nombre?.[0]}
              {pastor.apellido?.[0]}
            </div>
          )}
          <div>
            <p className="font-medium text-sm">
              {pastor.nombre} {pastor.apellido}
            </p>
            {pastor.email && (
              <p className="text-xs text-muted-foreground">{pastor.email}</p>
            )}
          </div>
        </div>
      </td>
      <td className="p-3">
        <Badge variant="outline" className={`${config.bgColor} border-0`}>
          <Icon className={`size-3 mr-1 ${config.color}`} />
          <span className={config.color}>
            {tipoPastorLabels[pastor.tipo] || 'Pastor'}
          </span>
        </Badge>
      </td>
      <td className="p-3 text-sm">{pastor.cargo || '-'}</td>
      <td className="p-3 text-sm">
        {pastor.sede || pastor.region || pastor.pais || '-'}
      </td>
      <td className="p-3">
        {pastor.mostrarEnLanding ? (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            Visible
          </Badge>
        ) : (
          <Badge variant="secondary">Oculto</Badge>
        )}
      </td>
      <td className="p-3">
        <Badge variant={pastor.activo ? 'default' : 'secondary'}>
          {pastor.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => onEdit(pastor)}>
                <Edit className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Editar</TooltipContent>
          </Tooltip>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm">
                {pastor.activo ? <UserX className="size-4" /> : <UserCheck className="size-4" />}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {pastor.activo ? '¿Desactivar pastor?' : '¿Activar pastor?'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {pastor.activo
                    ? `${pastor.nombre} ${pastor.apellido} quedará inactivo.`
                    : `${pastor.nombre} ${pastor.apellido} será reactivado.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleToggleActive}>
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </td>
    </tr>
  )
}
















