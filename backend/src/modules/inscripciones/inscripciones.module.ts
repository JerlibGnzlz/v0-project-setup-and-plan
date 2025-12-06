import { Module, forwardRef } from '@nestjs/common'
import { InscripcionesController, PagosController } from './inscripciones.controller'
import { InscripcionesService } from './inscripciones.service'
import { PrismaModule } from '../../prisma/prisma.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { AuditService } from '../../common/services/audit.service'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => NotificationsModule),
    forwardRef(() => AuthModule), // Importar AuthModule para que TokenBlacklistService esté disponible
  ],
  controllers: [InscripcionesController, PagosController],
  providers: [InscripcionesService, AuditService],
  exports: [InscripcionesService],
})
export class InscripcionesModule {}
