import { Module } from "@nestjs/common"
import { AuthModule } from "./modules/auth/auth.module"
import { ConvencionesModule } from "./modules/convenciones/convenciones.module"
import { PastoresModule } from "./modules/pastores/pastores.module"
import { PrismaModule } from "./prisma/prisma.module"

@Module({
  imports: [PrismaModule, AuthModule, ConvencionesModule, PastoresModule],
})
export class AppModule {}
