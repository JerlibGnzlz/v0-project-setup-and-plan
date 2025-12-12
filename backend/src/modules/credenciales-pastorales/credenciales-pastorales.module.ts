import { Module } from '@nestjs/common'
import { CredencialesPastoralesService } from './credenciales-pastorales.service'
import { CredencialesPastoralesController } from './credenciales-pastorales.controller'
import { CredencialesPastoralesScheduler } from './credenciales-pastorales.scheduler'
import { PrismaModule } from '../../prisma/prisma.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { EventEmitterModule } from '@nestjs/event-emitter'

@Module({
  imports: [PrismaModule, NotificationsModule, EventEmitterModule],
  controllers: [CredencialesPastoralesController],
  providers: [CredencialesPastoralesService, CredencialesPastoralesScheduler],
  exports: [CredencialesPastoralesService],
})
export class CredencialesPastoralesModule {}

