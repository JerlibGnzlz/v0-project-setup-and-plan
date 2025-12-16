import { Module } from '@nestjs/common'
import { CredencialesCapellaniaService } from './credenciales-capellania.service'
import { CredencialesCapellaniaController } from './credenciales-capellania.controller'
import { PrismaModule } from '../../prisma/prisma.module'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [CredencialesCapellaniaController],
  providers: [CredencialesCapellaniaService],
  exports: [CredencialesCapellaniaService],
})
export class CredencialesCapellaniaModule {}

