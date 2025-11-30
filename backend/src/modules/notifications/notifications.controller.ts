import { Controller, Post, Get, Body, UseGuards, Req, Query, Param, Patch } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PastorJwtAuthGuard } from '../auth/guards/pastor-jwt-auth.guard'

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  // Endpoint para mobile (pastores)
  @Post('register')
  @UseGuards(PastorJwtAuthGuard)
  async registerToken(@Req() req: any, @Body() body: { token: string; platform: string; deviceId?: string }) {
    const email = req.user.email
    return this.notificationsService.registerToken(email, body.token, body.platform, body.deviceId)
  }

  // Endpoints para admin dashboard (usando JwtAuthGuard)
  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(
    @Req() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const email = req.user.email
    return this.notificationsService.getNotificationHistory(email, {
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    })
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(@Req() req: any) {
    const email = req.user.email
    const count = await this.notificationsService.getUnreadCount(email)
    // Asegurar que siempre retorne un objeto con count
    return { count: count ?? 0 }
  }

  @Patch('mark-read/:id')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Req() req: any, @Param('id') id: string) {
    const email = req.user.email
    return this.notificationsService.markAsRead(id, email)
  }

  @Patch('mark-all-read')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead(@Req() req: any) {
    const email = req.user.email
    return this.notificationsService.markAllAsRead(email)
  }
}

