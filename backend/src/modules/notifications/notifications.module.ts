import { Module, forwardRef } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
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
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
    }),
    EventEmitterModule.forRoot(),
    // Configurar BullModule con Redis para cola de notificaciones
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB || '0'),
      },
    }),
    // Registrar cola de notificaciones
    BullModule.registerQueue({
      name: 'notifications',
    }),
    forwardRef(() => AuthModule),
  ],
  controllers: [NotificationsController, EmailTestController],
  providers: [
    EmailService,
    NotificationsGateway,
    NotificationsService,
    NotificationsCleanupService,
    NotificationListener, // Listener que escucha eventos y los encola
    NotificationProcessor, // Processor que procesa los trabajos de la cola
  ],
  exports: [NotificationsService, NotificationsGateway, EmailService],
})
export class NotificationsModule { }

