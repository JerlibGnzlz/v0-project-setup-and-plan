import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
  Logger,
} from '@nestjs/common'
import { SolicitudesCredencialesService } from './solicitudes-credenciales.service'
import {
  CreateSolicitudCredencialDto,
  UpdateSolicitudCredencialDto,
  EstadoSolicitud,
  TipoCredencial,
} from './dto/solicitud-credencial.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { InvitadoJwtAuthGuard } from '../auth/guards/invitado-jwt-auth.guard'
import { AuthenticatedRequest, AuthenticatedInvitadoRequest } from '../auth/types/request.types'
import { PaginationDto } from '../../common/dto/pagination.dto'

@Controller('solicitudes-credenciales')
export class SolicitudesCredencialesController {
  private readonly logger = new Logger(SolicitudesCredencialesController.name)

  constructor(
    private readonly solicitudesCredencialesService: SolicitudesCredencialesService
  ) {}

  /**
   * Crear solicitud de credencial desde la app móvil
   */
  @Post()
  @UseGuards(InvitadoJwtAuthGuard)
  async create(
    @Request() req: AuthenticatedInvitadoRequest,
    @Body() dto: CreateSolicitudCredencialDto
  ) {
    const invitadoId = req.user?.id
    if (!invitadoId) {
      throw new Error('Usuario no autenticado')
    }

    this.logger.log(`Creando solicitud de credencial ${dto.tipo} para invitado ${invitadoId}`)
    return this.solicitudesCredencialesService.create(invitadoId, dto)
  }

  /**
   * Obtener mis solicitudes (para invitados)
   * IMPORTANTE: Esta ruta debe estar ANTES de @Get(':id') para evitar conflictos
   */
  @Get('mis-solicitudes')
  @UseGuards(InvitadoJwtAuthGuard)
  async getMisSolicitudes(@Request() req: AuthenticatedInvitadoRequest) {
    const invitadoId = req.user?.id
    if (!invitadoId) {
      throw new Error('Usuario no autenticado')
    }

    return this.solicitudesCredencialesService.findByInvitadoId(invitadoId)
  }

  /**
   * Obtener una solicitud por ID (para admins)
   * IMPORTANTE: Esta ruta debe estar DESPUÉS de rutas específicas como 'mis-solicitudes'
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.solicitudesCredencialesService.findOne(id)
  }

  /**
   * Obtener todas las solicitudes (para admins)
   * IMPORTANTE: Esta ruta debe estar DESPUÉS de @Get(':id') para evitar conflictos
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query() query: PaginationDto & { estado?: EstadoSolicitud; tipo?: TipoCredencial }
  ) {
    const page = query.page ? Number(query.page) : 1
    const limit = query.limit ? Number(query.limit) : 20

    return this.solicitudesCredencialesService.findAll(
      page,
      limit,
      query.estado,
      query.tipo
    )
  }

  /**
   * Actualizar una solicitud (para admins)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSolicitudCredencialDto,
    @Request() req: AuthenticatedRequest
  ) {
    this.logger.log(
      `Actualizando solicitud ${id} por usuario ${req.user?.email}`
    )
    return this.solicitudesCredencialesService.update(id, dto)
  }
}

