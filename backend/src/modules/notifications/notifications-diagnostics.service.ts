import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class NotificationsDiagnosticsService {
  private readonly logger = new Logger(NotificationsDiagnosticsService.name)

  constructor(private prisma: PrismaService) {}

  /**
   * Diagnóstico completo del sistema de notificaciones push
   */
  async getDiagnostics(): Promise<{
    deviceTokens: {
      total: number
      activos: number
      porPlataforma: { ios: number; android: number }
      porTipoUsuario: { admin: number; pastor: number; invitado: number }
    }
    credenciales: {
      total: number
      conInvitadoId: number
      vencidas: number
      porVencer: number
      sinInvitadoId: number
    }
    usuariosConTokens: Array<{
      email: string
      tipo: 'admin' | 'pastor' | 'invitado'
      tokensActivos: number
      plataformas: string[]
    }>
    credencialesConUsuariosSinTokens: Array<{
      credencialId: string
      tipo: 'ministerial' | 'capellania'
      documento: string
      nombre: string
      email: string
      estado: string
      diasRestantes: number
    }>
  }> {
    try {
      // 1. Estadísticas de device tokens
      const totalTokens = await this.prisma.deviceToken.count()
      const tokensActivos = await this.prisma.deviceToken.count({ where: { active: true } })
      const tokensIOS = await this.prisma.deviceToken.count({
        where: { active: true, platform: 'ios' },
      })
      const tokensAndroid = await this.prisma.deviceToken.count({
        where: { active: true, platform: 'android' },
      })

      const totalAdminTokens = await this.prisma.adminDeviceToken.count({ where: { active: true } })
      const totalPastorTokens = await this.prisma.deviceToken.count({ where: { active: true } })
      const totalInvitadoTokens = await this.prisma.invitadoDeviceToken.count({
        where: { active: true },
      })

      // 2. Estadísticas de credenciales
      const totalCredencialesMinisteriales = await this.prisma.credencialMinisterial.count({
        where: { activa: true },
      })
      const credencialesMinisterialesConInvitado = await this.prisma.credencialMinisterial.count({
        where: { activa: true, invitadoId: { not: null } },
      })

      const totalCredencialesCapellania = await this.prisma.credencialCapellania.count({
        where: { activa: true },
      })
      const credencialesCapellaniaConInvitado = await this.prisma.credencialCapellania.count({
        where: { activa: true, invitadoId: { not: null } },
      })

      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      const en30Dias = new Date()
      en30Dias.setDate(en30Dias.getDate() + 30)
      en30Dias.setHours(23, 59, 59, 999)

      const credencialesVencidas = await this.prisma.credencialMinisterial.count({
        where: {
          activa: true,
          invitadoId: { not: null },
          fechaVencimiento: { lt: hoy },
        },
      })

      const credencialesPorVencer = await this.prisma.credencialMinisterial.count({
        where: {
          activa: true,
          invitadoId: { not: null },
          fechaVencimiento: { gte: hoy, lte: en30Dias },
        },
      })

      // 3. Usuarios con tokens activos
      const usuariosConTokens: Array<{
        email: string
        tipo: 'admin' | 'pastor' | 'invitado'
        tokensActivos: number
        plataformas: string[]
      }> = []

      // Admins con tokens
      const adminsConTokens = await this.prisma.user.findMany({
        where: {
          deviceTokens: {
            some: { active: true },
          },
        },
        include: {
          deviceTokens: {
            where: { active: true },
          },
        },
      })

      for (const admin of adminsConTokens) {
        const plataformas = [
          ...new Set(admin.deviceTokens.map((dt) => dt.platform)),
        ]
        usuariosConTokens.push({
          email: admin.email,
          tipo: 'admin',
          tokensActivos: admin.deviceTokens.length,
          plataformas,
        })
      }

      // Pastores con tokens
      const pastoresConTokens = await this.prisma.pastor.findMany({
        where: {
          auth: {
            deviceTokens: {
              some: { active: true },
            },
          },
        },
        include: {
          auth: {
            include: {
              deviceTokens: {
                where: { active: true },
              },
            },
          },
        },
      })

      for (const pastor of pastoresConTokens) {
        if (pastor.auth && pastor.auth.deviceTokens.length > 0) {
          const plataformas = [
            ...new Set(pastor.auth.deviceTokens.map((dt) => dt.platform)),
          ]
          usuariosConTokens.push({
            email: pastor.email || 'sin email',
            tipo: 'pastor',
            tokensActivos: pastor.auth.deviceTokens.length,
            plataformas,
          })
        }
      }

      // Invitados con tokens
      const invitadosConTokens = await this.prisma.invitado.findMany({
        where: {
          auth: {
            deviceTokens: {
              some: { active: true },
            },
          },
        },
        include: {
          auth: {
            include: {
              deviceTokens: {
                where: { active: true },
              },
            },
          },
        },
      })

      for (const invitado of invitadosConTokens) {
        if (invitado.auth && invitado.auth.deviceTokens.length > 0) {
          const plataformas = [
            ...new Set(invitado.auth.deviceTokens.map((dt) => dt.platform)),
          ]
          usuariosConTokens.push({
            email: invitado.email,
            tipo: 'invitado',
            tokensActivos: invitado.auth.deviceTokens.length,
            plataformas,
          })
        }
      }

      // 4. Credenciales con usuarios pero sin tokens
      const credencialesConUsuariosSinTokens: Array<{
        credencialId: string
        tipo: 'ministerial' | 'capellania'
        documento: string
        nombre: string
        email: string
        estado: string
        diasRestantes: number
      }> = []

      const credencialesMinisterialesConInvitado = await this.prisma.credencialMinisterial.findMany({
        where: {
          activa: true,
          invitadoId: { not: null },
          OR: [
            { fechaVencimiento: { lt: hoy } },
            { fechaVencimiento: { gte: hoy, lte: en30Dias } },
          ],
        },
        include: {
          invitado: {
            include: {
              auth: {
                include: {
                  deviceTokens: {
                    where: { active: true },
                  },
                },
              },
            },
          },
        },
      })

      for (const credencial of credencialesMinisterialesConInvitado) {
        if (credencial.invitado) {
          const diasRestantes = Math.ceil(
            (credencial.fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
          )
          const estado = diasRestantes < 0 ? 'vencida' : 'por_vencer'

          const tieneTokens =
            credencial.invitado.auth?.deviceTokens &&
            credencial.invitado.auth.deviceTokens.length > 0

          if (!tieneTokens) {
            credencialesConUsuariosSinTokens.push({
              credencialId: credencial.id,
              tipo: 'ministerial',
              documento: credencial.documento,
              nombre: `${credencial.nombre} ${credencial.apellido}`,
              email: credencial.invitado.email,
              estado,
              diasRestantes: Math.abs(diasRestantes),
            })
          }
        }
      }

      const credencialesCapellaniaConInvitado = await this.prisma.credencialCapellania.findMany({
        where: {
          activa: true,
          invitadoId: { not: null },
          OR: [
            { fechaVencimiento: { lt: hoy } },
            { fechaVencimiento: { gte: hoy, lte: en30Dias } },
          ],
        },
        include: {
          invitado: {
            include: {
              auth: {
                include: {
                  deviceTokens: {
                    where: { active: true },
                  },
                },
              },
            },
          },
        },
      })

      for (const credencial of credencialesCapellaniaConInvitado) {
        if (credencial.invitado) {
          const diasRestantes = Math.ceil(
            (credencial.fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
          )
          const estado = diasRestantes < 0 ? 'vencida' : 'por_vencer'

          const tieneTokens =
            credencial.invitado.auth?.deviceTokens &&
            credencial.invitado.auth.deviceTokens.length > 0

          if (!tieneTokens) {
            credencialesConUsuariosSinTokens.push({
              credencialId: credencial.id,
              tipo: 'capellania',
              documento: credencial.documento,
              nombre: `${credencial.nombre} ${credencial.apellido}`,
              email: credencial.invitado.email,
              estado,
              diasRestantes: Math.abs(diasRestantes),
            })
          }
        }
      }

      return {
        deviceTokens: {
          total: totalTokens + (await this.prisma.adminDeviceToken.count()) + (await this.prisma.invitadoDeviceToken.count()),
          activos: tokensActivos + totalAdminTokens + totalInvitadoTokens,
          porPlataforma: {
            ios: tokensIOS + (await this.prisma.adminDeviceToken.count({ where: { active: true, platform: 'ios' } })) + (await this.prisma.invitadoDeviceToken.count({ where: { active: true, platform: 'ios' } })),
            android: tokensAndroid + (await this.prisma.adminDeviceToken.count({ where: { active: true, platform: 'android' } })) + (await this.prisma.invitadoDeviceToken.count({ where: { active: true, platform: 'android' } })),
          },
          porTipoUsuario: {
            admin: totalAdminTokens,
            pastor: totalPastorTokens,
            invitado: totalInvitadoTokens,
          },
        },
        credenciales: {
          total: totalCredencialesMinisteriales + totalCredencialesCapellania,
          conInvitadoId:
            credencialesMinisterialesConInvitado + credencialesCapellaniaConInvitado,
          vencidas: credencialesVencidas,
          porVencer: credencialesPorVencer,
          sinInvitadoId:
            totalCredencialesMinisteriales +
            totalCredencialesCapellania -
            credencialesMinisterialesConInvitado -
            credencialesCapellaniaConInvitado,
        },
        usuariosConTokens,
        credencialesConUsuariosSinTokens,
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error obteniendo diagnóstico:`, errorMessage)
      throw error
    }
  }
}

