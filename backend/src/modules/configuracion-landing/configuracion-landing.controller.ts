import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common'
import { ConfiguracionLandingService } from './configuracion-landing.service'
import { UpdateConfiguracionLandingDto } from './dto/configuracion-landing.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('configuracion-landing')
export class ConfiguracionLandingController {
  constructor(
    private readonly configuracionLandingService: ConfiguracionLandingService
  ) {}

  /**
   * Obtiene la configuración de landing (público)
   * Endpoint público para la landing page
   */
  @Get()
  getConfiguracion() {
    return this.configuracionLandingService.getConfiguracion()
  }

  /**
   * Actualiza la configuración de landing (admin)
   * Endpoint protegido, requiere autenticación
   */
  @Patch()
  @UseGuards(JwtAuthGuard)
  updateConfiguracion(@Body() dto: UpdateConfiguracionLandingDto) {
    return this.configuracionLandingService.updateConfiguracion(dto)
  }
}

