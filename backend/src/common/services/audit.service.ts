import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { Prisma } from '@prisma/client'

export type AuditEntityType =
  | 'INSCRIPCION'
  | 'PAGO'
  | 'PASTOR'
  | 'CONVENCION'
  | 'NOTICIA'
  | 'GALERIA'
  | 'USUARIO'

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VALIDAR'
  | 'RECHAZAR'
  | 'REHABILITAR'
  | 'CANCELAR'
  | 'ACTIVAR'
  | 'DESACTIVAR'
  | 'ARCHIVAR'
  | 'PUBLICAR'
  | 'OCULTAR'
  | 'DESTACAR'
  | 'QUITAR_DESTACADO'
  | 'ACTUALIZAR'

export interface AuditLogData {
  entityType: AuditEntityType
  entityId: string
  action: AuditAction
  userId?: string
  userEmail?: string
  changes?: {
    field: string
    oldValue: unknown
    newValue: unknown
  }[]
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

/**
 * Servicio centralizado para auditoría de cambios importantes
 *
 * Registra todas las acciones críticas en el sistema para trazabilidad
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name)

  constructor(private prisma: PrismaService) {}

  /**
   * Registra una acción de auditoría
   */
  async log(data: AuditLogData): Promise<void> {
    try {
      // Usar el modelo de AuditoriaPago existente para pagos
      if (data.entityType === 'PAGO') {
        await this.logPagoAudit(data)
        return
      }

      // Para otras entidades, usar tabla genérica de auditoría (AuditLog)
      if (data.userId) {
        try {
          // Obtener nombre del usuario si no está en los datos
          let userName = data.metadata?.userName as string | undefined
          if (!userName && data.userId) {
            const user = await this.prisma.user.findUnique({
              where: { id: data.userId },
              select: { nombre: true },
            })
            userName = user?.nombre
          }

          await this.prisma.auditLog.create({
            data: {
              entityType: data.entityType,
              entityId: data.entityId || 'N/A',
              action: data.action,
              userId: data.userId,
              userEmail: data.userEmail || 'sistema',
              userName: userName || null,
              changes: data.changes
                ? (data.changes as Prisma.InputJsonValue)
                : null,
              metadata: data.metadata
                ? (data.metadata as Prisma.InputJsonValue)
                : null,
              ipAddress: data.ipAddress || null,
              userAgent: data.userAgent || null,
            },
          })

          this.logger.debug(
            `📝 Auditoría registrada: [${data.entityType}] ${data.action} en ${data.entityId} por ${data.userEmail}`
          )
        } catch (error: unknown) {
          // Si la tabla no existe aún (migración pendiente), solo loguear
          const errorMessage = error instanceof Error ? error.message : String(error)
          if (errorMessage.includes('audit_logs') || errorMessage.includes('AuditLog')) {
            this.logger.debug('Tabla AuditLog no disponible aún, usando solo logs')
            const entityId = data.entityId || 'N/A'
            const userEmail = data.userEmail || 'sistema'
            this.logger.log(
              `📝 Auditoría [${data.entityType}]: ${data.action} en ${entityId} por ${userEmail}`
            )
          } else {
            throw error
          }
        }
      } else {
        // Si no hay userId, solo loguear
        const entityId = data.entityId || 'N/A'
        const userEmail = data.userEmail || 'sistema'
        this.logger.log(
          `📝 Auditoría [${data.entityType}]: ${data.action} en ${entityId} por ${userEmail}`
        )
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorStack = error instanceof Error ? error.stack : undefined
      this.logger.error(`Error registrando auditoría: ${errorMessage}`, errorStack)
      // No fallar si la auditoría falla - es crítico pero no debe romper el flujo
    }
  }

  /**
   * Registra auditoría específica para pagos (usa tabla existente)
   */
  private async logPagoAudit(data: AuditLogData): Promise<void> {
    try {
      // Extraer información específica de pagos
      const pagoId = data.entityId
      const inscripcionId = data.metadata?.inscripcionId || ''

      // Determinar estados anterior y nuevo
      const estadoAnterior = data.changes?.find(c => c.field === 'estado')?.oldValue
      const estadoNuevo = data.changes?.find(c => c.field === 'estado')?.newValue

      // Mapear acción a formato de AuditoriaPago
      let accion = data.action
      if (data.action === 'VALIDAR') accion = 'VALIDAR'
      else if (data.action === 'RECHAZAR') accion = 'RECHAZAR'
      else if (data.action === 'REHABILITAR') accion = 'REHABILITAR'
      else if (data.action === 'UPDATE') accion = 'ACTUALIZAR'

      await this.prisma.auditoriaPago.create({
        data: {
          pagoId,
          inscripcionId: typeof inscripcionId === 'string' ? inscripcionId : '',
          accion,
          estadoAnterior: estadoAnterior as string | null,
          estadoNuevo: estadoNuevo as string | null,
          usuarioId: data.userId,
          motivo: (data.metadata?.motivo as string | undefined) || null,
          metadata: {
            ...data.metadata,
            changes: data.changes,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
          } as Prisma.InputJsonValue,
        },
      })

      this.logger.log(`📝 Auditoría de pago registrada: ${accion} en ${pagoId}`)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error(`Error registrando auditoría de pago: ${errorMessage}`)
    }
  }

  /**
   * Obtiene el historial de auditoría de una entidad
   */
  async getAuditHistory(
    entityType: AuditEntityType,
    entityId: string
  ): Promise<Array<Record<string, unknown>>> {
    try {
      if (entityType === 'PAGO') {
        return this.prisma.auditoriaPago.findMany({
          where: { pagoId: entityId },
          orderBy: { createdAt: 'desc' },
        })
      }

      // Para otras entidades, retornar array vacío por ahora
      // TODO: Implementar cuando se cree tabla genérica
      this.logger.warn(`Historial de auditoría no implementado para ${entityType}`)
      return []
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error(`Error obteniendo historial de auditoría: ${errorMessage}`)
      return []
    }
  }

  /**
   * Helper para crear datos de auditoría desde cambios de entidad
   */
  createAuditDataFromChanges<T extends Record<string, unknown>>(
    entityType: AuditEntityType,
    entityId: string,
    action: AuditAction,
    oldData: T | null,
    newData: Partial<T>,
    userId?: string,
    userEmail?: string
  ): AuditLogData {
    const changes: { field: string; oldValue: unknown; newValue: unknown }[] = []

    // Comparar campos y detectar cambios
    Object.keys(newData).forEach(key => {
      const oldValue = oldData?.[key]
      const newValue = newData[key]

      // Solo registrar si realmente cambió
      if (oldValue !== newValue && newValue !== undefined) {
        changes.push({
          field: key,
          oldValue: oldValue ?? null,
          newValue: newValue ?? null,
        })
      }
    })

    return {
      entityType,
      entityId,
      action,
      userId,
      userEmail,
      changes: changes.length > 0 ? changes : undefined,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    }
  }
}
