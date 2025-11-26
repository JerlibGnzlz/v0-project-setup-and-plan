import { Module } from "@nestjs/common"
import { InscripcionesController, PagosController } from "./inscripciones.controller"
import { InscripcionesService } from "./inscripciones.service"
import { PrismaModule } from "../../prisma/prisma.module"

@Module({
  imports: [PrismaModule],
  controllers: [InscripcionesController, PagosController],
  providers: [InscripcionesService],
  exports: [InscripcionesService],
})
export class InscripcionesModule { }


