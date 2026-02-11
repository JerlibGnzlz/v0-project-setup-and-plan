import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common'
import { SedesService } from './sedes.service'
import { CreateSedeDto, UpdateSedeDto, SedeFilterDto } from './dto/sede.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('sedes')
export class SedesController {
  constructor(private readonly sedesService: SedesService) {}

  // ==========================================
  // ENDPOINT PÚBLICO (para landing page)
  // ==========================================

  /**
   * Obtiene sedes activas para la landing page
   * Endpoint público, no requiere autenticación
   */
  @Get('landing')
  getForLanding() {
    return this.sedesService.findAll()
  }

  /**
   * Total de sedes activas. Público para la landing (sección Misión / "X países").
   */
  @Get('count')
  getTotalCount() {
    return this.sedesService.getTotalActiveCount()
  }

  // ==========================================
  // ENDPOINTS PROTEGIDOS (admin)
  // ==========================================

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createSedeDto: CreateSedeDto) {
    return this.sedesService.create(createSedeDto)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() filters?: SedeFilterDto) {
    // Si se piden todas (incluyendo inactivas), usar método específico
    if (filters?.activa === false || filters === undefined) {
      return this.sedesService.findAllIncludingInactive()
    }
    // Si se piden solo activas o con filtros, usar findAll normal
    return this.sedesService.findAll()
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.sedesService.findOne(id)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateSedeDto: UpdateSedeDto) {
    return this.sedesService.update(id, updateSedeDto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.sedesService.remove(id)
  }
}

