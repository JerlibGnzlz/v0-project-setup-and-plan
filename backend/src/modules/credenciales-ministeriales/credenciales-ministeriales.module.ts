import { Module } from '@nestjs/common'
import { CredencialesMinisterialesService } from './credenciales-ministeriales.service'
import { CredencialesMinisterialesController } from './credenciales-ministeriales.controller'
import { PrismaModule } from '../../prisma/prisma.module'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [CredencialesMinisterialesController],
  providers: [CredencialesMinisterialesService],
  exports: [CredencialesMinisterialesService],
})
export class CredencialesMinisterialesModule {}

