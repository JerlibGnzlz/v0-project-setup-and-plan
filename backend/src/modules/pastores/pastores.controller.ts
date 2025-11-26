import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from "@nestjs/common"
import { PastoresService } from "./pastores.service"
import { CreatePastorDto, UpdatePastorDto } from "./dto/pastor.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@Controller("pastores")
export class PastoresController {
  constructor(private pastoresService: PastoresService) { }

  // ==========================================
  // ENDPOINTS PÚBLICOS (para landing page)
  // ==========================================

  /**
   * Obtiene pastores para la landing page
   * Solo los que tienen mostrarEnLanding = true
   */
  @Get('landing')
  findForLanding() {
    return this.pastoresService.findForLanding()
  }

  /**
   * Obtiene la directiva pastoral
   */
  @Get('directiva')
  findDirectiva() {
    return this.pastoresService.findDirectiva()
  }

  /**
   * Obtiene supervisores (opcionalmente filtrados por región)
   */
  @Get('supervisores')
  findSupervisores(@Query('region') region?: string) {
    return this.pastoresService.findSupervisores(region)
  }

  /**
   * Obtiene pastores por tipo
   */
  @Get('tipo/:tipo')
  findByTipo(@Param('tipo') tipo: string) {
    return this.pastoresService.findByTipo(tipo)
  }

  // ==========================================
  // ENDPOINTS GENERALES
  // ==========================================

  @Get()
  findAll() {
    return this.pastoresService.findAll()
  }

  @Get('active')
  findActive() {
    return this.pastoresService.findActive()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pastoresService.findOne(id)
  }

  // ==========================================
  // ENDPOINTS PROTEGIDOS (requieren auth)
  // ==========================================

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreatePastorDto) {
    return this.pastoresService.create(dto)
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(@Param('id') id: string, @Body() dto: UpdatePastorDto) {
    return this.pastoresService.update(id, dto)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pastoresService.remove(id)
  }
}
