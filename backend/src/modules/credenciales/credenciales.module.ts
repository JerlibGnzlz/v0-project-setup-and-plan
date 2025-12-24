import { Module } from '@nestjs/common'
import { CredencialesController } from './credenciales.controller'
import { PrismaModule } from '../../prisma/prisma.module'
import { AuthModule } from '../auth/auth.module'
import { CredencialesMinisterialesModule } from '../credenciales-ministeriales/credenciales-ministeriales.module'
import { CredencialesCapellaniaModule } from '../credenciales-capellania/credenciales-capellania.module'
import { DataSyncModule } from '../data-sync/data-sync.module'

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CredencialesMinisterialesModule,
    CredencialesCapellaniaModule,
    DataSyncModule,
  ],
  controllers: [CredencialesController],
})
export class CredencialesModule {}

