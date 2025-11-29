import { Controller, Post, Get, Body, UseGuards, Req, Query, Param, Patch } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { PastorJwtAuthGuard } from '../auth/guards/pastor-jwt-auth.guard'

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post('register')
  @UseGuards(PastorJwtAuthGuard)
  async registerToken(@Req() req: any, @Body() body: { token: string; platform: string; deviceId?: string }) {
    const email = req.user.email
    return this.notificationsService.registerToken(email, body.token, body.platform, body.deviceId)
  }

  @Get('history')
  @UseGuards(PastorJwtAuthGuard)
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
  @UseGuards(PastorJwtAuthGuard)
  async getUnreadCount(@Req() req: any) {
    const email = req.user.email
    return this.notificationsService.getUnreadCount(email)
  }

  @Patch('mark-read/:id')
  @UseGuards(PastorJwtAuthGuard)
  async markAsRead(@Req() req: any, @Param('id') id: string) {
    const email = req.user.email
    return this.notificationsService.markAsRead(id, email)
  }

  @Patch('mark-all-read')
  @UseGuards(PastorJwtAuthGuard)
  async markAllAsRead(@Req() req: any) {
    const email = req.user.email
    return this.notificationsService.markAllAsRead(email)
  }
}

