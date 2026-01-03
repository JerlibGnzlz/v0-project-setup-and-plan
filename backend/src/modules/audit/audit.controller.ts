import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { AuditService } from '../../common/services/audit.service'
import { PrismaService } from '../../prisma/prisma.service'

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AuditController {
  constructor(
    private auditService: AuditService,
    private prisma: PrismaService
  ) {}

  /**
   * Obtiene logs de auditoría con filtros opcionales
   */
  @Get('logs')
  async getLogs(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const take = limit ? parseInt(limit, 10) : 50
    const skip = offset ? parseInt(offset, 10) : 0

    const where: {
      entityType?: string
      entityId?: string
      userId?: string
      action?: string
    } = {}

    if (entityType) where.entityType = entityType
    if (entityId) where.entityId = entityId
    if (userId) where.userId = userId
    if (action) where.action = action

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              nombre: true,
              rol: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ])

    // Transformar logs para incluir userName y userEmail directamente
    const transformedLogs = logs.map(log => ({
      ...log,
      userName: log.userName || log.user?.nombre || null,
      userEmail: log.userEmail || log.user?.email || 'sistema',
      createdAt: log.createdAt.toISOString(),
      changes: log.changes ? (typeof log.changes === 'object' && log.changes !== null ? log.changes : null) : null,
      metadata: log.metadata ? (typeof log.metadata === 'object' && log.metadata !== null ? log.metadata : null) : null,
    }))

    return {
      logs: transformedLogs,
      pagination: {
        total,
        limit: take,
        offset: skip,
        hasMore: skip + take < total,
      },
    }
  }

  /**
   * Obtiene actividad de un usuario específico
   */
  @Get('users/:userId/activity')
  async getUserActivity(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const take = limit ? parseInt(limit, 10) : 50
    const skip = offset ? parseInt(offset, 10) : 0

    const [logs, total, user] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              nombre: true,
              rol: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where: { userId } }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          nombre: true,
          rol: true,
          ultimoLogin: true,
          loginCount: true,
          ultimaIp: true,
        },
      }),
    ])

    // Transformar logs para incluir userName y userEmail directamente
    const transformedActivityLogs = logs.map(log => ({
      ...log,
      userName: log.userName || log.user?.nombre || null,
      userEmail: log.userEmail || log.user?.email || 'sistema',
      createdAt: log.createdAt.toISOString(),
      changes: log.changes ? (typeof log.changes === 'object' && log.changes !== null ? log.changes : null) : null,
      metadata: log.metadata ? (typeof log.metadata === 'object' && log.metadata !== null ? log.metadata : null) : null,
    }))

    return {
      user: user
        ? {
            ...user,
            ultimoLogin: user.ultimoLogin?.toISOString() || null,
          }
        : null,
      activity: {
        logs: transformedActivityLogs,
        pagination: {
          total,
          limit: take,
          offset: skip,
          hasMore: skip + take < total,
        },
      },
    }
  }

  /**
   * Obtiene estadísticas de actividad
   */
  @Get('stats')
  async getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const where: {
      createdAt?: {
        gte?: Date
        lte?: Date
      }
    } = {}

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const [totalLogs, byEntityType, byAction, byUser, recentActivity] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.groupBy({
        by: ['entityType'],
        where,
        _count: true,
      }),
      this.prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: true,
      }),
      this.prisma.auditLog.groupBy({
        by: ['userId'],
        where,
        _count: true,
        orderBy: {
          _count: {
            userId: 'desc',
          },
        },
        take: 10,
      }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: {
              nombre: true,
              email: true,
            },
          },
        },
      }),
    ])

    // Obtener nombres de usuarios para el top 10
    const userIds = byUser.map(u => u.userId)
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        nombre: true,
        email: true,
      },
    })

    const byUserWithNames = byUser.map(stat => ({
      ...stat,
      user: users.find(u => u.id === stat.userId) || null,
    }))

    // Transformar recentActivity para incluir userName y userEmail directamente
    const transformedRecentActivity = recentActivity.map(log => ({
      ...log,
      userName: log.userName || log.user?.nombre || null,
      userEmail: log.userEmail || log.user?.email || 'sistema',
      createdAt: log.createdAt.toISOString(),
      changes: log.changes ? (typeof log.changes === 'object' && log.changes !== null ? log.changes : null) : null,
      metadata: log.metadata ? (typeof log.metadata === 'object' && log.metadata !== null ? log.metadata : null) : null,
    }))

    return {
      totalLogs,
      byEntityType,
      byAction,
      topUsers: byUserWithNames,
      recentActivity: transformedRecentActivity,
    }
  }
}

