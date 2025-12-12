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
  Logger,
} from '@nestjs/common'
import { CredencialesPastoralesService } from './credenciales-pastorales.service'
import {
  CreateCredencialPastoralDto,
  UpdateCredencialPastoralDto,
  CredencialFilterDto,
} from './dto/credencial-pastoral.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PaginationDto } from '../../common/dto/pagination.dto'
import { AuthenticatedRequest } from '../auth/types/request.types'

@Controller('credenciales-pastorales')
@UseGuards(JwtAuthGuard)
export class CredencialesPastoralesController {
  private readonly logger = new Logger(CredencialesPastoralesController.name)

  constructor(
    private readonly credencialesPastoralesService: CredencialesPastoralesService
  ) {}

  @Post()
  async create(
    @Body() createDto: CreateCredencialPastoralDto,
    @Request() req: AuthenticatedRequest
  ) {
    try {
      this.logger.log(
        `Creando credencial pastoral para pastor ${createDto.pastorId} por usuario ${req.user?.email}`
      )
      return await this.credencialesPastoralesService.create(createDto)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error en create: ${errorMessage}`)
      throw error
    }
  }

  @Get()
  async findAll(
    @Query() pagination: PaginationDto,
    @Query() filters: CredencialFilterDto
  ) {
    try {
      const page = Number(pagination.page || 1)
      const limit = Number(pagination.limit || 20)
      return await this.credencialesPastoralesService.findAllWithFilters(
        page,
        limit,
        filters
      )
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error en findAll: ${errorMessage}`)
      throw error
    }
  }

  @Get('por-vencer')
  async findPorVencer() {
    try {
      return await this.credencialesPastoralesService.findPorVencer()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error en findPorVencer: ${errorMessage}`)
      throw error
    }
  }

  @Get('vencidas')
  async findVencidas() {
    try {
      return await this.credencialesPastoralesService.findVencidas()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error en findVencidas: ${errorMessage}`)
      throw error
    }
  }

  @Post('actualizar-estados')
  async actualizarEstados() {
    try {
      return await this.credencialesPastoralesService.actualizarEstados()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error en actualizarEstados: ${errorMessage}`)
      throw error
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.credencialesPastoralesService.findOneWithPastor(id)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error en findOne: ${errorMessage}`)
      throw error
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCredencialPastoralDto,
    @Request() req: AuthenticatedRequest
  ) {
    try {
      this.logger.log(
        `Actualizando credencial ${id} por usuario ${req.user?.email}`
      )
      return await this.credencialesPastoralesService.update(id, updateDto)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error en update: ${errorMessage}`)
      throw error
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    try {
      this.logger.log(
        `Eliminando credencial ${id} por usuario ${req.user?.email}`
      )
      return await this.credencialesPastoralesService.remove(id)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error en remove: ${errorMessage}`)
      throw error
    }
  }
}

