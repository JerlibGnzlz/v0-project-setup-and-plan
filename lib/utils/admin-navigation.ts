import {
  LayoutDashboard,
  Users,
  Newspaper,
  ImageIcon,
  CreditCard,
  UserCheck,
  Shield,
  Globe,
  Settings,
  UserCog,
  FileText,
  type LucideIcon,
} from 'lucide-react'

export interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
  description: string
  roles: ('ADMIN' | 'EDITOR' | 'VIEWER')[]
}

export const adminNavigation: NavigationItem[] = [
  {
    name: 'Panel de Control',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Vista general y estadísticas',
    roles: ['ADMIN'],
  },
  {
    name: 'Estructura Organizacional',
    href: '/admin/pastores',
    icon: Users,
    description: 'Gestión de líderes y pastores',
    roles: ['ADMIN'],
  },
  {
    name: 'Gestión de Noticias',
    href: '/admin/noticias',
    icon: Newspaper,
    description: 'Publicaciones y contenido',
    roles: ['ADMIN', 'EDITOR'],
  },
  {
    name: 'Galería Multimedia',
    href: '/admin/galeria',
    icon: ImageIcon,
    description: 'Archivos y recursos visuales',
    roles: ['ADMIN', 'EDITOR'],
  },
  {
    name: 'Registro de Inscripciones',
    href: '/admin/inscripciones',
    icon: UserCheck,
    description: 'Participantes y registros',
    roles: ['ADMIN'],
  },
  {
    name: 'Administración de Pagos',
    href: '/admin/pagos',
    icon: CreditCard,
    description: 'Transacciones y cuotas',
    roles: ['ADMIN'],
  },
  {
    name: 'Credenciales Pastorales',
    href: '/admin/credenciales-ministeriales',
    icon: Shield,
    description: 'Solicitudes y emisión pastoral',
    roles: ['ADMIN'],
  },
  {
    name: 'Credenciales de Capellanía',
    href: '/admin/credenciales-capellania',
    icon: Shield,
    description: 'Solicitudes y emisión de capellanía',
    roles: ['ADMIN'],
  },
  {
    name: 'Gestión de Sedes',
    href: '/admin/sedes',
    icon: Globe,
    description: 'Ubicaciones y oficinas',
    roles: ['ADMIN'],
  },
  {
    name: 'Configuración Landing',
    href: '/admin/configuracion-landing',
    icon: Settings,
    description: 'Estadísticas y contenido',
    roles: ['ADMIN'],
  },
  {
    name: 'Gestión de Usuarios',
    href: '/admin/usuarios',
    icon: UserCog,
    description: 'Crear y administrar usuarios',
    roles: ['ADMIN'],
  },
  {
    name: 'Auditoría',
    href: '/admin/auditoria',
    icon: FileText,
    description: 'Registro de actividad del sistema',
    roles: ['ADMIN'],
  },
]

/**
 * Filtra la navegación según el rol del usuario
 * @param userRole - Rol del usuario ('ADMIN' | 'EDITOR' | 'VIEWER')
 * @returns Array de items de navegación filtrados
 */
export function getFilteredNavigation(
  userRole: 'ADMIN' | 'EDITOR' | 'VIEWER' | undefined
): NavigationItem[] {
  if (!userRole) return []
  
  // ADMIN tiene acceso a todo
  if (userRole === 'ADMIN') {
    return adminNavigation
  }
  
  // Filtrar según roles permitidos
  return adminNavigation.filter(item => item.roles.includes(userRole))
}

