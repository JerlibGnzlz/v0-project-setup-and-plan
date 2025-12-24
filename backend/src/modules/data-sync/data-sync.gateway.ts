import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

interface AuthenticatedSocket extends Socket {
  userId?: string
  email?: string
  tipo?: 'admin' | 'pastor' | 'invitado'
}

export type DataSyncEventType = 'credencial_updated' | 'convencion_updated' | 'convencion_created' | 'convencion_deleted'

export interface DataSyncEvent {
  type: DataSyncEventType
  data: Record<string, unknown>
  timestamp: number
}

@WebSocketGateway({
  cors: {
    origin: '*', // Permitir conexiones desde cualquier origen (app móvil)
    credentials: true,
  },
  namespace: '/data-sync',
})
export class DataSyncGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(DataSyncGateway.name)
  private connectedClients = new Map<string, AuthenticatedSocket>()

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Autenticar usando token JWT (puede ser de admin, pastor o invitado)
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '')

      if (!token) {
        this.logger.warn(`Cliente ${client.id} desconectado: sin token`)
        client.emit('error', {
          type: 'AUTH_ERROR',
          message: 'Token no proporcionado',
        })
        client.disconnect()
        return
      }

      // Verificar token
      let payload: { sub?: string; id?: string; email?: string; tipo?: string; exp?: number }
      try {
        payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'your-secret-key',
        })
      } catch (verifyError: unknown) {
        const errorMessage = verifyError instanceof Error ? verifyError.message : 'Error desconocido'
        this.logger.warn(`Cliente ${client.id} desconectado: token inválido - ${errorMessage}`)
        client.emit('error', {
          type: 'INVALID_TOKEN',
          message: 'Token inválido o expirado',
        })
        client.disconnect()
        return
      }

      client.userId = payload.sub || payload.id
      client.email = payload.email
      client.tipo = (payload.tipo as 'admin' | 'pastor' | 'invitado') || 'invitado'

      if (!client.userId) {
        this.logger.warn(`Cliente ${client.id} desconectado: token sin userId`)
        client.emit('error', {
          type: 'INVALID_TOKEN',
          message: 'Token inválido',
        })
        client.disconnect()
        return
      }

      this.connectedClients.set(client.id, client)
      this.logger.log(`✅ Cliente conectado a data-sync: ${client.id} (${client.email}, tipo: ${client.tipo})`)

      // Enviar confirmación de conexión
      client.emit('connected', {
        message: 'Conectado a sincronización de datos',
        userId: client.userId,
        tipo: client.tipo,
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error autenticando cliente ${client.id}:`, errorMessage)
      client.emit('error', {
        type: 'CONNECTION_ERROR',
        message: 'Error de conexión',
      })
      client.disconnect()
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.connectedClients.delete(client.id)
    this.logger.log(`Cliente desconectado de data-sync: ${client.id}`)
  }

  /**
   * Emite un evento de sincronización a todos los clientes conectados
   */
  emitDataSyncEvent(event: DataSyncEvent) {
    this.logger.log(`📡 Emitiendo evento de sincronización: ${event.type}`)
    this.server.emit('data-sync', event)
  }

  /**
   * Emite evento de actualización de credencial
   */
  emitCredencialUpdated(credencialId: string, tipo: 'pastoral' | 'ministerial' | 'capellania') {
    this.emitDataSyncEvent({
      type: 'credencial_updated',
      data: {
        credencialId,
        tipo,
      },
      timestamp: Date.now(),
    })
  }

  /**
   * Emite evento de actualización de convención
   */
  emitConvencionUpdated(convencionId: string) {
    this.emitDataSyncEvent({
      type: 'convencion_updated',
      data: {
        convencionId,
      },
      timestamp: Date.now(),
    })
  }

  /**
   * Emite evento de creación de convención
   */
  emitConvencionCreated(convencionId: string) {
    this.emitDataSyncEvent({
      type: 'convencion_created',
      data: {
        convencionId,
      },
      timestamp: Date.now(),
    })
  }

  /**
   * Emite evento de eliminación de convención
   */
  emitConvencionDeleted(convencionId: string) {
    this.emitDataSyncEvent({
      type: 'convencion_deleted',
      data: {
        convencionId,
      },
      timestamp: Date.now(),
    })
  }
}

