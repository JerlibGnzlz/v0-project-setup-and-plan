import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { NotificationsController } from './notifications.controller'
import { EmailTestController } from './email-test.controller'
import { NotificationsService } from './notifications.service'
import { EmailService } from './email.service'
import { NotificationsGateway } from './notifications.gateway'
import { PrismaModule } from '../../prisma/prisma.module'

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
    }),
  ],
  controllers: [NotificationsController, EmailTestController],
  providers: [EmailService, NotificationsGateway, NotificationsService],
  exports: [NotificationsService, NotificationsGateway, EmailService],
})
export class NotificationsModule {}

