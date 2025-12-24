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
  BadRequestException,
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
    try {
      const invitadoId = req.user?.id
      if (!invitadoId) {
        this.logger.error('❌ Usuario no autenticado en create solicitud')
        throw new BadRequestException('Usuario no autenticado')
      }

      this.logger.log(`📝 Creando solicitud de credencial ${dto.tipo} para invitado ${invitadoId}`)
      this.logger.log(`📝 DTO recibido en controller:`, {
        tipo: dto.tipo,
        dni: dto.dni,
        nombre: dto.nombre,
        apellido: dto.apellido,
      })

      const solicitud = await this.solicitudesCredencialesService.create(invitadoId, dto)
      this.logger.log(`✅ Solicitud creada exitosamente: ${solicitud.id}`)
      return solicitud
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      const errorStack = error instanceof Error ? error.stack : undefined
      this.logger.error(`❌ Error en controller create solicitud: ${errorMessage}`)
      if (errorStack) {
        this.logger.error(`Stack trace: ${errorStack}`)
      }
      // Re-lanzar el error para que el GlobalExceptionFilter lo maneje
      throw error
    }
  }

  /**
   * Obtener mis solicitudes (para invitados)
   * IMPORTANTE: Rutas específicas deben ir ANTES de rutas con parámetros dinámicos
   */
  @Get('mis-solicitudes')
  @UseGuards(InvitadoJwtAuthGuard)
  async getMisSolicitudes(@Request() req: AuthenticatedInvitadoRequest) {
    try {
      const invitadoId = req.user?.id
      if (!invitadoId) {
        this.logger.error('Usuario no autenticado en getMisSolicitudes')
        throw new BadRequestException('Usuario no autenticado')
      }

      this.logger.log(`Obteniendo solicitudes para invitado ${invitadoId}`)
      const solicitudes = await this.solicitudesCredencialesService.findByInvitadoId(invitadoId)
      this.logger.log(`✅ Retornando ${solicitudes.length} solicitudes`)
      return solicitudes
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error en getMisSolicitudes: ${errorMessage}`)
      throw error
    }
  }

  /**
   * Obtener todas las solicitudes (para admins)
   * IMPORTANTE: Esta ruta debe ir ANTES de @Get(':id') para evitar que :id capture todas las rutas
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
   * Obtener una solicitud por ID (para admins)
   * IMPORTANTE: Rutas con parámetros dinámicos deben ir AL FINAL
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.solicitudesCredencialesService.findOne(id)
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

