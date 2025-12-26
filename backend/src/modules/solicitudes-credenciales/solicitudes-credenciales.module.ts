import { Module } from '@nestjs/common'
import { SolicitudesCredencialesController } from './solicitudes-credenciales.controller'
import { SolicitudesCredencialesService } from './solicitudes-credenciales.service'
import { PrismaModule } from '../../prisma/prisma.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [PrismaModule, NotificationsModule, AuthModule],
  controllers: [SolicitudesCredencialesController],
  providers: [SolicitudesCredencialesService],
  exports: [SolicitudesCredencialesService],
})
export class SolicitudesCredencialesModule {}

