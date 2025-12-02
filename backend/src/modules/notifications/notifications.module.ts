import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { BullModule } from '@nestjs/bull'
import { NotificationsController } from './notifications.controller'
import { EmailTestController } from './email-test.controller'
import { NotificationsService } from './notifications.service'
import { EmailService } from './email.service'
import { NotificationsGateway } from './notifications.gateway'
import { NotificationsCleanupService } from './notifications-cleanup.service'
import { NotificationListener } from './listeners/notification.listener'
import { NotificationProcessor } from './processors/notification.processor'
import { PrismaModule } from '../../prisma/prisma.module'

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
    }),
    EventEmitterModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
      },
    }),
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  controllers: [NotificationsController, EmailTestController],
  providers: [
    EmailService,
    NotificationsGateway,
    NotificationsService,
    NotificationsCleanupService,
    NotificationListener,
    NotificationProcessor,
  ],
  exports: [NotificationsService, NotificationsGateway, EmailService],
})
export class NotificationsModule {}

