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
import { CredencialesMinisterialesService } from './credenciales-ministeriales.service'
import {
  CreateCredencialMinisterialDto,
  UpdateCredencialMinisterialDto,
  CredencialMinisterialFilterDto,
} from './dto/credencial-ministerial.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PaginationDto } from '../../common/dto/pagination.dto'
import { AuthenticatedRequest } from '../auth/types/request.types'

@Controller('credenciales-ministeriales')
@UseGuards(JwtAuthGuard)
export class CredencialesMinisterialesController {
  private readonly logger = new Logger(CredencialesMinisterialesController.name)

  constructor(
    private readonly credencialesMinisterialesService: CredencialesMinisterialesService
  ) {}

  @Post()
  async create(
    @Body() createDto: CreateCredencialMinisterialDto,
    @Request() req: AuthenticatedRequest
  ) {
    try {
      this.logger.log(
        `Creando credencial ministerial para ${createDto.documento} por usuario ${req.user?.email}`
      )
      return await this.credencialesMinisterialesService.create(createDto)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error en create: ${errorMessage}`)
      throw error
    }
  }

  @Get()
  async findAll(
    @Query() pagination: PaginationDto,
    @Query() filters?: CredencialMinisterialFilterDto
  ) {
    try {
      // Convertir page y limit a números de forma segura
      const page = pagination.page ? Number(pagination.page) : 1
      const limit = pagination.limit ? Number(pagination.limit) : 20
      
      // Validar que page y limit sean números válidos
      if (isNaN(page) || page < 1) {
        this.logger.warn(`Page inválido: ${pagination.page}, usando default: 1`)
        return await this.credencialesMinisterialesService.findAllWithFilters(1, limit, undefined)
      }
      
      if (isNaN(limit) || limit < 1) {
        this.logger.warn(`Limit inválido: ${pagination.limit}, usando default: 20`)
        return await this.credencialesMinisterialesService.findAllWithFilters(page, 20, undefined)
      }
      
      // Limpiar filtros: solo incluir si tienen valor
      const cleanFilters: CredencialMinisterialFilterDto = {}
      
      if (filters?.documento && typeof filters.documento === 'string' && filters.documento.trim()) {
        cleanFilters.documento = filters.documento.trim()
      }
      
      if (filters?.estado && typeof filters.estado === 'string' && filters.estado.trim() && filters.estado !== 'todos') {
        cleanFilters.estado = filters.estado.trim() as 'vigente' | 'por_vencer' | 'vencida'
      }
      
      // Manejar activa: puede venir como string 'true'/'false' o como boolean
      if (filters?.activa !== undefined && filters.activa !== null) {
        if (typeof filters.activa === 'string') {
          cleanFilters.activa = filters.activa === 'true' || filters.activa === '1'
        } else if (typeof filters.activa === 'boolean') {
          cleanFilters.activa = filters.activa
        }
      }
      
      this.logger.log(
        `Obteniendo credenciales ministeriales: page=${page}, limit=${limit}, filters=${JSON.stringify(cleanFilters)}`
      )
      
      return await this.credencialesMinisterialesService.findAllWithFilters(
        page,
        limit,
        Object.keys(cleanFilters).length > 0 ? cleanFilters : undefined
      )
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error en findAll: ${errorMessage}`)
      if (error instanceof Error) {
        this.logger.error(`Stack trace: ${error.stack}`)
      }
      throw error
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.credencialesMinisterialesService.findOneWithEstado(id)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error en findOne: ${errorMessage}`)
      throw error
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCredencialMinisterialDto,
    @Request() req: AuthenticatedRequest
  ) {
    try {
      this.logger.log(
        `Actualizando credencial ministerial ${id} por usuario ${req.user?.email}`
      )
      return await this.credencialesMinisterialesService.update(id, updateDto)
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
        `Eliminando credencial ministerial ${id} por usuario ${req.user?.email}`
      )
      return await this.credencialesMinisterialesService.remove(id)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error en remove: ${errorMessage}`)
      throw error
    }
  }

}

