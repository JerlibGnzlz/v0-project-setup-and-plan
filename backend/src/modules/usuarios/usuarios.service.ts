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

      // Detectar si es una credencial por defecto (email termina en @ministerio-amva.org y password es Cambiar123!)
      const esCredencialPorDefecto = dto.email.endsWith('@ministerio-amva.org') && dto.password === 'Cambiar123!'

      // Crear usuario
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          nombre: dto.nombre,
          rol: dto.rol,
          avatar: defaultAvatar,
          // Guardar metadata para indicar que tiene credenciales por defecto
          // Usaremos el campo metadata si existe, o podemos agregar un campo temporal
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
  async update(id: string, dto: UpdateUsuarioDto, userId?: string, userEmail?: string, ipAddress?: string, currentUserRole?: UserRole): Promise<Omit<User, 'password'>> {
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

      // Registrar auditoría
      if (userId) {
        const changes = []
        if (dto.email && dto.email !== existingUser.email) {
          changes.push({ field: 'email', oldValue: existingUser.email, newValue: dto.email })
        }
        if (dto.nombre && dto.nombre !== existingUser.nombre) {
          changes.push({ field: 'nombre', oldValue: existingUser.nombre, newValue: dto.nombre })
        }
        if (dto.rol && dto.rol !== existingUser.rol) {
          changes.push({ field: 'rol', oldValue: existingUser.rol, newValue: dto.rol })
        }
        if (dto.activo !== undefined && dto.activo !== existingUser.activo) {
          changes.push({ field: 'activo', oldValue: existingUser.activo, newValue: dto.activo })
        }

        await this.auditService.log({
          entityType: 'USUARIO',
          entityId: id,
          action: 'UPDATE',
          userId,
          userEmail: userEmail || 'sistema',
          changes: changes.length > 0 ? changes : undefined,
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
  async remove(id: string, userId?: string, userEmail?: string, ipAddress?: string): Promise<void> {
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

    // Registrar auditoría
    if (userId) {
      await this.auditService.log({
        entityType: 'USUARIO',
        entityId: id,
        action: 'DELETE',
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
  }

  /**
   * Cambiar contraseña de usuario (desde admin)
   * Establece una contraseña temporal que el usuario deberá cambiar
   * Si el email no termina en @ministerio-amva.org, también se restablece el email a uno temporal
   * para asegurar que el usuario sea redirigido a setup-credentials
   */
  async adminResetPassword(id: string, dto: AdminResetPasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new NotFoundException('Usuario no encontrado')
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10)

    // Si el email NO termina en @ministerio-amva.org, generar un email temporal
    // basado en el nombre del usuario para asegurar que sea redirigido a setup-credentials
    let emailTemporal: string | undefined
    if (!user.email.endsWith('@ministerio-amva.org')) {
      const nombreLimpio = user.nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20)
      emailTemporal = `${nombreLimpio}@ministerio-amva.org`
      
      // Verificar que el email temporal no esté en uso por otro usuario
      const emailEnUso = await this.prisma.user.findUnique({
        where: { email: emailTemporal },
      })
      
      // Si está en uso, agregar un sufijo único
      if (emailEnUso && emailEnUso.id !== id) {
        emailTemporal = `${nombreLimpio}${Date.now().toString().slice(-6)}@ministerio-amva.org`
      }
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        ...(emailTemporal && { email: emailTemporal }),
      },
    })

    if (emailTemporal) {
      this.logger.log(`✅ Contraseña y email reseteados para usuario: ${user.email} -> ${emailTemporal}`)
      this.logger.log(`ℹ️  Email temporal establecido. El usuario será redirigido a setup-credentials al iniciar sesión.`)
    } else {
      this.logger.log(`✅ Contraseña reseteada para usuario: ${user.email}`)
      this.logger.log(`ℹ️  Usuario ${user.email} tiene credenciales por defecto. Será redirigido a setup-credentials al iniciar sesión.`)
    }
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
   * Cambiar email propio (requiere contraseña actual)
   */
  async changeEmail(userId: string, newEmail: string, password: string): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        password: true,
      },
    })

    if (!user) {
      throw new NotFoundException('Usuario no encontrado')
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw new BadRequestException('La contraseña actual es incorrecta')
    }

    // Verificar que el nuevo email no esté en uso
    const emailInUse = await this.prisma.user.findUnique({
      where: { email: newEmail },
    })

    if (emailInUse) {
      throw new ConflictException('El email ya está en uso por otro usuario')
    }

    // Actualizar email
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmail,
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

    this.logger.log(`✅ Email cambiado para usuario: ${user.id} de ${user.email} a ${newEmail}`)

    // Registrar auditoría
    await this.auditService.log({
      entityType: 'USUARIO',
      entityId: userId,
      action: 'UPDATE',
      userId,
      userEmail: user.email,
      changes: [
        { field: 'email', oldValue: user.email, newValue: newEmail },
      ],
      metadata: {
        email: updatedUser.email,
        nombre: updatedUser.nombre,
        rol: updatedUser.rol,
      },
    })

    return updatedUser
  }

  /**
   * Activar/Desactivar usuario (toggle)
   * Solo se puede desactivar usuarios EDITOR o VIEWER
   * Los ADMIN siempre deben estar activos
   */
  async toggleActivo(id: string, userId?: string, userEmail?: string, ipAddress?: string): Promise<Omit<User, 'password'>> {
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

