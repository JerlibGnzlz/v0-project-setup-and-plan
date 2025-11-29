import { Module } from "@nestjs/common"
import { AuthModule } from "./modules/auth/auth.module"
import { ConvencionesModule } from "./modules/convenciones/convenciones.module"
import { PastoresModule } from "./modules/pastores/pastores.module"
import { GaleriaModule } from "./modules/galeria/galeria.module"
import { InscripcionesModule } from "./modules/inscripciones/inscripciones.module"
import { NoticiasModule } from "./modules/noticias/noticias.module"
import { PrismaModule } from "./prisma/prisma.module"
import { UploadModule } from "./modules/upload/upload.module"
import { NotificationsModule } from "./modules/notifications/notifications.module"

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ConvencionesModule,
    PastoresModule,
    GaleriaModule,
    InscripcionesModule,
    NoticiasModule,
    UploadModule,
    NotificationsModule,
  ],
})
export class AppModule { }
