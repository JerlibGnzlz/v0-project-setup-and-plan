'use client'

import type React from "react"
import { LogOut, Menu } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { Toaster } from "@/components/ui/sonner"
import { QueryProvider } from "@/lib/providers/query-provider"
import { useAuth } from "@/lib/hooks/use-auth"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout, isAuthenticated, isHydrated, checkAuth } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Páginas públicas que no requieren autenticación
  const publicPaths = ['/admin/login']
  const isPublicPath = publicPaths.some(path => pathname?.startsWith(path))

  // Verificar autenticación al montar
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    // Solo redirigir después de que se haya verificado la autenticación
    if (isHydrated && !isAuthenticated && !isPublicPath) {
      router.push('/admin/login')
    }
  }, [isAuthenticated, isHydrated, isPublicPath, router])

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  // Páginas públicas: renderizar sin verificar autenticación
  if (isPublicPath) {
    return <>{children}</>
  }

  // Mostrar loading mientras Zustand hidrata el estado
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
                width={70}
                height={70}
                className="relative w-16 h-16 object-contain"
              />
            </div>
            <div>
              <h2 className="font-semibold bg-gradient-to-r from-sky-600 via-emerald-600 to-amber-600 dark:from-sky-400 dark:via-emerald-400 dark:to-amber-400 bg-clip-text text-transparent">
                Asociación Misionera Vida Abundante
              </h2>
              <p className="text-xs text-muted-foreground">Panel Administrativo</p>
            </div>
          </Link>

          {/* User section */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{user?.nombre || 'Admin'}</p>
              <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
            </div>
            {/* Avatar */}
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
          <SheetContent side="left" className="w-64 p-0 border-r-sky-200/50 dark:border-r-sky-500/20">
            <div className="flex h-full flex-col">
              {/* Logo */}
              <div className="flex h-16 items-center gap-3 border-b border-sky-200/50 dark:border-sky-500/20 px-6 bg-gradient-to-r from-sky-50/50 to-emerald-50/50 dark:from-sky-950/30 dark:to-emerald-950/30">
                <Image
                  src="/mundo.png"
                  alt="Logo AMVA"
                  width={56}
                  height={56}
                  className="w-14 h-14 object-contain"
                />
                <div>
                  <h2 className="font-semibold bg-gradient-to-r from-sky-600 to-emerald-600 dark:from-sky-400 dark:to-emerald-400 bg-clip-text text-transparent">A.M.V.A</h2>
                  <p className="text-xs text-muted-foreground">Panel Administrativo</p>
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
          <h2 className="font-semibold bg-gradient-to-r from-sky-600 to-emerald-600 dark:from-sky-400 dark:to-emerald-400 bg-clip-text text-transparent">A.M.V.A</h2>
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

      {/* Main Content */}
      <main className="container mx-auto p-6 lg:p-8 max-w-7xl">{children}</main>

      <Toaster position="top-right" richColors closeButton />
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </QueryProvider>
  )
}
