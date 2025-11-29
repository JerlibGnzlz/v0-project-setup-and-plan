import { Module, forwardRef } from "@nestjs/common"
import { InscripcionesController, PagosController } from "./inscripciones.controller"
import { InscripcionesService } from "./inscripciones.service"
import { PrismaModule } from "../../prisma/prisma.module"
import { NotificationsModule } from "../notifications/notifications.module"

@Module({
  imports: [PrismaModule, forwardRef(() => NotificationsModule)],
  controllers: [InscripcionesController, PagosController],
  providers: [InscripcionesService],
  exports: [InscripcionesService],
})
export class InscripcionesModule { }

