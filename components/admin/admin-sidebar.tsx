'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/hooks/use-auth'
import { ChevronRight } from 'lucide-react'
import { getFilteredNavigation, categoryLabels, type NavigationItem } from '@/lib/utils/admin-navigation'
import { useMemo } from 'react'

export function AdminSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  
  // Filtrar navegación según rol del usuario
  const filteredNavigation = getFilteredNavigation(user?.rol as 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'VIEWER' | undefined)

  // Agrupar navegación por categorías
  const groupedNavigation = useMemo(() => {
    const groups: Record<string, NavigationItem[]> = {}
    
    filteredNavigation.forEach(item => {
      const category = item.category || 'otros'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(item)
    })
    
    return groups
  }, [filteredNavigation])

  const checkIsActive = (item: NavigationItem): boolean => {
    // Coincidencia exacta siempre activa
    if (pathname === item.href) {
      return true
    }
    // Para credenciales de capellanía, verificar específicamente
    if (item.href === '/admin/visor-credenciales-capellania') {
      return pathname?.startsWith('/admin/visor-credenciales-capellania') ?? false
    }
    // Para credenciales ministeriales, verificar que no sea capellanía
    if (item.href === '/admin/visor-credenciales') {
      return (pathname?.startsWith('/admin/visor-credenciales') && !pathname?.startsWith('/admin/visor-credenciales-capellania')) ?? false
    }
    // Para otras rutas, usar startsWith con '/' siguiente
    return item.href !== '/admin' && ((pathname?.startsWith(item.href + '/') || pathname === item.href) ?? false)
  }

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:z-50 lg:pt-16">
      <div className="flex flex-col flex-grow bg-white/80 dark:bg-background/80 backdrop-blur-xl border-r border-sky-200/50 dark:border-sky-500/20 overflow-y-auto">
        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-6">
          {Object.entries(groupedNavigation).map(([category, items]) => (
            <div key={category} className="space-y-1.5">
              {/* Category Header */}
              {category !== 'principal' && (
                <div className="px-3 py-2">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {categoryLabels[category] || category}
                  </h3>
                </div>
              )}
              
              {/* Category Items */}
              <div className="space-y-0.5">
                {items.map(item => {
                  const isActive = checkIsActive(item)
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-gradient-to-r from-sky-500/10 via-emerald-500/10 to-amber-500/10 dark:from-sky-500/20 dark:via-emerald-500/20 dark:to-amber-500/20 text-sky-700 dark:text-sky-300 shadow-sm border border-sky-200/50 dark:border-sky-500/30'
                          : 'text-muted-foreground hover:bg-sky-50/50 dark:hover:bg-sky-950/20 hover:text-sky-700 dark:hover:text-sky-300'
                      )}
                    >
                      <div
                        className={cn(
                          'p-1.5 rounded-md transition-all duration-200 shrink-0',
                          isActive
                            ? 'bg-gradient-to-br from-sky-500/20 to-emerald-500/20 dark:from-sky-500/30 dark:to-emerald-500/30'
                            : 'bg-sky-50/50 dark:bg-sky-950/20 group-hover:bg-sky-100/50 dark:group-hover:bg-sky-900/30'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4 transition-colors',
                            isActive
                              ? 'text-sky-600 dark:text-sky-400'
                              : 'text-muted-foreground group-hover:text-sky-600 dark:group-hover:text-sky-400'
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[13px] leading-tight">{item.name}</div>
                        <div className="text-[10px] text-muted-foreground/80 truncate leading-tight mt-0.5">
                          {item.description}
                        </div>
                      </div>
                      <ChevronRight
                        className={cn(
                          'h-3.5 w-3.5 transition-all duration-200 shrink-0',
                          isActive
                            ? 'text-sky-600 dark:text-sky-400 translate-x-0 opacity-100'
                            : 'text-muted-foreground group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:translate-x-0.5 opacity-0 group-hover:opacity-100'
                        )}
                      />
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}
