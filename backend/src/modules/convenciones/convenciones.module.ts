import { Module } from "@nestjs/common"
import { PrismaModule } from "../../prisma/prisma.module"
import { ConvencionesController } from "./convenciones.controller"
import { ConvencionesService } from "./convenciones.service"
import { ConvencionRepository } from "./repositories/convencion.repository"

/**
 * Módulo de Convenciones
 * 
 * Estructura Clean Architecture:
 * - Controller: Maneja HTTP requests
 * - Service: Contiene lógica de negocio
 * - Repository: Acceso a datos (abstrae Prisma)
 */
@Module({
  imports: [PrismaModule],
  controllers: [ConvencionesController],
  providers: [
    ConvencionRepository,  // Repository primero (dependencia del service)
    ConvencionesService,
  ],
  exports: [ConvencionesService], // Exportar para uso en otros módulos
})
export class ConvencionesModule {}
