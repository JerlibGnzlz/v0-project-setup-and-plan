import { Module } from '@nestjs/common'
import { PrismaModule } from '../../prisma/prisma.module'
import { ConfiguracionLandingController } from './configuracion-landing.controller'
import { ConfiguracionLandingService } from './configuracion-landing.service'

@Module({
  imports: [PrismaModule],
  controllers: [ConfiguracionLandingController],
  providers: [ConfiguracionLandingService],
  exports: [ConfiguracionLandingService],
})
export class ConfiguracionLandingModule {}

