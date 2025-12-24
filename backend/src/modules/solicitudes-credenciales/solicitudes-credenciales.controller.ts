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
      this.logger.log(`📝 Request user: ${JSON.stringify(req.user)}`)
      this.logger.log(`📝 Request headers: ${JSON.stringify(req.headers)}`)
      this.logger.log(`📝 DTO recibido: ${JSON.stringify(dto)}`)
      
      const invitadoId = req.user?.id
      if (!invitadoId) {
        this.logger.error('❌ Usuario no autenticado en create solicitud')
        this.logger.error(`❌ req.user completo: ${JSON.stringify(req.user)}`)
        throw new BadRequestException('Usuario no autenticado')
      }
      
      this.logger.log(`✅ Invitado ID extraído: ${invitadoId}`)

      // Validar que el DTO tenga los campos requeridos
      if (!dto.tipo || !dto.dni || !dto.nombre || !dto.apellido) {
        this.logger.error('❌ DTO incompleto:', {
          tieneTipo: !!dto.tipo,
          tieneDni: !!dto.dni,
          tieneNombre: !!dto.nombre,
          tieneApellido: !!dto.apellido,
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

      try {
        const solicitud = await this.solicitudesCredencialesService.create(invitadoId, dto)
        this.logger.log(`✅ Solicitud creada exitosamente: ${solicitud.id}`)
        return solicitud
      } catch (createError: unknown) {
        const createErrorMessage = createError instanceof Error ? createError.message : 'Error desconocido'
        const createErrorStack = createError instanceof Error ? createError.stack : undefined
        this.logger.error(`❌ Error en service.create: ${createErrorMessage}`)
        if (createErrorStack) {
          this.logger.error(`Stack trace: ${createErrorStack}`)
        }
        // Re-lanzar el error para que se maneje arriba
        throw createError
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      const errorStack = error instanceof Error ? error.stack : undefined
      
      // Si es un error conocido de NestJS, re-lanzarlo tal cual
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        this.logger.error(`❌ Error conocido en controller: ${errorMessage}`)
        throw error
      }
      
      this.logger.error(`❌ Error en controller create solicitud: ${errorMessage}`)
      if (errorStack) {
        this.logger.error(`Stack trace: ${errorStack}`)
      }
      
      // Si es un error desconocido, lanzar BadRequestException con el mensaje
      throw new BadRequestException(`Error al crear solicitud: ${errorMessage}`)
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

