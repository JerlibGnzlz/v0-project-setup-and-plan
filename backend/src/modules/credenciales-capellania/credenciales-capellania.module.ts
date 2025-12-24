import { Module } from '@nestjs/common'
import { CredencialesCapellaniaService } from './credenciales-capellania.service'
import { CredencialesCapellaniaController } from './credenciales-capellania.controller'
import { PrismaModule } from '../../prisma/prisma.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { AuthModule } from '../auth/auth.module'
import { DataSyncModule } from '../data-sync/data-sync.module'

@Module({
  imports: [PrismaModule, NotificationsModule, AuthModule, DataSyncModule],
  controllers: [CredencialesCapellaniaController],
  providers: [CredencialesCapellaniaService],
  exports: [CredencialesCapellaniaService],
})
export class CredencialesCapellaniaModule {}

