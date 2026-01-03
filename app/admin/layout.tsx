'use client'

import type React from 'react'
import {
  LogOut,
  Menu,
  UserCircle,
  Lock,
  Shield,
  Mail,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChangePasswordDialog } from '@/components/admin/change-password-dialog'
import { ChangeEmailDialog } from '@/components/admin/change-email-dialog'
import { getFilteredNavigation } from '@/lib/utils/admin-navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/theme-toggle'
import { Toaster } from '@/components/ui/sonner'
import { QueryProvider } from '@/lib/providers/query-provider'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { NotificationsBell } from '@/components/admin/notifications-bell'
import { RouteGuard } from '@/components/admin/route-guard'

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated, isHydrated, checkAuth } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false)

  // Páginas públicas que no requieren autenticación
  const publicPaths = ['/admin/login', '/admin/forgot-password', '/admin/reset-password', '/admin/setup-credentials']
  const isPublicPath = publicPaths.some(path => pathname?.startsWith(path))

  // Estado para rastrear si ya verificamos las credenciales por defecto
  const [hasCheckedDefaultCredentials, setHasCheckedDefaultCredentials] = useState(false)

  // Verificar autenticación al montar
  useEffect(() => {
    const verifyAuth = async () => {
      // Si ya está autenticado e hidratado, solo necesitamos verificar credenciales por defecto
      if (isHydrated && isAuthenticated && user) {
        // Si ya tenemos el usuario, solo marcamos que podemos verificar credenciales
        // No necesitamos hacer checkAuth de nuevo si ya tenemos datos
        setHasCheckedDefaultCredentials(true)
        return
      }

      // Si no está hidratado, hacer checkAuth para inicializar el estado
      if (!isHydrated) {
        await checkAuth()
        setHasCheckedDefaultCredentials(true)
        return
      }

      // Si está hidratado pero no autenticado, verificar si hay token en storage
      // Si hay token, hacer checkAuth para obtener datos actualizados
      if (isHydrated && !isAuthenticated) {
        const hasToken = typeof window !== 'undefined' && 
          (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token'))
        
        if (hasToken) {
          await checkAuth()
          setHasCheckedDefaultCredentials(true)
        } else {
          // No hay token, no necesitamos verificar credenciales por defecto
          setHasCheckedDefaultCredentials(true)
        }
      }
    }
    
    verifyAuth()
  }, [checkAuth, isHydrated, isAuthenticated, user])

  useEffect(() => {
    // Solo verificar credenciales por defecto después de que checkAuth haya completado
    // Si el usuario está autenticado y tiene credenciales por defecto, redirigir a setup
    // IMPORTANTE: Solo verificar si NO estamos en la página de login (para evitar loops)
    if (
      hasCheckedDefaultCredentials &&
      isHydrated &&
      isAuthenticated &&
      user &&
      pathname !== '/admin/setup-credentials' &&
      pathname !== '/admin/login' &&
      !isPublicPath
    ) {
      const tieneCredencialesPorDefecto = user.email?.endsWith('@ministerio-amva.org')
      if (tieneCredencialesPorDefecto) {
        router.push('/admin/setup-credentials')
        return
      }
    }

    // Solo redirigir después de que se haya verificado la autenticación
    if (isHydrated && !isAuthenticated && !isPublicPath) {
      // Verificar también en storage como respaldo
      const storedToken =
        typeof window !== 'undefined'
          ? localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
          : null

      if (!storedToken) {
        // Usar window.location.href para forzar recarga completa en producción
        window.location.href = '/admin/login'
      } else {
        // Si hay token en storage pero el estado no está actualizado, forzar verificación
        // Pero solo una vez para evitar loops
        const timeoutId = setTimeout(() => {
          checkAuth().catch((error: unknown) => {
            console.error('[AdminLayout] Error en checkAuth:', error)
            // Si falla la verificación, limpiar y redirigir
            window.location.href = '/admin/login'
          })
        }, 100)
        return () => clearTimeout(timeoutId)
      }
    }
  }, [isAuthenticated, isHydrated, isPublicPath, pathname, checkAuth, hasCheckedDefaultCredentials, user, router])

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  // Páginas públicas: renderizar sin verificar autenticación
  if (isPublicPath) {
    return <>{children}</>
  }

  // Mostrar loading mientras Zustand hidrata el estado (con timeout de seguridad)
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-sky-50/30 dark:to-sky-950/10">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500 rounded-full blur-xl opacity-30 animate-pulse" />
          <div className="relative animate-spin rounded-full h-10 w-10 border-2 border-transparent border-t-sky-500 border-r-emerald-500 border-b-amber-500"></div>
        </div>
      </div>
    )
  }

  // Si no está autenticado después de hidratar, no mostrar nada (se redirigirá)
  if (!isAuthenticated) {
    return null
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-sky-50/30 dark:to-sky-950/10">
      {/* Desktop Header */}
      <header className="hidden lg:block sticky top-0 z-40 border-b border-sky-200/50 dark:border-sky-500/20 bg-white/80 dark:bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-background/60">
        <div className="h-1 bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500" />
        <div className="flex h-16 items-center justify-between px-6">
          {/* Logo */}
          <Link href="/admin" className="flex items-center group">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-sky-500/20 via-emerald-500/20 to-amber-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <Image
                src="/amvadigital.png"
                alt="Logo AMVA"
                width={80}
                height={80}
                className="relative w-16 h-16 sm:w-20 sm:h-20 object-contain"
              />
            </div>
          </Link>

          {/* User section */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{user?.nombre || 'Admin'}</p>
              <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
            </div>
            {/* Notifications Bell */}
            <NotificationsBell />
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative group">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.nombre || 'Admin'}
                      className="size-10 rounded-full object-cover ring-2 ring-emerald-500/30 hover:ring-emerald-500/50 transition-all cursor-pointer"
                    />
                  ) : (
                    <div className="size-10 rounded-full bg-gradient-to-br from-sky-500 via-emerald-500 to-amber-500 flex items-center justify-center ring-2 ring-emerald-500/30 hover:ring-emerald-500/50 transition-all cursor-pointer">
                      <Shield className="size-5 text-white drop-shadow-sm" />
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.nombre || 'Admin'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user?.rol === 'ADMIN' && (
                  <>
                    <DropdownMenuItem onClick={() => setIsChangeEmailOpen(true)}>
                      <Mail className="size-4 mr-2" />
                      Cambiar Email
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsChangePasswordOpen(true)}>
                      <Lock className="size-4 mr-2" />
                      Cambiar Contraseña
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="size-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-sky-200/50 dark:border-sky-500/20 bg-white/80 dark:bg-background/80 backdrop-blur-xl px-4 lg:hidden">
        <div className="h-0.5 absolute top-0 left-0 right-0 bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500" />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="size-5" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-72 p-0 border-r-sky-200/50 dark:border-r-sky-500/20"
          >
            <div className="flex h-full flex-col">
              {/* Logo */}
              <div className="flex h-20 items-center justify-center border-b border-sky-200/50 dark:border-sky-500/20 px-6 bg-gradient-to-r from-sky-50/50 to-emerald-50/50 dark:from-sky-950/30 dark:to-emerald-950/30">
                <Image
                  src="/amvadigital.png"
                  alt="Logo AMVA"
                  width={120}
                  height={120}
                  className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                />
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {getFilteredNavigation(user?.rol as 'ADMIN' | 'EDITOR' | 'VIEWER' | undefined).map(item => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/admin' && pathname?.startsWith(item.href))
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-sky-500/10 via-emerald-500/10 to-amber-500/10 dark:from-sky-500/20 dark:via-emerald-500/20 dark:to-amber-500/20 text-sky-700 dark:text-sky-300 shadow-sm border border-sky-200/50 dark:border-sky-500/30'
                          : 'text-muted-foreground hover:bg-sky-50/50 dark:hover:bg-sky-950/20 hover:text-sky-700 dark:hover:text-sky-300'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-br from-sky-500/20 to-emerald-500/20 dark:from-sky-500/30 dark:to-emerald-500/30'
                            : 'bg-sky-50/50 dark:bg-sky-950/20 group-hover:bg-sky-100/50 dark:group-hover:bg-sky-900/30'
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 transition-colors ${
                            isActive
                              ? 'text-sky-600 dark:text-sky-400'
                              : 'text-muted-foreground group-hover:text-sky-600 dark:group-hover:text-sky-400'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </nav>

              {/* User Section */}
              <div className="px-4 py-4 border-t border-sky-200/50 dark:border-sky-500/20 bg-gradient-to-r from-sky-50/30 to-emerald-50/30 dark:from-sky-950/20 dark:to-emerald-950/20">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 dark:bg-background/50 backdrop-blur-sm border border-sky-200/30 dark:border-sky-500/20 mb-3">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.nombre || 'Admin'}
                      className="size-10 rounded-full object-cover ring-2 ring-emerald-500/30"
                    />
                  ) : (
                    <div className="size-10 rounded-full bg-gradient-to-br from-sky-500 via-emerald-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                      {(user?.nombre || 'A').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user?.nombre || 'Admin'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo visible en el header móvil */}
        <Link href="/admin" className="flex items-center">
          <Image
            src="/amvadigital.png"
            alt="Logo AMVA"
            width={64}
            height={64}
            className="w-16 h-16 object-contain"
          />
        </Link>

        {/* User info and actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* User Menu Mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button>
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.nombre || 'Admin'}
                    className="size-9 rounded-full object-cover ring-2 ring-emerald-500/30"
                  />
                ) : (
                  <div className="size-9 rounded-full bg-gradient-to-br from-sky-500 via-emerald-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs">
                    {(user?.nombre || 'A').charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.nombre || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user?.rol === 'ADMIN' && (
                <>
                  <DropdownMenuItem onClick={() => setIsChangeEmailOpen(true)}>
                    <Mail className="size-4 mr-2" />
                    Cambiar Email
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsChangePasswordOpen(true)}>
                    <Lock className="size-4 mr-2" />
                    Cambiar Contraseña
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="size-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
        </div>
      </header>

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="lg:pl-72">
        <div className="container mx-auto p-6 lg:p-8 max-w-7xl">
          <RouteGuard>{children}</RouteGuard>
        </div>
      </main>

      <Toaster position="top-right" richColors closeButton />

      {/* Change Password Dialog */}
      <ChangePasswordDialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen} />
      
      {/* Change Email Dialog */}
      {user && (
        <ChangeEmailDialog
          open={isChangeEmailOpen}
          onOpenChange={setIsChangeEmailOpen}
          currentEmail={user.email}
        />
      )}
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </QueryProvider>
  )
}
