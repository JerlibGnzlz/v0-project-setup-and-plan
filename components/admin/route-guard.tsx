'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { getFilteredNavigation } from '@/lib/utils/admin-navigation'

interface RouteGuardProps {
  children: React.ReactNode
  requiredRole?: 'ADMIN' | 'EDITOR' | 'VIEWER'
}

/**
 * Componente que protege rutas según el rol del usuario
 * Redirige al dashboard si el usuario no tiene acceso
 */
export function RouteGuard({ children, requiredRole }: RouteGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isHydrated } = useAuth()

  useEffect(() => {
    // Esperar a que se hidrate el estado de autenticación
    if (!isHydrated) return

    // Si no está autenticado, ya será redirigido por el layout
    if (!isAuthenticated || !user) return

    // Si hay un rol requerido específico, verificar
    if (requiredRole) {
      if (user.rol !== requiredRole && user.rol !== 'ADMIN') {
        router.push('/admin')
        return
      }
    }

    // Verificar si la ruta actual está permitida para el rol del usuario
    const allowedRoutes = getFilteredNavigation(user.rol as 'ADMIN' | 'EDITOR' | 'VIEWER' | undefined)
    const isRouteAllowed = allowedRoutes.some(
      item => pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href + '/'))
    )

    // Permitir acceso al dashboard siempre
    if (pathname === '/admin') {
      return
    }

    // Si la ruta no está permitida, redirigir al dashboard
    if (!isRouteAllowed) {
      router.push('/admin')
    }
  }, [pathname, user, isAuthenticated, isHydrated, router, requiredRole])

  // Si no está hidratado o no está autenticado, no renderizar
  if (!isHydrated || !isAuthenticated || !user) {
    return null
  }

  // Verificar acceso
  const allowedRoutes = getFilteredNavigation(user.rol as 'ADMIN' | 'EDITOR' | 'VIEWER' | undefined)
  const isRouteAllowed =
    pathname === '/admin' ||
    allowedRoutes.some(
      item => pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href + '/'))
    )

  if (!isRouteAllowed) {
    return null
  }

  return <>{children}</>
}

