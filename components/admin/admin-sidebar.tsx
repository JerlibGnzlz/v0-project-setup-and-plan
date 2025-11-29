'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Newspaper,
  ImageIcon,
  CreditCard,
  UserCheck,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Vista general del sistema',
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
    name: 'Inscripciones',
    href: '/admin/inscripciones',
    icon: UserCheck,
    description: 'Ver inscripciones',
  },
  {
    name: 'Pagos',
    href: '/admin/pagos',
    icon: CreditCard,
    description: 'Gestionar pagos',
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:z-50 lg:pt-16">
      <div className="flex flex-col flex-grow bg-white/80 dark:bg-background/80 backdrop-blur-xl border-r border-sky-200/50 dark:border-sky-500/20 overflow-y-auto">
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))
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
                  <div className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </div>
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

        {/* User Section */}
        <div className="px-4 py-4 border-t border-sky-200/50 dark:border-sky-500/20 bg-gradient-to-r from-sky-50/30 to-emerald-50/30 dark:from-sky-950/20 dark:to-emerald-950/20">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 dark:bg-background/50 backdrop-blur-sm border border-sky-200/30 dark:border-sky-500/20">
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
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || ''}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full mt-3 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  )
}

