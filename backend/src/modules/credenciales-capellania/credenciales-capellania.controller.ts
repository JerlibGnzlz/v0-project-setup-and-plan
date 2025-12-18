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
import { CredencialesCapellaniaService } from './credenciales-capellania.service'
import {
  CreateCredencialCapellaniaDto,
  UpdateCredencialCapellaniaDto,
  CredencialCapellaniaFilterDto,
} from './dto/credencial-capellania.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PastorJwtAuthGuard } from '../auth/guards/pastor-jwt-auth.guard'
import { InvitadoJwtAuthGuard } from '../auth/guards/invitado-jwt-auth.guard'
import { PastorOrInvitadoJwtAuthGuard } from '../auth/guards/pastor-or-invitado-jwt-auth.guard'
import { PaginationDto } from '../../common/dto/pagination.dto'
import { AuthenticatedRequest, AuthenticatedInvitadoRequest } from '../auth/types/request.types'
import { PrismaService } from '../../prisma/prisma.service'

@Controller('credenciales-capellania')
export class CredencialesCapellaniaController {
  private readonly logger = new Logger(CredencialesCapellaniaController.name)

  constructor(
    private readonly credencialesCapellaniaService: CredencialesCapellaniaService,
    private readonly prisma: PrismaService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createDto: CreateCredencialCapellaniaDto,
    @Request() req: AuthenticatedRequest
  ) {
    try {
      this.logger.log(
        `Creando credencial de capellanía para ${createDto.documento} por usuario ${req.user?.email}`
      )
      return await this.credencialesCapellaniaService.create(createDto)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error en create: ${errorMessage}`)
      throw error
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query() query: PaginationDto & CredencialCapellaniaFilterDto
  ) {
    try {
      // Convertir page y limit a números de forma segura
      const page = query.page ? Number(query.page) : 1
      const limit = query.limit ? Number(query.limit) : 20
      
      // Validar que page y limit sean números válidos
      if (isNaN(page) || page < 1) {
        this.logger.warn(`Page inválido: ${query.page}, usando default: 1`)
        return await this.credencialesCapellaniaService.findAllWithFilters(1, limit, undefined)
      }
      
      if (isNaN(limit) || limit < 1) {
        this.logger.warn(`Limit inválido: ${query.limit}, usando default: 20`)
        return await this.credencialesCapellaniaService.findAllWithFilters(page, 20, undefined)
      }
      
      // Limpiar filtros: solo incluir si tienen valor
      const cleanFilters: CredencialCapellaniaFilterDto = {}
      
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
        `Obteniendo credenciales de capellanía: page=${page}, limit=${limit}, filters=${JSON.stringify(cleanFilters)}`
      )
      
      return await this.credencialesCapellaniaService.findAllWithFilters(
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
      return await this.credencialesCapellaniaService.findOneWithEstado(id)
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
    @Body() updateDto: UpdateCredencialCapellaniaDto,
    @Request() req: AuthenticatedRequest
  ) {
    try {
      this.logger.log(
        `Actualizando credencial de capellanía ${id} por usuario ${req.user?.email}`
      )
      return await this.credencialesCapellaniaService.update(id, updateDto)
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
        `Eliminando credencial de capellanía ${id} por usuario ${req.user?.email}`
      )
      return await this.credencialesCapellaniaService.remove(id)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error en remove: ${errorMessage}`)
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
      this.logger.log(`Consultando credencial de capellanía por documento: ${documento}`)
      const credencial = await this.credencialesCapellaniaService.obtenerEstadoPorDocumento(documento)
      
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

      this.logger.log(`Obteniendo credenciales de capellanía para invitado: ${invitadoId}`)
      
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
          // Normalizar DNI antes de buscar (remover espacios, guiones, convertir a mayúsculas)
          const dniNormalizado = dni.trim().replace(/[\s-]/g, '').toUpperCase()
          this.logger.log(`Buscando credencial de capellanía para DNI: "${dni}" (normalizado: "${dniNormalizado}")`)
          
          const credencial = await this.credencialesCapellaniaService.obtenerEstadoPorDocumento(dniNormalizado)
          
          if (credencial) {
            this.logger.log(`✅ Credencial encontrada para DNI: "${dni}" (documento en credencial: "${credencial.documento}")`)
            credenciales.push(credencial)
          } else {
            // Intentar también con el DNI original (sin normalizar) por si acaso
            if (dniNormalizado !== dni) {
              this.logger.log(`Intentando búsqueda con DNI original: "${dni}"`)
              const credencialOriginal = await this.credencialesCapellaniaService.obtenerEstadoPorDocumento(dni)
              if (credencialOriginal) {
                this.logger.log(`✅ Credencial encontrada con DNI original: "${dni}"`)
                credenciales.push(credencialOriginal)
              } else {
                this.logger.log(`⚠️ No se encontró credencial para DNI: "${dni}" (ni normalizado ni original)`)
              }
            } else {
              this.logger.log(`⚠️ No se encontró credencial para DNI: "${dni}"`)
            }
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
          this.logger.error(`Error buscando credencial para DNI ${dni}: ${errorMessage}`)
        }
      }

      if (credenciales.length === 0) {
        this.logger.warn(`No se encontraron credenciales para ningún DNI del invitado ${invitadoId}`)
        return { encontrada: false, mensaje: 'No se encontraron credenciales de capellanía para tu DNI. Verifica que tu credencial esté registrada en el sistema.' }
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

