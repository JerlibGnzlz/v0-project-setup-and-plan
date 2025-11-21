import { Module } from "@nestjs/common"
import { PrismaModule } from "../../prisma/prisma.module"
import { ConvencionesController } from "./convenciones.controller"
import { ConvencionesService } from "./convenciones.service"

@Module({
  imports: [PrismaModule],
  controllers: [ConvencionesController],
  providers: [ConvencionesService],
})
export class ConvencionesModule {}
