import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common'
import { GaleriaService } from './galeria.service'
import { CreateGaleriaDto, UpdateGaleriaDto } from './dto/galeria.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { AuthenticatedRequest } from '../auth/types/request.types'

@Controller('galeria')
export class GaleriaController {
  constructor(private galeriaService: GaleriaService) {}

  @Get()
  findAll() {
    return this.galeriaService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.galeriaService.findOne(id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @Post()
  create(@Body() dto: CreateGaleriaDto, @Request() req: AuthenticatedRequest) {
    const forwardedFor = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : req.headers['x-forwarded-for']
    const clientIp = req.ip || forwardedFor || undefined
    return this.galeriaService.createWithAudit(dto, req.user.id, req.user.email, clientIp)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGaleriaDto, @Request() req: AuthenticatedRequest) {
    const forwardedFor = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : req.headers['x-forwarded-for']
    const clientIp = req.ip || forwardedFor || undefined
    return this.galeriaService.updateWithAudit(id, dto, req.user.id, req.user.email, clientIp)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const forwardedFor = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : req.headers['x-forwarded-for']
    const clientIp = req.ip || forwardedFor || undefined
    return this.galeriaService.removeWithAudit(id, req.user.id, req.user.email, clientIp)
  }
}
