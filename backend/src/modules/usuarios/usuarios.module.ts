import { Module } from '@nestjs/common'
import { PrismaModule } from '../../prisma/prisma.module'
import { UsuariosController } from './usuarios.controller'
import { UsuariosService } from './usuarios.service'
import { AuditService } from '../../common/services/audit.service'

@Module({
  imports: [PrismaModule],
  controllers: [UsuariosController],
  providers: [UsuariosService, AuditService],
  exports: [UsuariosService],
})
export class UsuariosModule {}

