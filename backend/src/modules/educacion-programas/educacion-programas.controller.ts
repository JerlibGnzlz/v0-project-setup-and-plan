import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common'
import { EducacionProgramasService } from './educacion-programas.service'
import { UpdateProgramasEducacionDto } from './dto/educacion-programa.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('educacion-programas')
export class EducacionProgramasController {
  constructor(
    private readonly educacionProgramasService: EducacionProgramasService
  ) {}

  /**
   * Obtiene los programas AMVA Digital (público, para la landing).
   */
  @Get()
  findAll() {
    return this.educacionProgramasService.findAll()
  }

  /**
   * Actualiza los programas desde el panel de control (admin).
   */
  @Patch()
  @UseGuards(JwtAuthGuard)
  updateFromAdmin(@Body() dto: UpdateProgramasEducacionDto) {
    return this.educacionProgramasService.updateFromAdmin(dto)
  }
}
