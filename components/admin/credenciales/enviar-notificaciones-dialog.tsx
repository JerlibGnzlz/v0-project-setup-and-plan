'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Bell, Loader2 } from 'lucide-react'
import { notificationsApi } from '@/lib/api/notifications'

interface EnviarNotificacionesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EnviarNotificacionesDialog({
  open,
  onOpenChange,
}: EnviarNotificacionesDialogProps) {
  const [tipo, setTipo] = useState<'vencidas' | 'por_vencer' | 'ambas'>('ambas')
  const [isLoading, setIsLoading] = useState(false)
  const [resultado, setResultado] = useState<{
    enviadas: number
    errores: number
    detalles: Array<{ email: string; nombre: string; estado: string; exito: boolean; error?: string }>
  } | null>(null)

  const handleEnviar = async () => {
    setIsLoading(true)
    setResultado(null)

    try {
      const resultado = await notificationsApi.sendPushNotificationsCredencialesVencidas(tipo)
      setResultado(resultado)

      if (resultado.enviadas > 0) {
        toast.success('Notificaciones enviadas', {
          description: `Se enviaron ${resultado.enviadas} notificaciones push exitosamente${resultado.errores > 0 ? ` (${resultado.errores} errores)` : ''}`,
        })
      } else {
        toast.warning('No se enviaron notificaciones', {
          description: resultado.errores > 0 
            ? `No se encontraron usuarios con tokens de dispositivo activos para credenciales ${tipo === 'vencidas' ? 'vencidas' : tipo === 'por_vencer' ? 'por vencer' : 'vencidas o por vencer'}`
            : 'No se encontraron usuarios con credenciales en ese estado',
        })
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast.error('Error al enviar notificaciones', {
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setResultado(null)
      setTipo('ambas')
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Enviar Notificaciones Push
          </AlertDialogTitle>
          <AlertDialogDescription>
            Envía notificaciones push a usuarios con credenciales vencidas o por vencer.
            Solo se enviarán a usuarios que tengan la app móvil instalada y tokens de dispositivo activos.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de credenciales</label>
            <Select value={tipo} onValueChange={(value) => setTipo(value as typeof tipo)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vencidas">Vencidas</SelectItem>
                <SelectItem value="por_vencer">Por vencer (próximos 30 días)</SelectItem>
                <SelectItem value="ambas">Vencidas y por vencer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {resultado && (
            <div className="space-y-2 rounded-lg border p-4 bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Resultado:</span>
                <div className="flex gap-2">
                  <span className="text-sm text-green-600 dark:text-green-400">
                    ✅ {resultado.enviadas} enviadas
                  </span>
                  {resultado.errores > 0 && (
                    <span className="text-sm text-red-600 dark:text-red-400">
                      ❌ {resultado.errores} errores
                    </span>
                  )}
                </div>
              </div>

              {resultado.detalles.length > 0 && (
                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                  <p className="text-xs font-medium text-muted-foreground">Detalles:</p>
                  {resultado.detalles.map((detalle, index) => (
                    <div
                      key={index}
                      className={`text-xs p-2 rounded ${
                        detalle.exito
                          ? 'bg-green-50 dark:bg-green-950/20'
                          : 'bg-red-50 dark:bg-red-950/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{detalle.nombre}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          detalle.exito
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {detalle.exito ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {detalle.email} - {detalle.estado}
                      </div>
                      {detalle.error && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {detalle.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleEnviar} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Bell className="mr-2 h-4 w-4" />
                Enviar Notificaciones
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

