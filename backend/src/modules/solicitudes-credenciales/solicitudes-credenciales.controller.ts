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
  HttpException,
  InternalServerErrorException,
  NotFoundException,
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
      // Logging detallado para debugging
      this.logger.log('📝 ===== INICIO CREATE SOLICITUD =====')
      this.logger.log(`📝 Request URL: ${req.url}`)
      this.logger.log(`📝 Request method: ${req.method}`)
      this.logger.log(`📝 Request user: ${JSON.stringify(req.user)}`)
      this.logger.log(`📝 Request user type: ${typeof req.user}`)
      this.logger.log(`📝 Request user id: ${req.user?.id}`)
      this.logger.log(`📝 Request headers authorization: ${req.headers.authorization ? 'presente' : 'ausente'}`)
      this.logger.log(`📝 DTO recibido: ${JSON.stringify(dto)}`)
      this.logger.log(`📝 DTO tipo: ${typeof dto}`)
      this.logger.log(`📝 DTO tiene tipo: ${!!dto?.tipo}`)
      this.logger.log(`📝 DTO tiene dni: ${!!dto?.dni}`)
      this.logger.log(`📝 DTO tiene nombre: ${!!dto?.nombre}`)
      this.logger.log(`📝 DTO tiene apellido: ${!!dto?.apellido}`)
      
      const invitadoId = req.user?.id
      if (!invitadoId) {
        this.logger.error('❌ Usuario no autenticado en create solicitud')
        this.logger.error(`❌ req.user completo: ${JSON.stringify(req.user)}`)
        this.logger.error(`❌ req.user type: ${typeof req.user}`)
        this.logger.error(`❌ req.user keys: ${req.user ? Object.keys(req.user) : 'null'}`)
        throw new BadRequestException('Usuario no autenticado')
      }
      
      this.logger.log(`✅ Invitado ID extraído: ${invitadoId}`)
      this.logger.log(`✅ Invitado ID type: ${typeof invitadoId}`)

      // Validar que el DTO no sea null o undefined
      if (!dto) {
        this.logger.error('❌ DTO es null o undefined')
        throw new BadRequestException('DTO no recibido')
      }

      // Validar que el DTO tenga los campos requeridos
      if (!dto.tipo || !dto.dni || !dto.nombre || !dto.apellido) {
        this.logger.error('❌ DTO incompleto:', {
          tieneTipo: !!dto.tipo,
          tieneDni: !!dto.dni,
          tieneNombre: !!dto.nombre,
          tieneApellido: !!dto.apellido,
          tipoValue: dto.tipo,
          dniValue: dto.dni,
          nombreValue: dto.nombre,
          apellidoValue: dto.apellido,
        })
        throw new BadRequestException('Faltan campos requeridos en la solicitud')
      }

      // Validar que el tipo sea válido
      if (dto.tipo !== TipoCredencial.MINISTERIAL && dto.tipo !== TipoCredencial.CAPELLANIA) {
        this.logger.error(`❌ Tipo de credencial inválido: ${dto.tipo}`)
        throw new BadRequestException(`Tipo de credencial inválido: ${dto.tipo}`)
      }

      this.logger.log(`📝 Creando solicitud de credencial ${dto.tipo} para invitado ${invitadoId}`)
      this.logger.log(`📝 DTO recibido en controller:`, {
        tipo: dto.tipo,
        dni: dto.dni,
        nombre: dto.nombre,
        apellido: dto.apellido,
        nacionalidad: dto.nacionalidad,
        fechaNacimiento: dto.fechaNacimiento,
        motivo: dto.motivo ? dto.motivo.substring(0, 50) + '...' : undefined,
      })

      this.logger.log(`📝 Llamando a service.create con invitadoId: ${invitadoId}`)
      const solicitud = await this.solicitudesCredencialesService.create(invitadoId, dto)
      this.logger.log(`✅ Solicitud creada exitosamente: ${solicitud.id}`)
      this.logger.log(`✅ ===== FIN CREATE SOLICITUD (EXITOSO) =====`)
      return solicitud
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      const errorStack = error instanceof Error ? error.stack : undefined
      const errorName = error instanceof Error ? error.name : 'Unknown'

      this.logger.error(`❌ ===== ERROR EN CONTROLLER CREATE SOLICITUD =====`)
      this.logger.error(`❌ Error name: ${errorName}`)
      this.logger.error(`❌ Error message: ${errorMessage}`)
      this.logger.error(`❌ Error type: ${typeof error}`)
      this.logger.error(`❌ Error instanceof Error: ${error instanceof Error}`)
      this.logger.error(`❌ Error instanceof HttpException: ${error instanceof HttpException}`)
      this.logger.error(`❌ Error instanceof BadRequestException: ${error instanceof BadRequestException}`)
      this.logger.error(`❌ Error instanceof NotFoundException: ${error instanceof NotFoundException}`)
      
      if (error && typeof error === 'object') {
        this.logger.error(`❌ Error keys: ${Object.keys(error).join(', ')}`)
        if ('response' in error) {
          this.logger.error(`❌ Error.response: ${JSON.stringify((error as { response?: unknown }).response)}`)
        }
        if ('status' in error) {
          this.logger.error(`❌ Error.status: ${(error as { status?: unknown }).status}`)
        }
        if ('code' in error) {
          this.logger.error(`❌ Error.code: ${(error as { code?: unknown }).code}`)
        }
      }

      if (errorStack) {
        this.logger.error(`❌ Stack trace: ${errorStack}`)
      }

      // Re-lanzar errores conocidos de NestJS
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        this.logger.error(`❌ Re-lanzando error conocido: ${errorMessage}`)
        throw error
      }

      // Si es un HttpException pero no es BadRequestException o NotFoundException, re-lanzarlo
      if (error instanceof HttpException) {
        this.logger.error(`❌ Re-lanzando HttpException: ${errorMessage}`)
        throw error
      }

      // Para cualquier otro error, envolverlo en InternalServerErrorException
      this.logger.error(`❌ Envolviendo error desconocido en InternalServerErrorException`)
      throw new InternalServerErrorException(
        `Error interno al crear solicitud: ${errorMessage}`
      )
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

