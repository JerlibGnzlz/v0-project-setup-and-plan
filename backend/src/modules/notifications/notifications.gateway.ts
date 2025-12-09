import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger, UseGuards } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../prisma/prisma.service'

interface AuthenticatedSocket extends Socket {
  userId?: string
  email?: string
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(NotificationsGateway.name)
  private connectedClients = new Map<string, AuthenticatedSocket>()

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Autenticar usando token JWT
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '')

      if (!token) {
        this.logger.warn(`Cliente ${client.id} desconectado: sin token`)
        client.disconnect()
        return
      }

      // Verificar token
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'your-secret-key',
      })

      client.userId = payload.sub || payload.id
      client.email = payload.email

      this.connectedClients.set(client.id, client)
      this.logger.log(`Cliente conectado: ${client.id} (${client.email})`)

      // Enviar conteo de no leídas al conectar
      if (client.email) {
        const unreadCount = await this.getUnreadCount(client.email)
        client.emit('unread-count', { count: unreadCount })
      }
    } catch (error) {
      this.logger.error(`Error autenticando cliente ${client.id}:`, error)
      client.disconnect()
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.connectedClients.delete(client.id)
    this.logger.log(`Cliente desconectado: ${client.id}`)
  }

  /**
   * Emite una notificación a un usuario específico
   */
  async emitToUser(email: string, notification: Record<string, unknown>) {
    const clients = Array.from(this.connectedClients.values()).filter(
      client => client.email === email
    )

    if (clients.length === 0) {
      this.logger.debug(`No hay clientes conectados para ${email}`)
      return
    }

    clients.forEach(client => {
      client.emit('notification', notification)
      this.logger.log(`Notificación enviada a ${email} (${client.id})`)
    })
  }

  /**
   * Emite actualización de conteo de no leídas
   */
  async emitUnreadCountUpdate(email: string) {
    const clients = Array.from(this.connectedClients.values()).filter(
      client => client.email === email
    )

    if (clients.length === 0) {
      return
    }

    const unreadCount = await this.getUnreadCount(email)

    clients.forEach(client => {
      client.emit('unread-count', { count: unreadCount })
    })
  }

  private async getUnreadCount(email: string): Promise<number> {
    try {
      // Verificar si es un usuario admin
      // Usar select para evitar cargar columnas que no existen
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          nombre: true,
          rol: true,
        },
      })

      // Si es admin, buscar por email directamente
      if (user) {
        const count = await this.prisma.notificationHistory.count({
          where: {
            email,
            read: false,
          },
        })
        this.logger.debug(`[Gateway] Conteo de no leídas para admin ${email}: ${count}`)
        return count
      }

      // Verificar si es un pastor
      const pastorAuth = await this.prisma.pastorAuth.findUnique({
        where: { email },
      })

      // Si es pastor, buscar por pastorId
      if (pastorAuth) {
        const count = await this.prisma.notificationHistory.count({
          where: {
            pastorId: pastorAuth.pastorId,
            read: false,
          },
        })
        this.logger.debug(`[Gateway] Conteo de no leídas para pastor ${email}: ${count}`)
        return count
      }

      // Si no es ni admin ni pastor, retornar 0
      this.logger.warn(`[Gateway] No se encontró usuario ni pastor para email: ${email}`)
      return 0
    } catch (error) {
      this.logger.error(`[Gateway] Error obteniendo conteo de no leídas para ${email}:`, error)
      return 0
    }
  }
}


