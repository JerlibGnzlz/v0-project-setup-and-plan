'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/hooks/use-auth'
import { ChevronRight } from 'lucide-react'
import { getFilteredNavigation } from '@/lib/utils/admin-navigation'

export function AdminSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  
  // Filtrar navegación según rol del usuario
  const filteredNavigation = getFilteredNavigation(user?.rol as 'ADMIN' | 'EDITOR' | 'VIEWER' | undefined)

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:z-50 lg:pt-16">
      <div className="flex flex-col flex-grow bg-white/80 dark:bg-background/80 backdrop-blur-xl border-r border-sky-200/50 dark:border-sky-500/20 overflow-y-auto">
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {filteredNavigation.map(item => {
            let isActive = false
            
            // Coincidencia exacta siempre activa
            if (pathname === item.href) {
              isActive = true
            }
            // Para credenciales de capellanía, verificar específicamente
            else if (item.href === '/admin/visor-credenciales-capellania') {
              isActive = pathname?.startsWith('/admin/visor-credenciales-capellania') ?? false
            }
            // Para credenciales ministeriales, verificar que no sea capellanía
            else if (item.href === '/admin/visor-credenciales') {
              isActive = (pathname?.startsWith('/admin/visor-credenciales') && !pathname?.startsWith('/admin/visor-credenciales-capellania')) ?? false
            }
            // Para otras rutas, usar startsWith con '/' siguiente
            else {
              isActive = item.href !== '/admin' && ((pathname?.startsWith(item.href + '/') || pathname === item.href) ?? false)
            }
            
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-sky-500/10 via-emerald-500/10 to-amber-500/10 dark:from-sky-500/20 dark:via-emerald-500/20 dark:to-amber-500/20 text-sky-700 dark:text-sky-300 shadow-sm border border-sky-200/50 dark:border-sky-500/30'
                    : 'text-muted-foreground hover:bg-sky-50/50 dark:hover:bg-sky-950/20 hover:text-sky-700 dark:hover:text-sky-300'
                )}
              >
                <div
                  className={cn(
                    'p-2 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-br from-sky-500/20 to-emerald-500/20 dark:from-sky-500/30 dark:to-emerald-500/30'
                      : 'bg-sky-50/50 dark:bg-sky-950/20 group-hover:bg-sky-100/50 dark:group-hover:bg-sky-900/30'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-colors',
                      isActive
                        ? 'text-sky-600 dark:text-sky-400'
                        : 'text-muted-foreground group-hover:text-sky-600 dark:group-hover:text-sky-400'
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                </div>
                <ChevronRight
                  className={cn(
                    'h-4 w-4 transition-all duration-200',
                    isActive
                      ? 'text-sky-600 dark:text-sky-400 translate-x-0'
                      : 'text-muted-foreground group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:translate-x-1 opacity-0 group-hover:opacity-100'
                  )}
                />
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
