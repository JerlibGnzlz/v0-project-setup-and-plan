'use client'

import { useState } from 'react'
import { Bell, Check, CheckCheck, ExternalLink, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useNotificationHistory, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from '@/lib/hooks/use-notifications'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Skeleton } from '@/components/ui/skeleton'
import { useWebSocketNotifications } from '@/lib/hooks/use-websocket-notifications'
import { useRouter } from 'next/navigation'

export function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { data: history, isLoading } = useNotificationHistory(20, 0)
  const { data: unreadCount = 0 } = useUnreadCount()
  
  // Asegurar que unreadCount siempre sea un número
  const safeUnreadCount = typeof unreadCount === 'number' ? unreadCount : 0
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  
  // Conectar a WebSocket para notificaciones en tiempo real
  useWebSocketNotifications()

  const handleMarkAsRead = async (id: string) => {
    await markAsRead.mutateAsync(id)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync()
  }

  // Manejar acción rápida desde la notificación
  const handleNotificationAction = (notification: any) => {
    // Marcar como leída
    if (!notification.read) {
      handleMarkAsRead(notification.id)
    }

    // Navegar según el tipo de notificación
    const data = notification.data || {}
    
    switch (notification.type) {
      case 'nueva_inscripcion':
        // Navegar a la página de inscripciones y cerrar el popover
        setOpen(false)
        router.push('/admin/inscripciones')
        // Scroll a la inscripción específica después de un momento
        setTimeout(() => {
          const element = document.querySelector(`[data-inscripcion-id="${data.inscripcionId}"]`)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            // Resaltar la inscripción
            element.classList.add('ring-2', 'ring-amber-500', 'ring-offset-2')
            setTimeout(() => {
              element.classList.remove('ring-2', 'ring-amber-500', 'ring-offset-2')
            }, 3000)
          }
        }, 500)
        break
      
      case 'pago_validado':
      case 'inscripcion_confirmada':
        // Navegar a la página de inscripciones
        setOpen(false)
        router.push('/admin/inscripciones')
        break
      
      case 'nuevo_pastor_registrado':
        // Navegar a la página de pastores
        setOpen(false)
        router.push('/admin/pastores')
        break
      
      default:
        // Para otros tipos, solo cerrar el popover
        setOpen(false)
    }
  }

  const unreadNotifications = history?.notifications.filter((n) => !n.read) || []
  
  // Función para obtener el texto del botón de acción según el tipo
  const getActionButtonText = (type: string) => {
    switch (type) {
      case 'nueva_inscripcion':
        return 'Ver inscripción'
      case 'pago_validado':
        return 'Ver detalles'
      case 'inscripcion_confirmada':
        return 'Ver inscripción'
      case 'nuevo_pastor_registrado':
        return 'Ver pastores'
      default:
        return 'Ver más'
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {safeUnreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {safeUnreadCount > 9 ? '9+' : safeUnreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notificaciones</h3>
          {safeUnreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-8 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          ) : history?.notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay notificaciones</p>
            </div>
          ) : (
            <div className="p-2">
              {history?.notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg mb-2 transition-all ${
                    notification.read
                      ? 'bg-muted/50'
                      : 'bg-primary/5 border border-primary/20 hover:bg-primary/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {notification.body}
                      </p>
                      
                      {/* Botón de acción rápida */}
                      {!notification.read && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs mt-2 w-full"
                          onClick={() => handleNotificationAction(notification)}
                        >
                          {getActionButtonText(notification.type)}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(notification.createdAt), 'PPp', { locale: es })}
                        </span>
                        {notification.sentVia !== 'none' && (
                          <Badge variant="outline" className="text-xs">
                            {notification.sentVia === 'push' && '📱 Push'}
                            {notification.sentVia === 'email' && '📧 Email'}
                            {notification.sentVia === 'both' && '📱📧 Ambos'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAsRead(notification.id)
                        }}
                        title="Marcar como leída"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        {history && history.total > 20 && (
          <div className="p-3 border-t text-center">
            <p className="text-xs text-muted-foreground">
              Mostrando 20 de {history.total} notificaciones
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

