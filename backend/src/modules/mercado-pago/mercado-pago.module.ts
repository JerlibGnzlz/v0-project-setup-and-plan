import { Module } from '@nestjs/common'
// MercadoPagoService y MercadoPagoController removidos - archivos vacíos
import { InscripcionesModule } from '../inscripciones/inscripciones.module'
import { PrismaModule } from '../../prisma/prisma.module'

@Module({
  imports: [PrismaModule, InscripcionesModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class MercadoPagoModule {}


