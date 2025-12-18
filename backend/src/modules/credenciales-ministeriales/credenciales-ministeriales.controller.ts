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
import { PastorJwtAuthGuard } from '../auth/guards/pastor-jwt-auth.guard'
import { InvitadoJwtAuthGuard } from '../auth/guards/invitado-jwt-auth.guard'
import { PastorOrInvitadoJwtAuthGuard } from '../auth/guards/pastor-or-invitado-jwt-auth.guard'
import { PaginationDto } from '../../common/dto/pagination.dto'
import { AuthenticatedRequest, AuthenticatedInvitadoRequest } from '../auth/types/request.types'
import { PrismaService } from '../../prisma/prisma.service'

@Controller('credenciales-ministeriales')
export class CredencialesMinisterialesController {
  private readonly logger = new Logger(CredencialesMinisterialesController.name)

  constructor(
    private readonly credencialesMinisterialesService: CredencialesMinisterialesService,
    private readonly prisma: PrismaService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query() query: PaginationDto & CredencialMinisterialFilterDto
  ) {
    try {
      // Convertir page y limit a números de forma segura
      const page = query.page ? Number(query.page) : 1
      const limit = query.limit ? Number(query.limit) : 20
      
      // Validar que page y limit sean números válidos
      if (isNaN(page) || page < 1) {
        this.logger.warn(`Page inválido: ${query.page}, usando default: 1`)
        return await this.credencialesMinisterialesService.findAllWithFilters(1, limit, undefined)
      }
      
      if (isNaN(limit) || limit < 1) {
        this.logger.warn(`Limit inválido: ${query.limit}, usando default: 20`)
        return await this.credencialesMinisterialesService.findAllWithFilters(page, 20, undefined)
      }
      
      // Limpiar filtros: solo incluir si tienen valor
      const cleanFilters: CredencialMinisterialFilterDto = {}
      
      if (query.documento && typeof query.documento === 'string' && query.documento.trim()) {
        cleanFilters.documento = query.documento.trim()
      }
      
      if (query.estado && typeof query.estado === 'string' && query.estado.trim() && query.estado !== 'todos') {
        cleanFilters.estado = query.estado.trim() as 'vigente' | 'por_vencer' | 'vencida'
      }
      
      // Manejar activa: puede venir como string 'true'/'false' o como boolean
      if (query.activa !== undefined && query.activa !== null) {
        if (typeof query.activa === 'string') {
          cleanFilters.activa = query.activa === 'true' || query.activa === '1'
        } else if (typeof query.activa === 'boolean') {
          cleanFilters.activa = query.activa
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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

  /**
   * Endpoint para enviar recordatorios de estado de credenciales manualmente
   * Útil para testing o envío inmediato
   */
  @Post('recordatorios/enviar')
  @UseGuards(JwtAuthGuard)
  async enviarRecordatorios(@Request() req: AuthenticatedRequest) {
    try {
      this.logger.log(
        `Enviando recordatorios de credenciales manualmente por usuario ${req.user?.email}`
      )
      return await this.credencialesMinisterialesService.enviarRecordatoriosEstadoCredenciales()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error en enviarRecordatorios: ${errorMessage}`)
      throw error
    }
  }

  /**
   * Endpoint para consultar estado de credencial por documento
   * Útil para que los usuarios consulten su credencial desde la app móvil
   * Accesible para pastores O invitados autenticados
   */
  @Get('consultar/:documento')
  @UseGuards(PastorOrInvitadoJwtAuthGuard)
  async consultarPorDocumento(@Param('documento') documento: string) {
    try {
      this.logger.log(`Consultando credencial por documento: ${documento}`)
      const credencial = await this.credencialesMinisterialesService.obtenerEstadoPorDocumento(documento)
      
      if (!credencial) {
        return { encontrada: false, mensaje: 'Credencial no encontrada' }
      }

      return {
        encontrada: true,
        credencial,
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error en consultarPorDocumento: ${errorMessage}`)
      throw error
    }
  }

  /**
   * Endpoint para que invitados autenticados obtengan sus credenciales
   * Basado en el DNI de sus inscripciones
   * Accesible para invitados autenticados
   */
  @Get('mis-credenciales')
  @UseGuards(InvitadoJwtAuthGuard)
  async obtenerMisCredenciales(@Request() req: AuthenticatedInvitadoRequest) {
    try {
      const invitadoId = req.user?.id
      if (!invitadoId) {
        return { encontrada: false, mensaje: 'Usuario no autenticado' }
      }

      this.logger.log(`Obteniendo credenciales para invitado: ${invitadoId}`)
      
      // Buscar inscripciones del invitado que tengan DNI
      const inscripciones = await this.prisma.inscripcion.findMany({
        where: {
          invitadoId,
          dni: { not: null },
        },
        select: {
          dni: true,
        },
      })

      this.logger.log(`Inscripciones encontradas: ${inscripciones.length}`)

      if (!inscripciones || inscripciones.length === 0) {
        this.logger.warn(`No se encontraron inscripciones con DNI para invitado ${invitadoId}`)
        return { encontrada: false, mensaje: 'No se encontró DNI en tus inscripciones. Asegúrate de haber ingresado tu DNI al inscribirte a una convención.' }
      }

      // Obtener DNIs únicos (filtrar nulls y duplicados)
      const dniUnicos = Array.from(
        new Set(
          inscripciones
            .map((i) => i.dni)
            .filter((dni): dni is string => dni !== null && dni !== undefined && dni.trim() !== '')
        )
      )

      this.logger.log(`DNIs únicos encontrados: ${dniUnicos.length} - ${dniUnicos.join(', ')}`)

      if (dniUnicos.length === 0) {
        return { encontrada: false, mensaje: 'No se encontró DNI válido en tus inscripciones' }
      }

      // Obtener credenciales para cada DNI único
      const credenciales = []
      for (const dni of dniUnicos) {
        try {
          this.logger.log(`Buscando credencial ministerial para DNI: ${dni}`)
          const credencial = await this.credencialesMinisterialesService.obtenerEstadoPorDocumento(dni)
          if (credencial) {
            this.logger.log(`✅ Credencial encontrada para DNI: ${dni}`)
            credenciales.push(credencial)
          } else {
            this.logger.log(`⚠️ No se encontró credencial para DNI: ${dni}`)
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
          this.logger.error(`Error buscando credencial para DNI ${dni}: ${errorMessage}`)
        }
      }

      if (credenciales.length === 0) {
        this.logger.warn(`No se encontraron credenciales para ningún DNI del invitado ${invitadoId}`)
        return { encontrada: false, mensaje: 'No se encontraron credenciales ministeriales para tu DNI. Verifica que tu credencial esté registrada en el sistema.' }
      }

      this.logger.log(`✅ Total credenciales encontradas: ${credenciales.length}`)

      return {
        encontrada: true,
        credenciales,
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error en obtenerMisCredenciales: ${errorMessage}`)
      throw error
    }
  }

}

