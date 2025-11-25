'use client'

import type React from "react"
import { LogOut } from "lucide-react"
import Link from "next/link"
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
  const publicPaths = ['/admin/login', '/admin/forgot-password', '/admin/reset-password']
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Si no está autenticado después de hidratar, no mostrar nada (se redirigirá)
  if (!isAuthenticated) {
    return null
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Header */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Logo */}
          <Link href="/admin" className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-gradient-to-br from-primary via-accent to-secondary" />
            <div>
              <h2 className="font-semibold text-foreground">Vida Abundante</h2>
              <p className="text-xs text-muted-foreground">Panel Administrativo</p>
            </div>
          </Link>

          {/* User section */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <p className="text-sm font-medium">{user?.nombre || 'Admin'}</p>
              <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
            </div>
            <div className="size-8 rounded-full bg-primary" />
            <ThemeToggle />
            <Button size="sm" variant="ghost" onClick={handleLogout}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              {/* Menu icon will remain as it is part of the mobile layout */}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-full flex-col">
              {/* Logo */}
              <div className="flex h-16 items-center gap-2 border-b px-6">
                <div className="size-8 rounded-lg bg-gradient-to-br from-primary via-accent to-secondary" />
                <div>
                  <h2 className="font-semibold">Vida Abundante</h2>
                  <p className="text-xs text-muted-foreground">Panel Administrativo</p>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-primary via-accent to-secondary" />
          <h2 className="font-semibold">Vida Abundante</h2>
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
