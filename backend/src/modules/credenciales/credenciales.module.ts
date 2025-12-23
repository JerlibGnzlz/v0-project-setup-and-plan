import { Module } from '@nestjs/common'
import { CredencialesController } from './credenciales.controller'
import { PrismaModule } from '../../prisma/prisma.module'
import { AuthModule } from '../auth/auth.module'
import { CredencialesMinisterialesModule } from '../credenciales-ministeriales/credenciales-ministeriales.module'
import { CredencialesCapellaniaModule } from '../credenciales-capellania/credenciales-capellania.module'

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CredencialesMinisterialesModule,
    CredencialesCapellaniaModule,
  ],
  controllers: [CredencialesController],
})
export class CredencialesModule {}

