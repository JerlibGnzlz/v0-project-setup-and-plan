import { Module } from '@nestjs/common'
import { CredencialesMinisterialesService } from './credenciales-ministeriales.service'
import { CredencialesMinisterialesController } from './credenciales-ministeriales.controller'
import { CredencialesRecordatoriosService } from './credenciales-recordatorios.service'
import { PrismaModule } from '../../prisma/prisma.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { AuthModule } from '../auth/auth.module'
import { DataSyncModule } from '../data-sync/data-sync.module'

@Module({
  imports: [PrismaModule, NotificationsModule, AuthModule, DataSyncModule],
  controllers: [CredencialesMinisterialesController],
  providers: [CredencialesMinisterialesService, CredencialesRecordatoriosService],
  exports: [CredencialesMinisterialesService],
})
export class CredencialesMinisterialesModule {}

