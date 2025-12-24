import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Query,
  Param,
  Patch,
  Delete,
} from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PastorJwtAuthGuard } from '../auth/guards/pastor-jwt-auth.guard'
import { InvitadoJwtAuthGuard } from '../auth/guards/invitado-jwt-auth.guard'
import { AuthenticatedRequest, AuthenticatedPastorRequest, AuthenticatedInvitadoRequest } from '../auth/types/request.types'

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  // Endpoint para mobile (pastores) - DEPRECATED: usar /register/admin para admins
  @Post('register')
  @UseGuards(PastorJwtAuthGuard)
  async registerToken(
    @Req() req: AuthenticatedPastorRequest,
    @Body() body: { token: string; platform: string; deviceId?: string }
  ) {
    const email = req.user.email
    if (!email) {
      throw new Error('Email no disponible en el usuario autenticado')
    }
    return this.notificationsService.registerToken(email, body.token, body.platform, body.deviceId)
  }

  // Endpoint para admins (desde app móvil)
  @Post('register/admin')
  @UseGuards(JwtAuthGuard)
  async registerAdminToken(
    @Req() req: AuthenticatedRequest,
    @Body() body: { token: string; platform: string; deviceId?: string }
  ) {
    const email = req.user.email
    if (!email) {
      throw new Error('Email no disponible en el usuario autenticado')
    }
    return this.notificationsService.registerToken(email, body.token, body.platform, body.deviceId)
  }

  // Endpoint para invitados (desde app móvil)
  @Post('register/invitado')
  @UseGuards(InvitadoJwtAuthGuard)
  async registerInvitadoToken(
    @Req() req: AuthenticatedInvitadoRequest,
    @Body() body: { token: string; platform: string; deviceId?: string }
  ) {
    const email = req.user.email
    if (!email) {
      throw new Error('Email no disponible en el usuario autenticado')
    }
    return this.notificationsService.registerToken(email, body.token, body.platform, body.deviceId)
  }

  // Endpoints para admin dashboard (usando JwtAuthGuard)
  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(
    @Req() req: AuthenticatedRequest,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const email = req.user.email
    return this.notificationsService.getNotificationHistory(email, {
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    })
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(@Req() req: AuthenticatedRequest) {
    const email = req.user.email
    const count = await this.notificationsService.getUnreadCount(email)
    // Asegurar que siempre retorne un objeto con count
    return { count: count ?? 0 }
  }

  @Patch('mark-read/:id')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const email = req.user.email
    return this.notificationsService.markAsRead(id, email)
  }

  @Patch('mark-all-read')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead(@Req() req: AuthenticatedRequest) {
    const email = req.user.email
    return this.notificationsService.markAllAsRead(email)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteNotification(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const email = req.user.email
    return this.notificationsService.deleteNotification(id, email)
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteNotifications(
    @Req() req: AuthenticatedRequest,
    @Body() body: { ids?: string[]; deleteRead?: boolean; olderThanDays?: number }
  ) {
    const email = req.user.email
    return this.notificationsService.deleteNotifications(email, body)
  }

  /**
   * Endpoint para enviar notificaciones push masivas a usuarios con credenciales vencidas o por vencer
   * Solo disponible para admins
   */
  @Post('push/credenciales-vencidas')
  @UseGuards(JwtAuthGuard)
  async sendPushNotificationsCredencialesVencidas(
    @Body() body: { tipo: 'vencidas' | 'por_vencer' | 'ambas' }
  ) {
    return this.notificationsService.sendPushNotificationsCredencialesVencidas(body.tipo || 'ambas')
  }
}
