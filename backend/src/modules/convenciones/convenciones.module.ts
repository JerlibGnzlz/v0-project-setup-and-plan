import { Module } from "@nestjs/common"
import { ConvencionesController } from "./convenciones.controller"
import { ConvencionesService } from "./convenciones.service"

@Module({
  controllers: [ConvencionesController],
  providers: [ConvencionesService],
})
export class ConvencionesModule {}
