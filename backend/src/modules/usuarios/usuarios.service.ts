import { Injectable, NotFoundException, BadRequestException, Logger, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { AuditService } from '../../common/services/audit.service'
import { CreateUsuarioDto, UpdateUsuarioDto, ChangePasswordDto, AdminResetPasswordDto } from './dto/usuario.dto'
import { User, UserRole } from '@prisma/client'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsuariosService {
  private readonly logger = new Logger(UsuariosService.name)

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
  ) {}

  /**
   * Crear nuevo usuario
   * Solo ADMIN puede crear usuarios
   */
  async create(dto: CreateUsuarioDto, userId?: string, userEmail?: string, ipAddress?: string): Promise<Omit<User, 'password'>> {
    try {
      // Verificar si el email ya existe
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      })

      if (existingUser) {
        throw new ConflictException('El email ya está registrado')
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(dto.password, 10)

      // Generar avatar por defecto
      const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(dto.nombre)}&background=10b981&color=fff&size=128&bold=true`

      // Crear usuario
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          nombre: dto.nombre,
          rol: dto.rol,
          avatar: defaultAvatar,
        },
        select: {
          id: true,
          email: true,
          nombre: true,
          rol: true,
          avatar: true,
          activo: true,
          ultimoLogin: true,
          loginCount: true,
          ultimaIp: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      this.logger.log(`✅ Usuario creado: ${user.email} con rol ${user.rol}`)

      // Registrar auditoría
      if (userId) {
        await this.auditService.log({
          entityType: 'USUARIO',
          entityId: user.id,
          action: 'CREATE',
          userId,
          userEmail: userEmail || 'sistema',
          metadata: {
            email: user.email,
            nombre: user.nombre,
            rol: user.rol,
          },
          ipAddress: ipAddress || undefined,
        })
      }

      return user
    } catch (error: unknown) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error
      }

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error al crear usuario: ${errorMessage}`)
      throw new BadRequestException(`Error al crear usuario: ${errorMessage}`)
    }
  }

  /**
   * Obtener todos los usuarios (sin contraseñas)
   */
  async findAll(): Promise<Omit<User, 'password'>[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        avatar: true,
        activo: true,
        ultimoLogin: true,
        loginCount: true,
        ultimaIp: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  /**
   * Obtener usuario por ID
   */
  async findOne(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        avatar: true,
        activo: true,
        ultimoLogin: true,
        loginCount: true,
        ultimaIp: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new NotFoundException('Usuario no encontrado')
    }

    return user
  }

  /**
   * Actualizar usuario
   */
  async update(id: string, dto: UpdateUsuarioDto, userId?: string, userEmail?: string, ipAddress?: string): Promise<Omit<User, 'password'>> {
    try {
      // Verificar si el usuario existe
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      })

      if (!existingUser) {
        throw new NotFoundException('Usuario no encontrado')
      }

      // Si se está cambiando el email, verificar que no esté en uso
      if (dto.email && dto.email !== existingUser.email) {
        const emailInUse = await this.prisma.user.findUnique({
          where: { email: dto.email },
        })

        if (emailInUse) {
          throw new ConflictException('El email ya está en uso por otro usuario')
        }
      }

      // Actualizar usuario
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...(dto.email && { email: dto.email }),
          ...(dto.nombre && { nombre: dto.nombre }),
          ...(dto.rol && { rol: dto.rol }),
          ...(dto.avatar !== undefined && { avatar: dto.avatar }),
          ...(dto.activo !== undefined && { activo: dto.activo }),
        },
        select: {
          id: true,
          email: true,
          nombre: true,
          rol: true,
          avatar: true,
          activo: true,
          ultimoLogin: true,
          loginCount: true,
          ultimaIp: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      this.logger.log(`✅ Usuario actualizado: ${user.email}`)

      return user
    } catch (error: unknown) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error
      }

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error al actualizar usuario: ${errorMessage}`)
      throw new BadRequestException(`Error al actualizar usuario: ${errorMessage}`)
    }
  }

  /**
   * Eliminar usuario
   */
  async remove(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new NotFoundException('Usuario no encontrado')
    }

    // No permitir eliminar el último ADMIN
    if (user.rol === 'ADMIN') {
      const adminCount = await this.prisma.user.count({
        where: { rol: 'ADMIN' },
      })

      if (adminCount === 1) {
        throw new BadRequestException('No se puede eliminar el último administrador')
      }
    }

    await this.prisma.user.delete({
      where: { id },
    })

    this.logger.log(`✅ Usuario eliminado: ${user.email}`)
  }

  /**
   * Cambiar contraseña de usuario (desde admin)
   */
  async adminResetPassword(id: string, dto: AdminResetPasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new NotFoundException('Usuario no encontrado')
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10)

    await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    })

    this.logger.log(`✅ Contraseña reseteada para usuario: ${user.email}`)
  }

  /**
   * Cambiar contraseña propia (requiere contraseña actual)
   */
  async changePassword(userId: string, currentPassword: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    })

    if (!user) {
      throw new NotFoundException('Usuario no encontrado')
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      throw new BadRequestException('La contraseña actual es incorrecta')
    }

    // Hash de nueva contraseña
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10)

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    })

    this.logger.log(`✅ Contraseña cambiada para usuario: ${user.id}`)
  }

  /**
   * Activar/Desactivar usuario (toggle)
   * Solo se puede desactivar usuarios EDITOR o VIEWER
   * Los ADMIN siempre deben estar activos
   */
  async toggleActivo(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new NotFoundException('Usuario no encontrado')
    }

    // No permitir desactivar ADMIN
    if (user.rol === 'ADMIN') {
      throw new BadRequestException('No se puede desactivar un usuario administrador')
    }

    // Toggle del estado activo
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        activo: !user.activo,
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        avatar: true,
        activo: true,
        ultimoLogin: true,
        loginCount: true,
        ultimaIp: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    this.logger.log(
      `✅ Usuario ${updatedUser.activo ? 'activado' : 'desactivado'}: ${updatedUser.email}`
    )

    // Registrar auditoría
    if (userId) {
      await this.auditService.log({
        entityType: 'USUARIO',
        entityId: id,
        action: updatedUser.activo ? 'ACTIVAR' : 'DESACTIVAR',
        userId,
        userEmail: userEmail || 'sistema',
        changes: [
          { field: 'activo', oldValue: !updatedUser.activo, newValue: updatedUser.activo },
        ],
        metadata: {
          email: updatedUser.email,
          nombre: updatedUser.nombre,
          rol: updatedUser.rol,
        },
        ipAddress: ipAddress || undefined,
      })
    }

    return updatedUser
  }
}

