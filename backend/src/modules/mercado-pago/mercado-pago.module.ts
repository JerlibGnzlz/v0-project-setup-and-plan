import { Module } from '@nestjs/common'
import { MercadoPagoService } from './mercado-pago.service'
import { MercadoPagoController } from './mercado-pago.controller'
import { InscripcionesModule } from '../inscripciones/inscripciones.module'
import { PrismaModule } from '../../prisma/prisma.module'

@Module({
  imports: [PrismaModule, InscripcionesModule],
  controllers: [MercadoPagoController],
  providers: [MercadoPagoService],
  exports: [MercadoPagoService],
})
export class MercadoPagoModule {}


