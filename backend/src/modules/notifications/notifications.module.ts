import { Module, forwardRef, Logger } from '@nestjs/common'
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

// Verificar si Redis está configurado
const isRedisConfigured = !!(process.env.REDIS_HOST || process.env.REDIS_URL)
const logger = new Logger('NotificationsModule')

// Construir imports dinámicamente
const dynamicImports = []

// Solo configurar BullModule si Redis está configurado
if (isRedisConfigured) {
  logger.log('✅ Redis configurado - Habilitando cola de notificaciones con Bull')
  
  // Si hay REDIS_URL, usarla directamente (soporta rediss:// para SSL)
  // Si no, usar variables separadas
  const redisConfig = process.env.REDIS_URL
    ? process.env.REDIS_URL // BullModule acepta URL directamente
    : {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB || '0'),
      }
  
  dynamicImports.push(
    BullModule.forRoot({
      redis: redisConfig,
    }),
    BullModule.registerQueue({
      name: 'notifications',
    })
  )
  
  // Log de configuración (sin exponer credenciales)
  if (process.env.REDIS_URL) {
    const url = new URL(process.env.REDIS_URL)
    logger.log(`📡 Redis URL configurada: ${url.protocol}//${url.hostname}:${url.port}`)
  } else {
    logger.log(`📡 Redis configurado: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`)
  }
} else {
  logger.warn('⚠️ Redis no configurado - Las notificaciones se procesarán directamente (sin cola)')
  logger.warn('   Para habilitar la cola, configura REDIS_HOST o REDIS_URL en las variables de entorno')
}

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
    }),
    EventEmitterModule.forRoot(),
    ...dynamicImports, // Agregar imports de Bull solo si Redis está configurado
    forwardRef(() => AuthModule),
  ],
  controllers: [NotificationsController, EmailTestController],
  providers: [
    EmailService,
    NotificationsGateway,
    NotificationsService,
    NotificationsCleanupService,
    NotificationListener, // Listener que escucha eventos y los encola
    ...(isRedisConfigured ? [NotificationProcessor] : []), // Processor solo si Redis está configurado
  ],
  exports: [NotificationsService, NotificationsGateway, EmailService],
})
export class NotificationsModule {}
