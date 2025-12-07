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
  Request,
} from '@nestjs/common'
import { PastoresService } from './pastores.service'
import { CreatePastorDto, UpdatePastorDto } from './dto/pastor.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PaginationDto } from '../../common/dto/pagination.dto'
import { PastorFilterDto } from '../../common/dto/search-filter.dto'
import { AuthenticatedRequest } from '../auth/types/request.types'

@Controller('pastores')
export class PastoresController {
  constructor(private pastoresService: PastoresService) {}

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
  findAll(@Query() query: PaginationDto & PastorFilterDto) {
    // Siempre usar paginación por defecto para evitar problemas con grandes volúmenes
    const page = query.page ? Number(query.page) : 1
    const limit = query.limit ? Number(query.limit) : 20
    const filters: PastorFilterDto = {
      search: query.search,
      q: query.q,
      status: query.status as PastorFilterDto['status'],
      tipo: query.tipo as PastorFilterDto['tipo'],
      mostrarEnLanding: query.mostrarEnLanding,
    }
    return this.pastoresService.findAllPaginated(page, limit, filters)
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
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreatePastorDto) {
    return this.pastoresService.createWithAudit(dto, req.user?.id, req.user?.email)
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Request() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpdatePastorDto) {
    return this.pastoresService.updateWithAudit(id, dto, req.user?.id, req.user?.email)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.pastoresService.removeWithAudit(id, req.user?.id, req.user?.email)
  }
}
