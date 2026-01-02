import { Module } from '@nestjs/common'
import { NoticiasController } from './noticias.controller'
import { NoticiasService } from './noticias.service'
import { PrismaModule } from '../../prisma/prisma.module'
import { AuditService } from '../../common/services/audit.service'

@Module({
  imports: [PrismaModule],
  controllers: [NoticiasController],
  providers: [NoticiasService, AuditService],
  exports: [NoticiasService],
})
export class NoticiasModule {}
