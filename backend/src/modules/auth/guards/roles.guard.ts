import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator'
import { AuthenticatedRequest } from '../types/request.types'

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name)

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<('ADMIN' | 'EDITOR' | 'VIEWER')[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    )

    // Si no hay roles requeridos, permitir acceso (solo requiere autenticación)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const user = request.user

    if (!user) {
      this.logger.warn('❌ RolesGuard: Usuario no autenticado')
      throw new ForbiddenException('Usuario no autenticado')
    }

    const userRole = user.rol

    // ADMIN tiene acceso a todo
    if (userRole === 'ADMIN') {
      this.logger.debug(`✅ RolesGuard: ADMIN tiene acceso completo`)
      return true
    }

    // Verificar si el rol del usuario está en los roles requeridos
    const hasRole = requiredRoles.includes(userRole)

    if (!hasRole) {
      this.logger.warn(`❌ RolesGuard: Usuario ${user.email} con rol ${userRole} no tiene acceso. Roles requeridos: ${requiredRoles.join(', ')}`)
      throw new ForbiddenException(`No tienes permisos para acceder a este recurso. Rol requerido: ${requiredRoles.join(' o ')}`)
    }

    this.logger.debug(`✅ RolesGuard: Usuario ${user.email} con rol ${userRole} tiene acceso`)
    return true
  }
}

