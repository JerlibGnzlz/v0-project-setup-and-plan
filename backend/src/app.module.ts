import { Module } from "@nestjs/common"
import { AuthModule } from "./modules/auth/auth.module"
import { ConvencionesModule } from "./modules/convenciones/convenciones.module"
import { PastoresModule } from "./modules/pastores/pastores.module"
import { GaleriaModule } from "./modules/galeria/galeria.module"
import { InscripcionesModule } from "./modules/inscripciones/inscripciones.module"
import { PrismaModule } from "./prisma/prisma.module"
import { UploadModule } from "./modules/upload/upload.module"

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ConvencionesModule,
    PastoresModule,
    GaleriaModule,
    InscripcionesModule,
    UploadModule, // Added upload module
  ],
})
export class AppModule {}
