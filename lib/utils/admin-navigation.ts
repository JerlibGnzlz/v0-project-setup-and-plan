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
  roles: ('SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'VIEWER')[]
  category?: string
}

export const adminNavigation: NavigationItem[] = [
  {
    name: 'Panel de Control',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Vista general y estadísticas',
    roles: ['ADMIN'],
    category: 'principal',
  },
  {
    name: 'Gestión de Noticias',
    href: '/admin/noticias',
    icon: Newspaper,
    description: 'Publicaciones y contenido',
    roles: ['ADMIN', 'EDITOR'],
    category: 'contenido',
  },
  {
    name: 'Galería Multimedia',
    href: '/admin/galeria',
    icon: ImageIcon,
    description: 'Archivos y recursos visuales',
    roles: ['ADMIN', 'EDITOR'],
    category: 'contenido',
  },
  {
    name: 'Estructura Organizacional',
    href: '/admin/pastores',
    icon: Users,
    description: 'Gestión de líderes y pastores',
    roles: ['ADMIN'],
    category: 'gestion',
  },
  {
    name: 'Registro de Inscripciones',
    href: '/admin/inscripciones',
    icon: UserCheck,
    description: 'Participantes y registros',
    roles: ['ADMIN'],
    category: 'gestion',
  },
  {
    name: 'Administración de Pagos',
    href: '/admin/pagos',
    icon: CreditCard,
    description: 'Transacciones y cuotas',
    roles: ['ADMIN'],
    category: 'gestion',
  },
  {
    name: 'Credenciales Pastorales',
    href: '/admin/credenciales-ministeriales',
    icon: Shield,
    description: 'Solicitudes y emisión pastoral',
    roles: ['ADMIN'],
    category: 'credenciales',
  },
  {
    name: 'Credenciales de Capellanía',
    href: '/admin/credenciales-capellania',
    icon: Shield,
    description: 'Solicitudes y emisión de capellanía',
    roles: ['ADMIN'],
    category: 'credenciales',
  },
  {
    name: 'Gestión de Sedes',
    href: '/admin/sedes',
    icon: Globe,
    description: 'Ubicaciones y oficinas',
    roles: ['ADMIN'],
    category: 'configuracion',
  },
  {
    name: 'Configuración Landing',
    href: '/admin/configuracion-landing',
    icon: Settings,
    description: 'Estadísticas y contenido',
    roles: ['ADMIN'],
    category: 'configuracion',
  },
  {
    name: 'Gestión de Usuarios',
    href: '/admin/usuarios',
    icon: UserCog,
    description: 'Crear y administrar usuarios',
    roles: ['ADMIN'],
    category: 'configuracion',
  },
  {
    name: 'Auditoría del Sistema',
    href: '/admin/auditoria',
    icon: FileText,
    description: 'Registro de actividad del sistema',
    roles: ['SUPER_ADMIN'], // Solo SUPER_ADMIN puede ver auditoría
    category: 'configuracion',
  },
]

export const categoryLabels: Record<string, string> = {
  principal: 'Principal',
  contenido: 'Contenido',
  gestion: 'Gestión',
  credenciales: 'Credenciales',
  configuracion: 'Configuración',
}

/**
 * Filtra la navegación según el rol del usuario
 * @param userRole - Rol del usuario ('SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'VIEWER')
 * @returns Array de items de navegación filtrados
 */
export function getFilteredNavigation(
  userRole: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'VIEWER' | undefined
): NavigationItem[] {
  if (!userRole) return []
  
  // SUPER_ADMIN tiene acceso a TODO (incluyendo auditoría)
  if (userRole === 'SUPER_ADMIN') {
    return adminNavigation
  }
  
  // ADMIN tiene acceso a todo EXCEPTO auditoría
  if (userRole === 'ADMIN') {
    return adminNavigation.filter(item => item.name !== 'Auditoría del Sistema')
  }
  
  // Filtrar según roles permitidos
  return adminNavigation.filter(item => item.roles.includes(userRole))
}

