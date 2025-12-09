'use client'

import type React from 'react'
import {
  LogOut,
  Menu,
  LayoutDashboard,
  Users,
  Newspaper,
  ImageIcon,
  CreditCard,
  UserCircle,
  Shield,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/theme-toggle'
import { Toaster } from '@/components/ui/sonner'
import { QueryProvider } from '@/lib/providers/query-provider'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { NotificationsBell } from '@/components/admin/notifications-bell'

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated, isHydrated, checkAuth } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Páginas públicas que no requieren autenticación
  const publicPaths = ['/admin/login']
  const isPublicPath = publicPaths.some(path => pathname?.startsWith(path))

  // Verificar autenticación al montar (solo si no está hidratado)
  useEffect(() => {
    if (!isHydrated) {
      const verifyAuth = async () => {
        await checkAuth()
      }
      verifyAuth()
    }
  }, [checkAuth, isHydrated])

  useEffect(() => {
    // Solo redirigir después de que se haya verificado la autenticación
    if (isHydrated && !isAuthenticated && !isPublicPath) {
      // Verificar también en storage como respaldo
      const storedToken =
        typeof window !== 'undefined'
          ? localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
          : null

      if (!storedToken) {
        router.push('/admin/login')
      } else {
        // Si hay token en storage pero el estado no está actualizado, forzar verificación
        // Pero solo una vez para evitar loops
        const timeoutId = setTimeout(() => {
          checkAuth()
        }, 100)
        return () => clearTimeout(timeoutId)
      }
    }
  }, [isAuthenticated, isHydrated, isPublicPath, router, pathname, checkAuth])

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
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-sky-500/20 via-emerald-500/20 to-amber-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <Image
                src="/mundo.png"
                alt="Logo AMVA"
                width={48}
                height={48}
                className="relative w-12 h-12 object-contain"
              />
            </div>
            <div>
              <h2 className="font-semibold text-base bg-gradient-to-r from-sky-600 via-emerald-600 to-amber-600 dark:from-sky-400 dark:via-emerald-400 dark:to-amber-400 bg-clip-text text-transparent">
                AMVA Digital
              </h2>
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
            {/* Avatar con icono de Lucide */}
            <div className="relative group">
              <div className="size-10 rounded-full bg-gradient-to-br from-sky-500 via-emerald-500 to-amber-500 flex items-center justify-center ring-2 ring-emerald-500/30 hover:ring-emerald-500/50 transition-all">
                <Shield className="size-5 text-white drop-shadow-sm" />
              </div>
              {/* Tooltip en hover */}
              <div className="absolute right-0 top-full mt-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {user?.nombre || 'Administrador'}
              </div>
            </div>
            <ThemeToggle />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLogout}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
            >
              <LogOut className="size-4" />
            </Button>
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
              <div className="flex h-16 items-center gap-3 border-b border-sky-200/50 dark:border-sky-500/20 px-6 bg-gradient-to-r from-sky-50/50 to-emerald-50/50 dark:from-sky-950/30 dark:to-emerald-950/30">
                <Image
                  src="/mundo.png"
                  alt="Logo AMVA"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <h2 className="font-semibold text-sm bg-gradient-to-r from-sky-600 via-emerald-600 to-amber-600 dark:from-sky-400 dark:via-emerald-400 dark:to-amber-400 bg-clip-text text-transparent">
                    AMVA Digital
                  </h2>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {[
                  {
                    name: 'Dashboard',
                    href: '/admin',
                    icon: LayoutDashboard,
                    description: 'Vista general',
                  },
                  {
                    name: 'Estructura Organizacional',
                    href: '/admin/pastores',
                    icon: Users,
                    description: 'Gestionar pastores',
                  },
                  {
                    name: 'Noticias',
                    href: '/admin/noticias',
                    icon: Newspaper,
                    description: 'Gestionar noticias',
                  },
                  {
                    name: 'Multimedia',
                    href: '/admin/galeria',
                    icon: ImageIcon,
                    description: 'Gestionar multimedia',
                  },
                  {
                    name: 'Pagos',
                    href: '/admin/pagos',
                    icon: CreditCard,
                    description: 'Gestionar pagos',
                  },
                ].map(item => {
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
        <Link href="/admin" className="flex items-center gap-3">
          <Image
            src="/mundo.png"
            alt="Logo AMVA"
            width={56}
            height={56}
            className="w-14 h-14 object-contain"
          />
          <h2 className="font-semibold bg-gradient-to-r from-sky-600 to-emerald-600 dark:from-sky-400 dark:to-emerald-400 bg-clip-text text-transparent">
            A.M.V.A
          </h2>
        </Link>

        {/* User info and actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Avatar */}
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
          <ThemeToggle />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleLogout}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="lg:pl-72">
        <div className="container mx-auto p-6 lg:p-8 max-w-7xl">{children}</div>
      </main>

      <Toaster position="top-right" richColors closeButton />
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
