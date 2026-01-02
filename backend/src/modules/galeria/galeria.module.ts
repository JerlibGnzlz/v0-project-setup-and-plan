import { Module } from '@nestjs/common'
import { GaleriaController } from './galeria.controller'
import { GaleriaService } from './galeria.service'
import { PrismaModule } from '../../prisma/prisma.module'
import { AuditService } from '../../common/services/audit.service'

@Module({
  imports: [PrismaModule],
  controllers: [GaleriaController],
  providers: [GaleriaService, AuditService],
  exports: [GaleriaService],
})
export class GaleriaModule {}
